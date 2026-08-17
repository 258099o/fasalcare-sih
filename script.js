/* =========================================================
   FasalCare — script.js
   Full Conversational AI Assistant + Open-Meteo Integration
========================================================= */

const T = {
  hi: {
    tagline: "आपकी खेती की आसान डिजिटल मदद",
    cardWeather: "आज का मौसम", cardCrop: "मेरी फसल", cardTips: "खेती की सलाह",
    navHome: "होम", navAssistant: "सहायक", navWeather: "मौसम", navCrop: "फसल", navTips: "सलाह",
    assistantCardTitle: "मेरी खेती के बारे में पूछें",
    assistantCardSubtitle: "अपने खेत की स्थिति बताएं और तुरंत विशेषज्ञ सलाह पाएं",
    btnSpeak: "बोलकर बताएं", btnType: "लिखकर बताएं",
    assistantHeader: "FasalCare सहायक",
    typeAnswer: "अपना जवाब लिखें...", btnSend: "भेजें",
    reviewTitle: "आपकी जानकारी",
    btnAnalyzeText: "मेरी जानकारी का विश्लेषण करें",
    btnAnalyzing: "विश्लेषण कर रहे हैं...",
    summaryTitle: "FasalCare विश्लेषण रिपोर्ट",
    listen: "सुनें", btnRestart: "🔄 नई जानकारी पूछें",
    weatherTitle: "आज का मौसम", useLocation: "📍 मेरा स्थान बताएं", orText: "या",
    cityPlaceholder: "अपना शहर/गांव लिखें", search: "खोजें",
    loadingWeather: "मौसम की जानकारी ला रहे हैं…",
    rainChance: "बारिश की संभावना",
    humidity: "नमी", wind: "हवा", cropTitle: "मेरी फसल चुनें", tipsTitle: "आज की खेती की सलाह",
    errWeather: "मौसम की जानकारी उपलब्ध नहीं है। कृपया पुनः प्रयास करें।",
    errCityNotFound: "शहर नहीं मिला। कृपया नाम जांचकर फिर से लिखें।",
    errGeneric: "कुछ गड़बड़ हो गई। कृपया पुनः प्रयास करें।",
    errAIUnavailable: "AI सलाह अभी उपलब्ध नहीं है। स्थानीय फसल सलाह नीचे दी गई है।",
    errAIConfig: "सर्वर में एक तकनीकी सेटिंग की समस्या है। सामान्य फसल सलाह नीचे दी गई है।",
    skipText: "छोड़ें / पता नहीं",
    notProvided: "जानकारी नहीं दी गई"
  },
  en: {
    tagline: "Simple digital help for your farming",
    cardWeather: "Today's Weather", cardCrop: "My Crop", cardTips: "Crop Tips",
    navHome: "Home", navAssistant: "Assistant", navWeather: "Weather", navCrop: "Crop", navTips: "Tips",
    assistantCardTitle: "Tell FasalCare about your farm",
    assistantCardSubtitle: "Share your field condition to get personalized advice",
    btnSpeak: "Ask by Voice", btnType: "Type Details",
    assistantHeader: "FasalCare Assistant",
    typeAnswer: "Type your answer...", btnSend: "Send",
    reviewTitle: "Your Farm Information",
    btnAnalyzeText: "Analyze My Farm",
    btnAnalyzing: "Analyzing your farm...",
    summaryTitle: "FasalCare Analysis Report",
    listen: "Listen", btnRestart: "🔄 Start New Assessment",
    weatherTitle: "Today's Weather", useLocation: "📍 Use My Location", orText: "or",
    cityPlaceholder: "Enter your city/village", search: "Search",
    loadingWeather: "Fetching weather…",
    rainChance: "Rain chance today",
    humidity: "Humidity", wind: "Wind", cropTitle: "Select Your Crop", tipsTitle: "Today's Crop Tips",
    errWeather: "Weather information unavailable. Please try again.",
    errCityNotFound: "City not found. Please check the spelling and try again.",
    errGeneric: "Something went wrong. Please try again.",
    errAIUnavailable: "AI analysis is currently unavailable. Showing standard local guidance below.",
    errAIConfig: "There is a server configuration issue. Showing standard local guidance below.",
    skipText: "Skip / Unknown",
    notProvided: "Not provided"
  }
};

let currentLang = "hi";
let currentWeather = null;
let selectedCrop = null;

