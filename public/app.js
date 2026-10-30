/**
 * ASHA Sahayak - Frontline Mobile Web Application
 * Vanilla JS, Zero Build Step, Offline-First PWA, Multi-lingual (mr, hi, en).
 */

(function () {
  "use strict";

  // State Management
  const state = {
    language: localStorage.getItem("asha_lang") || "mr",
    currentTab: "view-triage",
    currentModule: "newborn",
    moduleData: null,
    currentQuestionIndex: 0,
    answers: {},
    measurements: {
      respiratory_rate: null,
      temperature_celsius: null
    },
    age: null,
    district: "Gadchiroli",
    block: "Kurkheda",
    isOffline: !navigator.onLine,
    breathCounter: {
      active: false,
      timer: null,
      secondsLeft: 30,
      taps: 0
    },
    latestResult: null
  };

  const DISTRICTS = {
    Gadchiroli: ["Kurkheda", "Dhanora", "Armori", "Chamorshi", "Aheri"],
    Nandurbar: ["Dhadgaon", "Akkalkuwa", "Taloda", "Shahada", "Navapur"],
    Pune: ["Haveli", "Ambegaon", "Junnar", "Khed", "Shirur"],
    Nashik: ["Trimbak", "Igatpuri", "Surgana", "Peint", "Kalwan"],
    Amravati: ["Dharni", "Chikhaldara", "Achalpur", "Morshi"],
    Thane: ["Shahapur", "Murbad", "Bhiwandi", "Kalyan"],
    Satara: ["Jawali", "Patan", "Mahabaleshwar", "Wai"]
  };

  const I18N_FALLBACK = {
    mr: {
      app_title: "आशा सहाय्यक",
      disclaimer: "हे ॲप केवळ निर्णय साहाय्यासाठी आहे, हा डॉक्टरांचा अंतिम निदान नाही. शंका असल्यास त्वरित आपल्या एएनएम (ANM) किंवा प्राथमिक आरोग्य केंद्राशी (PHC) संपर्क साधा.",
      btn_yes: "होय (YES)",
      btn_no: "नाही (NO)",
      btn_dk: "माहित नाही (DON'T KNOW)",
      btn_next: "पुढील प्रश्न (Next) →",
      btn_submit: "तपासणी पूर्ण करा (Submit) ✓",
      offline_msg: "ऑफलाइन मोड: स्थानिक नियमावलीनुसार सुरक्षित तपासणी सुरू आहे.",
      copied_msg: "संदर्भ नोंद कॉपी झाली!"
    },
    hi: {
      app_title: "आशा सहायक",
      disclaimer: "यह ऐप केवल निर्णय सहायता के लिए है, यह डॉक्टर की अंतिम जांच नहीं है। संदेह होने पर तुरंत अपनी एएनएम (ANM) या प्राथमिक स्वास्थ्य केंद्र (PHC) से संपर्क करें।",
      btn_yes: "हाँ (YES)",
      btn_no: "नहीं (NO)",
      btn_dk: "पता नहीं (DON'T KNOW)",
      btn_next: "अगला प्रश्न (Next) →",
      btn_submit: "परिणाम देखें (Submit) ✓",
      offline_msg: "ऑफलाइन मोड: इंटरनेट उपलब्ध नहीं है। स्थानीय नियमों के अनुसार कार्य जारी है।",
      copied_msg: "रेफरल पर्ची कॉपी हो गई!"
    },
    en: {
      app_title: "ASHA Sahayak",
      disclaimer: "Decision support only, not a medical diagnosis. When in doubt, call your ANM or the PHC immediately.",
      btn_yes: "YES",
      btn_no: "NO",
      btn_dk: "DON'T KNOW",
      btn_next: "Next Question →",
      btn_submit: "Complete Triage ✓",
      offline_msg: "Offline Mode: Rules engine operating locally with 100% safety.",
      copied_msg: "Referral note copied to clipboard!"
    }
  };

  // DOM Elements Cache
  const els = {};

  function initElements() {
    els.langSelect = document.getElementById("lang-select");
    els.appTitle = document.getElementById("ui-app-title");
    els.offlineAlert = document.getElementById("offline-alert");
    els.offlineMsg = document.getElementById("offline-msg");

    // Tabs
    els.tabBtns = document.querySelectorAll(".nav-tab-btn");
    els.tabViews = document.querySelectorAll(".tab-view");

    // Demographic inputs
    els.selectDistrict = document.getElementById("select-district");
    els.selectBlock = document.getElementById("select-block");
    els.inputAge = document.getElementById("input-age");
    els.lblAgeUnit = document.getElementById("lbl-age-unit");
    els.inputRR = document.getElementById("input-rr");
    els.inputTemp = document.getElementById("input-temp");

    // Sections
    els.secModuleSelect = document.getElementById("step-module-select");
    els.secDemographics = document.getElementById("step-demographics");
    els.secQuestions = document.getElementById("step-questions");
    els.secResults = document.getElementById("step-results");

    // Voice & Extraction
    els.textTranscript = document.getElementById("text-transcript");
    els.btnMic = document.getElementById("btn-mic");
    els.btnExtractSymptoms = document.getElementById("btn-extract-symptoms");
    els.extractStatus = document.getElementById("extract-status");

    // Breath Counter
    els.counterBpm = document.getElementById("counter-bpm");
    els.counterTimer = document.getElementById("counter-timer");
    els.btnBreathTap = document.getElementById("btn-breath-tap");
    els.btnBreathReset = document.getElementById("btn-breath-reset");

    // Question Flow
    els.progressFill = document.getElementById("question-progress-fill");
    els.stepIndicator = document.getElementById("question-step-text");
    els.moduleBadge = document.getElementById("question-module-badge");
    els.qText = document.getElementById("current-question-text");
    els.qWhy = document.getElementById("current-question-why");
    els.btnAnsYes = document.getElementById("btn-ans-yes");
    els.btnAnsNo = document.getElementById("btn-ans-no");
    els.btnAnsDk = document.getElementById("btn-ans-dk");
    els.btnPrevQ = document.getElementById("btn-prev-q");
    els.btnNextQ = document.getElementById("btn-next-q");

    // Result Screen
    els.resBanner = document.getElementById("result-color-banner");
    els.resBadge = document.getElementById("result-badge-text");
    els.resTitle = document.getElementById("result-title-text");
    els.resSignsList = document.getElementById("result-signs-list");
    els.resReasonsList = document.getElementById("result-reasons-list");
    els.resAdviceList = document.getElementById("result-advice-list");
    els.resWarningsList = document.getElementById("result-warnings-list");
    els.resAiExplanation = document.getElementById("result-ai-explanation");
    els.resReferralContent = document.getElementById("referral-note-content");
    els.resDisclaimer = document.getElementById("result-disclaimer");
    els.btnCopyNote = document.getElementById("btn-copy-note");
    els.btnShareWhatsapp = document.getElementById("btn-share-whatsapp");
    els.btnPrintNote = document.getElementById("btn-print-note");
    els.btnListenTTS = document.getElementById("btn-tts-listen");
    els.btnRestart = document.getElementById("btn-restart-triage");

    // Dashboard
    els.dashDist = document.getElementById("dash-filter-dist");
    els.dashBlock = document.getElementById("dash-filter-block");
    els.chkSimulated = document.getElementById("chk-toggle-simulated");
    els.dashAlertsList = document.getElementById("dash-alerts-list");
    els.statTotal = document.getElementById("stat-total-cases");
    els.statUrgent = document.getElementById("stat-urgent-cases");
    els.statPHC = document.getElementById("stat-visit-phc");
    els.statHome = document.getElementById("stat-home-care");
    els.dashModulesBar = document.getElementById("dash-modules-bar");
    els.dashTopSignsList = document.getElementById("dash-top-signs-list");
  }

  // -------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------
  function init() {
    initElements();
    setupEventListeners();
    setupNetworkStatusListeners();
    populateBlocks(els.selectDistrict.value, els.selectBlock);
    populateBlocks(els.dashDist.value, els.dashBlock, true);
    applyLanguage(state.language);
    registerServiceWorker();
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(reg => {
        console.log("Service Worker registered successfully.");
      }).catch(err => {
        console.warn("Service Worker registration failed:", err);
      });
    }
  }

  function setupNetworkStatusListeners() {
    const updateStatus = () => {
      state.isOffline = !navigator.onLine;
      if (state.isOffline) {
        els.offlineAlert.classList.remove("hidden");
        els.offlineMsg.innerText = I18N_FALLBACK[state.language].offline_msg;
      } else {
        els.offlineAlert.classList.add("hidden");
      }
    };
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
  }

  // -------------------------------------------------------------
  // Language & Localization
  // -------------------------------------------------------------
  function applyLanguage(lang) {
    state.language = lang;
    localStorage.setItem("asha_lang", lang);
    els.langSelect.value = lang;

    const strings = I18N_FALLBACK[lang] || I18N_FALLBACK.mr;
    els.appTitle.innerText = strings.app_title;
    document.getElementById("lbl-btn-yes").innerText = strings.btn_yes;
    document.getElementById("lbl-btn-no").innerText = strings.btn_no;
    document.getElementById("lbl-btn-dk").innerText = strings.btn_dk;
    els.resDisclaimer.innerText = strings.disclaimer;

    // Refresh questions if active
    if (state.moduleData) {
      renderCurrentQuestion();
    }
  }

  // -------------------------------------------------------------
  // District & Block Cascading Dropdowns
  // -------------------------------------------------------------
  function populateBlocks(distName, blockSelectEl, includeAllOption = false) {
    blockSelectEl.innerHTML = "";
    if (includeAllOption) {
      const optAll = document.createElement("option");
      optAll.value = "";
      optAll.innerText = state.language === "mr" ? "सर्व ब्लॉक्स (All)" : "All Blocks";
      blockSelectEl.appendChild(optAll);
    }
    const blocks = DISTRICTS[distName] || [];
    blocks.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b;
      opt.innerText = b;
      blockSelectEl.appendChild(opt);
    });
  }

  // -------------------------------------------------------------
  // Navigation & View Switching
  // -------------------------------------------------------------
  function switchTab(tabId) {
    state.currentTab = tabId;
    els.tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    els.tabViews.forEach(v => {
      v.classList.toggle("hidden", v.id !== tabId);
    });

    if (tabId === "view-dashboard") {
      loadDashboard();
    }
  }

  function startModule(moduleName) {
    state.currentModule = moduleName;
    state.answers = {};
    state.measurements = {
      respiratory_rate: null,
      temperature_celsius: null
    };
    state.currentQuestionIndex = 0;

    // Reset inputs for clean patient triage
    if (els.inputAge) els.inputAge.value = "";
    if (els.inputRR) els.inputRR.value = "";
    if (els.inputTemp) els.inputTemp.value = "";
    if (els.textTranscript) els.textTranscript.value = "";
    if (els.extractStatus) els.extractStatus.style.display = "none";
    resetBreathCounter();

    // Set age units
    if (moduleName === "newborn") {
      els.lblAgeUnit.innerText = state.language === "mr" ? "दिवस (Days 0-59)" : "Days (0-59)";
      els.inputAge.placeholder = "उदा. 12";
      els.inputAge.max = 59;
    } else if (moduleName === "child") {
      els.lblAgeUnit.innerText = state.language === "mr" ? "महिने (Months 2-59)" : "Months (2-59)";
      els.inputAge.placeholder = "उदा. 14";
      els.inputAge.max = 59;
    } else {
      els.lblAgeUnit.innerText = state.language === "mr" ? "वर्षे (Years)" : "Years";
      els.inputAge.placeholder = "उदा. 24";
      els.inputAge.max = 120;
    }

    // Switch view to Step 2 Demographics
    els.secModuleSelect.classList.add("hidden");
    els.secDemographics.classList.remove("hidden");
    els.secQuestions.classList.add("hidden");
    els.secResults.classList.add("hidden");
  }

  // -------------------------------------------------------------
  // Questionnaire Execution
  // -------------------------------------------------------------
  async function loadModuleRulesAndStartQuestions() {
    state.age = parseFloat(els.inputAge.value) || null;
    state.district = els.selectDistrict.value;
    state.block = els.selectBlock.value;

    const rr = parseInt(els.inputRR.value);
    const temp = parseFloat(els.inputTemp.value);
    state.measurements.respiratory_rate = !isNaN(rr) ? rr : null;
    state.measurements.temperature_celsius = !isNaN(temp) ? temp : null;

    // Load rules (try network, fall back to AshaRulesEngine local cache)
    try {
      if (!state.isOffline) {
        const resp = await fetch(`/api/rules/${state.currentModule}?lang=${state.language}`);
        if (resp.ok) {
          state.moduleData = await resp.json();
        }
      }
    } catch (e) {
      console.log("Using embedded local rules engine.");
    }

    if (!state.moduleData) {
      state.moduleData = window.AshaRulesEngine.RULES[state.currentModule];
    }

    state.currentQuestionIndex = 0;
    els.secDemographics.classList.add("hidden");
    els.secQuestions.classList.remove("hidden");
    renderCurrentQuestion();
  }

  function renderCurrentQuestion() {
    if (!state.moduleData || !state.moduleData.signs) return;
    const signs = state.moduleData.signs;
    const total = signs.length;
    const idx = state.currentQuestionIndex;

    if (idx >= total) {
      submitTriage();
      return;
    }

    const s = signs[idx];
    const qLang = s.question[state.language] || s.question.en || s.question;
    const whyLang = s.why_it_matters[state.language] || s.why_it_matters.en || s.why_it_matters;

    els.qText.innerText = qLang;
    els.qWhy.innerText = whyLang;
    els.stepIndicator.innerText = `प्रश्न ${idx + 1} / ${total}`;
    els.moduleBadge.innerText = state.currentModule.toUpperCase();

    // Progress bar
    const pct = ((idx + 1) / total) * 100;
    els.progressFill.style.width = `${pct}%`;

    // Highlight existing selection if answered
    const curVal = state.answers[s.id];
    els.btnAnsYes.classList.toggle("selected", curVal === true || curVal === "yes");
    els.btnAnsNo.classList.toggle("selected", curVal === false || curVal === "no");
    els.btnAnsDk.classList.toggle("selected", curVal === "dont_know");

    // Next button label
    const strings = I18N_FALLBACK[state.language] || I18N_FALLBACK.mr;
    els.btnNextQ.innerText = (idx === total - 1) ? strings.btn_submit : strings.btn_next;
  }

  function handleAnswer(val) {
    const signs = state.moduleData.signs;
    const s = signs[state.currentQuestionIndex];
    state.answers[s.id] = val;

    els.btnAnsYes.classList.toggle("selected", val === "yes");
    els.btnAnsNo.classList.toggle("selected", val === "no");
    els.btnAnsDk.classList.toggle("selected", val === "dont_know");

    // Auto advance smoothly after 200ms
    setTimeout(() => {
      advanceQuestion(1);
    }, 220);
  }

  function advanceQuestion(step) {
    const signs = state.moduleData.signs;
    const newIdx = state.currentQuestionIndex + step;
    if (newIdx < 0) {
      // Go back to demographics
      els.secQuestions.classList.add("hidden");
      els.secDemographics.classList.remove("hidden");
      return;
    }
    if (newIdx >= signs.length) {
      submitTriage();
      return;
    }
    state.currentQuestionIndex = newIdx;
    renderCurrentQuestion();
  }

  // -------------------------------------------------------------
  // Triage Submission & Offline Fallback
  // -------------------------------------------------------------
  async function submitTriage() {
    const payload = {
      module: state.currentModule,
      age: state.age,
      answers: state.answers,
      measurements: state.measurements,
      language: state.language,
      district: state.district,
      block: state.block
    };

    let result = null;

    if (!state.isOffline) {
      try {
        const resp = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (resp.ok) {
          result = await resp.json();
        }
      } catch (err) {
        console.warn("API triage failed, falling back to local JS engine:", err);
      }
    }

    // Local JS Fallback Evaluation (PWA Offline Invariant)
    if (!result) {
      const localEval = window.AshaRulesEngine.evaluate(
        state.currentModule,
        state.age,
        state.answers,
        state.measurements,
        state.language
      );
      const caseId = "OFFLINE-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      const disclaimer = (I18N_FALLBACK[state.language] || I18N_FALLBACK.mr).disclaimer;
      
      result = {
        case_id: caseId,
        level: localEval.level,
        rules_level: localEval.level,
        llm_suggested_level: null,
        triggered_signs: localEval.triggered_signs,
        reasons: localEval.reasons,
        home_care_advice: localEval.home_care_advice,
        warning_signs: localEval.warning_signs,
        unknown_urgent_signs: localEval.unknown_urgent_signs,
        explanation: (state.language === "mr") ?
          "ऑफलाइन क्लिनिकल नियमावलीनुसार निकाल काढला गेला आहे." :
          "Evaluation calculated locally via deterministic clinical rules engine.",
        referral_note: `ASHA SAHAYAK - OFFLINE REFERRAL NOTE\nCase ID: ${caseId}\nLevel: ${localEval.level}\nModule: ${state.currentModule}\nLocation: ${state.district}, ${state.block}\nTriggered Signs: ${localEval.triggered_sign_ids.join(', ')}`,
        disclaimer: disclaimer,
        timestamp: new Date().toISOString(),
        language: state.language
      };
      
      saveCaseToIndexedDB(result);
    }

    state.latestResult = result;
    renderResults(result);
  }

  function renderResults(res) {
    els.secQuestions.classList.add("hidden");
    els.secResults.classList.remove("hidden");

    // Severity banner styling
    els.resBanner.className = `result-banner ${res.level}`;
    els.resBadge.innerText = res.level;

    if (res.level === "URGENT_REFERRAL") {
      els.resTitle.innerText = state.language === "mr" ?
        "तात्काळ संदर्भ सेवा (तातडीने रुग्णालय/PHC हलवा)" :
        (state.language === "hi" ? "तत्काल रेफरल (तुरंत अस्पताल ले जाएं)" : "URGENT REFERRAL (Emergency Facility Transport)");
    } else if (res.level === "VISIT_PHC") {
      els.resTitle.innerText = state.language === "mr" ?
        "प्राथमिक आरोग्य केंद्रात तपासणी (२४ तासांत भेट)" :
        (state.language === "hi" ? "पीएचसी पर जांच (24 घंटे में दिखाएं)" : "VISIT PHC (Clinical Review in 24h)");
    } else {
      els.resTitle.innerText = state.language === "mr" ?
        "घरी काळजी व लक्ष ठेवणे (गृह व्यवस्थापन)" :
        (state.language === "hi" ? "घर पर देखभाल व निगरानी" : "HOME CARE (Home Management & Close Monitoring)");
    }

    // Triggered Signs List
    els.resSignsList.innerHTML = "";
    if (res.triggered_signs && res.triggered_signs.length > 0) {
      res.triggered_signs.forEach(s => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>[${s.level}]</strong> ${s.question || s.why_it_matters}`;
        els.resSignsList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.innerText = state.language === "mr" ? "कोणतेही गंभीर धोक्याचे लक्षण आढळले नाही." : "No acute red-flag signs recorded.";
      els.resSignsList.appendChild(li);
    }

    // Reasons List
    els.resReasonsList.innerHTML = "";
    (res.reasons || []).forEach(r => {
      const li = document.createElement("li");
      li.innerText = r;
      els.resReasonsList.appendChild(li);
    });

    // Protocol Advice List
    els.resAdviceList.innerHTML = "";
    (res.home_care_advice || []).forEach(adv => {
      const li = document.createElement("li");
      li.innerText = `• ${adv}`;
      els.resAdviceList.appendChild(li);
    });

    // Warning Signs List
    els.resWarningsList.innerHTML = "";
    (res.warning_signs || []).forEach(w => {
      const li = document.createElement("li");
      li.innerText = `⚠️ ${w}`;
      els.resWarningsList.appendChild(li);
    });

    // AI Explanation
    els.resAiExplanation.innerText = res.explanation || "--";

    // Referral Slip
    els.resReferralContent.innerText = res.referral_note || "";

    // Disclaimer
    els.resDisclaimer.innerText = res.disclaimer || "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // -------------------------------------------------------------
  // Voice Input (Web Speech API) & Symptom Extraction
  // -------------------------------------------------------------
  let recognition = null;
  function setupSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.log("Speech recognition not supported in this browser.");
      return;
    }

    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      els.btnMic.classList.add("recording");
    };

    recognition.onresult = (evt) => {
      const transcript = evt.results[0][0].transcript;
      els.textTranscript.value = transcript;
      els.btnMic.classList.remove("recording");
    };

    recognition.onerror = (err) => {
      console.warn("Speech recognition error:", err);
      els.btnMic.classList.remove("recording");
    };

    recognition.onend = () => {
      els.btnMic.classList.remove("recording");
    };
  }

  function toggleSpeech() {
    if (!recognition) {
      setupSpeechRecognition();
    }
    if (!recognition) {
      alert("Voice input is not supported in this browser. Please type symptoms.");
      return;
    }

    if (els.btnMic.classList.contains("recording")) {
      recognition.stop();
    } else {
      const langCodes = { mr: "mr-IN", hi: "hi-IN", en: "en-IN" };
      recognition.lang = langCodes[state.language] || "mr-IN";
      try {
        recognition.start();
      } catch (e) {
        console.warn("Recognition start failed:", e);
      }
    }
  }

  async function extractSymptomsFromText() {
    const text = els.textTranscript.value.trim();
    if (!text) return;

    els.extractStatus.style.display = "block";
    els.extractStatus.innerText = state.language === "mr" ? "लक्षणे ओळखत आहे..." : "Extracting candidate danger signs...";

    try {
      const resp = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: state.currentModule,
          language: state.language,
          transcript: text
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        const suggested = data.suggested_signs || [];
        suggested.forEach(sId => {
          state.answers[sId] = true;
        });
        els.extractStatus.innerText = state.language === "mr" ?
          `✨ ${suggested.length} लक्षणे ओळखली! पुढील स्क्रीनवर खात्री करा.` :
          `✨ Suggested ${suggested.length} candidate signs. Confirm on next screen.`;
      }
    } catch (e) {
      els.extractStatus.innerText = "Symptom extraction offline.";
    }
  }

  // -------------------------------------------------------------
  // Breath Rate Counter Tool
  // -------------------------------------------------------------
  function startBreathCounter() {
    const bc = state.breathCounter;
    if (bc.active) {
      // Register tap
      bc.taps += 1;
      const elapsed = 30 - bc.secondsLeft;
      if (elapsed > 0) {
        const rate = Math.round((bc.taps / elapsed) * 60);
        els.counterBpm.innerText = rate;
      }
      return;
    }

    // Start 30s countdown
    bc.active = true;
    bc.taps = 1;
    bc.secondsLeft = 30;
    els.counterBpm.innerText = "0";
    els.btnBreathTap.innerText = "👆 श्वास मोजत आहे... (TAP EACH BREATH)";

    bc.timer = setInterval(() => {
      bc.secondsLeft -= 1;
      els.counterTimer.innerText = `वेळ शिल्लक: ${bc.secondsLeft} सेकंद (Left: ${bc.secondsLeft}s)`;

      if (bc.secondsLeft <= 0) {
        clearInterval(bc.timer);
        bc.active = false;
        const finalBpm = Math.round((bc.taps / 30) * 60);
        els.counterBpm.innerText = finalBpm;
        els.inputRR.value = finalBpm;
        state.measurements.respiratory_rate = finalBpm;
        els.btnBreathTap.innerText = "✓ मोजणी पूर्ण! (TAP to restart)";
      }
    }, 1000);
  }

  function resetBreathCounter() {
    const bc = state.breathCounter;
    if (bc.timer) clearInterval(bc.timer);
    bc.active = false;
    bc.taps = 0;
    bc.secondsLeft = 30;
    els.counterBpm.innerText = "0";
    els.counterTimer.innerText = "वेळ: 30 सेकंद (Time: 30s)";
    els.btnBreathTap.innerText = "👆 श्वास घेतल्यावर टॅप करा (TAP)";
  }

  // -------------------------------------------------------------
  // Text-To-Speech Read-Aloud Result
  // -------------------------------------------------------------
  function speakResultSummary() {
    if (!window.speechSynthesis || !state.latestResult) return;
    window.speechSynthesis.cancel();

    const res = state.latestResult;
    let spokenText = `${res.level}. `;
    if (res.triggered_signs && res.triggered_signs.length > 0) {
      spokenText += res.triggered_signs.map(s => s.question || s.why_it_matters).join(". ");
    } else {
      spokenText += "No danger signs.";
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    const langCodes = { mr: "mr-IN", hi: "hi-IN", en: "en-IN" };
    utterance.lang = langCodes[state.language] || "mr-IN";
    window.speechSynthesis.speak(utterance);
  }

  // -------------------------------------------------------------
  // Referral Note Actions
  // -------------------------------------------------------------
  function copyReferralNote() {
    if (!state.latestResult) return;
    const note = state.latestResult.referral_note || "";
    navigator.clipboard.writeText(note).then(() => {
      const msg = (I18N_FALLBACK[state.language] || I18N_FALLBACK.mr).copied_msg;
      alert(msg);
    });
  }

  function shareWhatsApp() {
    if (!state.latestResult) return;
    const note = state.latestResult.referral_note || "";
    const encoded = encodeURIComponent(note);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  }

  function printReferralNote() {
    window.print();
  }

  // -------------------------------------------------------------
  // IndexedDB Storage for Offline Queue
  // -------------------------------------------------------------
  function saveCaseToIndexedDB(record) {
    if (!window.indexedDB) return;
    const req = window.indexedDB.open("AshaSahayakDB", 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("offline_cases")) {
        db.createObjectStore("offline_cases", { keyPath: "case_id" });
      }
    };
    req.onsuccess = e => {
      const db = e.target.result;
      const tx = db.transaction("offline_cases", "readwrite");
      tx.objectStore("offline_cases").put(record);
    };
  }

  // -------------------------------------------------------------
  // Dashboard Analytics & Cluster Alerts
  // -------------------------------------------------------------
  async function loadDashboard() {
    const dist = els.dashDist.value;
    const blk = els.dashBlock.value;
    const incSim = els.chkSimulated.checked;

    let url = `/api/dashboard?include_simulated=${incSim}`;
    if (dist) url += `&district=${encodeURIComponent(dist)}`;
    if (blk) url += `&block=${encodeURIComponent(blk)}`;

    try {
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        renderDashboard(data);
      }
    } catch (e) {
      console.warn("Dashboard fetch failed:", e);
    }
  }

  function renderDashboard(data) {
    els.statTotal.innerText = data.total_cases || 0;
    els.statUrgent.innerText = (data.cases_by_level && data.cases_by_level.URGENT_REFERRAL) || 0;
    els.statPHC.innerText = (data.cases_by_level && data.cases_by_level.VISIT_PHC) || 0;
    els.statHome.innerText = (data.cases_by_level && data.cases_by_level.HOME_CARE) || 0;

    // Cluster Alerts
    els.dashAlertsList.innerHTML = "";
    const alerts = data.cluster_alerts || [];
    if (alerts.length > 0) {
      alerts.forEach(a => {
        const div = document.createElement("div");
        div.className = "alert-pill";
        div.innerHTML = `<strong>[${a.alert_level}] ${a.district} / ${a.block}:</strong> ${a.case_count} cases of <em>"${a.sign_name}"</em> within ${a.time_window_days} days.`;
        els.dashAlertsList.appendChild(div);
      });
    } else {
      els.dashAlertsList.innerHTML = "<p style='font-size:0.85rem; color:#15803d;'>कोणताही सक्रिय क्लस्टर अलर्ट नाही. (No active syndromic cluster alerts).</p>";
    }

    // Module Distribution Bar
    els.dashModulesBar.innerHTML = "";
    const modCounts = data.cases_by_module || {};
    const modSpans = Object.entries(modCounts).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join(" | ");
    els.dashModulesBar.innerHTML = modSpans || "No data.";

    // Top Signs
    els.dashTopSignsList.innerHTML = "";
    (data.top_signs || []).forEach(ts => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${ts.count} cases:</strong> ${ts.name_mr || ts.name_en} <span style='font-size:0.8rem; color:#64748b;'>(${ts.level})</span>`;
      els.dashTopSignsList.appendChild(li);
    });
  }

  // -------------------------------------------------------------
  // Setup Event Listeners
  // -------------------------------------------------------------
  function setupEventListeners() {
    // Language Switcher
    els.langSelect.addEventListener("change", e => {
      applyLanguage(e.target.value);
    });

    // Nav Tabs
    els.tabBtns.forEach(btn => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // Module Selector Cards
    document.querySelectorAll(".module-card-btn").forEach(btn => {
      btn.addEventListener("click", () => startModule(btn.dataset.module));
    });

    // Back to modules
    document.getElementById("btn-back-to-modules").addEventListener("click", () => {
      els.secDemographics.classList.add("hidden");
      els.secModuleSelect.classList.remove("hidden");
    });

    // District Dropdowns
    els.selectDistrict.addEventListener("change", () => {
      populateBlocks(els.selectDistrict.value, els.selectBlock);
    });
    els.dashDist.addEventListener("change", () => {
      populateBlocks(els.dashDist.value, els.dashBlock, true);
      loadDashboard();
    });
    els.dashBlock.addEventListener("change", () => loadDashboard());
    els.chkSimulated.addEventListener("change", () => loadDashboard());

    // Proceed to questions
    document.getElementById("btn-proceed-to-questions").addEventListener("click", loadModuleRulesAndStartQuestions);

    // Voice & Extract
    els.btnMic.addEventListener("click", toggleSpeech);
    els.btnExtractSymptoms.addEventListener("click", extractSymptomsFromText);

    // Breath Counter
    els.btnBreathTap.addEventListener("click", startBreathCounter);
    els.btnBreathReset.addEventListener("click", resetBreathCounter);

    // Question Answers
    els.btnAnsYes.addEventListener("click", () => handleAnswer("yes"));
    els.btnAnsNo.addEventListener("click", () => handleAnswer("no"));
    els.btnAnsDk.addEventListener("click", () => handleAnswer("dont_know"));
    els.btnPrevQ.addEventListener("click", () => advanceQuestion(-1));
    els.btnNextQ.addEventListener("click", () => advanceQuestion(1));

    // Result Actions
    els.btnCopyNote.addEventListener("click", copyReferralNote);
    els.btnShareWhatsapp.addEventListener("click", shareWhatsApp);
    els.btnPrintNote.addEventListener("click", printReferralNote);
    els.btnListenTTS.addEventListener("click", speakResultSummary);
    els.btnRestart.addEventListener("click", () => {
      state.answers = {};
      state.currentQuestionIndex = 0;
      els.secResults.classList.add("hidden");
      els.secModuleSelect.classList.remove("hidden");
    });
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
