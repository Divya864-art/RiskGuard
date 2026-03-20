const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── In-memory store (no DB needed for demo) ───────────────────────────────
const workers = {}; // keyed by phone number

// ─── Config ────────────────────────────────────────────────────────────────
const BASE_PREMIUM = 40; // ₹/week
const CITY_MULTIPLIERS = { chennai: 1.2, mumbai: 1.15, delhi: 1.1, bangalore: 1.05 };
const RAIN_THRESHOLD_MM = 35; // mm in 3 hours
const PAYOUT_RATES = { basic: 500, standard: 1000, premium: 1750 };

// ─── Mock weather data ─────────────────────────────────────────────────────
const MOCK_WEATHER = {
  chennai: { rainfall_mm: 52, temperature_c: 38, aqi: 145, condition: "Heavy Rain" },
  mumbai:  { rainfall_mm: 18, temperature_c: 32, aqi: 180, condition: "Drizzle"    },
  delhi:   { rainfall_mm: 5,  temperature_c: 44, aqi: 310, condition: "Extreme Heat + Poor AQI" },
  bangalore: { rainfall_mm: 28, temperature_c: 29, aqi: 95, condition: "Moderate Rain" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function calcPremium(city, tier) {
  const multiplier = CITY_MULTIPLIERS[city.toLowerCase()] || 1.0;
  const tierMultiplier = { basic: 1, standard: 1.5, premium: 2.2 }[tier] || 1;
  return Math.round(BASE_PREMIUM * multiplier * tierMultiplier);
}

function fraudCheck(worker) {
  // Simulate: 80% of workers have recent activity
  const hasActivity = Math.random() > 0.2;
  if (!hasActivity) return { passed: false, reason: "No platform activity detected in the last 2 hours." };
  if (worker.claimsThisWeek >= 2) return { passed: false, reason: "Maximum claims for this week already reached." };
  return { passed: true };
}

// ─── Routes ────────────────────────────────────────────────────────────────

// POST /register
app.post("/register", (req, res) => {
  const { name, phone, city, platform, tier } = req.body;
  if (!name || !phone || !city || !platform) {
    return res.status(400).json({ error: "All fields are required." });
  }
  const normalizedCity = city.toLowerCase();
  const selectedTier = tier || "standard";
  const premium = calcPremium(normalizedCity, selectedTier);

  workers[phone] = {
    name,
    phone,
    city: normalizedCity,
    platform,
    tier: selectedTier,
    premium,
    policyActive: true,
    claimsThisWeek: 0,
    totalPayouts: 0,
    registeredAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: `Welcome, ${name}! Your policy is active.`,
    worker: workers[phone],
  });
});

// GET /get-premium?phone=xxx
app.get("/get-premium", (req, res) => {
  const { phone } = req.query;
  const worker = workers[phone];
  if (!worker) return res.status(404).json({ error: "Worker not found. Please register first." });

  res.json({
    name: worker.name,
    city: worker.city,
    platform: worker.platform,
    tier: worker.tier,
    premium: worker.premium,
    policyActive: worker.policyActive,
    maxPayout: PAYOUT_RATES[worker.tier],
  });
});

// POST /trigger-event
app.post("/trigger-event", (req, res) => {
  const { phone } = req.body;
  const worker = workers[phone];
  if (!worker) return res.status(404).json({ error: "Worker not found." });
  if (!worker.policyActive) return res.status(400).json({ error: "No active policy." });

  const weather = MOCK_WEATHER[worker.city] || MOCK_WEATHER["chennai"];

  // Check if any trigger threshold is breached
  const triggers = [];
  if (weather.rainfall_mm > RAIN_THRESHOLD_MM) triggers.push(`Heavy rainfall (${weather.rainfall_mm}mm > ${RAIN_THRESHOLD_MM}mm threshold)`);
  if (weather.temperature_c > 42) triggers.push(`Extreme heat (${weather.temperature_c}°C > 42°C threshold)`);
  if (weather.aqi > 300) triggers.push(`Hazardous AQI (${weather.aqi} > 300 threshold)`);

  if (triggers.length === 0) {
    return res.json({
      triggered: false,
      message: "No disruption threshold breached. Conditions are within normal range.",
      weather,
    });
  }

  res.json({
    triggered: true,
    triggers,
    weather,
    city: worker.city,
    message: "Disruption event detected. Initiating claim validation...",
  });
});

// POST /process-claim
app.post("/process-claim", (req, res) => {
  const { phone } = req.body;
  const worker = workers[phone];
  if (!worker) return res.status(404).json({ error: "Worker not found." });

  // Fraud check
  const fraud = fraudCheck(worker);
  if (!fraud.passed) {
    return res.json({
      approved: false,
      stage: "fraud_check",
      reason: fraud.reason,
    });
  }

  // Calculate payout (simulated: 4-hour disruption out of 10-hour day)
  const disruptionHours = 4;
  const dailyHours = 10;
  const weeklyBaseline = worker.premium * 8; // rough earning baseline
  const payout = Math.round((disruptionHours / dailyHours) * weeklyBaseline);
  const cappedPayout = Math.min(payout, PAYOUT_RATES[worker.tier]);

  // Update worker record
  worker.claimsThisWeek += 1;
  worker.totalPayouts += cappedPayout;

  res.json({
    approved: true,
    stage: "payout_complete",
    worker: worker.name,
    payout: cappedPayout,
    upi: `UPI transfer → ****${worker.phone.slice(-4)}`,
    message: `₹${cappedPayout} transferred to your UPI account successfully.`,
    claimsThisWeek: worker.claimsThisWeek,
    totalPayouts: worker.totalPayouts,
  });
});

// Health check
app.get("/", (req, res) => res.json({ status: "RiskGuard API running ✅" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🛡️  RiskGuard backend running on http://localhost:${PORT}`));