/* ---------- CHATBOT CONVERSATION STATE ---------- */
let currentStep = 0;
let isAnalyzing = false;
let awaitingResponse = false; // guards against duplicate/rapid-fire submissions
let currentSummaryTextToSpeak = "";

let farmerProfile = {
  crop: "",
  cropAge: "",
  soilType: "",
  lastIrrigation: "",
  problem: "",
  additional: ""
};

const QUESTIONS = [
  {
    key: "crop",
    hi: "नमस्ते! आप अपने खेत में कौन सी फसल उगा रहे हैं?",
    en: "Hello! Which crop are you growing in your field?",
    chips: {
      hi: ["गेहूं", "धान", "मक्का", "आलू", "टमाटर", "सरसों", "पता नहीं"],
      en: ["Wheat", "Rice", "Maize", "Potato", "Tomato", "Mustard", "Skip"]
    }
  },
  {
    key: "cropAge",
    hi: "आपकी फसल लगभग कितने दिन की है?",
    en: "Approximately how old is your crop (in days)?",
    chips: {
      hi: ["15-30 दिन", "30-60 दिन", "60+ दिन", "पता नहीं"],
      en: ["15-30 days", "30-60 days", "60+ days", "Skip"]
    }
  },
  {
    key: "soilType",
    hi: "आपके खेत की मिट्टी किस प्रकार की है?",
    en: "What type of soil do you have in your field?",
    chips: {
      hi: ["🟤 दोमट (Loamy)", "🏜️ रेतीली (Sandy)", "🪨 चिकनी (Clay)", "❓ पता नहीं"],
      en: ["🟤 Loamy", "🏜️ Sandy", "🪨 Clay", "❓ Skip"]
    }
  },
  {
    key: "lastIrrigation",
    hi: "पिछली बार खेत में पानी (सिंचाई) कब दिया था?",
    en: "When did you last irrigate the field?",
    chips: {
      hi: ["कल / आज", "2-4 दिन पहले", "1 हफ्ता पहले", "पता नहीं"],
      en: ["Yesterday / Today", "2-4 days ago", "1 week ago", "Skip"]
    }
  },
  {
    key: "problem",
    hi: "क्या फसल में कोई परेशानी या लक्षण दिख रहे हैं?",
    en: "Are you observing any specific problem or symptoms in the crop?",
    chips: {
      hi: ["पत्ते पीले हो रहे हैं", "कीट दिख रहे हैं", "सब ठीक है", "छोड़ें"],
      en: ["Yellowing leaves", "Pests visible", "Everything looks healthy", "Skip"]
    }
  },
  {
    key: "additional",
    hi: "क्या आप खेत या खाद से जुड़ी कोई और बात बताना चाहते हैं?",
    en: "Is there anything else you want to share about your farm?",
    chips: {
      hi: ["कुछ नहीं / आगे बढ़ें"],
      en: ["Nothing else / Proceed"]
    }
  }
];

// Words/phrases (typed or from chips) that mean "unknown / skip this question"
const SKIP_WORDS = [
  "पता नहीं", "छोड़ें", "आगे बढ़ें",
  "Skip", "skip", "SKIP", "unknown", "Unknown", "n/a", "N/A", "na", "NA"
];

/* ---------- LANGUAGE & SCREEN NAVIGATION ---------- */
function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.getElementById("langHi").classList.toggle("active", lang === "hi");
  document.getElementById("langEn").classList.toggle("active", lang === "en");

  document.querySelectorAll("[data-t]").forEach(el => {
    const key = el.getAttribute("data-t");
    if (T[lang][key]) el.textContent = T[lang][key];
  });
  document.querySelectorAll("[data-t-ph]").forEach(el => {
    const key = el.getAttribute("data-t-ph");
    if (T[lang][key]) el.placeholder = T[lang][key];
  });

  if (currentWeather) renderWeather();
  renderCropGrid();
}

function tr(key) { return T[currentLang][key] || key; }

function goTo(screen) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById("screen-" + screen);
  if (target) target.classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.screen === screen);
  });
}

