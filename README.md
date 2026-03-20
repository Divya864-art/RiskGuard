# RiskGuard
AI-Powered Parametric Income Insurance for Gig Delivery Workers

> Guidewire DEVTrails 2026 | Phase 1 Submission

RiskGuard protects food delivery partners (Swiggy/Zomato) from income loss caused by external disruptions — extreme weather, pollution, and civic events. No paperwork. No claims. Fully automated.

**Coverage: Loss of Income ONLY** · **Pricing: Weekly** · **Persona: Food Delivery (Chennai)**

---

 1. Persona

**Rajan, 26 — Swiggy/Zomato Delivery Partner, Chennai**

| Detail | Value |

| Weekly earnings | ₹3,500 – ₹4,500 |
| Working hours | 10–12 hrs/day, 6 days/week |
| Peak income window | 12–2 PM (lunch) · 7–9 PM (dinner) |
| Payment cycle | Weekly UPI/bank transfer |

Pain points:No income safety net. One bad-weather day = ₹600–₹800 lost. No documentation, no recourse, no insurance product designed for him.

---

2. Problem & Scenario

External disruptions — heavy rain, floods, extreme heat, hazardous AQI, local curfews — regularly halt delivery operations. Workers lose **20–30% of monthly income** with zero protection.

Example — Chennai Monsoon, October:
> IMD issues a Red Alert at 3 PM. Swiggy suspends operations in Rajan's zone by 4 PM. Roads flood.
> Rajan loses his entire dinner-hour earnings: ~₹700.
> **Without RiskGuard:** No recourse. He asks his landlord for an extension.
> **With RiskGuard:** Rainfall crosses the trigger threshold. System auto-validates his zone and active policy. ₹350 hits his UPI by 6 PM. No action needed from Rajan.

3. Solution Overview

RiskGuard monitors real-world conditions continuously and pays workers automatically when a verified disruption halts their ability to work.


Worker pays ₹X/week → System monitors live data → Threshold breached
→ Fraud check passes → Payout sent to UPI within 2 hours


**No claim forms. No approval wait. No documentation.**

 4. System Workflow
ONBOARDING
  Worker registers → enters zone + platform + UPI
  AI Risk Profiler scores zone + season + activity pattern
  Personalized weekly premium shown → paid via UPI → policy active

MONITORING (Always On)
  Live feeds: Weather API · AQI API · Civic alert feeds
  Compares readings against parametric thresholds every 15 minutes
  Checks which insured workers are active in the affected zone

TRIGGER & VALIDATION
  Threshold breached → Trigger Event logged
  Fraud Detection Layer runs (see Section 8)
  Pass → Auto-approved · Flag → Manual review queue

