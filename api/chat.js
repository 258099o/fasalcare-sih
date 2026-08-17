// api/chat.js — Secure Serverless Endpoint for Google Gemini
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (!apiKey) {
    return res.status(500).json({ 
      error: "MISSING_API_KEY", 
      message: "Gemini API key is not configured in server environment." 
    });
  }

  try {
    const { farmerProfile, weatherContext, lang } = req.body;

    const systemPrompt = `
You are FasalCare Farmer Assistant, a helpful and cautious agricultural decision-support expert for Indian smallholders.
The current language is ${lang === 'hi' ? 'Hindi' : 'English'}.

CRITICAL RULES:
1. Use ONLY the provided information. Do NOT invent missing measurements, soil moisture percentages, exact disease diagnoses, or imaginary facts.
2. If an attribute is "Not provided", explicitly treat it as unknown (e.g., "मिट्टी की वास्तविक नमी की जानकारी उपलब्ध नहीं है").
3. Distinguish clearly between:
   - KNOWN FACTS (from farmer input and weather data)
   - POSSIBLE EXPLANATIONS (never give a 100% definite diagnosis on vague symptoms)
   - RECOMMENDED ACTION
4. Keep the language extremely simple, conversational, and respectful. Avoid difficult academic vocabulary.
5. Return ONLY a valid JSON object matching the schema below without markdown backticks.

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

    const userPrompt = `
FARMER INFORMATION:
- Crop: ${farmerProfile.crop || 'Not provided'}
- Growth Stage / Age: ${farmerProfile.cropAge || 'Not provided'}
- Soil Type: ${farmerProfile.soilType || 'Not provided'}
- Last Irrigation: ${farmerProfile.lastIrrigation || 'Not provided'}
- Observed Issue: ${farmerProfile.problem || 'Not provided'}
- Additional Notes: ${farmerProfile.additional || 'None'}

LOCATION & CURRENT WEATHER:
- Location: ${weatherContext.place || 'Unknown'}
- Air Temperature: ${weatherContext.temp ? weatherContext.temp + '°C' : 'Not provided'}
- Air Humidity: ${weatherContext.humidity ? weatherContext.humidity + '%' : 'Not provided'}
- Rain Probability: ${weatherContext.rainChance ? weatherContext.rainChance + '%' : 'Not provided'}
- Wind Speed: ${weatherContext.wind ? weatherContext.wind + ' km/h' : 'Not provided'}
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "GEMINI_ERROR", details: errText });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Parse JSON
    const parsedData = JSON.parse(rawText);
    return res.status(200).json(parsedData);

  } catch (error) {
    return res.status(500).json({ error: "INTERNAL_ERROR", message: error.message });
  }
}