/* ---------- Basic HTML escaping for any text we inject via innerHTML ---------- */
function escapeHTML(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------- CONVERSATIONAL ASSISTANT FLOW ---------- */

// mode: 'voice' | 'text'
// presetCrop: optional crop name already chosen on the Crop screen — must survive the reset below.
function startAssistant(mode, presetCrop) {
  goTo('assistant');
  restartAssistant(presetCrop);
  if (mode === 'voice') {
    setTimeout(startChatVoice, 600);
  }
}

function restartAssistant(presetCrop) {
  currentStep = 0;
  isAnalyzing = false;
  awaitingResponse = false;
  farmerProfile = { crop: "", cropAge: "", soilType: "", lastIrrigation: "", problem: "", additional: "" };

  document.getElementById("chatMessages").innerHTML = "";
  document.getElementById("chatQuickOptions").innerHTML = "";
  document.getElementById("chatReviewBox").classList.add("hidden");
  document.getElementById("analysisResult").classList.add("hidden");
  document.getElementById("chatInputBar").classList.remove("hidden");
  setChatInputEnabled(true);

  // BUG FIX: previously, selecting a crop on the Crop screen and then opening the
  // assistant reset farmerProfile.crop back to "". We now re-apply the preset crop
  // AFTER the reset, and skip straight past the "which crop" question.
  if (presetCrop) {
    farmerProfile.crop = presetCrop;
    addMessage("bot", QUESTIONS[0][currentLang]);
    addMessage("user", presetCrop);
    currentStep = 1;
  }

  askNextQuestion();
}

function addMessage(sender, text) {
  const container = document.getElementById("chatMessages");
  const msg = document.createElement("div");
  msg.className = `msg ${sender === 'bot' ? 'msg-bot' : 'msg-user'}`;
  msg.textContent = text; // textContent only — safe from HTML injection
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function askNextQuestion() {
  if (currentStep < QUESTIONS.length) {
    const q = QUESTIONS[currentStep];
    const text = q[currentLang];
    addMessage("bot", text);
    renderQuickOptions(q.chips[currentLang]);
  } else {
    showReviewBox();
  }
}

function renderQuickOptions(options) {
  const container = document.getElementById("chatQuickOptions");
  container.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    const isSkip = SKIP_WORDS.some(w => opt.includes(w));
    btn.className = `chip ${isSkip ? 'chip-skip' : ''}`;
    btn.textContent = opt;
    btn.onclick = () => handleUserResponse(opt);
    container.appendChild(btn);
  });
}

/* Enable/disable all chat inputs while a response is being processed,
   to prevent duplicate/empty submissions (Bug: duplicate/empty submissions). */
function setChatInputEnabled(enabled) {
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("btnChatSend");
  const micBtn = document.getElementById("btnChatMic");
  if (chatInput) chatInput.disabled = !enabled;
  if (sendBtn) sendBtn.disabled = !enabled;
  if (micBtn) micBtn.disabled = !enabled;
  document.querySelectorAll("#chatQuickOptions .chip").forEach(b => b.disabled = !enabled);
}

function submitChatInput() {
  if (awaitingResponse) return;
  const input = document.getElementById("chatInput");
  const val = input.value.trim();
  if (!val) return;
  input.value = "";
  handleUserResponse(val);
}

function handleUserResponse(answer) {
  if (awaitingResponse) return; // guard: ignore rapid duplicate taps/sends
  const trimmed = (answer || "").trim();
  if (!trimmed) return;

  awaitingResponse = true;
  setChatInputEnabled(false);

  const isSkip = SKIP_WORDS.some(w => trimmed.includes(w));
  addMessage("user", trimmed);

  const currentQ = QUESTIONS[currentStep];
  farmerProfile[currentQ.key] = isSkip ? tr("notProvided") : trimmed;

  document.getElementById("chatQuickOptions").innerHTML = "";
  currentStep++;

  setTimeout(() => {
    awaitingResponse = false;
    setChatInputEnabled(true);
    askNextQuestion();
  }, 400);
}

