# Clinical Sources and Verification Matrix

This document records the official clinical protocols, training guidelines, and source references used to construct the danger-sign rules and thresholds in ASHA Sahayak.

## Official Clinical Protocols

1. **National Health Mission (NHM) ASHA Training Modules 6 & 7: "Simple Skills that Save Lives"**
   - **Issuing Authority**: Ministry of Health and Family Welfare (MoHFW), Government of India.
   - **Document**: Book 6: Maternal and Newborn Care; Book 7: Child Health, Nutrition and Childhood Illnesses.
   - **URL**: https://nhsrcindia.org/sites/default/files/2021-06/ASHA%20Book%206.pdf / https://hbnc-hbyc.mohfw.gov.in
   - **Sections Used**:
     - Book 6, Section 2: Danger Signs during Pregnancy and Labor.
     - Book 6, Section 3: Essential Newborn Care and Identification of Sick Newborns.
     - Book 7, Section 1: Assessment and Triage of Sick Child (2 months to 5 years).
   - **Status**: Primary reference standard for grassroots triage in India.

2. **Home Based Newborn Care (HBNC) Operational Guidelines & Assessment Checklist**
   - **Issuing Authority**: Child Health Division, MoHFW, Government of India.
   - **Document**: HBNC Operational Guidelines & ASHA Home Visit Card.
   - **Sections Used**: Check-up schedule (Days 1, 3, 7, 14, 21, 28, 42); Danger Signs Checklist for Immediate Referral.
   - **Criteria Verified**:
     - Fast breathing (>= 60 breaths/min for infant under 2 months).
     - Severe chest indrawing.
     - Hypothermia (< 35.5°C / 95.9°F) and High Fever (>= 37.5°C / 99.5°F).
     - Feeding stopped / unable to suck.
     - Convulsions or spasms.
     - Umbilical infection spreading to abdomen with erythema or pus.
     - Multiple pustules / extensive skin lesions.
     - Jaundice within first 24 hours or yellow palms and soles.

3. **Integrated Management of Neonatal and Childhood Illness (IMNCI / F-IMNCI)**
   - **Issuing Authority**: MoHFW, Govt of India with WHO and UNICEF India.
   - **Document**: IMNCI Chart Booklet for Children 2 Months up to 5 Years and Young Infants.
   - **Sections Used**: General Danger Signs (cannot drink/breastfeed, vomits everything, convulsions, lethargic/unconscious); Cough or Difficult Breathing; Diarrhoea and Dehydration; Fever; Malnutrition.
   - **Criteria Verified**:
     - Age 2 to 11 months fast breathing threshold: >= 50 breaths/min.
     - Age 12 to 59 months fast breathing threshold: >= 40 breaths/min.
     - Severe dehydration: Sunken eyes + skin pinch returns very slowly (> 2 seconds).
     - Stiff neck with fever: Meningismus sign triggering urgent referral.

4. **MoHFW Maternal Danger Signs & Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)**
   - **Issuing Authority**: Maternal Health Division, MoHFW, Govt of India.
   - **Sections Used**: Identification of High-Risk Pregnancies and Obstetric Emergencies.
   - **Criteria Verified**:
     - Antepartum hemorrhage (vaginal bleeding).
     - Severe pre-eclampsia / eclampsia (convulsions, severe headache with blurred vision, facial and hand edema).
     - Premature rupture of membranes (PROM / leaking amniotic fluid before labor).
     - Reduced/absent fetal movements in third trimester.
     - Prolonged labor (> 12 hours).
     - Postpartum hemorrhage (PPH) and puerperal sepsis (foul discharge, high fever).

5. **National Tuberculosis Elimination Programme (NTEP) & National Vector Borne Disease Control Programme (NVBDCP)**
   - **Issuing Authority**: Central TB Division & NVBDCP, MoHFW, Govt of India.
   - **Sections Used**: Presumptive TB screening guidelines (cough >= 2 weeks, hemoptysis); Malaria/Dengue seasonal fever screening.

---

## Seed Verification Comparison & Discrepancies

| Module | Seed Sign | Official Protocol Standard | Action Taken |
|---|---|---|---|
| Newborn | Fast breathing >= 60 bpm | HBNC & IMNCI standard: >= 60 breaths per minute counted when infant is calm | Matched. Implemented as numeric threshold >= 60. |
| Newborn | Temperature: Fever >= 37.5°C, Hypothermia < 35.5°C | HBNC Section 3: Axillary temperature >= 37.5°C or < 35.5°C | Matched. Numeric threshold handles both Celsius and Fahrenheit conversions. |
| Child | Fast breathing: 2-11m >= 50 bpm; 12-59m >= 40 bpm | IMNCI Chart Booklet page 4: 2-11 mos cut-off 50, 12-59 mos cut-off 40 | Matched. Evaluated dynamically by child age in months. |
| Child | Chest indrawing or stridor | IMNCI classifies stridor in calm child or severe chest indrawing as URGENT_REFERRAL (Severe Pneumonia / Very Severe Disease) | Matched as URGENT_REFERRAL. |
| Pregnancy | Labour > 12 hours | NHM Module 6: Prolonged active labor > 12 hours requires immediate transport via 108/102 ambulance | Matched as URGENT_REFERRAL. |
| Adult | Cough for 2 weeks or more | NTEP Technical Guidelines: Presumptive TB evaluation at PHC / DMC | Matched as VISIT_PHC (Referral for sputum microscopy / NAAT). |
| Adult | Blue lips / severe breathlessness | Adult triage / IDSP emergency red flag | Matched as URGENT_REFERRAL. |
