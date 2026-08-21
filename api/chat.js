// api/chat.js — Secure Serverless Endpoint for Google Gemini
//
// - Default model updated: "gemini-1.5-flash" is a discontinued model and was
//   causing every request to fail. Now defaults to a current, GA/stable,
//   long-term-support Flash-Lite model. Override anytime with the GEMINI_MODEL
//   environment variable if Google renames/replaces it later — check
//   https://ai.google.dev/gemini-api/docs/models for the current list.
// - generationConfig field name corrected: "response_mime_type" -> "responseMimeType"
//   (the documented REST field name).
// - Defensive JSON extraction (strips ```json fences) + schema validation.
// - Explicit handling for missing/blocked candidates, timeout, and invalid body.
// - Optional soilHealth context: only included in the prompt if the farmer
//   actually entered at least one value — never invented.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST is supported.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  if (!apiKey) {
    return res.status(500).json({
      error: "MISSING_API_KEY",
      message: "Gemini API key is not configured in server environment."
    });
  }

  // ---- Basic request validation ----
  const { farmerProfile, weatherContext, lang, soilHealth } = req.body || {};
  if (!farmerProfile || typeof farmerProfile !== 'object' || !weatherContext || typeof weatherContext !== 'object') {
    return res.status(400).json({
      error: "INVALID_REQUEST",
      message: "Request body must include farmerProfile and weatherContext objects."
    });
  }

  try {
    const systemPrompt = `
You are FasalCare Farmer Assistant, a helpful and cautious agricultural decision-support expert for Indian smallholders.
The current language is ${lang === 'hi' ? 'Hindi' : 'English'}.

CRITICAL RULES:
1. Use ONLY the provided information. Do NOT invent missing measurements, soil moisture percentages, exact disease diagnoses, fertilizer dosages, or imaginary facts.
2. If an attribute is "Not provided", explicitly treat it as unknown (e.g., "मिट्टी की वास्तविक नमी की जानकारी उपलब्ध नहीं है").
3. Distinguish clearly between:
   - KNOWN FACTS (from farmer input and weather data)
   - POSSIBLE EXPLANATIONS (never give a 100% definite diagnosis on vague symptoms — use wording like "possible cause", "may indicate", "consider consulting an agriculture expert")
   - RECOMMENDED ACTION
4. Keep the language extremely simple, conversational, and respectful. Avoid difficult academic vocabulary.
5. If soil test values are provided below, you may briefly explain what they generally mean in simple terms, but do NOT prescribe precise fertilizer quantities or dosages — recommend the farmer consult a local agriculture officer or Krishi Vigyan Kendra (KVK) for exact dosing.
6. Return ONLY a valid JSON object matching the schema below. Do not include markdown code fences, backticks, or any text outside the JSON object.

REQUIRED JSON OUTPUT FORMAT:
{
  "summary": "Short 1-2 line summary of the current farm situation",
  "weatherImpact": "How the current air temperature, air humidity, and rain probability affect the field",
  "waterAdvice": "Practical irrigation advice based on last watering and rain chance",
  "concern": "Potential risk or cautious observation regarding symptoms",
  "actions": [
    "Action step 1",
    "Action step 2",
    "Action step 3"
  ],
  "expertHelp": "When the farmer should visit the local Krishi Vigyan Kendra (KVK) or agriculture officer"
}
`;

    const soilBlock = buildSoilBlock(soilHealth);

    const userPrompt = `
FARMER INFORMATION:
- Crop: ${farmerProfile.crop || 'Not provided'}
- Growth Stage / Age: ${farmerProfile.cropAge || 'Not provided'}
- Soil Type: ${farmerProfile.soilType || 'Not provided'}
- Last Irrigation: ${farmerProfile.lastIrrigation || 'Not provided'}
- Observed Issue: ${farmerProfile.problem || 'Not provided'}
- Additional Notes: ${farmerProfile.additional || 'None'}
${soilBlock}
LOCATION & CURRENT WEATHER:
- Location: ${weatherContext.place || 'Unknown'}
- Air Temperature: ${weatherContext.temp ? weatherContext.temp + '°C' : 'Not provided'}
- Air Humidity: ${weatherContext.humidity ? weatherContext.humidity + '%' : 'Not provided'}
- Rain Probability (today, not current rainfall): ${weatherContext.rainChance ? weatherContext.rainChance + '%' : 'Not provided'}
- Wind Speed: ${weatherContext.wind ? weatherContext.wind + ' km/h' : 'Not provided'}
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // ---- Timeout guard so a hung Gemini call can't hang the whole function ----
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s

    let response;
    try {
      response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
          ],
          generationConfig: {
            responseMimeType: "application/json", // was "response_mime_type" (wrong REST field name)
            temperature: 0.2,
            maxOutputTokens: 1024
          }
        }),
        signal: controller.signal
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        return res.status(504).json({ error: "TIMEOUT", message: "Gemini did not respond in time." });
      }
      return res.status(502).json({ error: "NETWORK_ERROR", message: fetchErr.message });
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      const isModelError = response.status === 404 || /model/i.test(errText);
      return res.status(response.status).json({
        error: isModelError ? "MODEL_ERROR" : "GEMINI_ERROR",
        message: `Gemini request failed (status ${response.status}).`,
        details: errText
      });
    }

    const data = await response.json();

    if (data.promptFeedback && data.promptFeedback.blockReason) {
      return res.status(422).json({
        error: "BLOCKED",
        message: `Gemini blocked this request (${data.promptFeedback.blockReason}).`
      });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(502).json({ error: "NO_CONTENT", message: "Gemini returned no usable content." });
    }

    const parsedData = extractJSON(rawText);
    if (!parsedData || typeof parsedData !== 'object' || !parsedData.summary || !Array.isArray(parsedData.actions)) {
      return res.status(502).json({
        error: "INVALID_AI_RESPONSE",
        message: "Gemini response did not match the expected JSON schema."
      });
    }

    return res.status(200).json(parsedData);

  } catch (error) {
    return res.status(500).json({ error: "INTERNAL_ERROR", message: error.message });
  }
}

// Only adds a soil-test block to the prompt if the farmer actually entered
// at least one value — we never invent or assume soil readings.
function buildSoilBlock(soilHealth) {
  if (!soilHealth || typeof soilHealth !== 'object') return '';
  const fields = [
    ['pH', soilHealth.ph],
    ['Nitrogen (N)', soilHealth.nitrogen],
    ['Phosphorus (P)', soilHealth.phosphorus],
    ['Potassium (K)', soilHealth.potassium],
    ['Organic Carbon (%)', soilHealth.organicCarbon]
  ].filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');

  if (fields.length === 0) return '';

  const lines = fields.map(([label, v]) => `- ${label}: ${v}`).join('\n');
  return `\nSOIL TEST VALUES (farmer-provided, optional):\n${lines}\n`;
}

// Strips accidental markdown code fences (```json ... ```) before parsing,
// since JSON mode is not always perfectly honored by the model.
function extractJSON(text) {
  if (!text) return null;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}
