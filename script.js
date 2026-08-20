/* =========================================================
   FasalCare — script.js
   Conversational AI Assistant + Open-Meteo Integration
   + My Farm Dashboard + Schemes + Soil Health + Market Prices
   + Alerts + 7-Day Forecast + Today's Farm Brief
   + localStorage persistence (no backend database)
========================================================= */

const T = {
  hi: {
    tagline: "आपकी खेती की आसान डिजिटल मदद",
    cardWeather: "आज का मौसम", cardCrop: "मेरा फार्म", cardTips: "खेती की सलाह",
    navHome: "होम", navAssistant: "सहायक", navWeather: "मौसम", navFarm: "मेरा फार्म",
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
    humidity: "नमी", wind: "हवा",
    forecastTitle: "अगले दिनों का पूर्वानुमान",

    cropTitle: "मेरी फसल चुनें",
    tipsTitle: "आज की खेती की सलाह",

    farmTitle: "मेरा फार्म",
    briefTitle: "आज की फार्म संक्षिप्त जानकारी",
    briefNoProfile: "पहले सहायक के साथ अपनी फसल की जानकारी भरें, फिर यहां संक्षिप्त जानकारी दिखेगी।",
    briefCropOk: "कोई विशेष समस्या दर्ज नहीं की गई।",
    briefPriorities: "आज की प्राथमिकताएं",
    briefAllGood: "अभी कोई विशेष चेतावनी नहीं है — सामान्य देखभाल जारी रखें।",
    briefRunAssistant: "AI सहायक से पूरा विश्लेषण पाएं",
    briefFromAnalysis: "यह जानकारी आपके पिछले AI विश्लेषण पर आधारित है।",

    dashTitle: "मेरा फार्म — जानकारी",
    dashCrop: "फसल", dashCropAge: "फसल की उम्र", dashLocation: "स्थान",
    dashSoil: "मिट्टी", dashIrrigation: "आखिरी सिंचाई",

    statusTitle: "आज की स्थिति",
    statusWeather: "मौसम की स्थिति", statusWater: "पानी की सलाह",
    statusCrop: "फसल की स्थिति", statusAlerts: "सक्रिय अलर्ट",

    soilTitle: "मिट्टी स्वास्थ्य (वैकल्पिक)",
    soilHint: "अगर आपको ये मान पता नहीं हैं तो खाली छोड़ दें।",
    soilPh: "pH", soilN: "नाइट्रोजन (N)", soilP: "फॉस्फोरस (P)",
    soilK: "पोटैशियम (K)", soilOc: "जैविक कार्बन (%)",
    soilNote: "यह जानकारी अगली AI सलाह में शामिल की जाएगी।",

    schemesTitle: "सरकारी योजनाएं",
    schemesHint: "यह सूची केवल जानकारी के लिए है। पात्रता आधिकारिक वेबसाइट पर जांचें।",
    schemesTag: "आप पर लागू हो सकती है",
    schemesCheck: "आधिकारिक पात्रता जांचें",

    marketTitle: "मंडी भाव",
    marketPrototype: "मंडी भाव एकीकरण — प्रोटोटाइप चरण। वास्तविक/लाइव कीमतें अभी इस डेमो में उपलब्ध नहीं हैं।",
    marketOfficial: "आधिकारिक मंडी भाव देखें (Agmarknet)",

    alertsTitle: "फार्म अलर्ट",
    alertsEmpty: "अभी कोई अलर्ट नहीं है।",

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
    cardWeather: "Today's Weather", cardCrop: "My Farm", cardTips: "Crop Tips",
    navHome: "Home", navAssistant: "Assistant", navWeather: "Weather", navFarm: "My Farm",
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
    humidity: "Humidity", wind: "Wind",
    forecastTitle: "Upcoming Days Forecast",

    cropTitle: "Select Your Crop",
    tipsTitle: "Today's Crop Tips",

    farmTitle: "My Farm",
    briefTitle: "Today's Farm Brief",
    briefNoProfile: "Fill in your crop details with the Assistant first, and your brief will appear here.",
    briefCropOk: "No specific problem reported.",
    briefPriorities: "Today's priorities",
    briefAllGood: "No specific warnings right now — continue regular care.",
    briefRunAssistant: "Get a full AI analysis",
    briefFromAnalysis: "This is based on your last AI analysis.",

    dashTitle: "My Farm — Details",
    dashCrop: "Crop", dashCropAge: "Crop Age", dashLocation: "Location",
    dashSoil: "Soil Type", dashIrrigation: "Last Irrigation",

    statusTitle: "Today's Status",
    statusWeather: "Weather status", statusWater: "Water advice",
    statusCrop: "Crop condition", statusAlerts: "Active alerts",

    soilTitle: "Soil Health (optional)",
    soilHint: "Leave blank if you don't know these values.",
    soilPh: "pH", soilN: "Nitrogen (N)", soilP: "Phosphorus (P)",
    soilK: "Potassium (K)", soilOc: "Organic Carbon (%)",
    soilNote: "This will be included in your next AI analysis.",

    schemesTitle: "Government Schemes",
    schemesHint: "This list is for information only. Check eligibility on the official website.",
    schemesTag: "May be relevant to you",
    schemesCheck: "Check official eligibility",

    marketTitle: "Market Prices",
    marketPrototype: "Market price integration — prototype stage. Real/live prices are not available in this demo yet.",
    marketOfficial: "View official mandi prices (Agmarknet)",

    alertsTitle: "Farm Alerts",
    alertsEmpty: "No alerts right now.",

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
let currentWeather = null;      // today's weather snapshot
let currentForecast = null;     // { time:[], weather_code:[], temperature_2m_max:[], temperature_2m_min:[], precipitation_probability_max:[] }
let lastAnalysis = null;        // last successful Gemini report (or null)

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

let soilHealth = {
  ph: "", nitrogen: "", phosphorus: "", potassium: "", organicCarbon: ""
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

// Phrases that mean "everything looks fine" (used by Alerts / Farm Brief to avoid false alarms)
const NO_ISSUE_PHRASES = ["सब ठीक है", "Everything looks healthy"];
const OLD_IRRIGATION_HINTS = ["1 हफ्ता पहले", "1 week ago"];

/* =========================================================
   LOCAL STORAGE (prototype-level persistence, no backend DB)
========================================================= */
const STORAGE_KEY = "fasalcare_state_v1";

function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {}; // localStorage unavailable (private mode, etc.) — fail silently
  }
}

function saveStoredState(partial) {
  try {
    const current = loadStoredState();
    const merged = Object.assign({}, current, partial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    // storage full or unavailable — not critical, app still works this session
  }
}

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
  if (currentForecast) renderForecast(currentForecast);
  renderCropGrid();
  renderSchemes();
  renderTips();
  renderFarmDashboard();
  renderFarmBrief();
  renderAlerts();

  saveStoredState({ lang });
}

function tr(key) { return T[currentLang][key] || key; }

function goTo(screen) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById("screen-" + screen);
  if (target) target.classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.screen === screen);
  });

  // Refresh "My Farm" screen every time it's opened, since weather/analysis may have changed.
  if (screen === "farm") {
    renderFarmDashboard();
    renderFarmBrief();
    renderAlerts();
  }
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
// presetCrop: optional crop name already chosen on the My Farm screen — must survive the reset below.
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

  // Re-apply preset crop AFTER the reset above, and skip straight past the "which crop" question.
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
   to prevent duplicate/empty submissions. */
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

  // Persist as soon as the profile is complete, so My Farm reflects it even
  // if the farmer never clicks "Analyze".
  saveStoredState({ farmerProfile });
  renderFarmDashboard();
  renderFarmBrief();
  renderAlerts();
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

  // Only send soil health data if the farmer actually entered something —
  // never invent readings.
  const soilPayload = hasAnySoilValue() ? soilHealth : null;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmerProfile,
        weatherContext,
        soilHealth: soilPayload,
        lang: currentLang
      })
    });

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

    if (!payload.summary || !Array.isArray(payload.actions)) {
      console.warn("FasalCare: /api/chat returned an incomplete report", payload);
      renderFallbackAnalysis("invalid");
      return;
    }

    renderAnalysisResult(payload, false);
    lastAnalysis = Object.assign({}, payload, { generatedAt: Date.now() });
    saveStoredState({ lastAnalysis });
    renderFarmDashboard();
    renderFarmBrief();
    renderAlerts();

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
  if (isFallba
