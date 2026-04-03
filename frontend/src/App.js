import { useState, useEffect, useRef, useCallback } from "react";

const ZONES = ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Jayanagar", "BTM Layout"];
const PLATFORMS = ["Swiggy", "Zomato", "Dunzo", "Blinkit", "Zepto"];
const ZONE_RISK = { Koramangala: 1.1, Indiranagar: 1.0, Whitefield: 1.2, "HSR Layout": 0.9, Jayanagar: 0.85, "BTM Layout": 1.05 };
const PLANS = [
  { id: "basic", name: "Basic Shield", weekly: 49, coverage: 500, color: "#38bdf8", desc: "Rain + Heat triggers", triggers: ["rain", "heat"] },
  { id: "standard", name: "Standard Guard", weekly: 99, coverage: 1200, color: "#a78bfa", desc: "Rain + Heat + AQI + Traffic", triggers: ["rain", "heat", "aqi", "traffic"] },
  { id: "premium", name: "Premium Fortress", weekly: 179, coverage: 2500, color: "#f59e0b", desc: "All triggers + Priority claims", triggers: ["rain", "heat", "aqi", "traffic", "order_drop"] },
];
const THRESHOLDS = { rain: 15, heat: 40, aqi: 200, traffic: true, order_drop: 30 };

const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));

function generateNormalData() {
  return { rainfall: parseFloat(rand(0, 8).toFixed(1)), temperature: parseFloat(rand(28, 37).toFixed(1)), aqi: randInt(60, 150), traffic: "CLEAR", orderVolume: randInt(70, 100), locationConfidence: randInt(85, 99), deviceStatus: "NORMAL", userActivity: "ACTIVE" };
}
function generateFraudData() {
  return { rainfall: parseFloat(rand(18, 45).toFixed(1)), temperature: parseFloat(rand(28, 37).toFixed(1)), aqi: randInt(60, 150), traffic: "CLEAR", orderVolume: randInt(70, 100), locationConfidence: randInt(10, 35), deviceStatus: "SPOOFED", userActivity: "INACTIVE" };
}
function generateDisruptionData() {
  return { rainfall: parseFloat(rand(18, 55).toFixed(1)), temperature: parseFloat(rand(41, 48).toFixed(1)), aqi: randInt(210, 380), traffic: "BLOCKED", orderVolume: randInt(10, 35), locationConfidence: randInt(78, 95), deviceStatus: "NORMAL", userActivity: "ACTIVE" };
}
function calcFraudScore(data) {
  let s = 0;
  if (data.locationConfidence < 40) s += 40; else if (data.locationConfidence < 60) s += 20;
  if (data.userActivity === "INACTIVE") s += 30;
  if (data.deviceStatus === "SPOOFED") s += 25;
  if (data.orderVolume < 20 && data.rainfall > 20) s += 5;
  return Math.min(s, 100);
}
function calcDisruptions(data) {
  const d = [];
  if (data.rainfall > THRESHOLDS.rain) d.push({ type: "rain", label: "Heavy Rain", icon: "🌧", value: `${data.rainfall}mm`, payout: 400 });
  if (data.temperature > THRESHOLDS.heat) d.push({ type: "heat", label: "Extreme Heat", icon: "🌡", value: `${data.temperature}°C`, payout: 300 });
  if (data.aqi > THRESHOLDS.aqi) d.push({ type: "aqi", label: "Hazardous AQI", icon: "🌫", value: data.aqi, payout: 350 });
  if (data.traffic === "BLOCKED") d.push({ type: "traffic", label: "Traffic Block", icon: "🚧", value: "Blocked", payout: 250 });
  if (data.orderVolume < THRESHOLDS.order_drop) d.push({ type: "order_drop", label: "Order Drop", icon: "📉", value: `${data.orderVolume}%`, payout: 200 });
  return d;
}
function calcPremium(zone, data) {
  const base = 99, zm = ZONE_RISK[zone] || 1.0;
  const wm = data.rainfall > 10 || data.temperature > 38 || data.aqi > 150 ? 1.2 : 1.0;
  return Math.round(base * zm * wm);
}

