# 🛡 RiskGuard — AI-Powered Parametric Insurance for Gig Workers

> **"When the rain stops your ride, RiskGuard pays you — automatically."**
## Problem Statement

India has over **12 million gig delivery workers** on platforms like Swiggy, Zomato, Dunzo, and Blinkit. Every day, they face income disruptions entirely beyond their control:

- 🌧 **Heavy rainfall** shuts down delivery zones
- 🌡 **Extreme heat waves** make outdoor work dangerous
- 🌫 **Toxic AQI levels** force workers off the road
- 🚧 **Traffic blockages** make timely delivery impossible
- 📉 **Order volume crashes** during platform outages or civic disruptions

The Gap

> These workers have **zero financial protection**. Traditional insurance is too slow, too expensive, too paperwork-heavy — and simply not designed for the gig economy.

When disruptions strike, their income stops. There is no safety net.

## Our Solution

**RiskGuard** is a real-time, AI-powered parametric insurance platform built exclusively for gig delivery workers.

Unlike traditional insurance:

| Traditional Insurance | RiskGuard |
|---|---|
| File a claim manually | Claim triggers **automatically** |
| Weeks to process | Payout in **seconds** |
| Requires proof & paperwork | Driven by **environmental data** |
| High fixed premiums | **Dynamic AI-calculated** weekly pricing |
| Easy to defraud | **Multi-signal fraud detection** |

### How It Works in One Line

> The system continuously monitors weather, air quality, traffic, and worker activity. When a disruption threshold is crossed and the worker is verified as genuine, a payout is triggered — no human intervention required.

---

##  Persona — Who We Built This For

**Meet Ravi, 28 — Chennai-based Swiggy Delivery Partner**

- 🏠 Lives in Tambaram, commutes to Koramangala delivery zone
- 🛵 Earns ₹600–900/day on good days
- 📱 Owns an Android phone; comfortable with basic apps
- 💸 Supports a family of 3; no savings buffer

**A Real Scenario:**

> It's a Tuesday afternoon in June. The northeast monsoon hits Chennai unexpectedly hard. AQI spikes to 240. Rainfall exceeds 35mm. Swiggy orders in Ravi's zone drop by 72%. He parks his bike and waits — losing ₹700 in a single afternoon.
>
> With RiskGuard active on his phone:
> - The AI engine detects the rainfall and AQI breach within 2 minutes
> - Verifies Ravi's location confidence (94%) and activity status (Active)
> - Calculates a payout of ₹750 based on his Standard Guard plan
> - Credits it to his wallet — **before he even opens the app**

---

## 🔄 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     RISKGUARD PLATFORM                       │
│                                                              │
│  [Worker App]                                                │
│      │                                                       │
│      ▼                                                       │
│  [Registration + Policy Activation]                         │
│      │                                                       │
│      ▼                                                       │
│  [Live Data Feed]  ←── Simulated APIs (Weather, AQI,        │
│      │                  Traffic, Order Volume, GPS)          │
│      ▼                                                       │
│  [AI Decision Engine]                                        │
│      ├── Disruption Detection (threshold analysis)          │
│      ├── User Verification (activity + device signals)      │
│      └── Fraud Scoring (0–100 risk score)                   │
│      │                                                       │
│      ▼                                                       │
│  [Claim Processor]                                           │
│      ├── SAFE → Instant payout to wallet                    │
│      ├── SUSPICIOUS → Manual review flag                    │
│      └── FRAUD → Payout blocked, incident logged            │
│                                                              │
│  [Dashboard] ←── Real-time visibility for worker            │
└─────────────────────────────────────────────────────────────┘

## Key Features

### 1. 🧮 Dynamic Premium Calculation
- AI calculates weekly premiums based on:
  - **Zone risk multiplier** (e.g., Whitefield = 1.2×, Jayanagar = 0.85×)
  - **Live weather conditions** (heavy rain/heat = +20% premium)
  - **Seasonal patterns** (monsoon season uplift)
- Premium updates in real time as conditions change
- Displayed clearly: *"AI-calculated premium: ₹118/week"*

### 2. 📡 Real-Time Environmental Monitoring
The platform continuously streams 8 live data signals:

| Signal | Threshold | Source |
|---|---|---|
| 🌧 Rainfall | > 15mm | Weather API (simulated) |
| 🌡 Temperature | > 40°C | Weather API (simulated) |
| 🌫 AQI Level | > 200 | Air Quality API (simulated) |
| 🚧 Traffic Status | BLOCKED | Maps API (simulated) |
| 📉 Order Volume | < 30% of normal | Platform API (simulated) |
| 📍 Location Confidence | < 40% = suspicious | GPS Signal |
| 📱 Device Status | SPOOFED = fraud flag | Device telemetry |
| 🚚 User Activity | INACTIVE = fraud flag | Behavioral signal |

