# Frontline Clinical Vignette Review & Sign-Off Sheet

This document is prepared for formal review and sign-off by a Primary Health Centre (PHC) Medical Officer, Community Health Officer (CHO), or Auxiliary Nurse Midwife (ANM) Supervisor.

### Review Instructions for Medical Officer:
1. Examine each clinical vignette scenario and verify that the assigned Triage Risk Level (`URGENT_REFERRAL`, `VISIT_PHC`, or `HOME_CARE`) aligns with your facility's referral protocols.
2. Verify that triggered danger signs are appropriate for frontline ASHA recognition.
3. Record comments and signature at the bottom of this document.

---

| Vignette ID | Module | Case Title | Protocol Level | Engine Output | Triggered Danger Signs | Medical Officer Sign-Off |
|---|---|---|---|---|---|---|
| `VIG-NB-01` | **Newborn** | Healthy Day 5 Newborn Home Visit | `HOME_CARE` | `HOME_CARE` | `None` | [ ] Agree / [ ] Modify |
| `VIG-NB-02` | **Newborn** | Newborn Stopped Sucking Milk | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `nb_feeding_stop` | [ ] Agree / [ ] Modify |
| `VIG-NB-03` | **Newborn** | Newborn Borderline Fast Breathing (62 bpm) | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `nb_fast_breathing` | [ ] Agree / [ ] Modify |
| `VIG-NB-04` | **Newborn** | Newborn Normal Breathing (58 bpm) | `HOME_CARE` | `HOME_CARE` | `None` | [ ] Agree / [ ] Modify |
| `VIG-NB-05` | **Newborn** | Newborn Severe Subcostal Chest Indrawing | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `nb_chest_indrawing` | [ ] Agree / [ ] Modify |
| `VIG-NB-06` | **Newborn** | Newborn Hypothermia (Cold to Touch, 35.1°C) | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `nb_temp_abnormal` | [ ] Agree / [ ] Modify |
| `VIG-NB-07` | **Newborn** | Newborn High Fever (38.2°C) | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `nb_temp_abnormal` | [ ] Agree / [ ] Modify |
| `VIG-NB-08` | **Newborn** | Newborn Severe Omphalitis Spreading to Skin | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `nb_umbilicus_red_pus` | [ ] Agree / [ ] Modify |
| `VIG-NB-09` | **Newborn** | Newborn Early Jaundice on Day 1 | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `nb_jaundice_early_soles` | [ ] Agree / [ ] Modify |
| `VIG-NB-10` | **Newborn** | Newborn Mild Jaundice on Face Only (Day 5) | `VISIT_PHC` | `VISIT_PHC` | `nb_mild_jaundice_face` | [ ] Agree / [ ] Modify |
| `VIG-NB-11` | **Newborn** | Newborn Sticky Eye Discharge | `VISIT_PHC` | `VISIT_PHC` | `nb_sticky_eyes` | [ ] Agree / [ ] Modify |
| `VIG-NB-12` | **Newborn** | Uncertainty on Convulsions / Twitching (Don't Know) | `VISIT_PHC` | `VISIT_PHC` | `None` | [ ] Agree / [ ] Modify |
| `VIG-NB-13` | **Newborn** | Lactation Difficulty and Low Weight Concern | `VISIT_PHC` | `VISIT_PHC` | `nb_feeding_difficulty_weight` | [ ] Agree / [ ] Modify |
| `VIG-PREG-01` | **Pregnancy** | Healthy 2nd Trimester Routine ANC Visit | `HOME_CARE` | `HOME_CARE` | `None` | [ ] Agree / [ ] Modify |
| `VIG-PREG-02` | **Pregnancy** | Antepartum Vaginal Bleeding at 32 Weeks | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `preg_vaginal_bleed` | [ ] Agree / [ ] Modify |
| `VIG-PREG-03` | **Pregnancy** | Severe Headache with Blurred Vision (Pre-eclampsia) | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `preg_severe_headache_vision` | [ ] Agree / [ ] Modify |
| `VIG-PREG-04` | **Pregnancy** | Convulsions in Third Trimester (Eclampsia) | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `preg_convulsions_fits` | [ ] Agree / [ ] Modify |
| `VIG-PREG-05` | **Pregnancy** | Premature Rupture of Membranes (PROM) | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `preg_leaking_water` | [ ] Agree / [ ] Modify |
| `VIG-PREG-06` | **Pregnancy** | Absent Fetal Movements at 36 Weeks | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `preg_reduced_movements` | [ ] Agree / [ ] Modify |
| `VIG-PREG-07` | **Pregnancy** | Prolonged Active Labor (> 14 Hours) | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `preg_labour_over_12h` | [ ] Agree / [ ] Modify |
| `VIG-PREG-08` | **Pregnancy** | Postpartum Hemorrhage (PPH on Day 2) | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `preg_postpartum_heavy_bleed_fever` | [ ] Agree / [ ] Modify |
| `VIG-PREG-09` | **Pregnancy** | Severe Breathlessness at Rest and Pallor | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `preg_severe_breathlessness_pallor` | [ ] Agree / [ ] Modify |
| `VIG-PREG-10` | **Pregnancy** | Mild Foot Swelling Only (Dependent Edema) | `VISIT_PHC` | `VISIT_PHC` | `preg_swelling_feet_only` | [ ] Agree / [ ] Modify |
| `VIG-PREG-11` | **Pregnancy** | Mild Pallor and Fatigue | `VISIT_PHC` | `VISIT_PHC` | `preg_mild_pallor` | [ ] Agree / [ ] Modify |
| `VIG-PREG-12` | **Pregnancy** | Missed ANC Visits and Not Taking IFA Tablets | `VISIT_PHC` | `VISIT_PHC` | `preg_missed_anc_ifa` | [ ] Agree / [ ] Modify |
| `VIG-CH-01` | **Child** | Healthy Toddler with Mild Running Nose | `HOME_CARE` | `HOME_CARE` | `None` | [ ] Agree / [ ] Modify |
| `VIG-CH-02` | **Child** | Child 9 Months Fast Breathing (52 bpm) | `VISIT_PHC` | `VISIT_PHC` | `ch_fast_breathing` | [ ] Agree / [ ] Modify |
| `VIG-CH-03` | **Child** | Child 9 Months Normal Breathing (48 bpm) | `HOME_CARE` | `HOME_CARE` | `None` | [ ] Agree / [ ] Modify |
| `VIG-CH-04` | **Child** | Child 24 Months Fast Breathing (44 bpm) | `VISIT_PHC` | `VISIT_PHC` | `ch_fast_breathing` | [ ] Agree / [ ] Modify |
| `VIG-CH-05` | **Child** | Child Unable to Drink or Breastfeed | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ch_unable_to_drink` | [ ] Agree / [ ] Modify |
| `VIG-CH-06` | **Child** | Child Vomiting Everything | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ch_vomits_everything` | [ ] Agree / [ ] Modify |
| `VIG-CH-07` | **Child** | Child with Generalized Convulsions | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ch_convulsions` | [ ] Agree / [ ] Modify |
| `VIG-CH-08` | **Child** | Child Chest Indrawing and Harsh Stridor | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ch_chest_indrawing_stridor` | [ ] Agree / [ ] Modify |
| `VIG-CH-09` | **Child** | Severe Dehydration with Sunken Eyes & Slow Skin Pinch | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ch_severe_dehydration` | [ ] Agree / [ ] Modify |
| `VIG-CH-10` | **Child** | Fever for 9 Days with Stiff Neck | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ch_fever_over_7d_stiff_neck` | [ ] Agree / [ ] Modify |
| `VIG-CH-11` | **Child** | Bilateral Pitting Edema of Both Feet (Kwashiorkor) | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ch_swelling_feet_wasting` | [ ] Agree / [ ] Modify |
| `VIG-CH-12` | **Child** | Blood in Stool (Dysentery) | `VISIT_PHC` | `VISIT_PHC` | `ch_blood_in_stool` | [ ] Agree / [ ] Modify |
| `VIG-CH-13` | **Child** | Persistent Diarrhoea for 16 Days | `VISIT_PHC` | `VISIT_PHC` | `ch_diarrhoea_over_14d` | [ ] Agree / [ ] Modify |
| `VIG-AD-01` | **Adult** | Adult Mild Seasonal Cough (3 Days) | `HOME_CARE` | `HOME_CARE` | `None` | [ ] Agree / [ ] Modify |
| `VIG-AD-02` | **Adult** | Severe Dyspnea and Cyanosis (Blue Lips) | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ad_difficulty_breathing_blue_lips` | [ ] Agree / [ ] Modify |
| `VIG-AD-03` | **Adult** | Crushing Central Chest Pain Radiating to Left Arm | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ad_chest_pain` | [ ] Agree / [ ] Modify |
| `VIG-AD-04` | **Adult** | Disorientation and Neck Stiffness with Fever | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ad_confusion_stiff_neck` | [ ] Agree / [ ] Modify |
| `VIG-AD-05` | **Adult** | Intractable Vomiting and Prostration | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ad_unable_fluids` | [ ] Agree / [ ] Modify |
| `VIG-AD-06` | **Adult** | Hyperpyrexia (39.6°C) and Severe Prostration | `URGENT_REFERRAL` | `URGENT_REFERRAL` | `ad_very_high_fever_weakness` | [ ] Agree / [ ] Modify |
| `VIG-AD-07` | **Adult** | Chronic Productive Cough for 3 Weeks (Presumptive TB) | `VISIT_PHC` | `VISIT_PHC` | `ad_cough_2w` | [ ] Agree / [ ] Modify |
| `VIG-AD-08` | **Adult** | Hemoptysis (Blood in Coughed-up Sputum) | `VISIT_PHC` | `VISIT_PHC` | `ad_blood_in_sputum` | [ ] Agree / [ ] Modify |
| `VIG-AD-09` | **Adult** | Unexplained Fever Persisting for 5 Days | `VISIT_PHC` | `VISIT_PHC` | `ad_fever_over_3d` | [ ] Agree / [ ] Modify |
| `VIG-AD-10` | **Adult** | Fever with Shivering Chills in Malaria Season | `VISIT_PHC` | `VISIT_PHC` | `ad_fever_chills_vector` | [ ] Agree / [ ] Modify |
| `VIG-AD-11` | **Adult** | Borderline Fast Breathing in Adult (24 bpm) | `HOME_CARE` | `HOME_CARE` | `None` | [ ] Agree / [ ] Modify |
| `VIG-AD-12` | **Adult** | Unknown on Chest Pain (ASHA uncertain) | `VISIT_PHC` | `VISIT_PHC` | `None` | [ ] Agree / [ ] Modify |

---

## Medical Officer Clinical Sign-Off

- **Reviewing Officer Name**: ____________________________________________
- **Designation / Health Facility**: ____________________________________________
- **District / Block**: ____________________________________________
- **Registration Number**: ____________________________________________
- **Clinical Recommendation**: [ ] Approved for field deployment / [ ] Changes requested
- **Signature & Stamp**: ___________________________________ **Date**: _______________