function showReviewBox() {
  document.getElementById("chatInputBar").classList.add("hidden");
  document.getElementById("chatQuickOptions").innerHTML = "";
  const reviewBox = document.getElementById("chatReviewBox");
  reviewBox.classList.remove("hidden");

  const details = document.getElementById("reviewDetails");
  details.innerHTML = `
    <div class="review-item"><span>🌱 ${currentLang === 'hi' ? 'फसल' : 'Crop'}:</span> <strong>${escapeHTML(farmerProfile.crop)}</strong></div>
    <div class="review-item"><span>📅 ${currentLang === 'hi' ? 'फसल की उम्र' : 'Crop Age'}:</span> <strong>${escapeHTML(farmerProfile.cropAge)}</strong></div>
    <div class="review-item"><span>🟤 ${currentLang === 'hi' ? 'मिट्टी' : 'Soil'}:</span> <strong>${escapeHTML(farmerProfile.soilType)}</strong></div>
    <div class="review-item"><span>💧 ${currentLang === 'hi' ? 'आखिरी सिंचाई' : 'Last Irrigation'}:</span> <strong>${escapeHTML(farmerProfile.lastIrrigation)}</strong></div>
    <div class="review-item"><span>⚠️ ${currentLang === 'hi' ? 'समस्या' : 'Problem'}:</span> <strong>${escapeHTML(farmerProfile.problem)}</strong></div>
  `;
}

/* ---------- GEMINI API DISPATCH & FALLBACK ---------- */
async function submitToGemini() {
  if (isAnalyzing) return;
  isAnalyzing = true;

  const btn = document.getElementById("btnAnalyze");
  btn.disabled = true;
  btn.textContent = tr("btnAnalyzing");

  const weatherContext = currentWeather || {
    place: currentLang === 'hi' ? "स्थान साझा नहीं किया गया" : "Location not shared",
    temp: null,
    humidity: null,
    rainChance: null,
    wind: null
  };

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmerProfile,
        weatherContext,
        lang: currentLang
      })
    });

    // Try to read the JSON body regardless of status, so we can see the
    // structured error code the server sends back (Bug: couldn't tell error types apart).
    let payload = null;
    try {
      payload = await response.json();
    } catch (parseErr) {
      payload = null;
    }

    if (!response.ok || !payload || payload.error) {
      const errCode = (payload && payload.error) ? payload.error : "UNKNOWN";
      console.warn("FasalCare: /api/chat failed —", errCode, payload && payload.message);

      const isConfigIssue = (errCode === "MISSING_API_KEY" || errCode === "MODEL_ERROR");
      renderFallbackAnalysis(isConfigIssue ? "config" : "network");
      return;
    }

    // Defensive schema check even on a 200 response.
    if (!payload.summary || !Array.isArray(payload.actions)) {
      console.warn("FasalCare: /api/chat returned an incomplete report", payload);
      renderFallbackAnalysis("invalid");
      return;
    }

    renderAnalysisResult(payload, false);

  } catch (error) {
    console.warn("FasalCare: Gemini call threw an error, falling back to local guidance:", error);
    renderFallbackAnalysis("network");
  } finally {
    isAnalyzing = false;
    btn.disabled = false;
    btn.textContent = tr("btnAnalyzeText");
  }
}

function renderAnalysisResult(data, isFallback, fallbackReason) {
  document.getElementById("chatReviewBox").classList.add("hidden");
  const resultBox = document.getElementById("analysisResult");
  resultBox.classList.remove("hidden");

  const body = document.getElementById("summaryContent");
  const actionsList = (data.actions || []).map(a => `<li>${escapeHTML(a)}</li>`).join("");

  let bannerText = "";
  if (isFallback) {
    bannerText = fallbackReason === "config" ? tr("errAIConfig") : tr("errAIUnavailable");
  }

  body.innerHTML = `
    ${isFallback ? `<div style="color:#D32F2F; font-size:12px; margin-bottom:8px;">⚠️ ${escapeHTML(bannerText)}</div>` : ''}
    <div class="report-section">
      <h4>🌱 ${currentLang === 'hi' ? 'फसल की स्थिति' : 'Crop Condition'}</h4>
      <p>${escapeHTML(data.summary)}</p>
    </div>
    <div class="report-section">
      <h4>🌦️ ${currentLang === 'hi' ? 'मौसम का असर' : 'Weather Context'}</h4>
      <p>${escapeHTML(data.weatherImpact)}</p>
    </div>
    <div class="report-section">
      <h4>💧 ${currentLang === 'hi' ? 'पानी की सलाह' : 'Water Advice'}</h4>
      <p>${escapeHTML(data.waterAdvice)}</p>
    </div>
    ${data.concern ? `
    <div class="report-section">
      <h4>⚠️ ${currentLang === 'hi' ? 'ध्यान देने योग्य बात' : 'Caution / Observation'}</h4>
      <p>${escapeHTML(data.concern)}</p>
    </div>` : ''}
    <div class="report-section">
      <h4>✅ ${currentLang === 'hi' ? 'आज के मुख्य काम' : 'Actionable Steps for Today'}</h4>
      <ul>${actionsList}</ul>
    </div>
    <div class="report-section">
      <h4>👨‍🌾 ${currentLang === 'hi' ? 'कब विशेषज्ञ से मिलें' : 'When to Contact Expert'}</h4>
      <p>${escapeHTML(data.expertHelp)}</p>
    </div>
  `;

  currentSummaryTextToSpeak = `${data.summary}. ${data.waterAdvice}.`;
}

