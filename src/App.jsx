import { useEffect, useState } from "react";

const LANG = (typeof navigator !== "undefined" && (navigator.language || "")).toLowerCase().startsWith("sv") ? "sv" : "en";
const PSI_PRIMARY = LANG === "en";

// TODO vid CarbPlanner-release: byt till riktig URL med kampanjparametrar för
// attribution i App Store Connect, t.ex.
// https://apps.apple.com/se/app/carbplanner/idXXXXXXXXX?pt=<provider-id>&ct=bikepressure
const CARBPLANNER_URL = "https://apps.apple.com/app/carbplanner";
// Sätt till true när CarbPlanner är live i App Store. Tills dess göms både
// bränsle-/kalkylatorkortet och CarbPlanner-reklamkortet (se render nedan).
const CARBPLANNER_LIVE = false;

const STRINGS = {
  sv: {
    title: "BIKEPRESSURE", brand: "Bikepressure",
    tagline: "Rätt tryck · Bättre rull · Färre punkteringar",
    bikes: "Mina cyklar", name: "Namn", remove: "Ta bort",
    removeConfirm: "Ta bort den här cykeln?",
    bikeWord: "Cykel", defaultBike: "Min cykel",
    weight: "Vikt", bodyWeight: "Kroppsvikt", bikeGear: "Cykel + gear", totalWeight: "Totalvikt",
    bikeType: "Cykeltyp", road: "Landsväg", gravel: "Gravel", mtb: "MTB", city: "Stad/Hybrid",
    tireWidth: "Däckbredd", tubeless: "Tubeless", tubelessSub: "Kör du utan slang?",
    surface: "Underlag", asphalt: "Asfalt", mixed: "Blandat", offroad: "Grus/Trail",
    tune: "Finjustering", comfort: "Komfort", speed: "Fart",
    recommended: "Rekommenderat lufttryck", front: "Fram", rear: "Bak", tipLabel: "Tips:",
    whyTitle: "Varför detta tryck?",
    whyBody: [
      "Målet är cirka 15 % nedsjunkning av däcket under belastning. Publicerade mätningar visar att det ger den bästa balansen mellan rullmotstånd, komfort och grepp.",
      "Bredare däck behöver lägre tryck för samma nedsjunkning – därför sjunker rekommendationen snabbt när däckbredden ökar.",
      "Bakhjulet bär mer av din vikt än framhjulet och får därför något högre tryck.",
      "Tubeless kan köras med lägre tryck eftersom det inte finns någon slang som kan klämmas mot fälgen (snake bite).",
      "På ojämnt underlag ger lägre tryck bättre grepp och komfort – och ofta även lägre rullmotstånd, eftersom däcket följer ytan i stället för att studsa.",
    ],
    fuelTitle: "Bränsle för turen", rideLength: "Turlängd",
    fuelShort: "Under en timme behövs normalt inget extra bränsle – vatten räcker.",
    fuelCarbs: "g kolhydrater", fuelPerH: "g/tim",
    fuelCta: "Planera bränslet i CarbPlanner",
    carbDesc: "Räkna kolhydrater enkelt — min andra app, finns på App Store",
    footer: "Beräkningar baserade på vikt, däckbredd & underlag",
    disclaimer: "Rekommendationerna är vägledande. Följ alltid min- och max-tryck angivna av däck- och fälgtillverkaren.",
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
    title: "BIKEPRESSURE", brand: "Bikepressure",
    tagline: "Right pressure · Better rolling · Fewer flats",
    bikes: "My bikes", name: "Name", remove: "Remove",
    removeConfirm: "Remove this bike?",
    bikeWord: "Bike", defaultBike: "My bike",
    weight: "Weight", bodyWeight: "Body weight", bikeGear: "Bike + gear", totalWeight: "Total weight",
    bikeType: "Bike type", road: "Road", gravel: "Gravel", mtb: "MTB", city: "City/Hybrid",
    tireWidth: "Tire width", tubeless: "Tubeless", tubelessSub: "Running without tubes?",
    surface: "Surface", asphalt: "Asphalt", mixed: "Mixed", offroad: "Gravel/Trail",
    tune: "Fine-tune", comfort: "Comfort", speed: "Speed",
    recommended: "Recommended pressure", front: "Front", rear: "Rear", tipLabel: "Tip:",
    whyTitle: "Why this pressure?",
    whyBody: [
      "The target is roughly 15% tire drop under load. Published measurements show this gives the best balance of rolling resistance, comfort and grip.",
      "Wider tires need lower pressure for the same tire drop – which is why the recommendation falls quickly as tire width grows.",
      "The rear wheel carries more of your weight than the front, so it gets slightly higher pressure.",
      "Tubeless can be run at lower pressure since there is no inner tube to pinch against the rim (snake bite).",
      "On rough surfaces, lower pressure gives better grip and comfort – and often lower rolling resistance too, since the tire follows the surface instead of bouncing.",
    ],
    fuelTitle: "Fuel for the ride", rideLength: "Ride length",
    fuelShort: "Under an hour you normally don't need extra fuel – water is enough.",
    fuelCarbs: "g carbs", fuelPerH: "g/h",
    fuelCta: "Plan your fueling in CarbPlanner",
    carbDesc: "Easy carb counting — my other app, on the App Store",
    footer: "Calculations based on weight, tire width & surface",
    disclaimer: "Recommendations are guidance only. Always follow the min and max pressures stated by your tire and rim manufacturer.",
    decimal: ".",
    tips: {
      capped: "Near the upper limit – never exceed the max pressure printed on the tire sidewall.",
      hookless: "Above 72.5 psi (5.0 bar): don't run hookless rims this high, and check your tire's max pressure.",
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

function calcP(bw, biw, bt, tw, sf, tl, bias) {
  const tot  = bw + biw;
  const base = BASE_K / Math.pow(tw, 1.5) * (tot / REF_WEIGHT) * SM[sf]
             * (tl ? 1 : TUBE_FACTOR) * (1 + bias / 100);
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

// Kolhydratintag per timme enligt gällande idrottsnutritionsriktlinjer:
// 1–2 h: 30–60 g/h, 2–3 h: 60–90 g/h, längre: upp mot 90–110 g/h (tränad mage).
function fuelPlan(hours) {
  if (hours <= 1) return null;
  const [lo, hi] = hours <= 2 ? [30, 60] : hours <= 3 ? [60, 90] : [80, 110];
  const round5 = g => Math.round(g / 5) * 5;
  return { lo, hi, totLo: round5(lo * hours), totHi: round5(hi * hours) };
}

const STORE_KEY = "cykeltryck-v1";

function defaultProfile(name) {
  return { name, biw: 10.0, bt: "road", tw: 28, sf: "asphalt", tl: false, bias: 0 };
}

function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && Array.isArray(s.profiles) && s.profiles.length) {
      return {
        bw: typeof s.bw === "number" ? s.bw : 75,
        active: Math.min(Math.max(0, s.active | 0), s.profiles.length - 1),
        opens: s.opens | 0,
        rideH: typeof s.rideH === "number" ? s.rideH : 2,
        profiles: s.profiles.map(p => ({ ...defaultProfile(T.defaultBike), ...p })),
      };
    }
  } catch { /* korrupt lagring → börja om */ }
  return null;
}

async function requestReview() {
  try {
    const { InAppReview } = await import("@capacitor-community/in-app-review");
    await InAppReview.requestReview();
  } catch { /* webbläge eller plugin saknas — hoppa över */ }
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

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--accent-bg)" : "var(--card-b)",
      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      borderRadius:8, padding:"6px 12px",
      color: active ? "var(--accent)" : "var(--text-m)",
      fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:"pointer",
    }}>
      {children}
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

