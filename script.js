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
    loadingWeather: "मौसम की जानकारी ला रहे हैं…", rainChance: "बारिश",
    humidity: "नमी", wind: "हवा", cropTitle: "मेरी फसल चुनें", tipsTitle: "आज की खेती की सलाह",
    errWeather: "मौसम की जानकारी उपलब्ध नहीं है।",
    errCityNotFound: "शहर नहीं मिला।",
    errGeneric: "कुछ गड़बड़ हो गई। कृपया पुनः प्रयास करें।",
    errAIUnavailable: "AI सलाह अभी उपलब्ध नहीं है। स्थानीय फसल सलाह नीचे दी गई है।",
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
    loadingWeather: "Fetching weather…", rainChance: "Rain",
    humidity: "Humidity", wind: "Wind", cropTitle: "Select Your Crop", tipsTitle: "Today's Crop Tips",
    errWeather: "Weather information unavailable.",
    errCityNotFound: "City not found.",
    errGeneric: "Something went wrong. Please try again.",
    errAIUnavailable: "AI analysis is currently unavailable. Showing standard local guidance below.",
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

/* ---------- CONVERSATIONAL ASSISTANT FLOW ---------- */
function startAssistant(mode) {
  goTo('assistant');
  restartAssistant();
  if (mode === 'voice') {
    setTimeout(startChatVoice, 600);
  }
}

function restartAssistant() {
  currentStep = 0;
  isAnalyzing = false;
  farmerProfile = { crop: "", cropAge: "", soilType: "", lastIrrigation: "", problem: "", additional: "" };
  document.getElementById("chatMessages").innerHTML = "";
  document.getElementById("chatReviewBox").classList.add("hidden");
  document.getElementById("analysisResult").classList.add("hidden");
  document.getElementById("chatInputBar").classList.remove("hidden");
  askNextQuestion();
}

function addMessage(sender, text) {
  const container = document.getElementById("chatMessages");
  const msg = document.createElement("div");
  msg.className = `msg ${sender === 'bot' ? 'msg-bot' : 'msg-user'}`;
  msg.textContent = text;
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
    const isSkip = opt.includes("पता नहीं") || opt.includes("छोड़ें") || opt.includes("Skip");
    btn.className = `chip ${isSkip ? 'chip-skip' : ''}`;
    btn.textContent = opt;
    btn.onclick = () => handleUserResponse(opt);
    container.appendChild(btn);
  });
}

function submitChatInput() {
  const input = document.getElementById("chatInput");
  const val = input.value.trim();
  if (!val) return;
  input.value = "";
  handleUserResponse(val);
}

function handleUserResponse(answer) {
  const isSkip = answer.includes("पता नहीं") || answer.includes("छोड़ें") || answer.includes("Skip") || answer.includes("आगे बढ़ें");
  addMessage("user", answer);

  const currentQ = QUESTIONS[currentStep];
  farmerProfile[currentQ.key] = isSkip ? tr("notProvided") : answer;

  document.getElementById("chatQuickOptions").innerHTML = "";
  currentStep++;
  setTimeout(askNextQuestion, 400);
}