Values update every 2 seconds via simulated data pipelines.

### 3. ⚡ Automated Claim Triggering
- No button clicks. No forms. No waiting.
- When disruption data crosses defined thresholds:
  - System detects the event type
  - Validates it against the worker's active plan
  - Processes and credits payout automatically

### 4. 💰 Instant Payout Simulation
- Payout amounts per trigger:
  - 🌧 Heavy Rain → ₹400
  - 🌡 Extreme Heat → ₹300
  - 🌫 Hazardous AQI → ₹350
  - 🚧 Traffic Block → ₹250
  - 📉 Order Drop → ₹200
- Multiple simultaneous triggers = combined payout
- Payout history tracked in the Claims tab

### 5. 🔍 Multi-Signal Fraud Detection
- Computes a **Fraud Risk Score (0–100)** on every claim event
- Signals analyzed: GPS confidence, device status, user activity, order-rain correlation
- Status thresholds:
  - 🟢 0–34: **SAFE** → Payout proceeds
  - 🟡 35–69: **SUSPICIOUS** → Flagged for manual review
  - 🔴 70–100: **FRAUD** → Payout blocked, incident logged

---

##  AI/ML Integration

### Risk Scoring Model
The AI engine runs a continuous multi-factor risk assessment:

```
Risk Score = f(zone_multiplier, weather_severity, aqi_level, seasonal_factor)

Premium = Base(₹99) × Zone Risk × Weather Multiplier
```

- **Zone risk** is pre-mapped based on historical disruption frequency
- **Weather multiplier** dynamically adjusts based on live sensor data
- The model recalculates every tick (2-second intervals)

### Fraud Detection Logic
A weighted signal scoring model evaluates each claim attempt:

```
Fraud Score:
  + 40 pts  →  Location Confidence < 40%
  + 20 pts  →  Location Confidence 40–60%
  + 30 pts  →  User Activity = INACTIVE
  + 25 pts  →  Device Status = SPOOFED
  + 5 pts   →  Low orders + high rain (suspicious correlation)

```
► Analyzing environmental conditions...
  🌧 Heavy Rain detected: 34.2mm — threshold exceeded
  🌫 Hazardous AQI detected: 267 — threshold exceeded
► Validating user activity & device signals...
  📍 Location confidence: 91%
  📱 Device: NORMAL
  🚚 Activity: ACTIVE