export default function Bikepressure() {
  const [store, setStore] = useState(() => {
    const s = loadStore() ?? { bw: 75, active: 0, opens: 0, rideH: 2, profiles: [defaultProfile(T.defaultBike)] };
    return { ...s, opens: s.opens + 1 };
  });
  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* lagring full/avstängd */ }
  }, [store]);

  useEffect(() => {
    if (store.opens === 3) requestReview();
  }, [store.opens]);

  const p = store.profiles[store.active];
  const setP  = patch => setStore(s => ({ ...s, profiles: s.profiles.map((pr, i) => i === s.active ? { ...pr, ...patch } : pr) }));
  const setBw = v => setStore(s => ({ ...s, bw: v }));

  const addProfile = () => setStore(s => ({
    ...s,
    profiles: [...s.profiles, { ...s.profiles[s.active], name: `${T.bikeWord} ${s.profiles.length + 1}` }],
    active: s.profiles.length,
  }));

  const removeProfile = () => {
    if (!window.confirm(T.removeConfirm)) return;
    setStore(s => {
      const profiles = s.profiles.filter((_, i) => i !== s.active);
      return { ...s, profiles, active: Math.max(0, s.active - 1) };
    });
  };

  const { bw } = store;
  const { biw, bt, tw, sf, tl, bias } = p;
  const { fBar, rBar, fPsi, rPsi, capped } = calcP(bw, biw, bt, tw, sf, tl, bias);
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
  const fuel = fuelPlan(store.rideH);

  const fBig = PSI_PRIMARY ? fPsi : fBar;
  const rBig = PSI_PRIMARY ? rPsi : rBar;
  const fSub = PSI_PRIMARY ? <>psi / <strong style={{ color:"var(--h-text)" }}>{fBar}</strong> bar</> : <>bar / <strong style={{ color:"var(--h-text)" }}>{fPsi}</strong> psi</>;
  const rSub = PSI_PRIMARY ? <>psi / <strong style={{ color:"var(--h-text)" }}>{rBar}</strong> bar</> : <>bar / <strong style={{ color:"var(--h-text)" }}>{rPsi}</strong> psi</>;

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
          <CardTitle>{T.bikes}</CardTitle>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {store.profiles.map((pr, i) => (
              <Chip key={i} active={i === store.active} onClick={() => setStore(s => ({ ...s, active: i }))}>
                {pr.name}
              </Chip>
            ))}
            <Chip active={false} onClick={addProfile}>＋</Chip>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12, paddingTop:12, borderTop:"1px solid var(--border)" }}>
            <span style={{ fontSize:12, color:"var(--text-m)" }}>{T.name}</span>
            <input value={p.name} onChange={e => setP({ name: e.target.value })} style={{
              flex:1, minWidth:0, background:"var(--card-b)", border:"1px solid var(--border)",
              borderRadius:8, padding:"7px 10px", color:"var(--text)",
              fontFamily:"inherit", fontSize:14, fontWeight:500, outline:"none",
            }} />
            {store.profiles.length > 1 && (
              <button onClick={removeProfile} style={{
                background:"none", border:"none", color:"#C0392B", cursor:"pointer",
                fontFamily:"inherit", fontSize:13, fontWeight:600, padding:"7px 4px",
              }}>
                {T.remove}
              </button>
            )}
          </div>
        </Card>

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
              <Slider min={5} max={30} value={biw} step={0.1} onChange={v => setP({ biw: parseFloat(v) })} />
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
            <SegBtn active={bt==="road"}   onClick={() => setP({ bt: "road" })}   emoji="🚴"  label={T.road} />
            <SegBtn active={bt==="gravel"} onClick={() => setP({ bt: "gravel" })} emoji="🛤️" label={T.gravel} />
            <SegBtn active={bt==="mtb"}    onClick={() => setP({ bt: "mtb" })}    emoji="🚵"  label={T.mtb} />
            <SegBtn active={bt==="city"}   onClick={() => setP({ bt: "city" })}   emoji="🏙️" label={T.city} />
          </div>
        </Card>

        <Card>
          <CardTitle>{T.tireWidth}</CardTitle>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
            {PRESETS.map(v => (
              <button key={v} onClick={() => setP({ tw: v })} style={{
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
              <Slider min={18} max={75} value={tw} step={1} onChange={v => setP({ tw: parseInt(v) })} />
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
            <Toggle on={tl} onToggle={() => setP({ tl: !tl })} label={T.tubeless} />
          </div>
        </Card>

        <Card>
          <CardTitle>{T.surface}</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            <SegBtn active={sf==="asphalt"} onClick={() => setP({ sf: "asphalt" })} emoji="🛣️"  label={T.asphalt} />
            <SegBtn active={sf==="mixed"}   onClick={() => setP({ sf: "mixed" })}   emoji="🌿"  label={T.mixed} />
            <SegBtn active={sf==="offroad"} onClick={() => setP({ sf: "offroad" })} emoji="🏔️" label={T.offroad} />
          </div>
        </Card>

        <Card>
          <CardTitle>{T.tune}</CardTitle>
          <Slider min={-5} max={5} value={bias} step={1} onChange={v => setP({ bias: parseInt(v) })} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, color:"var(--text-m)", marginTop:4 }}>
            <span>← {T.comfort}</span>
            <strong style={{ color: bias === 0 ? "var(--text-m)" : "var(--accent)", fontSize:13 }}>
              {bias > 0 ? "+" : ""}{bias} %
            </strong>
            <span>{T.speed} →</span>
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
              <div style={{ fontSize:54, fontWeight:800, color:"var(--h-text)", lineHeight:1 }}>{fBig}</div>
              <div style={{ fontSize:12, color:"var(--h-text-soft)", marginTop:4 }}>{fSub}</div>
            </div>
            <div style={{ width:1, background:"var(--h-border)", margin:"0 20px" }} />
            <div style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:1, color:"var(--h-text-soft)", marginBottom:4 }}>{T.rear}</div>
              <div style={{ fontSize:54, fontWeight:800, color:"var(--h-text)", lineHeight:1 }}>{rBig}</div>
              <div style={{ fontSize:12, color:"var(--h-text-soft)", marginTop:4 }}>{rSub}</div>
            </div>
          </div>
          <div style={{ fontSize:13, color:"var(--h-text-soft)", padding:"10px 14px", background:"var(--h-card)", borderRadius:8, textAlign:"left", lineHeight:1.6 }}>
            <strong style={{ color:"var(--h-text)" }}>{T.tipLabel}</strong> {tip}
          </div>
        </div>

        {CARBPLANNER_LIVE && (
        <Card style={{ marginTop:12 }}>
          <CardTitle>{T.fuelTitle}</CardTitle>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ minWidth:64 }}>
              <div style={{ fontSize:30, fontWeight:800, color:"var(--accent)", lineHeight:1 }}>
                {store.rideH.toFixed(1).replace(".", T.decimal)}
              </div>
              <div style={{ fontSize:11, color:"var(--text-m)" }}>{LANG === "sv" ? "timmar" : "hours"}</div>
            </div>
            <div style={{ flex:1 }}>
              <Slider min={0.5} max={8} value={store.rideH} step={0.5} onChange={v => setStore(s => ({ ...s, rideH: parseFloat(v) }))} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-m)", marginTop:3 }}>
                <span>0{T.decimal}5</span><span>8 h</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid var(--border)", fontSize:13, color:"var(--text-m)", lineHeight:1.5 }}>
            {fuel ? (
              <>
                <strong style={{ color:"var(--text)", fontSize:16 }}>{fuel.totLo}–{fuel.totHi} {T.fuelCarbs}</strong>
                {" "}({fuel.lo}–{fuel.hi} {T.fuelPerH})
              </>
            ) : T.fuelShort}
          </div>
          {fuel && (
            <a href={CARBPLANNER_URL} target="_blank" rel="noopener noreferrer" style={{
              display:"block", textAlign:"center", marginTop:12, padding:"11px 14px",
              background:"var(--accent-bg)", border:"1px solid var(--accent)",
              borderRadius:10, color:"var(--accent)", textDecoration:"none",
              fontSize:14, fontWeight:600,
            }}>
              {T.fuelCta} →
            </a>
          )}
        </Card>
        )}

        <Card>
          <button onClick={() => setWhyOpen(v => !v)} aria-expanded={whyOpen} style={{
            display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%",
            background:"none", border:"none", padding:0, cursor:"pointer",
            fontFamily:"inherit", fontSize:15, fontWeight:600, color:"var(--text)",
          }}>
            {T.whyTitle}
            <span style={{ color:"var(--text-m)", fontSize:13 }}>{whyOpen ? "▲" : "▼"}</span>
          </button>
          {whyOpen && (
            <div style={{ marginTop:10 }}>
              {T.whyBody.map((par, i) => (
                <p key={i} style={{ fontSize:13, color:"var(--text-m)", lineHeight:1.6, margin:"8px 0 0" }}>{par}</p>
              ))}
            </div>
          )}
        </Card>

        {CARBPLANNER_LIVE && (
        <a href={CARBPLANNER_URL} target="_blank" rel="noopener noreferrer"
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
        )}

        <div style={{ fontSize:11, color:"var(--text-m)", textAlign:"center", marginTop:16, marginBottom:24 }}>
          <div>{T.brand} · {T.footer}</div>
          <div style={{ marginTop:6, opacity:0.8 }}>{T.disclaimer}</div>
        </div>

      </div>
    </div>
  );
}