// reason: 'network' (default) | 'config' | 'invalid'
function renderFallbackAnalysis(reason) {
  const fallback = {
    summary: currentLang === 'hi'
      ? `आपकी फसल (${farmerProfile.crop}) की सामान्य सलाह नीचे दी गई है।`
      : `Standard local guidance for your crop (${farmerProfile.crop}) is shown below.`,
    weatherImpact: currentWeather
      ? (currentLang === 'hi' ? `वर्तमान हवा का तापमान ${currentWeather.temp}°C और आज बारिश की संभावना ${currentWeather.rainChance}% है।` : `Current air temp is ${currentWeather.temp}°C with a ${currentWeather.rainChance}% rain chance today.`)
      : (currentLang === 'hi' ? "मौसम की जानकारी नहीं मिली।" : "Weather info not available."),
    waterAdvice: currentWeather && currentWeather.rainChance >= 50
      ? (currentLang === 'hi' ? "बारिश की संभावना अधिक है, इसलिए आज सिंचाई रोक सकते हैं।" : "High chance of rain; consider postponing irrigation.")
      : (currentLang === 'hi' ? "मिट्टी की ऊपरी 2 इंच परत में नमी देखकर ही पानी दें।" : "Check moisture in top 2 inches of soil before irrigating."),
    concern: currentLang === 'hi'
      ? "पीलापन या कीट दिखने पर स्थानीय कृषि विशेषज्ञ (KVK) से संपर्क करें।"
      : "If symptoms persist, get them checked by local agriculture officials.",
    actions: currentLang === 'hi'
      ? ["खेत की नमी स्वयं जांचें", "पत्तियों के निचले हिस्से में कीट देखें", "मौसम के अनुसार काम करें"]
      : ["Check soil moisture manually", "Inspect underside of leaves for pests", "Adjust work based on weather"],
    expertHelp: currentLang === 'hi'
      ? "यदि 3 दिन में स्थिति में सुधार न हो तो नज़दीकी कृषि विज्ञान केंद्र जाएं।"
      : "Contact nearest Krishi Vigyan Kendra if condition does not improve in 3 days."
  };
  renderAnalysisResult(fallback, true, reason || "network");
}

/* ---------- VOICE INPUT (SpeechRecognition) ---------- */
function startChatVoice() {
  if (awaitingResponse) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert(currentLang === 'hi' ? "इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है।" : "Voice recognition is not supported in this browser.");
    return;
  }

  const recog = new SR();
  recog.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
  recog.onstart = () => {
    document.getElementById("btnChatMic").textContent = "🔴";
  };
  recog.onresult = (e) => {
    const text = e.results[0][0].transcript;
    document.getElementById("chatInput").value = text;
    handleUserResponse(text);
  };
  recog.onerror = () => {
    document.getElementById("btnChatMic").textContent = "🎙️";
  };
  recog.onend = () => {
    document.getElementById("btnChatMic").textContent = "🎙️";
  };
  recog.start();
}

function speakSummary() {
  if (!('speechSynthesis' in window) || !currentSummaryTextToSpeak) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(currentSummaryTextToSpeak);
  utterance.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
  window.speechSynthesis.speak(utterance);
}

/* ---------- WEATHER (Open-Meteo Integration) ---------- */