// ── PARTICLE CANVAS ───────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let id;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.45 + 0.08,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x = (p.x + p.vx + c.width) % c.width;
        p.y = (p.y + p.vy + c.height) % c.height;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,237,${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 85) { ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.strokeStyle=`rgba(99,179,237,${0.1*(1-d/85)})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"absolute",inset:0,width:"100%",height:"100%" }} />;
}

// ── REGISTRATION ──────────────────────────────────────────────────────────────
function RegisterScreen({ onRegister }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [zone, setZone] = useState(ZONES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [err, setErr] = useState("");
  const [focused, setFocused] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);

  const handle = () => {
    if (!name.trim()) { setErr("Please enter your full name"); return; }
    setSubmitting(true);
    setTimeout(() => onRegister({ name: name.trim(), zone, platform, id: Date.now() }), 1100);
  };

  const PICONS = { Swiggy:"🟠", Zomato:"🔴", Dunzo:"🟣", Blinkit:"🟡", Zepto:"🔵" };
  const zoneRiskLabel = ZONE_RISK[zone] > 1.08 ? { label:"HIGH", color:"#ef4444" } : ZONE_RISK[zone] > 0.97 ? { label:"MEDIUM", color:"#f59e0b" } : { label:"LOW", color:"#22c55e" };

  const inp = (field) => ({
    width:"100%", background: focused===field ? "rgba(56,189,248,0.07)" : "rgba(255,255,255,0.03)",
    border:`1.5px solid ${focused===field ? "rgba(56,189,248,0.55)" : "rgba(255,255,255,0.09)"}`,
    borderRadius:14, padding:"15px 18px", color:"#f1f5f9", fontSize:15,
    outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box",
    transition:"all 0.25s", letterSpacing:0.2,
  });

  return (
    <div style={{ minHeight:"100vh", background:"#03080f", position:"relative", overflow:"hidden" }}>
      <ParticleCanvas />

      {/* Gradient orbs */}
      <div style={{ position:"absolute", top:-150, right:-100, width:450, height:450, borderRadius:"50%", background:"radial-gradient(circle, rgba(56,189,248,0.13) 0%, transparent 68%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-80, left:-80, width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 68%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"35%", left:"20%", width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 68%)", pointerEvents:"none" }} />

      {step === 0 ? (
        /* ── HERO LANDING ── */
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"56px 28px 44px", position:"relative", zIndex:1 }}>
          
          {/* Top status chip */}
          <div style={{ animation:"riseUp 0.55s ease 0s both" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(56,189,248,0.08)", border:"1px solid rgba(56,189,248,0.22)", borderRadius:50, padding:"7px 16px" }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:"#38bdf8",display:"inline-block",boxShadow:"0 0 10px #38bdf8aa" }} />
              <span style={{ fontSize:11,color:"#38bdf8",fontWeight:700,letterSpacing:1.8,fontFamily:"'Syne',sans-serif" }}>AI-POWERED · PARAMETRIC INSURANCE</span>
            </div>
          </div>

          {/* Center hero */}
          <div>
            {/* Big shield icon */}
            <div style={{ animation:"riseUp 0.55s ease 0.08s both", marginBottom:24 }}>
              <div style={{
                width:88, height:88, borderRadius:24,
                background:"linear-gradient(135deg,rgba(56,189,248,0.18),rgba(167,139,250,0.18))",
                border:"1px solid rgba(56,189,248,0.28)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:42,
                boxShadow:"0 0 50px rgba(56,189,248,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}>🛡</div>
            </div>

            <div style={{ animation:"riseUp 0.55s ease 0.15s both" }}>
              <h1 style={{ margin:"0 0 2px", fontSize:52, fontWeight:900, lineHeight:1.0, fontFamily:"'Syne',sans-serif", color:"#f8fafc", letterSpacing:-1 }}>
                Risk<span style={{ color:"#38bdf8", textShadow:"0 0 30px rgba(56,189,248,0.6)" }}>Guard</span>
              </h1>
              <p style={{ margin:"12px 0 36px", fontSize:16, color:"#4a5568", lineHeight:1.65, maxWidth:290, fontFamily:"'DM Sans',sans-serif" }}>
                Real-time parametric insurance that pays out <em style={{ color:"#94a3b8", fontStyle:"normal", fontWeight:600 }}>automatically</em> when disruptions hit your deliveries.
              </p>
            </div>

            {/* Feature cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:40 }}>
              {[
                { icon:"⚡", title:"Instant Auto-Payout", sub:"No claims. No paperwork. Ever.", delay:"0.22s", c:"#38bdf8" },
                { icon:"🤖", title:"AI Detection Engine", sub:"Monitors rain, heat, AQI in real time", delay:"0.30s", c:"#a78bfa" },
                { icon:"🔒", title:"Fraud Shield", sub:"Smart anomaly detection protects payouts", delay:"0.38s", c:"#34d399" },
              ].map(f => (
                <div key={f.title} style={{
                  animation:`riseUp 0.55s ease ${f.delay} both`,
                  display:"flex", alignItems:"center", gap:14,
                  background:"rgba(255,255,255,0.04)", backdropFilter:"blur(12px)",
                  border:"1px solid rgba(255,255,255,0.08)", borderRadius:16,
                  padding:"14px 18px",
                }}>
                  <div style={{ width:42,height:42,borderRadius:12,background:`rgba(${f.c==="#38bdf8"?"56,189,248":f.c==="#a78bfa"?"167,139,250":"52,211,153"},0.12)`,border:`1px solid ${f.c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize:14,fontWeight:700,color:"#e2e8f0",fontFamily:"'Syne',sans-serif" }}>{f.title}</div>
                    <div style={{ fontSize:12,color:"#475569",marginTop:2,fontFamily:"'DM Sans',sans-serif" }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ animation:"riseUp 0.55s ease 0.44s both" }}>
              <button
                onClick={() => setStep(1)}
                onMouseEnter={() => setHoverBtn(true)}
                onMouseLeave={() => setHoverBtn(false)}
                style={{
                  width:"100%", padding:"18px", borderRadius:18, border:"none",
                  background:"linear-gradient(135deg,#38bdf8 0%,#818cf8 60%,#a78bfa 100%)",
                  color:"#fff", fontSize:17, fontWeight:800, cursor:"pointer",
                  fontFamily:"'Syne',sans-serif", letterSpacing:0.3,
                  boxShadow: hoverBtn ? "0 16px 48px rgba(56,189,248,0.55), 0 4px 16px rgba(0,0,0,0.5)" : "0 8px 32px rgba(56,189,248,0.32), 0 2px 8px rgba(0,0,0,0.4)",
                  transform: hoverBtn ? "translateY(-2px)" : "translateY(0)",
                  transition:"all 0.2s ease",
                }}>
                Get Protected Now →
              </button>
              <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:16 }}>
                {["₹49/week onwards","Cancel anytime","AI-monitored 24/7"].map(t => (
                  <span key={t} style={{ fontSize:11,color:"#334155",fontFamily:"'DM Sans',sans-serif" }}>✓ {t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── FORM ── */
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"44px 24px 32px", position:"relative", zIndex:1 }}>
          {/* Back btn */}
          <button onClick={() => setStep(0)} style={{ position:"absolute",top:20,left:20,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"8px 14px",color:"#64748b",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>← Back</button>

          <div style={{ animation:"riseUp 0.45s ease both" }}>
            {/* Header */}
            <div style={{ marginBottom:28 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                <div style={{ width:40,height:40,borderRadius:12,background:"rgba(56,189,248,0.12)",border:"1px solid rgba(56,189,248,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🛡</div>
                <span style={{ fontSize:13,color:"#38bdf8",fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:1 }}>RISKGUARD</span>
              </div>
              <h2 style={{ margin:"0 0 6px",fontSize:27,fontWeight:900,color:"#f8fafc",fontFamily:"'Syne',sans-serif",letterSpacing:-0.5 }}>Create your account</h2>
              <p style={{ margin:0,fontSize:14,color:"#475569",fontFamily:"'DM Sans',sans-serif" }}>Protection starts the moment you activate.</p>
            </div>

            {/* Step dots */}
            <div style={{ display:"flex",gap:6,marginBottom:28 }}>
              {[0,1,2].map(i => <div key={i} style={{ height:3,flex:1,borderRadius:99,background:i===0?"#38bdf8":i===1?"rgba(56,189,248,0.3)":"rgba(255,255,255,0.07)",transition:"background 0.3s" }} />)}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {/* Name */}
              <div style={{ animation:"riseUp 0.45s ease 0.05s both" }}>
                <label style={{ display:"block",fontSize:10.5,color:"#475569",marginBottom:8,letterSpacing:1.8,fontWeight:700,fontFamily:"'Syne',sans-serif" }}>YOUR FULL NAME</label>
                <input style={inp("name")} value={name} onChange={e=>{setName(e.target.value);setErr("");}} onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)} placeholder="e.g. Arjun Sharma" />
              </div>

              {/* Zone */}
              <div style={{ animation:"riseUp 0.45s ease 0.1s both" }}>
                <label style={{ display:"block",fontSize:10.5,color:"#475569",marginBottom:10,letterSpacing:1.8,fontWeight:700,fontFamily:"'Syne',sans-serif" }}>DELIVERY ZONE</label>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                  {ZONES.map(z => (
                    <button key={z} onClick={()=>setZone(z)} style={{ padding:"11px 6px",borderRadius:12,border:`1.5px solid ${zone===z?"rgba(56,189,248,0.55)":"rgba(255,255,255,0.07)"}`,background:zone===z?"rgba(56,189,248,0.1)":"rgba(255,255,255,0.03)",color:zone===z?"#38bdf8":"#475569",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif" }}>{z}</button>
                  ))}
                </div>
                {/* Zone risk badge */}
                <div style={{ marginTop:10,display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10 }}>
                  <span style={{ fontSize:12,color:"#475569",fontFamily:"'DM Sans',sans-serif" }}>📍 Zone risk:</span>
                  <span style={{ fontSize:12,fontWeight:800,color:zoneRiskLabel.color,fontFamily:"'Syne',sans-serif",letterSpacing:1 }}>{zoneRiskLabel.label}</span>
                  <span style={{ fontSize:11,color:"#334155",marginLeft:"auto",fontFamily:"'DM Sans',sans-serif" }}>{ZONE_RISK[zone]}× premium</span>
                </div>
              </div>

              {/* Platform */}
              <div style={{ animation:"riseUp 0.45s ease 0.15s both" }}>
                <label style={{ display:"block",fontSize:10.5,color:"#475569",marginBottom:10,letterSpacing:1.8,fontWeight:700,fontFamily:"'Syne',sans-serif" }}>DELIVERY PLATFORM</label>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={()=>setPlatform(p)} style={{ padding:"10px 16px",borderRadius:50,border:`1.5px solid ${platform===p?"rgba(167,139,250,0.55)":"rgba(255,255,255,0.07)"}`,background:platform===p?"rgba(167,139,250,0.1)":"rgba(255,255,255,0.03)",color:platform===p?"#a78bfa":"#475569",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{fontSize:14}}>{PICONS[p]}</span>{p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview card */}
              <div style={{ animation:"riseUp 0.45s ease 0.2s both", background:"linear-gradient(135deg,rgba(56,189,248,0.07),rgba(167,139,250,0.05))", border:"1px solid rgba(56,189,248,0.14)", borderRadius:14, padding:"14px 16px" }}>
                <div style={{ fontSize:10.5,color:"#38bdf8",letterSpacing:1.5,fontWeight:700,fontFamily:"'Syne',sans-serif",marginBottom:10 }}>COVERAGE PREVIEW</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                  {[{l:"AI Premium (est.)",v:`₹${Math.round(99*(ZONE_RISK[zone]||1))}/wk`},{l:"Max Coverage",v:"Up to ₹2,500"},{l:"Platform",v:platform},{l:"Zone",v:zone}].map(({l,v})=>(
                    <div key={l}>
                      <div style={{fontSize:10,color:"#334155",fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>{l}</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",fontFamily:"'Syne',sans-serif"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {err && <div style={{ background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#fca5a5",fontFamily:"'DM Sans',sans-serif" }}>⚠ {err}</div>}

              {/* Submit */}
              <button onClick={handle} disabled={submitting} style={{
                width:"100%", padding:"17px", borderRadius:16, border:"none",
                background: submitting ? "rgba(56,189,248,0.25)" : "linear-gradient(135deg,#38bdf8,#818cf8 55%,#a78bfa)",
                color:"#fff", fontSize:16, fontWeight:800, cursor:submitting?"default":"pointer",
                fontFamily:"'Syne',sans-serif", letterSpacing:0.4,
                boxShadow: submitting ? "none" : "0 8px 32px rgba(56,189,248,0.28)",
                transition:"all 0.3s", animation:"riseUp 0.45s ease 0.25s both",
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              }}>
                {submitting ? (
                  <><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Activating Shield...</>
                ) : "Activate My Shield →"}
              </button>

              <div style={{ display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap" }}>
                {["Auto-claims","No paperwork","Cancel anytime"].map(t=><span key={t} style={{fontSize:11,color:"#1e293b",fontFamily:"'DM Sans',sans-serif"}}>✓ {t}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap');
        @keyframes riseUp { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
      `}</style>
    </div>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function GlowBadge({ color, children }) {
  return <span style={{ background:`${color}22`,border:`1px solid ${color}55`,color,borderRadius:99,padding:"2px 10px",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1 }}>{children}</span>;
}
function MetricCard({ icon, label, value, unit, danger, warn }) {
  const bc = danger?"#ef4444":warn?"#f59e0b":"#ffffff15";
  const vc = danger?"#ef4444":warn?"#f59e0b":"#f1f5f9";
  return (
    <div style={{ background:"rgba(255,255,255,0.04)",border:`1px solid ${bc}`,borderRadius:14,padding:"12px 16px",display:"flex",flexDirection:"column",gap:4,transition:"border-color 0.4s",boxShadow:danger?"0 0 14px #ef444430":warn?"0 0 14px #f59e0b25":"none" }}>
      <span style={{fontSize:20}}>{icon}</span>
      <span style={{fontSize:11,color:"#94a3b8",fontFamily:"monospace",letterSpacing:1}}>{label}</span>
      <span style={{fontSize:18,fontWeight:800,color:vc,fontFamily:"monospace"}}>{value}<span style={{fontSize:11,fontWeight:400,color:"#64748b",marginLeft:3}}>{unit}</span></span>
    </div>
  );
}
function LogLine({ text, type, ts }) {
  const color = type==="error"?"#ef4444":type==="warn"?"#f59e0b":type==="success"?"#22c55e":"#94a3b8";
  return (
    <div style={{display:"flex",gap:10,alignItems:"flex-start",padding:"4px 0",animation:"fadeIn 0.3s ease"}}>
      <span style={{color:"#475569",fontSize:10,fontFamily:"monospace",whiteSpace:"nowrap",marginTop:2}}>{ts}</span>
      <span style={{color,fontSize:12,fontFamily:"monospace",lineHeight:1.5}}>{text}</span>
    </div>
  );
}
function PulsingDot({ color }) {
  return (
    <span style={{position:"relative",display:"inline-block",width:10,height:10,borderRadius:"50%",background:color,flexShrink:0}}>
      <span style={{position:"absolute",inset:-3,borderRadius:"50%",border:`2px solid ${color}`,animation:"pulse 1.5s infinite",opacity:0.6}}/>
    </span>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function RiskGuard() {
  const [screen, setScreen] = useState("register");
  const [user, setUser] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [liveData, setLiveData] = useState(generateNormalData());
  const [logs, setLogs] = useState([]);
  const [claims, setClaims] = useState([]);
  const [fraudScore, setFraudScore] = useState(0);
  const [fraudStatus, setFraudStatus] = useState("SAFE");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [scenario, setScenario] = useState("normal");
  const [premium, setPremium] = useState(99);
  const logsRef = useRef(null);
  const tickRef = useRef(null);
  const engineRef = useRef(null);

  const addLog = useCallback((text, type="info") => {
    const ts = new Date().toLocaleTimeString("en-IN",{hour12:false});
    setLogs(prev=>[{text,type,ts,id:Date.now()+Math.random()},...prev].slice(0,80));
  },[]);

  useEffect(()=>{
    if(!policy) return;
    tickRef.current = setInterval(()=>{
      setLiveData(prev=>{
        const base = scenario==="disruption"?generateDisruptionData():scenario==="fraud"?generateFraudData():generateNormalData();
        if(scenario==="fraud") return {...base,rainfall:parseFloat(rand(18,45).toFixed(1))};
        return {...base,rainfall:parseFloat((prev.rainfall*0.4+base.rainfall*0.6).toFixed(1)),temperature:parseFloat((prev.temperature*0.5+base.temperature*0.5).toFixed(1)),aqi:Math.round(prev.aqi*0.4+base.aqi*0.6)};
      });
    },2000);
    return ()=>clearInterval(tickRef.current);
  },[policy,scenario]);

  useEffect(()=>{
    if(!policy) return;
    clearTimeout(engineRef.current);
    engineRef.current=setTimeout(()=>runAIEngine(liveData),600);
  },[liveData,policy]);

  useEffect(()=>{ if(user) setPremium(calcPremium(user.zone,liveData)); },[liveData,user]);

  const runAIEngine = useCallback((data)=>{
    if(!policy) return;
    const fs=calcFraudScore(data);
    const status=fs>=70?"FRAUD":fs>=35?"SUSPICIOUS":"SAFE";
    setFraudScore(fs); setFraudStatus(status);
    const dis=calcDisruptions(data).filter(d=>policy.triggers.includes(d.type));
    if(!dis.length) return;
    addLog("► Analyzing environmental conditions...","info");
    dis.forEach((d,i)=>setTimeout(()=>addLog(`  ${d.icon} ${d.label}: ${d.value} — threshold exceeded`,"warn"),i*300));
    setTimeout(()=>addLog("► Validating user activity & device signals...","info"),dis.length*300+200);
    setTimeout(()=>{ addLog(`  📍 Location confidence: ${data.locationConfidence}%`,data.locationConfidence<50?"warn":"info"); addLog(`  📱 Device: ${data.deviceStatus}`,data.deviceStatus!=="NORMAL"?"warn":"info"); addLog(`  🚚 Activity: ${data.userActivity}`,data.userActivity!=="ACTIVE"?"warn":"info"); },dis.length*300+600);
    setTimeout(()=>addLog(`► Fraud risk score: ${fs}/100`,fs>60?"error":fs>30?"warn":"info"),dis.length*300+1000);
    setTimeout(()=>{
      if(status==="FRAUD"){ addLog("🚨 FRAUD DETECTED — Payout blocked automatically","error"); }
      else if(status==="SUSPICIOUS"){ addLog("⚠️ Suspicious activity — Manual review flagged","warn"); }
      else {
        addLog("✅ User verified — Triggering parametric payout...","success");
        const tot=dis.reduce((s,d)=>s+d.payout,0);
        setTimeout(()=>{
          addLog(`💰 Payout ₹${tot} credited automatically`,"success");
          setClaims(prev=>{ if(prev[0]&&Date.now()-prev[0].time<5000) return prev; return [{id:Date.now(),time:Date.now(),triggers:dis.map(d=>d.label),payout:tot,status:"PAID"},...prev].slice(0,20); });
        },600);
      }
    },dis.length*300+1400);
  },[policy,addLog]);

  const handleRegister=(u)=>{ setUser(u); setScreen("dashboard"); };
  const handleActivatePolicy=(plan)=>{ setPolicy(plan); setLogs([]); setClaims([]); addLog(`✅ Policy "${plan.name}" activated`,"success"); addLog(`📍 Zone: ${user.zone} | Platform: ${user.platform}`,"info"); addLog("🤖 AI Monitoring Engine started...","success"); setActiveTab("monitor"); };
  const handleScenario=(s)=>{ setScenario(s); addLog(`⚡ Scenario: ${s.toUpperCase()}`,s==="fraud"?"error":s==="disruption"?"warn":"success"); };

  if(screen==="register") return <RegisterScreen onRegister={handleRegister}/>;

  const disruptions=calcDisruptions(liveData);
  const riskLevel=fraudStatus==="FRAUD"?"CRITICAL":disruptions.length>=3?"HIGH":disruptions.length>=1?"MEDIUM":"LOW";
  const riskColor=riskLevel==="CRITICAL"||riskLevel==="HIGH"?"#ef4444":riskLevel==="MEDIUM"?"#f59e0b":"#22c55e";
  const totalPaid=claims.filter(c=>c.status==="PAID").reduce((s,c)=>s+c.payout,0);

  const tabSt=(t)=>({flex:1,padding:"10px 0",background:activeTab===t?"rgba(56,189,248,0.12)":"transparent",border:activeTab===t?"1px solid rgba(56,189,248,0.25)":"1px solid transparent",borderRadius:10,color:activeTab===t?"#38bdf8":"#475569",fontWeight:700,fontSize:10,cursor:"pointer",letterSpacing:0.5,transition:"all 0.2s",textTransform:"uppercase",fontFamily:"'Syne',sans-serif"});

  return (
    <div style={{minHeight:"100vh",maxWidth:480,margin:"0 auto",padding:"0 0 100px",background:"#03080f"}}>
      <div style={{position:"sticky",top:0,zIndex:50,backdropFilter:"blur(20px)",background:"rgba(3,8,15,0.92)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🛡</span>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:"#f1f5f9",fontFamily:"'Syne',sans-serif"}}>RiskGuard</div>
            <div style={{fontSize:11,color:"#475569",fontFamily:"'DM Sans',sans-serif"}}>{user.name} · {user.platform}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}><PulsingDot color={policy?"#22c55e":"#475569"}/><span style={{fontSize:11,color:policy?"#22c55e":"#475569",fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{policy?"LIVE":"OFFLINE"}</span></div>
      </div>

      <div style={{padding:"0 16px"}}>
        {activeTab==="dashboard"&&(
          <div style={{paddingTop:20}}>
            {!policy?(
              <div>
                <div style={{marginBottom:24}}><h2 style={{fontSize:20,fontWeight:800,margin:"0 0 4px",color:"#f1f5f9",fontFamily:"'Syne',sans-serif"}}>Choose Your Plan</h2><p style={{fontSize:13,color:"#475569",margin:0,fontFamily:"'DM Sans',sans-serif"}}>AI-calculated for {user.zone} zone</p></div>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {PLANS.map(plan=>(
                    <div key={plan.id} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${plan.color}33`,borderRadius:18,padding:20,boxShadow:`0 0 20px ${plan.color}15`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                        <div><div style={{fontSize:16,fontWeight:800,color:"#f1f5f9",fontFamily:"'Syne',sans-serif"}}>{plan.name}</div><div style={{fontSize:12,color:"#64748b",marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>{plan.desc}</div></div>
                        <div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:900,color:plan.color,fontFamily:"'Syne',sans-serif"}}>₹{plan.weekly}</div><div style={{fontSize:10,color:"#475569"}}>/week</div></div>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{fontSize:13,color:"#64748b",fontFamily:"'DM Sans',sans-serif"}}>Coverage: <span style={{color:"#f1f5f9",fontWeight:700}}>₹{plan.coverage}</span></div>
                        <button onClick={()=>handleActivatePolicy(plan)} style={{background:`linear-gradient(135deg,${plan.color}cc,${plan.color})`,border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>Activate →</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:14,paddingTop:20}}>
                <div style={{background:`linear-gradient(135deg,${policy.color}20,rgba(255,255,255,0.04))`,border:`1px solid ${policy.color}44`,borderRadius:18,padding:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div><div style={{fontSize:12,color:"#64748b",letterSpacing:1,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>ACTIVE POLICY</div><div style={{fontSize:18,fontWeight:800,color:"#f1f5f9",fontFamily:"'Syne',sans-serif"}}>{policy.name}</div><div style={{fontSize:12,color:"#64748b",marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>Zone: {user.zone}</div></div>
                    <GlowBadge color="#22c55e">Active</GlowBadge>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:16}}>
                    {[{l:"Weekly",v:`₹${premium}`},{l:"Coverage",v:`₹${policy.coverage}`},{l:"Claims",v:claims.length}].map(({l,v})=>(
                      <div key={l} style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"10px 12px"}}>
                        <div style={{fontSize:10,color:"#475569",marginBottom:3,fontFamily:"'DM Sans',sans-serif"}}>{l}</div>
                        <div style={{fontSize:15,fontWeight:800,color:"#f1f5f9",fontFamily:"'Syne',sans-serif"}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${riskColor}33`,borderRadius:14,padding:16}}>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>RISK LEVEL</div>
                    <div style={{fontSize:22,fontWeight:900,color:riskColor,fontFamily:"'Syne',sans-serif"}}>{riskLevel}</div>
                    <div style={{fontSize:11,color:"#475569",marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>{disruptions.length} disruptions</div>
                  </div>
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:14,padding:16}}>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>EARNINGS PROTECTED</div>
                    <div style={{fontSize:22,fontWeight:900,color:"#22c55e",fontFamily:"'Syne',sans-serif"}}>₹{totalPaid}</div>
                    <div style={{fontSize:11,color:"#475569",marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>This session</div>
                  </div>
                </div>
                <div style={{background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.25)",borderRadius:14,padding:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:11,color:"#7c3aed",letterSpacing:1,fontWeight:700,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>🤖 AI-CALCULATED PREMIUM</div><div style={{fontSize:12,color:"#64748b",fontFamily:"'DM Sans',sans-serif"}}>Zone × weather × season</div></div>
                  <div style={{fontSize:26,fontWeight:900,color:"#a78bfa",fontFamily:"'Syne',sans-serif"}}>₹{premium}<span style={{fontSize:12,fontWeight:400,color:"#475569"}}>/wk</span></div>
                </div>
                <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:16}}>
                  <div style={{fontSize:11,color:"#475569",letterSpacing:1,marginBottom:12,fontFamily:"'Syne',sans-serif"}}>⚙ DEMO SCENARIO CONTROL</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[{id:"normal",label:"Normal",color:"#22c55e"},{id:"disruption",label:"Disruption",color:"#f59e0b"},{id:"fraud",label:"Fraud",color:"#ef4444"}].map(s=>(
                      <button key={s.id} onClick={()=>handleScenario(s.id)} style={{background:scenario===s.id?`${s.color}22`:"transparent",border:`1px solid ${scenario===s.id?s.color:"rgba(255,255,255,0.1)"}`,borderRadius:9,padding:"10px 6px",color:scenario===s.id?s.color:"#475569",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.2s",fontFamily:"'Syne',sans-serif"}}>{s.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==="monitor"&&(
          <div style={{paddingTop:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:800,color:"#f1f5f9",fontFamily:"'Syne',sans-serif"}}>Live Data Feed</h2>
              <div style={{display:"flex",alignItems:"center",gap:6}}><PulsingDot color="#22c55e"/><span style={{fontSize:11,color:"#22c55e",fontWeight:700,fontFamily:"'Syne',sans-serif"}}>STREAMING</span></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <MetricCard icon="🌧" label="RAINFALL" value={liveData.rainfall} unit="mm" danger={liveData.rainfall>THRESHOLDS.rain} warn={liveData.rainfall>10}/>
              <MetricCard icon="🌡" label="TEMPERATURE" value={liveData.temperature} unit="°C" danger={liveData.temperature>THRESHOLDS.heat} warn={liveData.temperature>38}/>
              <MetricCard icon="🌫" label="AQI" value={liveData.aqi} unit="" danger={liveData.aqi>THRESHOLDS.aqi} warn={liveData.aqi>150}/>
              <MetricCard icon="🚧" label="TRAFFIC" value={liveData.traffic} unit="" danger={liveData.traffic==="BLOCKED"} warn={false}/>
              <MetricCard icon="📉" label="ORDER VOLUME" value={liveData.orderVolume} unit="%" danger={liveData.orderVolume<THRESHOLDS.order_drop} warn={liveData.orderVolume<50}/>
              <MetricCard icon="📍" label="LOC CONFIDENCE" value={liveData.locationConfidence} unit="%" danger={liveData.locationConfidence<40} warn={liveData.locationConfidence<60}/>
              <MetricCard icon="📱" label="DEVICE STATUS" value={liveData.deviceStatus} unit="" danger={liveData.deviceStatus==="SPOOFED"} warn={false}/>
              <MetricCard icon="🚚" label="USER ACTIVITY" value={liveData.userActivity} unit="" danger={liveData.userActivity==="INACTIVE"} warn={false}/>
            </div>
            <div style={{marginTop:14,background:"rgba(255,255,255,0.04)",border:`1px solid ${fraudStatus==="FRAUD"?"#ef4444":fraudStatus==="SUSPICIOUS"?"#f59e0b":"#22c55e"}44`,borderRadius:14,padding:16,boxShadow:fraudStatus==="FRAUD"?"0 0 20px #ef444330":"none",transition:"all 0.4s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:12,color:"#64748b",fontWeight:700,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>🔍 FRAUD RISK SCORE</span>
                <GlowBadge color={fraudStatus==="FRAUD"?"#ef4444":fraudStatus==="SUSPICIOUS"?"#f59e0b":"#22c55e"}>{fraudStatus}</GlowBadge>
              </div>
              <div style={{background:"rgba(0,0,0,0.3)",borderRadius:99,height:10,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${fraudScore}%`,transition:"width 0.6s ease",background:fraudScore>60?"linear-gradient(90deg,#ef4444,#dc2626)":fraudScore>30?"linear-gradient(90deg,#f59e0b,#d97706)":"linear-gradient(90deg,#22c55e,#16a34a)",borderRadius:99}}/>
              </div>
              <div style={{marginTop:6,fontSize:20,fontWeight:900,color:fraudScore>60?"#ef4444":fraudScore>30?"#f59e0b":"#22c55e",fontFamily:"'Syne',sans-serif"}}>{fraudScore}<span style={{fontSize:12,color:"#475569",fontWeight:400}}>/100</span></div>
            </div>
            {disruptions.length>0&&<div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}><div style={{fontSize:12,color:"#64748b",letterSpacing:1,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>ACTIVE DISRUPTIONS</div>{disruptions.map(d=><div key={d.type} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:14}}>{d.icon} <span style={{color:"#fca5a5",fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{d.label}</span></span><span style={{fontSize:13,color:"#f87171",fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{d.value}</span></div>)}</div>}
          </div>
        )}

        {activeTab==="logs"&&(
          <div style={{paddingTop:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:800,color:"#f1f5f9",fontFamily:"'Syne',sans-serif"}}>AI Decision Engine</h2>
              <button onClick={()=>setLogs([])} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 12px",color:"#475569",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Clear</button>
            </div>
            <div ref={logsRef} style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 16px",height:"62vh",overflowY:"auto",fontFamily:"monospace"}}>
              {logs.length===0?<div style={{color:"#334155",fontSize:13,textAlign:"center",marginTop:40}}>Awaiting data stream...</div>:logs.map(l=><LogLine key={l.id} {...l}/>)}
            </div>
          </div>
        )}

        {activeTab==="claims"&&(
          <div style={{paddingTop:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:800,color:"#f1f5f9",fontFamily:"'Syne',sans-serif"}}>Claims History</h2>
              <GlowBadge color="#22c55e">₹{totalPaid} paid</GlowBadge>
            </div>
            {fraudStatus==="FRAUD"&&<div style={{background:"rgba(239,68,68,0.1)",border:"2px solid #ef4444",borderRadius:14,padding:16,marginBottom:14}}>
              <div style={{fontSize:16,fontWeight:900,color:"#ef4444",marginBottom:4,fontFamily:"'Syne',sans-serif"}}>🚨 FRAUD DETECTED</div>
              <div style={{fontSize:13,color:"#fca5a5",fontFamily:"'DM Sans',sans-serif"}}>All pending payouts blocked. Logged for investigation.</div>
              <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}><GlowBadge color="#ef4444">Location Spoofing</GlowBadge><GlowBadge color="#ef4444">Inactive User</GlowBadge><GlowBadge color="#ef4444">Device Anomaly</GlowBadge></div>
            </div>}
            {claims.length===0?(
              <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:32,textAlign:"center",color:"#334155"}}>
                <div style={{fontSize:32,marginBottom:8}}>📋</div>
                <div style={{fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>No claims yet</div>
                <div style={{fontSize:12,marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>Claims trigger automatically on disruption</div>
              </div>
            ):claims.map(c=>(
              <div key={c.id} style={{background:c.status==="PAID"?"rgba(34,197,94,0.07)":"rgba(239,68,68,0.07)",border:`1px solid ${c.status==="PAID"?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,borderRadius:14,padding:16,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontSize:12,color:"#475569",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>{new Date(c.time).toLocaleTimeString("en-IN")}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{c.triggers.map(t=><GlowBadge key={t} color="#94a3b8">{t}</GlowBadge>)}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:c.status==="PAID"?"#22c55e":"#ef4444",fontFamily:"'Syne',sans-serif"}}>₹{c.payout}</div><GlowBadge color={c.status==="PAID"?"#22c55e":"#ef4444"}>{c.status}</GlowBadge></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(3,8,15,0.95)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.07)",padding:"10px 16px 18px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
        {[{id:"dashboard",icon:"🏠",label:"Home"},{id:"monitor",icon:"📡",label:"Monitor"},{id:"logs",icon:"🤖",label:"AI Logs"},{id:"claims",icon:"💰",label:"Claims"}].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={tabSt(t.id)}><div style={{fontSize:18}}>{t.icon}</div><div>{t.label}</div></button>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap');
        *{box-sizing:border-box;}
        body{background:#03080f;color:#f1f5f9;font-family:'DM Sans',sans-serif;margin:0;}
        input,select,button{font-family:'DM Sans',sans-serif;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%{transform:scale(1);opacity:.6;}70%{transform:scale(2);opacity:0;}100%{transform:scale(1);opacity:0;}}
        @keyframes riseUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
        select option{background:#0f172a;}
      `}</style>
    </div>
  );
}