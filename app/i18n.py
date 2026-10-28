"""Internationalization and localization dictionary for ASHA Sahayak.
Supports Marathi (mr), Hindi (hi), and English (en).
"""

from typing import Dict, Any

LANGUAGES = ["mr", "hi", "en"]
DEFAULT_LANGUAGE = "mr"

TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "app_title": {
        "en": "ASHA Sahayak",
        "hi": "आशा सहायक",
        "mr": "आशा सहाय्यक",
    },
    "app_subtitle": {
        "en": "Frontline Clinical Decision Support for Rural Health Workers",
        "hi": "ग्रामीण स्वास्थ्य कार्यकर्ताओं के लिए नैदानिक निर्णय सहायता",
        "mr": "ग्रामीण आरोग्य सेविकांसाठी क्लिनिकल निर्णय साहाय्य प्रणाली",
    },
    "disclaimer": {
        "en": "Decision support only, not a medical diagnosis. When in doubt, call your ANM or the PHC immediately.",
        "hi": "यह ऐप केवल निर्णय सहायता के लिए है, यह डॉक्टर की अंतिम जांच नहीं है। संदेह होने पर तुरंत अपनी एएनएम (ANM) या प्राथमिक स्वास्थ्य केंद्र (PHC) से संपर्क करें।",
        "mr": "हे ॲप केवळ निर्णय साहाय्यासाठी आहे, हा डॉक्टरांचा अंतिम निदान नाही. शंका असल्यास त्वरित आपल्या एएनएम (ANM) किंवा प्राथमिक आरोग्य केंद्राशी (PHC) संपर्क साधा.",
    },
    "ai_fallback_notice": {
        "en": "AI explanation unavailable, showing standard guidance.",
        "hi": "AI विश्लेषण अनुपलब्ध है, मानक दिशा-निर्देश दिखाए जा रहे हैं।",
        "mr": "AI विश्लेषण अनुपलब्ध आहे, प्रमाणित मार्गदर्शक तत्त्वे दाखवली जात आहेत.",
    },
    "unknown_urgent_alert": {
        "en": "Urgent danger sign marked as 'Don't Know'. Please re-examine this sign immediately or refer to PHC as safety precaution.",
        "hi": "गंभीर खतरे के लक्षण पर 'पता नहीं' दर्ज है। कृपया तुरंत इस लक्षण की पुनः जांच करें या सुरक्षा के लिए पीएचसी रेफर करें।",
        "mr": "धोक्याच्या गंभीर लक्षणावर 'माहित नाही' नोंदवले आहे. कृपया त्वरित या लक्षणाची पुन्हा तपासणी करा किंवा सुरक्षेसाठी प्राथमिक आरोग्य केंद्रात घेऊन जा.",
    },
    "level_URGENT_REFERRAL": {
        "en": "URGENT REFERRAL (Immediate Transport to Hospital / PHC)",
        "hi": "तत्काल रेफरल (तुरंत अस्पताल / पीएचसी ले जाएं)",
        "mr": "तात्काळ संदर्भ सेवा (तातडीने रुग्णालय / प्राथमिक आरोग्य केंद्रात हलवा)",
    },
    "level_VISIT_PHC": {
        "en": "VISIT PHC (Clinical Check-up within 24 Hours)",
        "hi": "पीएचसी पर जांच (24 घंटे में डॉक्टर को दिखाएं)",
        "mr": "प्राथमिक आरोग्य केंद्रात तपासणी (२४ तासांत डॉक्टरांना दाखवा)",
    },
    "level_HOME_CARE": {
        "en": "HOME CARE (Home Management & Close Monitoring)",
        "hi": "घर पर देखभाल (घरेलू देखभाल व निगरानी)",
        "mr": "घरी काळजी व लक्ष ठेवणे (गृह व्यवस्थापन)",
    },
    "btn_yes": {"en": "YES", "hi": "हाँ", "mr": "होय"},
    "btn_no": {"en": "NO", "hi": "नहीं", "mr": "नाही"},
    "btn_dont_know": {"en": "DON'T KNOW", "hi": "पता नहीं", "mr": "माहित नाही"},
    "btn_next": {"en": "Next Question", "hi": "अगला प्रश्न", "mr": "पुढील प्रश्न"},
    "btn_prev": {"en": "Previous", "hi": "पिछला", "mr": "मागे"},
    "btn_submit": {"en": "Complete Triage", "hi": "परिणाम देखें", "mr": "तपासणी पूर्ण करा"},
    "btn_copy": {"en": "Copy Note", "hi": "नोट कॉपी करें", "mr": "नोंद कॉपी करा"},
    "btn_whatsapp": {"en": "Share on WhatsApp", "hi": "व्हाट्सएप पर भेजें", "mr": "व्हॉट्सॲपवर पाठवा"},
    "btn_print": {"en": "Print / PDF", "hi": "प्रिंट / पीडीएफ", "mr": "प्रिंट / सेव्ह करा"},
    "btn_call_anm": {"en": "Call ANM / 108", "hi": "एएनएम / 108 को कॉल करें", "mr": "एएनएम / १०८ ला कॉल करा"},
    "btn_listen": {"en": "Listen Summary", "hi": "सारांश सुनें", "mr": "सारांश ऐका"},
    "btn_extract": {"en": "Extract Symptoms", "hi": "लक्षण पहचानें", "mr": "लक्षणे तपासा"},
    "btn_start_breath_counter": {"en": "Count Breaths (30s)", "hi": "सांस गिनें (30 से)", "mr": "श्वास मोजा (३० सेकंद)"},
    "btn_restart": {"en": "New Patient", "hi": "नया मरीज", "mr": "नवीन रुग्ण"},
    "section_triggered_signs": {
        "en": "Identified Danger Signs",
        "hi": "पहचाने गए खतरे के लक्षण",
        "mr": "आढळलेली धोक्याची लक्षणे",
    },
    "section_reasons": {
        "en": "Clinical Reasons for Triage",
        "hi": "रेफरल के चिकित्सकीय कारण",
        "mr": "सल्ल्याची वैद्यकीय कारणे",
    },
    "section_immediate_advice": {
        "en": "Protocol Care & Advice",
        "hi": "दिशा-निर्देश और देखभाल सलाह",
        "mr": "प्रोटोकॉलनुसार काळजी व सल्ला",
    },
    "section_warning_signs": {
        "en": "Return Immediately If You Notice",
        "hi": "तुरंत अस्पताल लौटें यदि यह लक्षण दिखें",
        "mr": "खालीलपैकी कोणतेही लक्षण दिसल्यास त्वरित परत या",
    },
    "section_referral_note": {
        "en": "Referral Slip for Medical Officer (PHC)",
        "hi": "चिकित्सा अधिकारी (पीएचसी) के लिए रेफरल पर्ची",
        "mr": "वैद्यकीय अधिकाऱ्यांसाठी (PHC) संदर्भ चिठ्ठी",
    },
    "module_newborn": {
        "en": "Newborn (0 to 59 days)",
        "hi": "नवजात शिशु (0 से 59 दिन)",
        "mr": "नवजात बाळ (० ते ५९ दिवस)",
    },
    "module_pregnancy": {
        "en": "Pregnant / Postpartum Mother",
        "hi": "गर्भवती एवं प्रसूता महिला",
        "mr": "गर्भवती व बाळंत स्त्री",
    },
    "module_child": {
        "en": "Child (2 months to 5 years)",
        "hi": "बच्चा (2 माह से 5 वर्ष)",
        "mr": "लहान मूल (२ महिने ते ५ वर्षे)",
    },
    "module_adult": {
        "en": "Adult (with Fever or Cough)",
        "hi": "वयस्क (बुखार या खांसी)",
        "mr": "ताप किंवा खोकला असलेला प्रौढ",
    },
    "simulated_data_banner": {
        "en": "SIMULATED DEMO DATA: Showing realistic mock surveillance records for evaluation. Toggle to switch to live records.",
        "hi": "सिम्युलेटेड डेमो डेटा: मूल्यांकन के लिए यथार्थवादी मॉक रिकॉर्ड दिखाए जा रहे हैं। लाइव डेटा देखने के लिए टॉगल करें।",
        "mr": "प्रात्यक्षिक सिम्युलेटेड डेटा: मूल्यमापनासाठी प्रातिनिधिक डेटा दाखवला आहे. थेट नोंदींसाठी टॉगल करा.",
    },
}


def get_text(key: str, lang: str = "mr") -> str:
    """Return localized string for key and language."""
    if lang not in LANGUAGES:
        lang = DEFAULT_LANGUAGE
    entry = TRANSLATIONS.get(key)
    if not entry:
        return key
    return entry.get(lang, entry.get(DEFAULT_LANGUAGE, key))


def get_all_strings(lang: str = "mr") -> Dict[str, str]:
    """Return all UI translations for given language."""
    if lang not in LANGUAGES:
        lang = DEFAULT_LANGUAGE
    return {k: v.get(lang, v.get(DEFAULT_LANGUAGE, k)) for k, v in TRANSLATIONS.items()}
