import { useState } from "react";

const LANG = (typeof navigator !== "undefined" && (navigator.language || "")).toLowerCase().startsWith("sv") ? "sv" : "en";

const STRINGS = {
  sv: {
    title: "CYKELTRYCK", brand: "CykelTryck",
    tagline: "Rätt tryck · Bättre rull · Färre punkteringar",
    weight: "Vikt", bodyWeight: "Kroppsvikt", bikeGear: "Cykel + gear", totalWeight: "Totalvikt",
    bikeType: "Cykeltyp", road: "Landsväg", gravel: "Gravel", mtb: "MTB", city: "Stad/Hybrid",
    tireWidth: "Däckbredd", tubeless: "Tubeless", tubelessSub: "Kör du utan slang?",
    surface: "Underlag", asphalt: "Asfalt", mixed: "Blandat", offroad: "Grus/Trail",
    recommended: "Rekommenderat lufttryck", front: "Fram", rear: "Bak", tipLabel: "Tips:",
    carbDesc: "Räkna kolhydrater enkelt — min andra app, finns på App Store",
    footer: "Beräkningar baserade på vikt, däckbredd & underlag",
    decimal: ",",
    tips: {
      capped: "Nära övre gränsen – överskrid aldrig max-trycket som står på däckets sida.",
      hookless: "Över 5,0 bar (72,5 psi): kör inte så högt på hookless-fälgar, och kontrollera däckets max-tryck.",
      tubeless: "Tubeless låter dig köra lägre tryck med mindre risk för punktering.",
      offroad: "Lägre tryck ger bättre grepp och komfort i terräng.",
      wide: "Bredare däck → mer komfort utan att rulla långsammare.",
      default: "Kontrollera alltid trycket innan varje tur!",
    },
  },
  en: {
    title: "BIKEPRESSURE", brand: "BikePressure",
    tagline: "Right pressure · Better rolling · Fewer flats",
    weight: "Weight", bodyWeight: "Body weight", bikeGear: "Bike + gear", totalWeight: "Total weight",
    bikeType: "Bike type", road: "Road", gravel: "Gravel", mtb: "MTB", city: "City/Hybrid",
    tireWidth: "Tire width", tubeless: "Tubeless", tubelessSub: "Running without tubes?",
    surface: "Surface", asphalt: "Asphalt", mixed: "Mixed", offroad: "Gravel/Trail",
    recommended: "Recommended pressure", front: "Front", rear: "Rear", tipLabel: "Tip:",
    carbDesc: "Easy carb counting — my other app, on the App Store",
    footer: "Calculations based on weight, tire width & surface",
    decimal: ".",
    tips: {
      capped: "Near the upper limit – never exceed the max pressure printed on the tire sidewall.",
      hookless: "Above 5.0 bar (72.5 psi): don't run hookless rims this high, and check your tire's max pressure.",
      tubeless: "Tubeless lets you run lower pressure with less risk of flats.",
      offroad: "Lower pressure gives better grip and comfort off-road.",
      wide: "Wider tires → more comfort without rolling slower.",
      default: "Always check your pressure before every ride!",
    },
  },
};

const T = STRINGS[LANG];

if (typeof document !== "undefined") {
  document.documentElement.lang = LANG;
  document.title = T.brand;
}