// WMO weather codes -> icon + short bilingual condition label.
// (Bug fix: weather_code was fetched from the API but never actually used.)
const WEATHER_CODES = {
  0:  { icon: "☀️", hi: "साफ आसमान", en: "Clear sky" },
  1:  { icon: "🌤️", hi: "मुख्यतः साफ", en: "Mainly clear" },
  2:  { icon: "⛅", hi: "आंशिक बादल", en: "Partly cloudy" },
  3:  { icon: "☁️", hi: "बादल छाए हुए", en: "Overcast" },
  45: { icon: "🌫️", hi: "कोहरा", en: "Fog" },
  48: { icon: "🌫️", hi: "कोहरा (पाला)", en: "Rime fog" },
  51: { icon: "🌦️", hi: "हल्की बूंदाबांदी", en: "Light drizzle" },
  53: { icon: "🌦️", hi: "बूंदाबांदी", en: "Drizzle" },
  55: { icon: "🌧️", hi: "घनी बूंदाबांदी", en: "Dense drizzle" },
  56: { icon: "🌧️", hi: "जमने वाली बूंदाबांदी", en: "Freezing drizzle" },
  57: { icon: "🌧️", hi: "घनी जमने वाली बूंदाबांदी", en: "Dense freezing drizzle" },
  61: { icon: "🌧️", hi: "हल्की बारिश", en: "Light rain" },
  63: { icon: "🌧️", hi: "बारिश", en: "Rain" },
  65: { icon: "🌧️", hi: "तेज़ बारिश", en: "Heavy rain" },
  66: { icon: "🌧️", hi: "जमने वाली बारिश", en: "Freezing rain" },
  67: { icon: "🌧️", hi: "तेज़ जमने वाली बारिश", en: "Heavy freezing rain" },
  71: { icon: "🌨️", hi: "हल्की बर्फ़बारी", en: "Light snow" },
  73: { icon: "🌨️", hi: "बर्फ़बारी", en: "Snow" },
  75: { icon: "🌨️", hi: "तेज़ बर्फ़बारी", en: "Heavy snow" },
  77: { icon: "🌨️", hi: "बर्फ़ के कण", en: "Snow grains" },
  80: { icon: "🌦️", hi: "हल्की बौछारें", en: "Light showers" },
  81: { icon: "🌧️", hi: "बौछारें", en: "Showers" },
  82: { icon: "⛈️", hi: "तेज़ बौछारें", en: "Violent showers" },
  85: { icon: "🌨️", hi: "हल्की बर्फ़ की बौछारें", en: "Light snow showers" },
  86: { icon: "🌨️", hi: "तेज़ बर्फ़ की बौछारें", en: "Heavy snow showers" },
  95: { icon: "⛈️", hi: "आंधी-तूफान", en: "Thunderstorm" },
  96: { icon: "⛈️", hi: "तूफान (ओले संभव)", en: "Thunderstorm with hail" },
  99: { icon: "⛈️", hi: "तेज़ तूफान (ओले)", en: "Severe thunderstorm with hail" }
};

function getWeatherInfo(code) {
  const info = WEATHER_CODES[code] || { icon: "🌡️", hi: "जानकारी उपलब्ध नहीं", en: "Condition unavailable" };
  return { icon: info.icon, label: currentLang === 'hi' ? info.hi : info.en };
}

function clearWeatherError() {
  const el = document.getElementById("weatherError");
  if (!el) return;
  el.textContent = "";
  el.classList.add("hidden");
}

function showWeatherError(msg) {
  const el = document.getElementById("weatherError");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
}

async function fetchByGPS() {
  clearWeatherError();
  document.getElementById("weatherResult").classList.add("hidden");

  if (!navigator.geolocation) {
    showWeatherError(tr("errWeather"));
    return;
  }
  document.getElementById("weatherLoading").classList.remove("hidden");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      await loadWeather(pos.coords.latitude, pos.coords.longitude, null);
    },
    () => {
      document.getElementById("weatherLoading").classList.add("hidden");
      showWeatherError(tr("errWeather"));
    },
    { timeout: 10000 }
  );
}

async function fetchByCityName() {
  const name = document.getElementById("cityInput").value.trim();
  if (!name) return;

  clearWeatherError();
  document.getElementById("weatherResult").classList.add("hidden");
  document.getElementById("weatherLoading").classList.remove("hidden");

  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
    if (!res.ok) throw new Error("geocoding request failed");
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      document.getElementById("weatherLoading").classList.add("hidden");
      showWeatherError(tr("errCityNotFound"));
      return;
    }
    const r = data.results[0];
    const place = r.admin1 ? `${r.name}, ${r.admin1}` : r.name;
    await loadWeather(r.latitude, r.longitude, place);
  } catch (e) {
    document.getElementById("weatherLoading").classList.add("hidden");
    showWeatherError(tr("errGeneric"));
  }
}