function showReviewBox() {
  document.getElementById("chatInputBar").classList.add("hidden");
  document.getElementById("chatQuickOptions").innerHTML = "";
  const reviewBox = document.getElementById("chatReviewBox");
  reviewBox.classList.remove("hidden");

  const details = document.getElementById("reviewDetails");
  details.innerHTML = `
    <div class="review-item"><span>🌱 ${currentLang === 'hi' ? 'फसल' : 'Crop'}:</span> <strong>${farmerProfile.crop}</strong></div>
    <div class="review-item"><span>📅 ${currentLang === 'hi' ? 'फसल की उम्र' : 'Crop Age'}:</span> <strong>${farmerProfile.cropAge}</strong></div>
    <div class="review-item"><span>🟤 ${currentLang === 'hi' ? 'मिट्टी' : 'Soil'}:</span> <strong>${farmerProfile.soilType}</strong></div>
    <div class="review-item"><span>💧 ${currentLang === 'hi' ? 'आखिरी सिंचाई' : 'Last Irrigation'}:</span> <strong>${farmerProfile.lastIrrigation}</strong></div>
    <div class="review-item"><span>⚠️ ${currentLang === 'hi' ? 'समस्या' : 'Problem'}:</span> <strong>${farmerProfile.problem}</strong></div>
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
    place: "Location not shared",
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

    if (!response.ok) {
      throw new Error("Serverless API response not OK");
    }

    const data = await response.json();
    renderAnalysisResult(data, false);

  } catch (error) {
    console.warn("Gemini API call failed or offline, falling back to local guidance:", error);
    renderFallbackAnalysis();
  } finally {
    isAnalyzing = false;
    btn.disabled = false;
    btn.textContent = tr("btnAnalyzeText");
  }
}

function renderAnalysisResult(data, isFallback) {
  document.getElementById("chatReviewBox").classList.add("hidden");
  const resultBox = document.getElementById("analysisResult");
  resultBox.classList.remove("hidden");

  const body = document.getElementById("summaryContent");
  const actionsList = (data.actions || []).map(a => `<li>${a}</li>`).join("");

  body.innerHTML = `
    ${isFallback ? `<div style="color:#D32F2F; font-size:12px; margin-bottom:8px;">⚠️ ${tr('errAIUnavailable')}</div>` : ''}
    <div class="report-section">
      <h4>🌱 ${currentLang === 'hi' ? 'फसल की स्थिति' : 'Crop Condition'}</h4>
      <p>${data.summary}</p>
    </div>
    <div class="report-section">
      <h4>🌦️ ${currentLang === 'hi' ? 'मौसम का असर' : 'Weather Context'}</h4>
      <p>${data.weatherImpact}</p>
    </div>
    <div class="report-section">
      <h4>💧 ${currentLang === 'hi' ? 'पानी की सलाह' : 'Water Advice'}</h4>
      <p>${data.waterAdvice}</p>
    </div>
    ${data.concern ? `
    <div class="report-section">
      <h4>⚠️ ${currentLang === 'hi' ? 'ध्यान देने योग्य बात' : 'Caution / Observation'}</h4>
      <p>${data.concern}</p>
    </div>` : ''}
    <div class="report-section">
      <h4>✅ ${currentLang === 'hi' ? 'आज के मुख्य काम' : 'Actionable Steps for Today'}</h4>
      <ul>${actionsList}</ul>
    </div>
    <div class="report-section">
      <h4>👨‍🌾 ${currentLang === 'hi' ? 'कब विशेषज्ञ से मिलें' : 'When to Contact Expert'}</h4>
      <p>${data.expertHelp}</p>
    </div>
  `;

  currentSummaryTextToSpeak = `${data.summary}. ${data.waterAdvice}.`;
}

function renderFallbackAnalysis() {
  const fallback = {
    summary: currentLang === 'hi'
      ? `आपकी फसल (${farmerProfile.crop}) की सामान्य सलाह नीचे दी गई है।`
      : `Standard local guidance for your crop (${farmerProfile.crop}) is shown below.`,
    weatherImpact: currentWeather
      ? (currentLang === 'hi' ? `वर्तमान हवा का तापमान ${currentWeather.temp}°C और बारिश की संभावना ${currentWeather.rainChance}% है।` : `Current air temp is ${currentWeather.temp}°C with ${currentWeather.rainChance}% rain chance.`)
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
  renderAnalysisResult(fallback, true);
}

/* ---------- VOICE INPUT (SpeechRecognition) ---------- */
function startChatVoice() {
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
async function fetchByGPS() {
  if (!navigator.geolocation) {
    alert(tr("errWeather"));
    return;
  }
  document.getElementById("weatherLoading").classList.remove("hidden");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      await loadWeather(pos.coords.latitude, pos.coords.longitude, null);
    },
    () => {
      document.getElementById("weatherLoading").classList.add("hidden");
      alert(tr("errWeather"));
    }
  );
}

async function fetchByCityName() {
  const name = document.getElementById("cityInput").value.trim();
  if (!name) return;
  document.getElementById("weatherLoading").classList.remove("hidden");
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      alert(tr("errCityNotFound"));
      document.getElementById("weatherLoading").classList.add("hidden");
      return;
    }
    const r = data.results[0];
    await loadWeather(r.latitude, r.longitude, `${r.name}, ${r.admin1 || ''}`);
  } catch (e) {
    document.getElementById("weatherLoading").classList.add("hidden");
    alert(tr("errGeneric"));
  }
}

async function loadWeather(lat, lon, placeNameOverride) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=precipitation_probability_max&timezone=auto`);
    const data = await res.json();

    currentWeather = {
      place: placeNameOverride || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      temp: Math.round(data.current.temperature_2m),
      humidity: Math.round(data.current.relative_humidity_2m),
      wind: Math.round(data.current.wind_speed_10m),
      rainChance: data.daily?.precipitation_probability_max ? data.daily.precipitation_probability_max[0] : 0
    };

    renderWeather();
    document.getElementById("weatherLoading").classList.add("hidden");
    document.getElementById("weatherResult").classList.remove("hidden");
  } catch (e) {
    document.getElementById("weatherLoading").classList.add("hidden");
    alert(tr("errWeather"));
  }
}

function renderWeather() {
  if (!currentWeather) return;
  document.getElementById("placeName").textContent = currentWeather.place;
  document.getElementById("wTemp").textContent = currentWeather.temp + "°C";
  document.getElementById("wRain").textContent = currentWeather.rainChance + "%";
  document.getElementById("wHumidity").textContent = currentWeather.humidity + "%";
  document.getElementById("wWind").textContent = currentWeather.wind + " km/h";

  const snap = document.getElementById("homeSnapshot");
  snap.classList.remove("hidden");
  document.getElementById("snapWeather").textContent = `🌦️ ${currentWeather.place}: ${currentWeather.temp}°C | ${currentLang === 'hi' ? 'बारिश' : 'Rain'}: ${currentWeather.rainChance}%`;
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
      farmerProfile.crop = currentLang === 'hi' ? c.hi : c.en;
      startAssistant('text');
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