// Tryckmodell: P ∝ systemvikt / däckbredd^1.5 — följer Frank Bertos
// 15 % tire drop-data (validerad 20–37 mm) och är kalibrerad mot
// SRAM AXS/Silca-rekommendationer vid 85 kg systemvikt (tubeless, asfalt).
// Fram/bak-skillnaden hålls liten (≈ ±4 %) i linje med SRAM:s riktlinje
// om 3–7 psi mellanskillnad, i stället för att skala rakt av lastfördelningen.
const REF_WEIGHT = 85;   // kg systemvikt där basvärdet gäller
const BASE_K     = 10400; // ger ~70 psi för 28 mm vid 85 kg
const SPLITS = { road:{f:0.96,r:1.04}, gravel:{f:0.96,r:1.04}, mtb:{f:0.96,r:1.04}, city:{f:0.93,r:1.07} };
const SM     = { asphalt:1.0, mixed:0.92, offroad:0.84 };
const TUBE_FACTOR = 1.08; // SRAM: +4–6 psi med slang för att undvika snake bites
const FL     = { road:35, gravel:18, mtb:12, city:28 };
const CE     = { road:110, gravel:70, mtb:40, city:85 };
const HOOKLESS_LIMIT_PSI = 72.5;

function calcP(bw, biw, bt, tw, sf, tl) {
  const tot  = bw + biw;
  const base = BASE_K / Math.pow(tw, 1.5) * (tot / REF_WEIGHT) * SM[sf] * (tl ? 1 : TUBE_FACTOR);
  let fP = base * SPLITS[bt].f;
  let rP = base * SPLITS[bt].r;
  const capped = rP > CE[bt] || fP > CE[bt];
  fP = Math.round(Math.max(FL[bt], Math.min(CE[bt], fP)));
  rP = Math.round(Math.max(FL[bt], Math.min(CE[bt], rP)));
  return {
    fBar: (fP * 0.06895).toFixed(1),
    rBar: (rP * 0.06895).toFixed(1),
    fPsi: fP,
    rPsi: rP,
    capped,
  };
}

function Card({ children, style }) {
  return (
    <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:18, marginBottom:12, ...style }}>
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
      <span style={{ fontSize:11, textTransform:"uppercase", letterSpacing:2, color:"var(--text-m)", whiteSpace:"nowrap" }}>{children}</span>
      <div style={{ flex:1, height:1, background:"var(--border)" }} />
    </div>
  );
}

function SegBtn({ active, onClick, emoji, label }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--accent-bg)" : "var(--card-b)",
      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      borderRadius: 10, padding: "10px 6px",
      color: active ? "var(--accent)" : "var(--text-m)",
      fontFamily: "inherit", fontSize: 14, fontWeight: 500,
      cursor: "pointer", textAlign: "center", lineHeight: 1.3,
    }}>
      <div style={{ fontSize:20, marginBottom:3 }}>{emoji}</div>
      {label}
    </button>
  );
}

function Toggle({ on, onToggle, label }) {
  return (
    <button onClick={onToggle} role="switch" aria-checked={on} aria-label={label} style={{
      width:46, height:26, padding:0,
      background: on ? "var(--accent-bg)" : "var(--card-b)",
      border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
      borderRadius: 13, cursor: "pointer", position: "relative",
      flexShrink: 0, transition: "background 0.2s",
    }}>
      <div style={{
        position: "absolute", width:20, height:20, borderRadius:"50%",
        background: on ? "var(--accent)" : "var(--text-m)",
        top:2, left: on ? 22 : 2, transition: "left 0.2s",
      }} />
    </button>
  );
}

function Slider({ min, max, value, step, onChange }) {
  return (
    <input type="range" min={min} max={max} value={value} step={step}
      style={{ width:"100%", accentColor:"var(--accent)", cursor:"pointer" }}
      onChange={e => onChange(e.target.value)} />
  );
}