async function loadWeather(lat, lon, placeNameOverride) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=precipitation_probability_max&timezone=auto`);
    if (!res.ok) throw new Error("weather request failed");
    const data = await res.json();
    if (!data.current) throw new Error("no current weather in response");

    currentWeather = {
      place: placeNameOverride || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      temp: Math.round(data.current.temperature_2m),
      humidity: Math.round(data.current.relative_humidity_2m),
      wind: Math.round(data.current.wind_speed_10m),
      weatherCode: data.current.weather_code,
      // This is the DAILY max rain PROBABILITY (%), not "it is currently raining".
      rainChance: (data.daily && Array.isArray(data.daily.precipitation_probability_max))
        ? data.daily.precipitation_probability_max[0]
        : 0
    };

    renderWeather();
    clearWeatherError();
    document.getElementById("weatherLoading").classList.add("hidden");
    document.getElementById("weatherResult").classList.remove("hidden");
  } catch (e) {
    document.getElementById("weatherLoading").classList.add("hidden");
    showWeatherError(tr("errWeather"));
  }
}

function renderWeather() {
  if (!currentWeather) return;
  document.getElementById("placeName").textContent = currentWeather.place;
  document.getElementById("wTemp").textContent = currentWeather.temp + "°C";
  document.getElementById("wRain").textContent = currentWeather.rainChance + "%";
  document.getElementById("wHumidity").textContent = currentWeather.humidity + "%";
  document.getElementById("wWind").textContent = currentWeather.wind + " km/h";

  const info = getWeatherInfo(currentWeather.weatherCode);
  document.getElementById("wIcon").textContent = info.icon;

  // Populate the previously-unused advice paragraph with condition + a simple rule-based tip.
  const adviceEl = document.getElementById("weatherAdvice");
  let tip;
  if (currentWeather.rainChance >= 60) {
    tip = currentLang === 'hi'
      ? "आज बारिश की संभावना अधिक है — सिंचाई रोकना बेहतर होगा।"
      : "High rain chance today — consider postponing irrigation.";
  } else if (currentWeather.rainChance <= 20 && currentWeather.humidity < 40) {
    tip = currentLang === 'hi'
      ? "मौसम शुष्क है — मिट्टी की नमी जांचकर ही सिंचाई करें।"
      : "Dry conditions — check soil moisture before irrigating.";
  } else {
    tip = currentLang === 'hi'
      ? "आज का मौसम सामान्य खेती कार्यों के लिए ठीक है।"
      : "Conditions look fine for regular field work today.";
  }
  adviceEl.textContent = `${info.icon} ${info.label} — ${tip}`;

  const snap = document.getElementById("homeSnapshot");
  snap.classList.remove("hidden");
  document.getElementById("snapWeather").textContent =
    `🌦️ ${currentWeather.place}: ${currentWeather.temp}°C | ${currentLang === 'hi' ? 'आज बारिश' : 'Rain today'}: ${currentWeather.rainChance}%`;
}

/* ---------- CROPS GRID ---------- */
const CROPS_LIST = [
  { id: "wheat", icon: "🌾", hi: "गेहूं", en: "Wheat" },
  { id: "rice", icon: "🌾", hi: "धान", en: "Rice" },
  { id: "maize", icon: "🌽", hi: "मक्का", en: "Maize" },
  { id: "potato", icon: "🥔", hi: "आलू", en: "Potato" },
  { id: "tomato", icon: "🍅", hi: "टमाटर", en: "Tomato" },
  { id: "mustard", icon: "🌿", hi: "सरसों", en: "Mustard" }
];

function renderCropGrid() {
  const grid = document.getElementById("cropGrid");
  if (!grid) return;
  grid.innerHTML = "";
  CROPS_LIST.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "crop-item";
    btn.innerHTML = `<span style="font-size:24px;">${c.icon}</span><br><strong>${currentLang === 'hi' ? c.hi : c.en}</strong>`;
    btn.onclick = () => {
      const cropName = currentLang === 'hi' ? c.hi : c.en;
      // BUG FIX: pass the crop straight into startAssistant instead of relying on
      // module-level farmerProfile.crop, which restartAssistant() used to wipe out.
      startAssistant('text', cropName);
    };
    grid.appendChild(btn);
  });
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
  setLanguage("hi");
  document.getElementById("chatInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") submitChatInput();
  });
});