► Fraud risk score: 5/100
✅ User verified — Triggering parametric payout...
💰 Payout ₹750 credited automatically
```

All decision reasoning is visible to the user in the **AI Logs** panel.

---

## 🚨 Adversarial Defense — Market Crash Scenario

**Scenario:** During a severe flood event (high payout period), a fraud ring attempts to mass-claim payouts using GPS-spoofed locations, inactive accounts, and spoofed device signals.

### How RiskGuard Defends:

#### 🛰 GPS Spoofing Detection
- Location confidence is scored 0–100% in real time
- Confidence < 40% adds 40 fraud points immediately
- Spoofed coordinates typically produce unstable, low-confidence signals

#### 📲 Multi-Signal Validation
No single signal can trigger a fraud block. The system requires convergence:
- Device integrity check (NORMAL vs SPOOFED)
- User activity verification (ACTIVE vs INACTIVE)
- Behavioral pattern consistency (is the worker actually on route?)
- Environmental-order correlation (is the order drop realistic given the weather?)

#### 🕵️ Fraud Ring Detection Logic
- Mass simultaneous claims from the same zone are cross-checked against activity signals
- Accounts showing INACTIVE + SPOOFED device + low location confidence → automatic block
- Incident logged with timestamp, signal snapshot, and account ID

#### ✅ Fair UX — No Punishment for Genuine Users
- Genuine workers with high location confidence, normal device signals, and active status are **never** blocked
- The system is designed to be conservative in fraud blocking — a score of 69 or below always proceeds to review, never direct block
- Workers can see their real-time fraud score and understand why a claim was flagged

---

## 📦 Coverage Scope & Exclusions

### ✅ What RiskGuard Covers
- **Income loss** during verified environmental disruptions
- Loss due to platform order volume drops during extreme events
- Income impact from government-imposed restrictions during disasters

### ❌ What RiskGuard Does NOT Cover

| Excluded Category | Reason |
|---|---|
| 🏥 Health & medical expenses | Requires separate health insurance |
| 🚗 Vehicle damage or repairs | Covered under vehicle insurance |
| 🤕 Accident compensation | Covered under personal accident policy |
| 🦺 Equipment loss/theft | Requires asset insurance |
| 📵 Platform-side technical issues | Not an environmental disruption |

> RiskGuard is **income protection only** — parametric, event-driven, and scoped to verifiable external disruptions.

---

## 🏗️ Technical Architecture

```
riskguard/
├── src/
│   ├── components/
│   │   ├── RegisterScreen.jsx      # Landing + form UI
│   │   ├── Dashboard.jsx           # Policy + stats overview
│   │   ├── LiveMonitor.jsx         # Real-time data feed panel
│   │   ├── AIDecisionLogs.jsx      # Engine reasoning log
│   │   └── ClaimsHistory.jsx       # Payout + fraud status
│   ├── engine/
│   │   ├── dataSimulator.js        # Simulated API data streams
│   │   ├── disruptionEngine.js     # Threshold-based trigger logic
│   │   ├── fraudScorer.js          # Multi-signal fraud scoring
│   │   └── premiumCalculator.js    # Dynamic premium model
│   ├── state/
│   │   └── appState.js             # React state management
│   └── App.jsx                     # Root component + routing
├── public/
├── package.json
└── README.md
```

## 🔮 Future Enhancements

### 🔌 Real API Integration
- [ ] OpenWeatherMap API for live rainfall and temperature
- [ ] CPCB (Central Pollution Control Board) API for real-time AQI
- [ ] Google Maps Traffic API for zone-level congestion data
- [ ] Platform webhooks (Swiggy/Zomato) for order volume signals

### 🧠 Advanced ML Models
- [ ] Time-series forecasting for disruption prediction (before it happens)
- [ ] Personalized risk scoring per worker based on historical claims
- [ ] Cluster analysis for fraud ring detection across multiple accounts
- [ ] Anomaly detection using unsupervised learning (Isolation Forest)

### 💳 Real Payment Infrastructure
- [ ] UPI integration for instant wallet credit (Razorpay/PhonePe)
- [ ] Blockchain-anchored claim records for auditability
- [ ] Multi-currency support for future international expansion

### 📊 Platform Integrations
- [ ] Swiggy/Zomato partner API for identity and earnings verification
- [ ] DigiLocker integration for KYC at registration
- [ ] WhatsApp Business API for claim notifications

### 🏦 Regulatory Compliance
- [ ] IRDAI (Insurance Regulatory and Development Authority of India) sandbox registration
- [ ] Parametric product filing under Sandbox Regulations 2019
- [ ] Data privacy compliance under DPDP Act 2023

---

## 🚀 Project Evolution (Phase Journey)

### Phase 1 — Ideation & Design (Hackathon Day 1)

In Phase 1, we focused on deep **persona research** and **problem framing** using a SOAR-style structured approach:

- **Situation:** Gig workers in India earning below ₹20,000/month with zero income protection
- **Objective:** Design a financially viable, technology-first protection product for the informal gig economy
- **Action:** Mapped disruption triggers (rain, heat, AQI, traffic, order volume) to parametric payout structures; designed a weekly premium model that is affordable (₹49–₹179/week); outlined a fraud defense strategy for the "Market Crash" adversarial scenario
- **Result:** A fully validated conceptual model with defined pricing, coverage scope, persona fit, and AI strategy

Key Phase 1 deliverables:
- Persona: *Ravi, 28, Chennai delivery partner*
- Weekly premium tiers: Basic (₹49), Standard (₹99), Premium (₹179)
- Disruption trigger definitions with payout amounts
- Fraud detection strategy: multi-signal validation architecture

---

### Phase 2 — Prototype & Build (Hackathon Day 2)

In Phase 2, we transformed the conceptual model into a **fully functional, production-quality prototype**:

- Built the **React frontend** with a multi-screen mobile-first UI (registration, dashboard, monitoring, AI logs, claims)
- Implemented the **AI Decision Engine** with real-time threshold analysis and fraud scoring
- Built the **dynamic premium calculator** that adjusts live based on zone and weather data
- Created the **automated claim pipeline** — disruption detected → user verified → payout triggered, with zero manual steps
- Designed the **fraud detection system** with multi-signal scoring and auto-block logic
- Added a full **demo scenario control panel** for live hackathon demonstrations
- Built an animated, cinematic **registration experience** with particle canvas and glassmorphism UI

> *"Phase 1 gave us the blueprint. Phase 2 made it real."*

---

## 👥 Team

| Name | Role |
|---|---|
| Divya S | Product & Strategy |
| Iniya J | Frontend Development |
| Anisha D | AI/ML & Backend Logic |
| Archana K | UI/UX Design |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