export default function CykelTryck() {
  const [bw,  setBw]  = useState(75);
  const [biw, setBiw] = useState(10.0);
  const [bt,  setBt]  = useState("road");
  const [tw,  setTw]  = useState(28);
  const [sf,  setSf]  = useState("asphalt");
  const [tl,  setTl]  = useState(false);

  const { fBar, rBar, fPsi, rPsi, capped } = calcP(bw, biw, bt, tw, sf, tl);
  const total = bw + biw;

  const tip = T.tips[
    capped ? "capped"
    : Math.max(fPsi, rPsi) > HOOKLESS_LIMIT_PSI ? "hookless"
    : tl ? "tubeless"
    : sf === "offroad" ? "offroad"
    : bt === "road" && tw >= 32 ? "wide"
    : "default"
  ];

  const PRESETS = [23,25,28,32,35,38,42,47,50,57,61,66];

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", color:"var(--text)", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontSize:16 }}>
      <div className="app-bottom" style={{ maxWidth:460, margin:"0 auto", padding:"0 16px 0" }}>

        <div className="app-header" style={{ background:"var(--h-grad)", margin:"0 -16px", padding:"32px 16px 24px", marginBottom:16 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:30, fontWeight:800, letterSpacing:5, color:"var(--h-text)" }}>{T.title}</div>
            <div style={{ fontSize:11, color:"var(--h-text-soft)", letterSpacing:1, marginTop:5, textTransform:"uppercase" }}>{T.tagline}</div>
          </div>
        </div>

        <Card>
          <CardTitle>{T.weight}</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <div style={{ fontSize:12, color:"var(--text-m)", marginBottom:5 }}>{T.bodyWeight}</div>
              <div style={{ fontSize:38, fontWeight:800, color:"var(--accent)", lineHeight:1, marginBottom:8 }}>
                {bw}<span style={{ fontSize:13, color:"var(--text-m)", fontWeight:400, marginLeft:3 }}>kg</span>
              </div>
              <Slider min={40} max={150} value={bw} step={1} onChange={v => setBw(parseInt(v))} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-m)", marginTop:3 }}>
                <span>40</span><span>150 kg</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:12, color:"var(--text-m)", marginBottom:5 }}>{T.bikeGear}</div>
              <div style={{ fontSize:38, fontWeight:800, color:"var(--accent)", lineHeight:1, marginBottom:8 }}>
                {biw.toFixed(1)}<span style={{ fontSize:13, color:"var(--text-m)", fontWeight:400, marginLeft:3 }}>kg</span>
              </div>
              <Slider min={5} max={30} value={biw} step={0.1} onChange={v => setBiw(parseFloat(v))} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-m)", marginTop:3 }}>
                <span>5</span><span>30 kg</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid var(--border)", fontSize:13, color:"var(--text-m)" }}>
            {T.totalWeight}: <strong style={{ color:"var(--text)", fontSize:16 }}>{total.toFixed(1)} kg</strong>
          </div>
        </Card>

        <Card>
          <CardTitle>{T.bikeType}</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <SegBtn active={bt==="road"}   onClick={() => setBt("road")}   emoji="🚴"  label={T.road} />
            <SegBtn active={bt==="gravel"} onClick={() => setBt("gravel")} emoji="🛤️" label={T.gravel} />
            <SegBtn active={bt==="mtb"}    onClick={() => setBt("mtb")}    emoji="🚵"  label={T.mtb} />
            <SegBtn active={bt==="city"}   onClick={() => setBt("city")}   emoji="🏙️" label={T.city} />
          </div>
        </Card>

        <Card>
          <CardTitle>{T.tireWidth}</CardTitle>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
            {PRESETS.map(v => (
              <button key={v} onClick={() => setTw(v)} style={{
                background: tw===v ? "var(--accent-bg)" : "var(--card-b)",
                border: `1px solid ${tw===v ? "var(--accent)" : "var(--border)"}`,
                borderRadius:8, padding:"5px 9px",
                color: tw===v ? "var(--accent)" : "var(--text-m)",
                fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:"pointer",
              }}>
                {v}mm
              </button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ minWidth:52 }}>
              <div style={{ fontSize:30, fontWeight:800, color:"var(--accent)", lineHeight:1 }}>{tw}</div>
              <div style={{ fontSize:11, color:"var(--text-m)" }}>mm{tw >= 45 ? ` · ${(tw / 25.4).toFixed(1).replace(".", T.decimal)}"` : ""}</div>
            </div>
            <div style={{ flex:1 }}>
              <Slider min={18} max={75} value={tw} step={1} onChange={v => setTw(parseInt(v))} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-m)", marginTop:3 }}>
                <span>18mm</span><span>75mm</span>
              </div>
            </div>
          </div>
          <div style={{ height:1, background:"var(--border)", margin:"14px 0" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:15, fontWeight:500 }}>{T.tubeless}</div>
              <div style={{ fontSize:12, color:"var(--text-m)", marginTop:2 }}>{T.tubelessSub}</div>
            </div>
            <Toggle on={tl} onToggle={() => setTl(v => !v)} label={T.tubeless} />
          </div>
        </Card>

        <Card>
          <CardTitle>{T.surface}</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            <SegBtn active={sf==="asphalt"} onClick={() => setSf("asphalt")} emoji="🛣️"  label={T.asphalt} />
            <SegBtn active={sf==="mixed"}   onClick={() => setSf("mixed")}   emoji="🌿"  label={T.mixed} />
            <SegBtn active={sf==="offroad"} onClick={() => setSf("offroad")} emoji="🏔️" label={T.offroad} />
          </div>
        </Card>

        <div style={{
          background:"var(--h-grad)", border:"1px solid var(--h-border)",
          borderRadius:20, padding:"24px 20px", textAlign:"center",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,var(--accent-line),transparent)" }} />
          <div style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"var(--h-text-soft)", marginBottom:4 }}>{T.recommended}</div>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"stretch", margin:"16px 0", gap:0 }}>
            <div style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:1, color:"var(--h-text-soft)", marginBottom:4 }}>{T.front}</div>
              <div style={{ fontSize:54, fontWeight:800, color:"var(--h-text)", lineHeight:1 }}>{fBar}</div>
              <div style={{ fontSize:12, color:"var(--h-text-soft)", marginTop:4 }}>bar / <strong style={{ color:"var(--h-text)" }}>{fPsi}</strong> psi</div>
            </div>
            <div style={{ width:1, background:"var(--h-border)", margin:"0 20px" }} />
            <div style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:1, color:"var(--h-text-soft)", marginBottom:4 }}>{T.rear}</div>
              <div style={{ fontSize:54, fontWeight:800, color:"var(--h-text)", lineHeight:1 }}>{rBar}</div>
              <div style={{ fontSize:12, color:"var(--h-text-soft)", marginTop:4 }}>bar / <strong style={{ color:"var(--h-text)" }}>{rPsi}</strong> psi</div>
            </div>
          </div>
          <div style={{ fontSize:13, color:"var(--h-text-soft)", padding:"10px 14px", background:"var(--h-card)", borderRadius:8, textAlign:"left", lineHeight:1.6 }}>
            <strong style={{ color:"var(--h-text)" }}>{T.tipLabel}</strong> {tip}
          </div>
        </div>

        {/* TODO: CarbPlanner är inte publicerad än — byt till riktig URL (apps.apple.com/se/app/carbplanner/idXXXXXXXXX) vid release */}
        <a href="https://apps.apple.com/app/carbplanner" target="_blank" rel="noopener noreferrer"
          style={{ display:"block", textDecoration:"none", marginTop:24, background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"14px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <img src="/carbplanner-icon.png" alt="CarbPlanner" style={{ width:40, height:40, borderRadius:9 }} />
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>CarbPlanner</div>
              <div style={{ fontSize:12, color:"var(--text-m)", marginTop:2 }}>{T.carbDesc}</div>
            </div>
            <div style={{ marginLeft:"auto", fontSize:18, color:"var(--text-m)" }}>›</div>
          </div>
        </a>

        <div style={{ fontSize:11, color:"var(--text-m)", textAlign:"center", marginTop:16, marginBottom:24 }}>
          {T.brand} · {T.footer}
        </div>

      </div>
    </div>
  );
}
