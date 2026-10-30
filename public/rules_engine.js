/**
 * Client-Side JavaScript Deterministic Rules Engine for ASHA Sahayak.
 * 100% Parity with Python RulesEngine for offline PWA operation.
 * Supports Node.js (CommonJS) and Browser environments.
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AshaRulesEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  // Embedded Rule Definitions for 100% Offline Standalone Execution
  const RULES = {
    newborn: {
      target_group: {
        en: "Newborn (0 to 59 days)",
        hi: "नवजात शिशु (0 से 59 दिन)",
        mr: "नवजात बाळ (० ते ५९ दिवस)"
      },
      signs: [
        {
          id: "nb_feeding_stop",
          level: "URGENT",
          question: {
            en: "Is the baby not feeding well or has stopped sucking milk?",
            hi: "क्या बच्चा ठीक से दूध नहीं पी रहा है या स्तनपान करना बंद कर दिया है?",
            mr: "बाळ व्यवस्थित दूध पीत नाही किंवा स्तनपान करणे पूर्णपणे बंद केले आहे का?"
          },
          why_it_matters: {
            en: "Inability to feed is an early indicator of severe neonatal infection, sepsis, or critical illness.",
            hi: "दूध न पी पाना नवजात में गंभीर संक्रमण, सेप्सिस या गंभीर बीमारी का शुरुआती संकेत है।",
            mr: "दूध न पिणे हे नवजात बाळामध्ये गंभीर संसर्ग, सेप्सिस किंवा धोकादायक आजाराचे प्रमुख लक्षण आहे."
          }
        },
        {
          id: "nb_convulsions",
          level: "URGENT",
          question: {
            en: "Has the baby had convulsions, fits, or abnormal twitching movements?",
            hi: "क्या बच्चे को दौरे, झटके या असामान्य ऐंठन आ रही है?",
            mr: "बाळाला झटके, आकडी किंवा अंगात थरथर येत आहे का?"
          },
          why_it_matters: {
            en: "Convulsions indicate serious neurological involvement, meningitis, severe asphyxia, or hypoglycemia.",
            hi: "दौरे मस्तिष्क संक्रमण, मेनिन्जाइटिस, गंभीर हाइपोग्लाइसीमिया या ऑक्सीजन की कमी का संकेत हैं।",
            mr: "झटके येणे हे मेंदूचा संसर्ग (मेनिंजायटिस), रक्तातील साखर कमी होणे किंवा गंभीर आजाराचे लक्षण आहे."
          }
        },
        {
          id: "nb_fast_breathing",
          level: "URGENT",
          threshold: { type: "respiratory_rate", comparator: ">=", value: 60 },
          question: {
            en: "Is the baby breathing fast (60 or more breaths per minute when calm)?",
            hi: "क्या बच्चा बहुत तेज़ सांस ले रहा है (शांत होने पर भी 60 या अधिक प्रति मिनट)?",
            mr: "बाळ खूप जलद श्वास घेत आहे का (शांत असताना ६० किंवा अधिक प्रति मिनिट)?"
          },
          why_it_matters: {
            en: "Fast breathing in young infants is a hallmark sign of severe pneumonia and respiratory distress.",
            hi: "नवजात में तेज़ सांस निमोनिया और श्वसन संकट का प्रमुख लक्षण है।",
            mr: "जलद श्वास घेणे हे नवजात बाळाला गंभीर न्यूमोनिया किंवा श्वास घेण्यास अडचण असल्याचे स्पष्ट लक्षण आहे."
          }
        },
        {
          id: "nb_chest_indrawing",
          level: "URGENT",
          question: {
            en: "Is there severe lower chest indrawing (chest sinks in deeply when breathing in)?",
            hi: "क्या बच्चे की छाती सांस लेते समय अंदर धंस रही है?",
            mr: "श्वास घेताना बाळाची छाती खोल आत खेचली जात आहे का?"
          },
          why_it_matters: {
            en: "Severe chest indrawing means the lungs are stiff from severe pneumonia or infection, requiring urgent oxygen and antibiotics.",
            hi: "छाती का अंदर धंसना गंभीर निमोनिया दर्शाता है, जिसमें तुरंत ऑक्सीजन और अस्पताल देखभाल आवश्यक है।",
            mr: "छाती आत खेचली जाणे म्हणजे फुप्फुसांचा गंभीर संसर्ग असून तत्काळ ऑक्सिजन व उपचारांची गरज आहे."
          }
        },
        {
          id: "nb_temp_abnormal",
          level: "URGENT",
          threshold: { type: "temperature_celsius" },
          question: {
            en: "Does the baby have high fever (37.5°C / 99.5°F or above) or feel abnormally cold (hypothermia below 35.5°C / 95.9°F)?",
            hi: "क्या बच्चे को तेज़ बुखार (37.5°C / 99.5°F या अधिक) है या शरीर असामान्य रूप से ठंडा (35.5°C से कम) पड़ गया है?",
            mr: "बाळाला जास्त ताप (३७.५° से / ९९.५° फॅ किंवा जास्त) आहे किंवा बाळ असामान्यपणे थंड (३५.५° से पेक्षा कमी) पडले आहे का?"
          },
          why_it_matters: {
            en: "Both severe fever and cold body (hypothermia) in newborns signal life-threatening bacterial infections and need immediate warming and referral.",
            hi: "नवजात में बुखार या शरीर का ठंडा पड़ना गंभीर बैक्टीरियल संक्रमण दर्शाता है।",
            mr: "नवजात बाळाचे शरीर थंड पडणे किंवा तीव्र ताप येणे हे रक्तातील गंभीर संसर्गाचे लक्षण असून तत्काळ उब व संदर्भ सेवा आवश्यक आहे."
          }
        },
        {
          id: "nb_lethargic_unconscious",
          level: "URGENT",
          question: {
            en: "Is the baby unusually sleepy, lethargic, unconscious, or moves only when stimulated?",
            hi: "क्या बच्चा बहुत सुस्त, बेहोश है या जगाने और हिलाने पर ही थोड़ी हलचल करता है?",
            mr: "बाळ खूप सुस्त, बेशुद्ध आहे किंवा हलवल्यावरच थोडी हालचाल करते का?"
          },
          why_it_matters: {
            en: "Depressed sensorium indicates critical systemic compromise, severe infection, or intracranial pathology.",
            hi: "बच्चे का अत्यधिक सुस्त या बेहोश होना अत्यंत गंभीर बीमारी का संकेत है।",
            mr: "बाळ सुस्त किंवा अचेत असणे हे अत्यंत गंभीर संसर्ग किंवा आजाराचे लक्षण आहे."
          }
        },
        {
          id: "nb_umbilicus_red_pus",
          level: "URGENT",
          question: {
            en: "Is the navel (umbilicus) red with redness spreading to the abdomen skin, or draining pus?",
            hi: "क्या नाभि लाल है, लालिमा पेट की त्वचा पर फैल रही है या मवाद आ रहा है?",
            mr: "नाळ लाल झाली आहे, लालसरपणा पोटाच्या त्वचेवर पसरत आहे किंवा पू येत आहे का?"
          },
          why_it_matters: {
            en: "Omphalitis with cellulitis can rapidly advance to fatal systemic neonatal septicemia.",
            hi: "नाभि का संक्रमण तेजी से पूरे शरीर में फैलकर सेप्सिस बन सकता है।",
            mr: "नाळेचा संसर्ग वेगाने पसरून बाळाच्या जीवाला धोका निर्माण करू शकतो (नाळेचा सेप्सिस)."
          }
        },
        {
          id: "nb_skin_pustules",
          level: "URGENT",
          question: {
            en: "Does the baby have many or large pus-filled blisters (pustules) on the body?",
            hi: "क्या बच्चे के शरीर पर बहुत सारे या बड़े-बड़े मवाद वाले फोड़े-फुंसियां हैं?",
            mr: "बाळाच्या अंगावर अनेक किंवा मोठे पू भरलेले फोड/पुळ्या आल्या आहेत का?"
          },
          why_it_matters: {
            en: "Extensive skin pustules are a sign of serious bacterial staphylococcal or streptococcal infection.",
            hi: "अधिक फुंसियां गंभीर बैक्टीरियल संक्रमण दर्शाती हैं।",
            mr: "मोठे किंवा अनेक पू भरलेले फोड हे गंभीर जिवाणू संसर्गाचे द्योतक आहेत."
          }
        },
        {
          id: "nb_jaundice_early_soles",
          level: "URGENT",
          question: {
            en: "Did yellow color (jaundice) appear in the first 24 hours of life, or have palms and soles turned yellow?",
            hi: "क्या पीलिया जन्म के पहले 24 घंटों में दिखा या हथेलियां और पैर के तलवे पीले पड़ गए हैं?",
            mr: "कावीळ जन्माच्या पहिल्या २४ तासांत दिसली का, किंवा तळहात आणि तळपाय पिवळे पडले आहेत का?"
          },
          why_it_matters: {
            en: "Pathological jaundice in first 24h or reaching palms/soles carries high risk of bilirubin brain toxicity (kernicterus).",
            hi: "पहले 24 घंटे में पीलिया या तलवों तक पीलापन दिमाग पर असर (कर्णिक्टेरस) कर सकता है।",
            mr: "पहिल्या २४ तासांतील कावीळ किंवा तळहाता-पायापर्यंत पसरलेली कावीळ मेंदूला इजा पोहोचवू शकते."
          }
        },
        {
          id: "nb_mild_jaundice_face",
          level: "REFER",
          question: {
            en: "Does the baby have mild yellowish color on face or eyes only, after day 2 of birth?",
            hi: "क्या जन्म के 2 दिन बाद केवल चेहरे या आँखों में हल्का पीलापन है?",
            mr: "जन्मानंतर २ दिवसांनी फक्त चेहरा किंवा डोळ्यांमध्ये हलका पिवळेपणा दिसत आहे का?"
          },
          why_it_matters: {
            en: "Physiological jaundice is common but must be evaluated at PHC to ensure it does not progress deeper.",
            hi: "हल्का पीलिया आम हो सकता है पर पीएचसी पर जांच जरूरी है ताकि यह बढ़े नहीं।",
            mr: "हलकी कावीळ सामान्य असू शकते, परंतु ती वाढत नाही ना याची खात्री करण्यासाठी प्राथमिक आरोग्य केंद्रात तपासणी आवश्यक आहे."
          }
        },
        {
          id: "nb_sticky_eyes",
          level: "REFER",
          question: {
            en: "Are the baby's eyes swollen, sticky with discharge, or tearing continuously?",
            hi: "क्या बच्चे की आँखों से लगातार चिपचिपा पानी या कीचड़ निकल रहा है?",
            mr: "बाळाच्या डोळ्यांतून सतत चिकट स्राव किंवा पू येत आहे का, डोळे चिकटले आहेत का?"
          },
          why_it_matters: {
            en: "Neonatal conjunctivitis (ophthalmia neonatorum) requires topical antimicrobial drops to prevent corneal ulceration.",
            hi: "आँखों का संक्रमण कॉर्निया को नुकसान पहुँचा सकता है, इसलिए डॉक्टर को दिखाना चाहिए।",
            mr: "डोळ्यांचा संसर्ग वाढल्यास दृष्टीला हानी पोहोचू शकते, त्वरित औषधोपचारांची गरज आहे."
          }
        },
        {
          id: "nb_feeding_difficulty_weight",
          level: "REFER",
          question: {
            en: "Does the mother report difficulty attaching the baby to the breast, or baby feels very small/lightweight?",
            hi: "क्या माँ को स्तनपान कराने में कठिनाई हो रही है या बच्चा बहुत छोटा/कम वजन लग रहा है?",
            mr: "स्तनपान करताना बाळ व्यवस्थित पकड घेत नाही किंवा बाळाचे वजन खूपच कमी वाटत आहे का?"
          },
          why_it_matters: {
            en: "Suboptimal feeding and low birth weight need skilled lactation support and growth monitoring at the PHC.",
            hi: "स्तनपान में कठिनाई और कम वजन में पीएचसी पर पोषण परामर्श आवश्यक है।",
            mr: "स्तनपानातील अडचणी आणि कमी वजनाच्या बाळाला योग्य मार्गदर्शनासाठी प्राथमिक आरोग्य केंद्रात दाखवावे."
          }
        }
      ],
      home_care_advice: {
        en: [
          "Keep the newborn warm: Use Kangaroo Mother Care (skin-to-skin contact) and dress in dry warm clothes and cap.",
          "Exclusive breastfeeding: Feed frequently (at least 8-12 times in 24 hours), day and night. Give no water, honey, or animal milk.",
          "Clean umbilical cord: Keep cord stump clean and dry. Do not apply oil, turmeric, cow dung, or powder.",
          "Hand hygiene: Wash hands with soap and water before touching or feeding the baby.",
          "Delay bathing: Do not bathe the baby in the first 7 days, especially if low birth weight."
        ],
        mr: [
          "बाळाला उबदार ठेवा: कांगारू मदर केअर (आईच्या छातीशी त्वचेचा संपर्क) द्या, बाळाला उबदार सुती कपडे व टोपी घाला.",
          "केवळ निव्वळ अंगावरचे दूध: २४ तासांत किमान ८ ते १२ वेळा वारंवार पाजावे. पाणी, मध, गूळ किंवा इतर दूध अजिबात देऊ नका.",
          "नाळेची स्वच्छता: नाळ कोरडी आणि स्वच्छ ठेवा. नाळेवर हळद, तेल, राख किंवा पावडर लावू नका.",
          "स्वच्छता: बाळाला हात लावण्यापूर्वी व स्तनपानापूर्वी साबणाने हात स्वच्छ धुवा.",
          "बाळाला लगेच आंघोळ घालू नका: जन्मानंतर पहिले ७ दिवस बाळाला आंघोळ घालू नये, फक्त ओल्या सुती कापडाने पुसून घ्यावे."
        ]
      },
      warning_signs: {
        en: ["Baby stops sucking milk completely", "Convulsions or spasms", "Hypothermia or high fever", "Rapid breathing or indrawing"],
        mr: ["बाळाने दूध पिणे बंद केले", "झटके किंवा आकडी आली", "बाळ थंड पडले किंवा खूप ताप आला", "श्वास वेगाने चालणे किंवा छाती आत ओढली जाणे"]
      }
    },

    pregnancy: {
      target_group: {
        en: "Pregnancy and Postpartum Mother",
        hi: "गर्भवती एवं प्रसूता महिला",
        mr: "गर्भवती व बाळंत स्त्री"
      },
      signs: [
        {
          id: "preg_vaginal_bleed",
          level: "URGENT",
          question: {
            en: "Is there any vaginal bleeding or spotting during pregnancy or labor?",
            hi: "क्या गर्भावस्था या प्रसव के दौरान योनि से रक्तस्राव या खून के धब्बे आ रहे हैं?",
            mr: "गरोदरपणात किंवा बाळंतपणाच्या कळा सुरू असताना योनीतून रक्तस्त्राव किंवा रक्ताचे डाग दिसत आहेत का?"
          },
          why_it_matters: {
            en: "Antepartum bleeding may signal placenta previa or abruptio placentae, which can quickly cause fatal maternal shock or fetal death.",
            hi: "गर्भावस्था में रक्तस्राव प्लेसेंटा की गड़बड़ी का संकेत है।",
            mr: "गरोदरपणात रक्तस्त्राव होणे हे वार सरकल्याचे लक्षण असू शकते, ज्यामुळे माता व बाळाच्या जीवाला धोका निर्माण होतो."
          }
        },
        {
          id: "preg_convulsions_fits",
          level: "URGENT",
          question: {
            en: "Has the mother had convulsions, fits, or loss of consciousness?",
            hi: "क्या गर्भवती महिला को दौरे, झटके या बेहोशी आई है?",
            mr: "स्त्रीला झटके, आकडी किंवा चक्कर येऊन बेशुद्ध पडल्याचे झाले आहे का?"
          },
          why_it_matters: {
            en: "Convulsions indicate eclampsia, a critical emergency requiring immediate magnesium sulfate and facility delivery.",
            hi: "दौरे एक्लम्पसिया का संकेत हैं, जिसमें तुरंत आपातकालीन इलाज की जरूरत होती है।",
            mr: "झटके येणे हे गरोदरपणातील अत्यंत धोकादायक रक्तदाब वाढीचे (एक्लॅम्पसिया) लक्षण आहे."
          }
        },
        {
          id: "preg_severe_headache_vision",
          level: "URGENT",
          question: {
            en: "Is the mother suffering from severe persistent headache with blurred vision or spots before the eyes?",
            hi: "क्या महिला को गंभीर सिरदर्द के साथ आँखों के सामने धुंधलापन या चमकते बिंदु दिख रहे हैं?",
            mr: "तीव्र डोकेदुखी सोबत डोळ्यांसमोर अंधारी, धूसर दिसणे किंवा चमके दिसण्याचा त्रास होत आहे का?"
          },
          why_it_matters: {
            en: "These are impending signs of severe pre-eclampsia and cerebral edema, heralding fatal eclamptic fits.",
            hi: "तेज़ सिरदर्द और धुंधला दिखना प्री-एक्लैम्पसिया का गंभीर लक्षण है।",
            mr: "तीव्र डोकेदुखी आणि धूसर दिसणे हे गंभीर प्री-एक्लॅम्पसियाचे लक्षण आहे."
          }
        },
        {
          id: "preg_severe_abdominal_pain",
          level: "URGENT",
          question: {
            en: "Does she have severe, unbearable abdominal pain not like normal labor pains?",
            hi: "क्या पेट में अत्यधिक तेज़, असहनीय दर्द हो रहा है जो सामान्य प्रसव पीड़ा जैसा नहीं है?",
            mr: "पोटात असह्य तीव्र वेदना होत आहेत का, ज्या सामान्य कळांपेक्षा वेगळ्या व सतत आहेत?"
          },
          why_it_matters: {
            en: "Severe sudden abdominal pain can indicate uterine rupture, concealed placental abruption, or ectopic pregnancy.",
            hi: "तीव्र पेट दर्द गर्भाशय फटने का संकेत हो सकता है।",
            mr: "पोटात तीव्र असह्य वेदना होणे गर्भाशयाला इजा किंवा वार वेगळी होण्याचा धोका दर्शवते."
          }
        },
        {
          id: "preg_high_fever",
          level: "URGENT",
          threshold: { type: "temperature_celsius", comparator: ">=", value: 38.0 },
          question: {
            en: "Does she have high fever (38.0°C / 100.4°F or above) with chills, weakness, or shivering?",
            hi: "क्या महिला को तेज़ बुखार (38.0°C या अधिक) के साथ कंपकंपी या अत्यधिक कमजोरी है?",
            mr: "स्त्रीला खूप जास्त ताप (३८.०° से किंवा अधिक) सोबत थंडी वाजणे किंवा अत्यंत अशक्तपणा आहे का?"
          },
          why_it_matters: {
            en: "High fever in pregnancy may be caused by intrauterine infection (chorioamnionitis), severe malaria, or pyelonephritis.",
            hi: "गर्भावस्था में तेज़ बुखार गर्भाशय के संक्रमण या मलेरिया के कारण हो सकता है।",
            mr: "गरोदरपणात तीव्र ताप गर्भाशयाच्या संसर्गामुळे किंवा मलेरियामुळे असू शकतो."
          }
        },
        {
          id: "preg_leaking_water",
          level: "URGENT",
          question: {
            en: "Is there continuous leaking or gushing of watery fluid from the vagina before labor pains begin?",
            hi: "क्या प्रसव पीड़ा शुरू होने से पहले ही योनि से पानी का रिसाव या बहाव हो रहा है?",
            mr: "कळा सुरू होण्यापूर्वीच योनीतून सतत पाणी गळत आहे किंवा एकदम खूप पाणी सुटले आहे का?"
          },
          why_it_matters: {
            en: "Premature rupture of membranes exposes the fetus to life-threatening ascending infection and cord prolapse.",
            hi: "समय से पहले पानी की थैली फटने से संक्रमण का खतरा होता है।",
            mr: "कळा सुरू होण्यापूर्वी पाणी सुटल्यास बाळाला गर्भाशयात गंभीर संसर्ग होण्याचा धोका असतो."
          }
        },
        {
          id: "preg_reduced_movements",
          level: "URGENT",
          question: {
            en: "Has the mother noticed a sudden decrease or complete absence of baby kicks/movements in the womb?",
            hi: "क्या गर्भ में बच्चे की हलचल या लातें अचानक बहुत कम हो गई हैं या बिल्कुल महसूस नहीं हो रही हैं?",
            mr: "पोटातील बाळाची हालचाल अचानक खूप कमी झाली आहे किंवा अजिबात जाणवत नाही का?"
          },
          why_it_matters: {
            en: "Decreased or absent fetal movements is a primary red flag for fetal distress, hypoxia, or imminent intrauterine fetal demise.",
            hi: "बच्चे की हलचल रुकना गर्भ में दम घुटने का गंभीर संकेत है।",
            mr: "बाळाची हालचाल मंदावणे किंवा थांबणे हे गर्भातील बाळ धोक्यात असल्याचे लक्षण आहे."
          }
        },
        {
          id: "preg_swelling_face_hands",
          level: "URGENT",
          question: {
            en: "Is there sudden swelling of the face, eyelids, and hands, especially alongside a headache?",
            hi: "क्या चेहरे, पलकों और हाथों पर अचानक सूजन आ गई है, विशेषकर सिरदर्द के साथ?",
            mr: "चेहऱ्यावर, डोळ्यांच्या पापण्यांवर आणि हातांवर अचानक सूज आली आहे का, सोबत डोकेदुखी आहे का?"
          },
          why_it_matters: {
            en: "Facial and upper extremity edema is a key warning for pre-eclampsia and hypertensive encephalopathy.",
            hi: "चेहरे और हाथों पर सूजन उच्च रक्तचाप और प्री-एक्लैम्पसिया का मुख्य लक्षण है।",
            mr: "चेहरा व हातांवर सूज येणे हे गरोदरपणातील गंभीर उच्च रक्तदाबाचे लक्षण आहे."
          }
        },
        {
          id: "preg_severe_breathlessness_pallor",
          level: "URGENT",
          question: {
            en: "Is the mother severely breathless even at rest, or are her tongue and palms extremely pale (severe anemia)?",
            hi: "क्या आराम करते समय भी सांस फूल रही है, या जीभ और हथेलियां बहुत अधिक सफेद/पीली पड़ गई हैं?",
            mr: "बसल्या जागीही तीव्र धाप लागत आहे का, किंवा जीभ आणि तळहात अत्यंत पांढरे/फिकट पडले आहेत का?"
          },
          why_it_matters: {
            en: "Severe anemia with breathlessness can precipitate sudden high-output congestive heart failure during late pregnancy or labor.",
            hi: "गंभीर एनीमिया और सांस फूलना दिल की विफलता का कारण बन सकता है।",
            mr: "रक्ताची तीव्र कमतरता आणि धाप लागणे यामुळे हृदयविकाराचा धोका असतो."
          }
        },
        {
          id: "preg_labour_over_12h",
          level: "URGENT",
          question: {
            en: "Have true labor pains been continuing for more than 12 hours without delivery?",
            hi: "क्या प्रसव पीड़ा शुरू हुए 12 घंटे से अधिक का समय बीत चुका है और प्रसव नहीं हुआ है?",
            mr: "बाळंतपणाच्या खऱ्या कळा सुरू होऊन १२ तासांपेक्षा जास्त वेळ झाला असून प्रसूती झालेली नाही का?"
          },
          why_it_matters: {
            en: "Prolonged labor causes maternal exhaustion, uterine rupture, postpartum hemorrhage, and fetal asphyxia.",
            hi: "12 घंटे से अधिक प्रसव पीड़ा माँ और शिशु दोनों के लिए जानलेवा हो सकती है।",
            mr: "१२ तासांपेक्षा जास्त वेळ कळा चालणे बाळ व मातेसाठी अत्यंत धोकादायक आहे."
          }
        },
        {
          id: "preg_postpartum_heavy_bleed_fever",
          level: "URGENT",
          question: {
            en: "After delivery, is the mother soaking 2 or more pads/cloths per hour, passing large blood clots, or having high fever with foul-smelling discharge?",
            hi: "प्रसव के बाद क्या प्रति घंटे 2 से अधिक कपड़े/पैड भीग रहे हैं, बड़े थक्के आ रहे हैं, या दुर्गंधयुक्त स्राव के साथ बुखार है?",
            mr: "बाळंतपणानंतर दर तासाला २ पेक्षा जास्त पॅड/कपडे भिजत आहेत, रक्ताच्या मोठ्या गुठळ्या पडत आहेत किंवा दुर्गंधीयुक्त स्राव व ताप आहे का?"
          },
          why_it_matters: {
            en: "Postpartum hemorrhage (PPH) is the leading cause of maternal mortality; foul discharge indicates puerperal sepsis.",
            hi: "प्रसवोत्तर अत्यधिक रक्तस्राव (PPH) मातृ मृत्यु का सबसे बड़ा कारण है।",
            mr: "बाळंतपणानंतरचा अतिरक्तस्त्राव मातेच्या जीवाला तत्काळ धोका निर्माण करतो."
          }
        },
        {
          id: "preg_mild_pallor",
          level: "REFER",
          question: {
            en: "Does she look mildly pale, feel easily fatigued, or get tired quickly on light exertion?",
            hi: "क्या महिला थोड़ी पीली दिखती है या हल्का काम करने पर भी बहुत जल्दी थक जाती है?",
            mr: "स्त्री थोडी फिकट दिसत आहे किंवा थोडे काम केल्यावरही खूप थकवा जाणवतो का?"
          },
          why_it_matters: {
            en: "Mild to moderate nutritional anemia must be confirmed with hemoglobin testing and treated with therapeutic IFA.",
            hi: "हल्के एनीमिया की जांच और आयरन की गोलियां देना आवश्यक है।",
            mr: "ॲनिमिया वेळेत ओळखून प्राथमिक आरोग्य केंद्रात तपासणी व गोळ्या सुरू करणे गरजेचे आहे."
          }
        },
        {
          id: "preg_swelling_feet_only",
          level: "REFER",
          question: {
            en: "Does she have mild swelling in her feet or ankles only (which reduces after overnight rest)?",
            hi: "क्या केवल पैरों या टखनों में हल्की सूजन है जो रात को आराम करने पर कम हो जाती है?",
            mr: "फक्त पायांवर किंवा घोट्यांवर हलकी सूज आहे का, जी रात्री विश्रांती घेतल्यानंतर कमी होते?"
          },
          why_it_matters: {
            en: "Dependent ankle edema is often physiological, but blood pressure must be checked at the PHC to rule out pre-eclampsia.",
            hi: "पैरों की सूजन में बीपी चेक कराना जरूरी है।",
            mr: "पायांवरची साधी सूज सामान्य असू शकते, पण बीपी तपासून घेण्यासाठी आरोग्य केंद्रात दाखवावे."
          }
        },
        {
          id: "preg_missed_anc_ifa",
          level: "REFER",
          question: {
            en: "Has she missed any routine antenatal check-up (ANC), TT/Td injections, or not taken Iron-Folic Acid tablets?",
            hi: "क्या महिला ने नियमित प्रसवपूर्व जांच (ANC) छोड़ दिया है या आयरन की गोलियां नहीं ले रही हैं?",
            mr: "नियमित गरोदरपण तपासणी (ANC), टीटी/टीडी लस चुकली आहे किंवा आयर्न-फॉलिक ॲसिडच्या गोळ्या घेतलेल्या नाहीत का?"
          },
          why_it_matters: {
            en: "Regular ANC checkups and IFA supplements prevent severe pregnancy complications, low birth weight, and maternal anemia.",
            hi: "नियमित जांच और पोषण सप्लीमेंट सुरक्षित प्रसव के लिए अत्यंत आवश्यक हैं।",
            mr: "नियमित तपासणी आणि गोळ्यांमुळे गुंतागुंत टळते व बाळ निरोगी राहते."
          }
        }
      ]
    },

    child: {
      target_group: {
        en: "Child (2 months to 5 years)",
        hi: "बच्चा (2 माह से 5 वर्ष)",
        mr: "लहान मूल (२ महिने ते ५ वर्षे)"
      },
      signs: [
        {
          id: "ch_unable_to_drink",
          level: "URGENT",
          question: {
            en: "Is the child unable to drink or breastfeed at all?",
            hi: "क्या बच्चा कुछ भी पीने या स्तनपान करने में बिल्कुल असमर्थ है?",
            mr: "मूल काहीही पिऊ शकत नाही किंवा स्तनपान अजिबात करू शकत नाही का?"
          },
          why_it_matters: {
            en: "Inability to drink is an IMNCI general danger sign indicating extreme prostration, severe septicemia, or metabolic collapse.",
            hi: "कुछ भी न पी पाना गंभीर बीमारी का प्रमुख आपातकालीन संकेत है।",
            mr: "काहीही न पिणे हे गंभीर संसर्ग किंवा आजाराचे तातडीचे धोक्याचे लक्षण आहे."
          }
        },
        {
          id: "ch_vomits_everything",
          level: "URGENT",
          question: {
            en: "Does the child vomit everything (cannot keep anything down)?",
            hi: "क्या बच्चा जो कुछ भी खाता-पीता है, सब तुरंत उल्टी कर देता है?",
            mr: "मूल जे काही खाते-पिते ते सर्व लगेच उलटी करून बाहेर टाकते का?"
          },
          why_it_matters: {
            en: "Persistent vomiting prevents oral hydration and medication, leading to rapid shock and hypoglycemia.",
            hi: "लगातार उल्टी से बच्चे में गंभीर डिहाइड्रेशन का खतरा होता है।",
            mr: "सतत उलटी झाल्यामुळे शरीरातील पाणी वेगाने कमी होऊन मूल बेशुद्ध पडू शकते."
          }
        },
        {
          id: "ch_convulsions",
          level: "URGENT",
          question: {
            en: "Has the child had convulsions, seizures, or fits during this illness?",
            hi: "क्या इस बीमारी के दौरान बच्चे को दौरे, झटके या ऐंठन आई है?",
            mr: "या आजारपणात मुलाला झटके, आकडी किंवा अंगात ताठरपणा आला आहे का?"
          },
          why_it_matters: {
            en: "Seizures suggest acute central nervous system infection (meningitis/encephalitis), cerebral malaria, or severe febrile crisis.",
            hi: "दौरे मस्तिष्क ज्वर (मेनिंजाइटिस) या सेरेब्रल मलेरिया का संकेत हो सकते हैं।",
            mr: "झटके येणे हे मेंदूज्वर किंवा मेंदूचा गंभीर संसर्ग असू शकतो."
          }
        },
        {
          id: "ch_lethargic_unconscious",
          level: "URGENT",
          question: {
            en: "Is the child lethargic, abnormally drowsy, floppy, or difficult to awaken / unconscious?",
            hi: "क्या बच्चा बहुत सुस्त, अर्धबेहोश, बेसुध है या जगाने में बहुत कठिनाई हो रही है?",
            mr: "मूल खूप सुस्त, ग्लानीत, निपचित पडलेले आहे किंवा हाक मारूनही जागे होत नाही का?"
          },
          why_it_matters: {
            en: "Altered sensorium signals severe shock, cerebral hypoxia, or systemic toxemia requiring immediate resuscitation.",
            hi: "बेसुध होना शरीर में ऑक्सीजन की कमी और गंभीर संक्रमण का संकेत है।",
            mr: "मूल सुस्त किंवा बेशुद्ध असणे म्हणजे शरीरात गंभीर विषबाधा किंवा संसर्ग झाला आहे."
          }
        },
        {
          id: "ch_chest_indrawing_stridor",
          level: "URGENT",
          question: {
            en: "Does the child have chest indrawing (lower chest sucks in when breathing) or harsh stridor sound when calm?",
            hi: "क्या बच्चे की छाती अंदर धंस रही है या शांत होने पर भी सांस में स्ट्राइडर आवाज आ रही है?",
            mr: "श्वास घेताना मुलाची छाती खोल आत खेचली जात आहे किंवा शांत असतानाही छातीतून कर्कश घरघर (स्ट्रायडर) आवाज येतो का?"
          },
          why_it_matters: {
            en: "Severe chest indrawing or stridor in a calm child indicates severe pneumonia or acute upper airway obstruction.",
            hi: "छाती का धंसना और स्ट्राइडर गंभीर निमोनिया का संकेत है।",
            mr: "छाती आत खेचली जाणे हे गंभीर न्यूमोनिया किंवा श्वासनलिकेतील अडथळा दर्शवते."
          }
        },
        {
          id: "ch_severe_dehydration",
          level: "URGENT",
          question: {
            en: "Does the child have severe dehydration (sunken eyes AND skin pinch on abdomen goes back very slowly > 2 seconds, or unable to drink)?",
            hi: "क्या बच्चे में गंभीर निर्जलीकरण है (आँखें धंसी हुई और त्वचा चुटकी 2 सेकंड से ज्यादा में जाए)?",
            mr: "मुलाच्या शरीरातील पाणी तीव्र कमी झाले आहे का (डोळे खोल गेले आहेत आणि पोटाच्या त्वचेची घडी २ सेकंदांपेक्षा जास्त वेळ तशीच राहते)?"
          },
          why_it_matters: {
            en: "Severe dehydration causes hypovolemic circulatory collapse and acute renal failure within hours without IV fluids.",
            hi: "गंभीर डिहाइड्रेशन से कुछ ही घंटों में सदमा (शॉक) हो सकता है।",
            mr: "पाणी तीव्र कमी झाल्याने मुलाचे अवयव निकामी होण्याचा धोका असतो."
          }
        },
        {
          id: "ch_fever_over_7d_stiff_neck",
          level: "URGENT",
          question: {
            en: "Has fever lasted more than 7 days, or does the child have a stiff, painful neck when bending chin to chest?",
            hi: "क्या बुखार 7 दिनों से अधिक से है, या बच्चे की गर्दन अकड़ी हुई/सख्त है?",
            mr: "ताप ७ दिवसांपेक्षा जास्त काळ टिकून आहे का, किंवा मुलाची मान ताठ झाली असून हनुवटी छातीला टेकवता येत नाही का?"
          },
          why_it_matters: {
            en: "Prolonged fever with neck stiffness is a classic presentation of acute pyogenic or tubercular meningitis.",
            hi: "गर्दन में अकड़न मेनिंजाइटिस का मुख्य संकेत है।",
            mr: "मान ताठ होणे हे मेंदूज्वराचे (मेनिंजायटिस) अत्यंत गंभीर लक्षण आहे."
          }
        },
        {
          id: "ch_swelling_feet_wasting",
          level: "URGENT",
          question: {
            en: "Does the child have bilateral pitting edema (swelling of both feet) or severe visible wasting (skin and bones appearance)?",
            hi: "क्या बच्चे के दोनों पैरों पर सूजन (दबाने पर गड्ढा पड़ना) है या अत्यधिक सूखापन है?",
            mr: "मुलाच्या दोन्ही पायांवर सूज (दाबल्यास खड्डा पडणे) आहे किंवा अत्यंत तीव्र कुपोषण/हाडांचा सापळा झाला आहे का?"
          },
          why_it_matters: {
            en: "Edema of both feet indicates kwashiorkor or severe acute malnutrition (SAM) with high risk of metabolic heart failure.",
            hi: "दोनों पैरों में सूजन गंभीर तीव्र कुपोषण (SAM) दर्शाती है।",
            mr: "दोन्ही पायांवर सूज हे तीव्र कुपोषणाचे लक्षण असून पोषण पुनर्वसन केंद्रात (NRC) दाखल करावे."
          }
        },
        {
          id: "ch_fast_breathing",
          level: "REFER",
          threshold: { type: "respiratory_rate_by_age" },
          question: {
            en: "Is the child breathing fast (>= 50 breaths/min for 2-11 months; >= 40 breaths/min for 12-59 months)?",
            hi: "क्या बच्चा तेज़ सांस ले रहा है (2-11 महीने में 50 या अधिक; 12-59 महीने में 40 या अधिक)?",
            mr: "मूल जलद श्वास घेत आहे का (२ ते ११ महिन्यांसाठी ५० किंवा अधिक; १२ ते ५९ महिन्यांसाठी ४० किंवा अधिक प्रति मिनिट)?"
          },
          why_it_matters: {
            en: "Fast breathing without danger signs indicates pneumonia requiring oral amoxicillin and medical evaluation at the PHC.",
            hi: "तेज़ सांस निमोनिया का संकेत है।",
            mr: "जलद श्वास न्यूमोनियाचे लक्षण आहे; प्राथमिक आरोग्य केंद्रात तपासणी व औषधोपचार आवश्यक आहेत."
          }
        },
        {
          id: "ch_blood_in_stool",
          level: "REFER",
          question: {
            en: "Has there been visible red blood in the child's loose stools (dysentery)?",
            hi: "क्या बच्चे के पतले दस्त में लाल खून आ रहा है (पेचिश)?",
            mr: "मुलाच्या जुलाबातून लाल रक्त पडत आहे का (आमांश/पेचिश)?"
          },
          why_it_matters: {
            en: "Blood in stool signifies invasive bacillary dysentery (Shigella) requiring targeted antibiotics at the PHC.",
            hi: "मल में खून शिगेला संक्रमण दर्शाता है।",
            mr: "शौचातून रक्त येणे हे आतड्यांचा संसर्ग दर्शवते; आरोग्य केंद्रातून योग्य औषध घ्यावे."
          }
        },
        {
          id: "ch_diarrhoea_over_14d",
          level: "REFER",
          question: {
            en: "Has loose watery diarrhoea been continuing for 14 days or longer (persistent diarrhoea)?",
            hi: "क्या बच्चे को 14 दिन या उससे अधिक समय से लगातार पतले दस्त हो रहे हैं?",
            mr: "मुलाला १४ दिवस किंवा त्याहून अधिक काळ सतत पातळ जुलाब होत आहेत का?"
          },
          why_it_matters: {
            en: "Persistent diarrhea damages intestinal villi, inducing severe malabsorption, nutrient wasting, and electrolyte loss.",
            hi: "लंबे समय तक दस्त रहने से आंतें कमजोर होती हैं।",
            mr: "दीर्घकाळ जुलाब राहिल्याने कुपोषण वाढते; तज्ज्ञ डॉक्टरांकडून तपासणी आवश्यक आहे."
          }
        },
        {
          id: "ch_fever_2_to_7d",
          level: "REFER",
          question: {
            en: "Has the child had fever for 2 to 7 days without urgent danger signs?",
            hi: "क्या बच्चे को 2 से 7 दिनों से बुखार है?",
            mr: "मुलाला २ ते ७ दिवसांपासून ताप येत आहे का?"
          },
          why_it_matters: {
            en: "Fever exceeding 48 hours requires malaria blood slide/RDT testing, urinary examination, and clinical review at the PHC.",
            hi: "दो दिन से अधिक बुखार में मलेरिया जांच जरूरी है।",
            mr: "२ दिवसांपेक्षा जास्त ताप असल्यास हिवताप/मलेरिया तपासणी व औषधोपचार आवश्यक आहेत."
          }
        },
        {
          id: "ch_some_dehydration",
          level: "REFER",
          question: {
            en: "Is the child restless, irritable, thirsty (drinks eagerly), with slightly sunken eyes?",
            hi: "क्या बच्चा चिड़चिड़ा, बेचैन है, बहुत प्यासा है और आँखें हल्की धंसी हैं?",
            mr: "मूल चिडचिड करत आहे, खूप तहानलेले आहे (पाणी हावरटासारखे पिते) आणि डोळे थोडे खोल गेले आहेत का?"
          },
          why_it_matters: {
            en: "Early dehydration needs structured Oral Rehydration Salt (ORS) solution and Zinc therapy at the health post.",
            hi: "ओआरएस और जिंक देकर डिहाइड्रेशन को रोकें।",
            mr: "ओआरएस (ORS) आणि झिंक देऊन शरीरातील पाण्याची कमतरता भरून काढणे गरजेचे आहे."
          }
        },
        {
          id: "ch_ear_discharge",
          level: "REFER",
          question: {
            en: "Is pus draining from the child's ear, or does the child have acute ear pain?",
            hi: "क्या बच्चे के कान से मवाद बह रहा है या कान में असहनीय दर्द है?",
            mr: "मुलाच्या कानातून पू वाहत आहे किंवा कानात तीव्र वेदना होत आहेत का?"
          },
          why_it_matters: {
            en: "Otitis media can cause chronic hearing impairment or spread into mastoiditis without timely antimicrobial treatment.",
            hi: "कान का संक्रमण सुनने की क्षमता को प्रभावित कर सकता है।",
            mr: "कानाचा संसर्ग वाढल्यास ऐकण्याच्या क्षमतेवर परिणाम होऊ शकतो; वेळेत औषधोपचार करावेत."
          }
        }
      ]
    },

    adult: {
      target_group: {
        en: "Adult with Fever or Cough",
        hi: "वयस्क (बुखार या खांसी से पीड़ित)",
        mr: "प्रौढ व्यक्ती (ताप किंवा खोकला असलेली)"
      },
      signs: [
        {
          id: "ad_difficulty_breathing_blue_lips",
          level: "URGENT",
          question: {
            en: "Is the patient having severe difficulty breathing, struggling for breath, or have lips/fingernails turned bluish?",
            hi: "क्या मरीज को सांस लेने में बहुत तकलीफ हो रही है, हांफ रहा है, या होंठ और नाखून नीले पड़ गए हैं?",
            mr: "रुग्णाला श्वास घेण्यास खूप त्रास होतोय, धाप लागून बोलता येत नाही किंवा ओठ व नखे निळसर पडली आहेत का?"
          },
          why_it_matters: {
            en: "Central cyanosis and severe dyspnea indicate acute respiratory failure, hypoxemia, or acute pulmonary edema.",
            hi: "होंठों का नीला पड़ना फेफड़ों के गंभीर फेल्योर का संकेत है।",
            mr: "ओठ निळे पडणे आणि तीव्र धाप लागणे हे रक्तातील ऑक्सिजन धोक्याच्या पातळीखाली गेल्याचे लक्षण आहे."
          }
        },
        {
          id: "ad_confusion_stiff_neck",
          level: "URGENT",
          question: {
            en: "Is the patient disoriented, confused, talking irrelevantly, having convulsions, or has a stiff painful neck?",
            hi: "क्या मरीज भ्रमित है, बहकी-बहकी बातें कर रहा है, दौरे पड़ रहे हैं या गर्दन में गंभीर अकड़न/दर्द है?",
            mr: "रुग्ण गोंधळलेला आहे, असंबद्ध बोलत आहे, झटके येत आहेत किंवा मान ताठ होऊन खूप दुखत आहे का?"
          },
          why_it_matters: {
            en: "Altered mental status with fever points towards bacterial meningitis, encephalitis, cerebral malaria, or severe sepsis.",
            hi: "भ्रमित होना और गर्दन में अकड़न दिमागी बुखार या गंभीर सेप्सिस का संकेत है।",
            mr: "गोंधळलेली अवस्था आणि ताठ मान हे मेंदूज्वर किंवा गंभीर सेप्सिसचे लक्षण आहे."
          }
        },
        {
          id: "ad_chest_pain",
          level: "URGENT",
          question: {
            en: "Does the patient experience heavy crushing chest pain, pressure, or tightness radiating to arm or jaw?",
            hi: "क्या मरीज को छाती में भारी दबाव, जकड़न या असहनीय दर्द हो रहा है जो बाएं हाथ या जबड़े तक फैल रहा है?",
            mr: "छातीत प्रचंड दाब, जडपणा किंवा तीव्र वेदना होत आहेत का, ज्या डाव्या हाताकडे किंवा जबड्याकडे पसरत आहेत?"
          },
          why_it_matters: {
            en: "Acute crushing chest pain is indicative of acute myocardial infarction (heart attack) or pulmonary embolism.",
            hi: "छाती का असहनीय दर्द दिल के दौरे (हार्ट अटैक) का संकेत हो सकता है।",
            mr: "छातीत तीव्र वेदना व दाब हे हृदयविकाराचा झटका असू शकते."
          }
        },
        {
          id: "ad_unable_fluids",
          level: "URGENT",
          question: {
            en: "Is the patient persistently vomiting and completely unable to keep any fluids or sips down?",
            hi: "क्या मरीज को लगातार उल्टियां हो रही हैं और वह पानी का एक घूंट भी पेट में नहीं रख पा रहा है?",
            mr: "रुग्णाला सतत उलट्या होत असून पाणी किंवा पातळ पदार्थाचा एक घोटही पोटात टिकत नाही का?"
          },
          why_it_matters: {
            en: "Intractable vomiting rapidly leads to severe prerenal hypovolemic failure, hypokalemia, and circulatory shock.",
            hi: "पानी भी न पच पाना शरीर को शॉक और किडनी फेल्योर में डाल सकता है।",
            mr: "पाणीही पोटात न टिकल्याने डिहायड्रेशन होऊन अवयव निकामी होण्याचा धोका असतो."
          }
        },
        {
          id: "ad_very_high_fever_weakness",
          level: "URGENT",
          threshold: { type: "temperature_celsius", comparator: ">=", value: 39.0 },
          question: {
            en: "Does the patient have very high fever (39.0°C / 102.2°F or above) with profound prostration (cannot sit up or stand)?",
            hi: "क्या मरीज को अत्यधिक तेज़ बुखार (39.0°C या अधिक) के साथ इतनी भारी कमजोरी है कि उठ या बैठ भी नहीं पा रहा है?",
            mr: "रुग्णाला खूप जास्त ताप (३९.०° से किंवा अधिक) सोबत इतका प्रचंड अशक्तपणा आहे की उठून बसता किंवा उभे राहता येत नाही का?"
          },
          why_it_matters: {
            en: "High pyrexia with extreme prostration is an emergency criterion for severe falciparum malaria, dengue shock, or septicemic crisis.",
            hi: "तेज़ बुखार के साथ चरम कमजोरी सेप्टिक शॉक या गंभीर मलेरिया का संकेत है।",
            mr: "जास्त ताप आणि तीव्र अशक्तपणा हा सेप्टिक शॉक, डेंग्यू किंवा गंभीर मलेरियाचा धोका दर्शवतो."
          }
        },
        {
          id: "ad_cough_2w",
          level: "REFER",
          question: {
            en: "Has the cough been persisting for 2 weeks or longer?",
            hi: "क्या मरीज को 2 सप्ताह या उससे अधिक समय से लगातार खांसी आ रही है?",
            mr: "रुग्णाला २ आठवडे किंवा त्याहून अधिक काळ सतत खोकला येत आहे का?"
          },
          why_it_matters: {
            en: "Cough lasting over 2 weeks is the primary clinical definition of Presumptive Pulmonary Tuberculosis requiring sputum testing at the PHC.",
            hi: "2 हफ्ते से अधिक खांसी टीबी का प्राथमिक लक्षण है; बलगम की जांच अनिवार्य है।",
            mr: "२ आठवड्यांपेक्षा जास्त काळ खोकला असणे हे क्षयरोगाचे (टीबी) मुख्य संशयित लक्षण असून थुंकी तपासणी आवश्यक आहे."
          }
        },
        {
          id: "ad_blood_in_sputum",
          level: "REFER",
          question: {
            en: "Has there been visible red blood or dark streaks of blood in the coughed-up sputum (hemoptysis)?",
            hi: "क्या खांसने पर बलगम में लाल खून या खून के रेशे आ रहे हैं?",
            mr: "खोकल्याच्या थुंकीतून लाल रक्त किंवा रक्ताचे डाग पडत आहेत का?"
          },
          why_it_matters: {
            en: "Hemoptysis signifies cavitary pulmonary tuberculosis, bronchiectasis, or other serious lower airway lesion.",
            hi: "बलगम में खून फेफड़ों में गहरे संक्रमण या टीबी का लक्षण है।",
            mr: "थुंकीतून रक्त पडणे फुप्फुसांचा गंभीर आजार किंवा टीबी दर्शवते; त्वरित तपासणी हवी."
          }
        },
        {
          id: "ad_fever_over_3d",
          level: "REFER",
          question: {
            en: "Has the fever been continuing for more than 3 continuous days without an obvious cause?",
            hi: "क्या बुखार लगातार 3 दिनों से अधिक से बना हुआ है?",
            mr: "ताप सलग ३ दिवसांपेक्षा जास्त काळ चालू आहे का?"
          },
          why_it_matters: {
            en: "Fever exceeding 3 days requires laboratory workup for malaria, typhoid, dengue, and urinary tract infection at the PHC.",
            hi: "3 दिन से अधिक बुखार में मलेरिया, टाइफाइड या डेंगू की खून जांच जरूरी है।",
            mr: "३ दिवसांपेक्षा जास्त ताप राहिल्यास मलेरिया किंवा डेंग्यूची रक्ततपासणी करणे गरजेचे आहे."
          }
        },
        {
          id: "ad_fever_chills_vector",
          level: "REFER",
          question: {
            en: "Is the fever accompanied by severe shivering chills, eye-socket pain, joint ache, or during a known local outbreak season?",
            hi: "क्या बुखार के साथ कंपकंपी, आँखों के पीछे दर्द, जोड़ों में तेज़ दर्द है या क्षेत्र में मलेरिया/डेंगू फैला हुआ है?",
            mr: "थंडी वाजून ताप येत आहे का, डोळ्यांच्या मागे किंवा सांध्यांमध्ये तीव्र वेदना आहेत का (हिवताप/डेंग्यूची शक्यता)?"
          },
          why_it_matters: {
            en: "Fever with chills and retro-orbital pain is the classic syndromic triad for vector-borne malaria and dengue requiring rapid diagnostic tests.",
            hi: "कंपकंपी के साथ बुखार मलेरिया और जोड़ों में दर्द डेंगू का लक्षण है।",
            mr: "थंडी वाजून येणारा ताप व सांधेदुखी हे डेंग्यू किंवा मलेरियाचे लक्षण असून रक्तचाचणी आवश्यक आहे."
          }
        }
      ]
    }
  };

  function isYes(val) {
    if (val === true || val === 1) return true;
    if (typeof val === "string") {
      const s = val.trim().toLowerCase();
      return ["yes", "y", "true", "1", "होय", "हाँ"].includes(s);
    }
    return false;
  }

  function isDontKnow(val) {
    if (val === null || val === undefined) return false;
    if (typeof val === "string") {
      const s = val.trim().toLowerCase();
      return ["dont_know", "don't know", "dontknow", "unknown", "माहित नाही", "पता नहीं"].includes(s);
    }
    return false;
  }

  function getCelsius(meas) {
    if (!meas) return null;
    if (meas.temperature_celsius !== undefined && meas.temperature_celsius !== null) {
      return Math.round(meas.temperature_celsius * 10) / 10;
    }
    if (meas.temperature_fahrenheit !== undefined && meas.temperature_fahrenheit !== null) {
      return Math.round(((meas.temperature_fahrenheit - 32) * 5 / 9) * 10) / 10;
    }
    return null;
  }

  function evaluateMeasurements(moduleName, age, measurements) {
    if (!measurements) return [];
    const triggered = [];
    const celsius = getCelsius(measurements);
    const rr = measurements.respiratory_rate;

    if (moduleName === "newborn") {
      if (rr !== undefined && rr !== null && rr >= 60) {
        triggered.push("nb_fast_breathing");
      }
      if (celsius !== null && (celsius >= 37.5 || celsius < 35.5)) {
        triggered.push("nb_temp_abnormal");
      }
    } else if (moduleName === "pregnancy") {
      if (celsius !== null && celsius >= 38.0) {
        triggered.push("preg_high_fever");
      }
      if (rr !== undefined && rr !== null && rr >= 28) {
        triggered.push("preg_severe_breathlessness_pallor");
      }
    } else if (moduleName === "child") {
      if (rr !== undefined && rr !== null) {
        if (age !== undefined && age !== null) {
          if (age < 12 && rr >= 50) triggered.push("ch_fast_breathing");
          else if (age >= 12 && rr >= 40) triggered.push("ch_fast_breathing");
        } else {
          if (rr >= 40) triggered.push("ch_fast_breathing");
        }
      }
      if (celsius !== null && celsius >= 38.5) {
        triggered.push("ch_fever_2_to_7d");
      }
    } else if (moduleName === "adult") {
      if (rr !== undefined && rr !== null && (rr >= 30 || rr <= 8)) {
        triggered.push("ad_difficulty_breathing_blue_lips");
      }
      if (celsius !== null) {
        if (celsius >= 39.0) triggered.push("ad_very_high_fever_weakness");
        else if (celsius >= 38.0) triggered.push("ad_fever_over_3d");
      }
    }

    return triggered;
  }

  function evaluate(moduleName, age, answers, measurements, language) {
    language = language || "mr";
    const mod = RULES[moduleName];
    if (!mod) {
      throw new Error("Invalid module: " + moduleName);
    }

    const signs = mod.signs || [];
    const triggeredSignIds = [];
    const unknownUrgentSigns = [];

    // 1. Evaluate Measurements
    const measTriggered = evaluateMeasurements(moduleName, age, measurements);
    measTriggered.forEach(id => {
      if (!triggeredSignIds.includes(id)) triggeredSignIds.push(id);
    });

    // 2. Evaluate Questionnaire Answers
    signs.forEach(sign => {
      const ans = answers ? answers[sign.id] : undefined;
      if (isYes(ans)) {
        if (!triggeredSignIds.includes(sign.id)) {
          triggeredSignIds.push(sign.id);
        }
      } else if (sign.level === "URGENT" && isDontKnow(ans)) {
        unknownUrgentSigns.push(sign.id);
      }
    });

    // 3. Determine Risk Level
    const signMap = {};
    signs.forEach(s => { signMap[s.id] = s; });

    const hasUrgentYes = triggeredSignIds.some(id => signMap[id] && signMap[id].level === "URGENT");
    const hasReferYes = triggeredSignIds.some(id => signMap[id] && signMap[id].level === "REFER");
    const hasUnknownUrgent = unknownUrgentSigns.length > 0;

    let level = "HOME_CARE";
    if (hasUrgentYes) {
      level = "URGENT_REFERRAL";
    } else if (hasReferYes || hasUnknownUrgent) {
      level = "VISIT_PHC";
    } else {
      level = "HOME_CARE";
    }

    // 4. Triggered Signs & Reasons
    const triggeredSigns = [];
    const reasons = [];

    triggeredSignIds.forEach(id => {
      const s = signMap[id];
      if (s) {
        const q = s.question[language] || s.question.en;
        const why = s.why_it_matters[language] || s.why_it_matters.en;
        triggeredSigns.push({ id: s.id, level: s.level, question: q, why_it_matters: why });
        reasons.push("[" + s.level + "] " + why);
      }
    });

    unknownUrgentSigns.forEach(id => {
      const s = signMap[id];
      if (s) {
        const q = s.question[language] || s.question.en;
        reasons.push("[DON'T KNOW] " + q);
      }
    });

    const advice = (mod.home_care_advice && (mod.home_care_advice[language] || mod.home_care_advice.en)) || [];
    const warnings = (mod.warning_signs && (mod.warning_signs[language] || mod.warning_signs.en)) || [];

    return {
      level: level,
      triggered_signs: triggeredSigns,
      triggered_sign_ids: triggeredSignIds,
      reasons: reasons,
      unknown_urgent_signs: unknownUrgentSigns,
      home_care_advice: advice,
      warning_signs: warnings
    };
  }

  return {
    RULES: RULES,
    evaluate: evaluate
  };
});