PAYOUT
  Amount = f(disruption duration, worker's earning baseline, tier)
  Transferred to UPI within 2 hours
  Push notification sent with breakdown

DASHBOARD
  Worker: active policy · earnings protected · payout history
  Admin: claims · loss ratio · fraud flags · predictive analytics

 5. Weekly Premium Model

Premiums are billed weekly, matching the gig worker's natural pay cycle.

Tiers

| Tier | Weekly Premium | Max Weekly Payout | Triggers Covered |
|---|---|---|---|
| Basic | ₹25 | ₹500 | Rainfall + Flood |
| Standard | ₹45 | ₹1,000 | + Extreme Heat + AQI |
| Premium | ₹70 | ₹1,750 | + Civic Disruptions |

Dynamic Pricing Formula

Final Premium = Base Price
              × Zone Risk Multiplier     (0.8 – 1.3, based on flood/disruption history)
              × Seasonal Factor          (0.9 – 1.4, peaks during monsoon)
              × Tenure Discount          (up to 15% off after 8 clean weeks)


**Rajan's example — October, Velachery zone, Standard tier:**
`₹45 × 1.25 (zone) × 1.30 (monsoon) × 0.90 (tenure) = ₹66/week`
Max payout: ₹1,000 · Payout for 4-hour disruption: ~₹350

 Payout Formula


Payout = (Disruption Hours / Avg. Daily Work Hours) × Weekly Earning Baseline × Coverage Ratio

Capped at tier maximum.

 6. Parametric Triggers

All triggers are objective and data-driven. No self-reporting by the worker.

| # | Trigger | Source | Threshold | Notes |
|---|---|---|---|---|
| T1 | Heavy Rainfall | OpenWeatherMap / IMD | > 35 mm in 3 hours | Min. 2-hour duration |
| T2 | Extreme Heat | IMD / Weather API | > 42°C for 3+ hours | Midday window: 11 AM–3 PM |
| T3 | Flood / Red Alert | IMD + civic feeds | Zone-level Red/Orange alert | Full disruption payout |
| T4 | Severe AQI | CPCB API | AQI > 300 for 2+ hours | Hazardous category |
| T5 | Civic Disruption | News API / Govt feeds | Verified curfew / bandh | Zone-specific validation |

**Rules:** Worker must be in their registered zone + within active coverage window at time of trigger. Workers with no platform activity in the 2 hours prior are ineligible.

 7. AI/ML Integration

Premium Engine
- **Model:** XGBoost (weekly retraining)
- **Inputs:** Zone disruption history · worker activity hours · season · geography (flood-prone, coastal)
- **Output:** Zone risk multiplier → final weekly premium

Fraud Detection
- **Model:** Isolation Forest + rule-based anomaly detection
- **Detects:** Inactive workers claiming · wrong-zone claims · duplicate UPI claims · last-minute policy purchases before a known storm
- **Scoring:** Fraud Risk Score 0–100. Score > 90 → auto-reject. Score 70–90 → manual review.

 8. Adversarial Defense & Anti-Spoofing

Threat Model

| Attack | Description |
| GPS Spoofing (Individual) | Fake GPS app to appear in an affected zone |
| Coordinated Fraud Ring | Multiple workers spoofing the same location simultaneously |
| Retroactive Policy Abuse | Buying a policy after a weather alert is issued |
| False Disruption Claims | Claiming for minor events that didn't affect the zone |

Multi-Signal Location Validation

RiskGuard does **not rely on GPS alone**. Location confidence requires ≥3 of 5 signals to agree:

GPS coordinate
Cell tower / network triangulation
Wi-Fi access point fingerprint
IP geolocation
Device sensor consistency (accelerometer / gyroscope)

GPS-only matches with no corroborating signals are automatically flagged.

Behavioral Checks

- **Pre-trigger activity:** No platform activity in the 60 min before disruption → ineligible
- **Zone pattern consistency:** Worker suddenly appearing in a higher-payout zone on a trigger day → flagged
- **Device fingerprinting:** Two UPI IDs claiming from the same device → both flagged
- **Policy timing:** Policies purchased within 4 hours of a public weather alert → not eligible for that event

Coordinated Ring Detection

- Claims from 10+ workers in the same zone within minutes of a trigger are cluster-analyzed for GPS path mirroring
- Workers sharing the same IP range, Wi-Fi SSID, or cell tower at claim time are grouped and reviewed together

Protecting Genuine Workers

- Claims scoring 70–90 go to a human review queue (24-hour SLA), never auto-rejected
- Rejected workers receive a clear explanation + one-tap appeal option
- Workers with 12+ clean weeks earn **Verified Partner** status — reduced scrutiny on future claims

 9. Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Android-first, works on 3G, Hindi/Tamil/Telugu i18n) |
| Backend API | Node.js + Express |
| ML Serving | Python + FastAPI |
| Database | PostgreSQL (policies, claims) · Redis (real-time trigger state) |
| ML Models | XGBoost (pricing) · Isolation Forest (fraud) · Scikit-learn |
| Weather / AQI | OpenWeatherMap API · CPCB AQI API · IMD alerts |
| Payments | Razorpay Test Mode / UPI Simulator |
| Admin Dashboard | React (web) |
| DevOps | Docker · GitHub Actions · AWS EC2 / Render |

10. Platform Choice

**Mobile app (Android-first) + Web admin dashboard**

Food delivery workers live on their smartphones — orders, navigation, payments all happen on-device. A mobile app is the only realistic interface for onboarding, notifications, and real-time policy status.

Android is the primary target because 95%+ of Indian gig workers use Android (Redmi/Realme range). The app is designed for Android 9+, tested on 2GB RAM devices, and optimized for low-bandwidth networks.

The admin/insurer dashboard is a web app for internal operations teams only.

 11. 6-Week Plan

| Phase | Weeks | Deliverables |
|---|---|---|
| **Phase 1** — Ideation | Mar 4–20 | This README · GitHub repo · 2-min strategy video |
| **Phase 2** — Build | Mar 21–Apr 4 | Onboarding · Premium calculator · Trigger engine · Basic fraud detection · Claims flow · 2-min demo video |
| **Phase 3** — Scale | Apr 5–17 | Advanced fraud detection · Payout integration · Worker + admin dashboards · Final pitch deck · 5-min walkthrough video |

Constraints Checklist

| Requirement | Status |
|---|---|
| Income loss coverage ONLY (no health/vehicle/accident) | ✅ |
| Weekly pricing model | ✅ |
| AI/ML in premium calculation + fraud detection | ✅ |
| Parametric triggers with automated payouts | ✅ |
| Strong fraud + GPS anti-spoofing strategy | ✅ |
| Single delivery persona focus | ✅ Food delivery (Swiggy/Zomato), Chennai |

 Repository Structure

riskguard/
├── README.md
├── app/              # React Native mobile app
├── backend/          # Node.js API + trigger engine
├── ml/               # Premium model + fraud detection
├── admin-dashboard/  # React web app (insurer view)
└── docs/             # Architecture diagrams, wireframes


*Built for Guidewire DEVTrails 2026 · Team: [CODERZ] · Institution: [CHENNAI INSTITUTE OF TECHNOLOGY]*
