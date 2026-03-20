import React, { useState } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:3001";

const CITIES = ["Chennai", "Mumbai", "Delhi", "Bangalore"];
const PLATFORMS = ["Swiggy", "Zomato", "Amazon", "Blinkit", "Zepto"];
const TIERS = [
  { id: "basic",    label: "Basic",    price: "~₹48", max: "₹500",   triggers: "Rain + Flood" },
  { id: "standard", label: "Standard", price: "~₹72", max: "₹1,000", triggers: "+ Heat + AQI" },
  { id: "premium",  label: "Premium",  price: "~₹105",max: "₹1,750", triggers: "+ Civic Events" },
];

// ─── Styles ─────────────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#f0ede8",
    fontFamily: "'DM Sans', sans-serif",
    padding: "0 0 80px",
  },
  header: {
    borderBottom: "1px solid #1e1e2e",
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#0d0d16",
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 22,
    color: "#f0ede8",
    letterSpacing: "-0.5px",
  },
  badge: {
    background: "#1a3a2a",
    color: "#4ade80",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    border: "1px solid #2d6b47",
    letterSpacing: "0.5px",
  },
  container: { maxWidth: 680, margin: "0 auto", padding: "40px 24px 0" },
  stepIndicator: {
    display: "flex",
    gap: 8,
    marginBottom: 36,
    alignItems: "center",
  },
  stepDot: (active, done) => ({
    width: active ? 28 : 8,
    height: 8,
    borderRadius: 4,
    background: done ? "#4ade80" : active ? "#f0ede8" : "#2a2a3a",
    transition: "all 0.3s ease",
  }),
  card: {
    background: "#11111c",
    border: "1px solid #1e1e2e",
    borderRadius: 16,
    padding: "32px",
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 20,
    marginBottom: 6,
    color: "#f0ede8",
  },
  cardSub: { color: "#6b6b80", fontSize: 14, marginBottom: 28 },
  label: { fontSize: 12, fontWeight: 600, color: "#6b6b80", marginBottom: 8, letterSpacing: "0.8px", textTransform: "uppercase" },
  input: {
    width: "100%",
    background: "#0d0d16",
    border: "1px solid #1e1e2e",
    borderRadius: 10,
    padding: "13px 16px",
    color: "#f0ede8",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
  },
  select: {
    width: "100%",
    background: "#0d0d16",
    border: "1px solid #1e1e2e",
    borderRadius: 10,
    padding: "13px 16px",
    color: "#f0ede8",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    appearance: "none",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  formField: { marginBottom: 20 },
  tierGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 },
  tierCard: (selected) => ({
    background: selected ? "#0f2d1f" : "#0d0d16",
    border: `1px solid ${selected ? "#4ade80" : "#1e1e2e"}`,
    borderRadius: 12,
    padding: "16px 14px",
    cursor: "pointer",
    transition: "all 0.2s",
  }),
  tierLabel: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 4 },
  tierPrice: { color: "#4ade80", fontSize: 20, fontWeight: 700, fontFamily: "'Syne', sans-serif" },
  tierMax: { color: "#6b6b80", fontSize: 12, marginTop: 4 },
  tierTriggers: { color: "#6b6b80", fontSize: 11, marginTop: 6 },
  btn: {
    width: "100%",
    background: "#f0ede8",
    color: "#0a0a0f",
    border: "none",
    borderRadius: 10,
    padding: "15px",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.3px",
    transition: "opacity 0.2s",
  },
  btnGreen: {
    width: "100%",
    background: "#4ade80",
    color: "#0a0a0f",
    border: "none",
    borderRadius: 10,
    padding: "15px",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.3px",
    transition: "opacity 0.2s",
    marginBottom: 12,
  },
  btnOutline: {
    width: "100%",
    background: "transparent",
    color: "#f0ede8",
    border: "1px solid #2a2a3a",
    borderRadius: 10,
    padding: "15px",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  policyCard: {
    background: "#0d1f16",
    border: "1px solid #2d6b47",
    borderRadius: 16,
    padding: "24px",
    marginBottom: 20,
  },
  policyRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  policyKey: { color: "#6b6b80", fontSize: 14 },
  policyVal: { color: "#f0ede8", fontWeight: 600, fontSize: 14 },
  weatherBox: {
    background: "#1a1020",
    border: "1px solid #3a1f4a",
    borderRadius: 12,
    padding: "20px",
    marginBottom: 20,
  },
  weatherGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 },
  weatherStat: {
    background: "#0f0a18",
    borderRadius: 10,
    padding: "14px",
    textAlign: "center",
  },
  weatherVal: { fontSize: 22, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#c084fc" },
  weatherKey: { fontSize: 11, color: "#6b6b80", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" },
  alert: (type) => ({
    background: type === "success" ? "#0f2d1f" : type === "error" ? "#2d0f0f" : "#1a1020",
    border: `1px solid ${type === "success" ? "#4ade80" : type === "error" ? "#f87171" : "#c084fc"}`,
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 16,
    fontSize: 14,
    color: type === "success" ? "#4ade80" : type === "error" ? "#f87171" : "#c084fc",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  }),
  payoutBox: {
    background: "#0a1f12",
    border: "1px solid #4ade80",
    borderRadius: 16,
    padding: "32px",
    textAlign: "center",
    marginBottom: 20,
  },
  payoutAmount: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 52,
    color: "#4ade80",
    margin: "8px 0",
  },
  payoutSub: { color: "#6b6b80", fontSize: 14 },
  tag: (color) => ({
    display: "inline-block",
    background: color === "green" ? "#0f2d1f" : color === "red" ? "#2d0f0f" : "#1a1020",
    color: color === "green" ? "#4ade80" : color === "red" ? "#f87171" : "#c084fc",
    border: `1px solid ${color === "green" ? "#2d6b47" : color === "red" ? "#6b2d2d" : "#4a2d6b"}`,
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 600,
  }),
  divider: { borderColor: "#1e1e2e", margin: "24px 0" },
  spinner: {
    display: "inline-block",
    width: 18,
    height: 18,
    border: "2px solid #2a2a3a",
    borderTopColor: "#f0ede8",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    verticalAlign: "middle",
    marginRight: 8,
  },
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1); // 1=register, 2=policy, 3=simulate, 4=result
  const [loading, setLoading] = useState(false);
  const [worker, setWorker] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [triggerResult, setTriggerResult] = useState(null);
  const [claimResult, setClaimResult] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", phone: "", city: "Chennai", platform: "Swiggy", tier: "standard" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const api = async (endpoint, method = "GET", body = null) => {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API}${endpoint}`, opts);
    return res.json();
  };

  const handleRegister = async () => {
    if (!form.name || !form.phone) { setError("Please fill in all fields."); return; }
    if (form.phone.length < 10) { setError("Enter a valid 10-digit phone number."); return; }
    setError(""); setLoading(true);
    try {
      const data = await api("/register", "POST", form);
      if (data.error) { setError(data.error); setLoading(false); return; }
      setWorker(data.worker);
      const prem = await api(`/get-premium?phone=${form.phone}`);
      setPolicy(prem);
      setStep(2);
    } catch { setError("Cannot connect to server. Is the backend running?"); }
    setLoading(false);
  };

  const handleSimulate = async () => {
    setError(""); setLoading(true); setTriggerResult(null); setClaimResult(null);
    try {
      const data = await api("/trigger-event", "POST", { phone: worker.phone });
      setTriggerResult(data);
      setStep(3);
    } catch { setError("Failed to simulate event."); }
    setLoading(false);
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      const data = await api("/process-claim", "POST", { phone: worker.phone });
      setClaimResult(data);
      setStep(4);
    } catch { setError("Failed to process claim."); }
    setLoading(false);
  };

  const reset = () => {
    setStep(1); setWorker(null); setPolicy(null);
    setTriggerResult(null); setClaimResult(null); setError("");
    setForm({ name: "", phone: "", city: "Chennai", platform: "Swiggy", tier: "standard" });
  };

  return (
    <div style={S.app}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { border-color: #4ade80 !important; }
        button:hover { opacity: 0.85; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <span style={{ fontSize: 22 }}>🛡️</span>
        <span style={S.logo}>RiskGuard</span>
        <span style={S.badge}>DEMO</span>
        <span style={{ marginLeft: "auto", color: "#6b6b80", fontSize: 13 }}>Guidewire DEVTrails 2026</span>
      </div>

      <div style={S.container}>
        {/* Step Indicator */}
        <div style={S.stepIndicator}>
          {[1,2,3,4].map(s => <div key={s} style={S.stepDot(step === s, step > s)} />)}
          <span style={{ color: "#6b6b80", fontSize: 13, marginLeft: 8 }}>
            {["", "Register", "Your Policy", "Simulate Event", "Claim Result"][step]}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={S.alert("error")}>⚠️ {error}</div>
        )}

        {/* ── STEP 1: Register ── */}
        {step === 1 && (
          <div style={S.card}>
            <div style={S.cardTitle}>Worker Registration</div>
            <div style={S.cardSub}>Get covered in under 2 minutes</div>

            <div style={S.formGrid}>
              <div style={S.formField}>
                <div style={S.label}>Full Name</div>
                <input style={S.input} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rajan Kumar" />
              </div>
              <div style={S.formField}>
                <div style={S.label}>Phone Number</div>
                <input style={S.input} name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" maxLength={10} />
              </div>
            </div>

            <div style={S.formGrid}>
              <div style={S.formField}>
                <div style={S.label}>City</div>
                <select style={S.select} name="city" value={form.city} onChange={handleChange}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={S.formField}>
                <div style={S.label}>Platform</div>
                <select style={S.select} name="platform" value={form.platform} onChange={handleChange}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div style={S.formField}>
              <div style={S.label}>Coverage Tier</div>
              <div style={S.tierGrid}>
                {TIERS.map(t => (
                  <div key={t.id} style={S.tierCard(form.tier === t.id)} onClick={() => setForm({ ...form, tier: t.id })}>
                    <div style={S.tierLabel}>{t.label}</div>
                    <div style={S.tierPrice}>{t.price}<span style={{ fontSize: 12, fontWeight: 400, color: "#6b6b80" }}>/wk</span></div>
                    <div style={S.tierMax}>Max {t.max}</div>
                    <div style={S.tierTriggers}>{t.triggers}</div>
                  </div>
                ))}
              </div>
            </div>

            <button style={S.btn} onClick={handleRegister} disabled={loading}>
              {loading ? <><span style={S.spinner} />Registering...</> : "Activate Policy →"}
            </button>
          </div>
        )}

        {/* ── STEP 2: Policy ── */}
        {step === 2 && policy && (
          <>
            <div style={S.alert("success")}>
              ✅ Policy active! Welcome, {policy.name}.
            </div>

            <div style={S.policyCard}>
              <div style={{ ...S.cardTitle, marginBottom: 20 }}>
                Your Weekly Policy
                <span style={{ ...S.tag("green"), marginLeft: 12, fontSize: 11 }}>ACTIVE</span>
              </div>
              {[
                ["Worker", policy.name],
                ["City", policy.city.charAt(0).toUpperCase() + policy.city.slice(1)],
                ["Platform", policy.platform],
                ["Tier", policy.tier.charAt(0).toUpperCase() + policy.tier.slice(1)],
                ["Weekly Premium", `₹${policy.premium}/week`],
                ["Max Payout", `₹${policy.maxPayout.toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} style={S.policyRow}>
                  <span style={S.policyKey}>{k}</span>
                  <span style={S.policyVal}>{v}</span>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <div style={S.cardTitle}>How It Works</div>
              <div style={{ color: "#6b6b80", fontSize: 14, lineHeight: 1.7, marginTop: 8 }}>
                RiskGuard monitors live weather and civic conditions in your zone 24/7.
                When a disruption crosses a threshold — heavy rain, extreme heat, hazardous AQI — 
                your claim is auto-triggered and the payout lands in your UPI within 2 hours.
                <strong style={{ color: "#f0ede8" }}> No forms. No calls. No waiting.</strong>
              </div>
            </div>

            <button style={S.btnGreen} onClick={handleSimulate} disabled={loading}>
              {loading ? <><span style={S.spinner} />Checking conditions...</> : "🌧️  Simulate Rain Event"}
            </button>
          </>
        )}

        {/* ── STEP 3: Trigger ── */}
        {step === 3 && triggerResult && (
          <>
            <div style={S.weatherBox}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                Live Conditions — {worker.city.charAt(0).toUpperCase() + worker.city.slice(1)}
              </div>
              <div style={{ color: "#c084fc", fontSize: 13 }}>{triggerResult.weather?.condition}</div>
              <div style={S.weatherGrid}>
                {[
                  [triggerResult.weather?.rainfall_mm + " mm", "Rainfall"],
                  [triggerResult.weather?.temperature_c + "°C", "Temperature"],
                  [triggerResult.weather?.aqi, "AQI"],
                  [triggerResult.triggered ? "BREACHED" : "NORMAL", "Status"],
                ].map(([val, key]) => (
                  <div key={key} style={S.weatherStat}>
                    <div style={{ ...S.weatherVal, color: key === "Status" && triggerResult.triggered ? "#f87171" : "#c084fc" }}>{val}</div>
                    <div style={S.weatherKey}>{key}</div>
                  </div>
                ))}
              </div>
            </div>

            {triggerResult.triggered ? (
              <>
                <div style={S.alert("error")}>
                  🚨 Disruption detected! {triggerResult.triggers?.join(" · ")}
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Claim Validation</div>
                  <div style={{ color: "#6b6b80", fontSize: 14, marginTop: 8, marginBottom: 24 }}>
                    Threshold breached. Running fraud check and validating your zone activity...
                  </div>
                  <button style={S.btnGreen} onClick={handleClaim} disabled={loading}>
                    {loading ? <><span style={S.spinner} />Processing claim...</> : "Process Claim →"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={S.alert("success")}>
                  ✅ {triggerResult.message}
                </div>
                <button style={S.btnOutline} onClick={() => setStep(2)}>← Back to Policy</button>
              </>
            )}
          </>
        )}

        {/* ── STEP 4: Result ── */}
        {step === 4 && claimResult && (
          <>
            {claimResult.approved ? (
              <>
                <div style={S.payoutBox}>
                  <div style={{ color: "#4ade80", fontSize: 13, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
                    ✅ Claim Approved
                  </div>
                  <div style={S.payoutAmount}>₹{claimResult.payout?.toLocaleString()}</div>
                  <div style={S.payoutSub}>{claimResult.upi}</div>
                  <div style={{ ...S.payoutSub, marginTop: 8 }}>Payout processed in &lt; 2 hours</div>
                </div>

                <div style={S.card}>
                  {[
                    ["Worker", claimResult.worker],
                    ["Payout Amount", `₹${claimResult.payout?.toLocaleString()}`],
                    ["Transfer Method", "UPI (Simulated)"],
                    ["Claims This Week", claimResult.claimsThisWeek],
                    ["Total Earned Back", `₹${claimResult.totalPayouts?.toLocaleString()}`],
                    ["Fraud Check", "✅ Passed"],
                  ].map(([k, v]) => (
                    <div key={k} style={S.policyRow}>
                      <span style={S.policyKey}>{k}</span>
                      <span style={S.policyVal}>{v}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={S.alert("error")}>
                  ❌ Claim Rejected — {claimResult.reason}
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>What Happened?</div>
                  <div style={{ color: "#6b6b80", fontSize: 14, marginTop: 8 }}>
                    Our fraud detection system flagged this claim. This protects all workers in the pool from abuse.
                    If you believe this is an error, you can appeal within the app.
                  </div>
                </div>
              </>
            )}

            <button style={S.btn} onClick={reset}>Start New Demo ↺</button>
          </>
        )}
      </div>
    </div>
  );
}
