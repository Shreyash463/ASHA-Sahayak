# ASHA Sahayak: 2-Minute Judge Demo Script

**Theme**: Healthy & Inclusive Bharat (Seva First Innovation Challenge)  
**Target User**: Frontline village health worker (ASHA) in rural Maharashtra  
**Hardware Profile**: Basic Android device, intermittent connectivity, bright outdoor sunlight  

---

## Act 1: The Frontline Reality (0:00 - 0:30)

1. **Open the App**:
   - Navigate to `/` on a mobile viewport (390 x 844 px).
   - Point out the **high-contrast teal theme**, **clean typography**, and **large 48px+ tap targets** built for tired fingers in rural sunlight.
   - Note the **language selector** at top right: Toggle between **मराठी (Marathi)**, **हिंदी (Hindi)**, and **English**. Demonstrate that the UI changes instantly with zero reload.
2. **Select Patient Type**:
   - Show the 4 life-stage modules:
     1. **गर्भवती व बाळंत स्त्री (Pregnancy & Postpartum)**
     2. **नवजात बाळ (Newborn 0-59 Days)**
     3. **लहान मूल (Child 2m - 5y)**
     4. **ताप किंवा खोकला असलेला प्रौढ (Adult Fever/Cough)**
   - Click **"नवजात बाळ (Newborn)"**.

---

## Act 2: Triage with Voice & Breath Counter (0:30 - 1:15)

3. **Demographics & Symptom Voice Note**:
   - Select District: **Gadchiroli (गडचिरोली)**, Block: **Kurkheda (कुरखेडा)**.
   - Enter Age: **12 days**.
   - Tap the microphone button or type into the *"आपल्या शब्दात सांगा (Tell in own words)"* box:
     > *"बाळाला दोन दिवसांपासून खूप ताप आहे, छाती खोल आत खेचली जात आहे आणि बाळ दूध पीत नाही."*
   - Tap **"लक्षणे तपासा (Extract Signs)"**:
     - Gemini extracts candidate signs (`nb_feeding_stop`, `nb_temp_abnormal`, `nb_chest_indrawing`).
     - Point out the core safety rule: **AI only suggests; the ASHA retains complete agency to confirm or change each answer.**
4. **Breath Counter Tool**:
   - Tap **"श्वास मोजा (Breath Counter)"**.
   - Tap the large pulsating button with each simulated breath for 30/60 seconds.
   - Note that respiratory rate (e.g., 64 breaths/min) is automatically calculated and evaluated against the HBNC newborn danger cutoff (>= 60 bpm).
5. **Answer Danger Signs**:
   - Walk through the step-by-step card. Tap **"होय (YES)"** on *छाती आत खेचली जात आहे (Chest indrawing)*.
   - Tap **"माहित नाही (DON'T KNOW)"** on any question to show how safety-first logic treats uncertainty as requiring clinical re-evaluation.

---

## Act 3: Deterministic Result & Referral (1:15 - 1:45)

6. **View Result**:
   - The result screen renders with an unambiguous full-width **Red Banner**: **तात्काळ संदर्भ सेवा (URGENT_REFERRAL)**.
   - Highlight that the risk level was computed by a **pure deterministic rules engine**, never an unconstrained LLM.
   - Show:
     - **कारणे (Why it matters)**: Plain Marathi clinical reasons for referral.
     - **तातडीने काय करावे (Immediate Actions)**: Protocol warmth, transport position, keeping airway clear.
     - **वैधानिक इशारा (Disclaimer)**: Clinical decision support disclaimer.
7. **Referral Handover**:
   - Show the **Referral Note for the PHC Doctor**: Formatted with Patient ID, Village/Block, Vital signs, and triggered danger signs.
   - Demonstrate the three instant action buttons:
     - **कॉपी करा (Copy)**
     - **व्हॉट्सॲपवर पाठवा (WhatsApp Share)** (pre-populates wa.me message for ANM/108 ambulance)
     - **प्रिंट / सेव्ह (Print/PDF)**
     - **एएनएम / १०८ ला कॉल करा (Call ANM)** (1-tap dialer)
   - Tap **"ऐका (Listen)"** to demonstrate the Web Speech synthesis reading the summary aloud in Marathi.

---

## Act 4: District Health Officer Dashboard (1:45 - 2:00)

8. **Open `/dashboard`**:
   - Switch to the Medical Officer / District Dashboard.
   - Notice the prominent **"SIMULATED DEMO DATA"** banner with a toggle for live vs. simulated cases.
   - Show:
     - Total Cases Triage Breakdown (Urgent vs. PHC vs. Home Care).
     - Geographic Filters by District (e.g. Pune, Gadchiroli, Nashik) and Block.
     - **Outbreak Cluster Alert**: Highlighting Kurkheda block where >= 5 cases of newborn respiratory distress were detected in 72 hours, enabling rapid public health intervention before infant mortality spikes.
