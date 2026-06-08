import { useState } from "react";

const SPLITS = { road:{f:0.42,r:0.58}, gravel:{f:0.44,r:0.56}, mtb:{f:0.46,r:0.54}, city:{f:0.42,r:0.58} };
const KK     = { road:{f:99,r:102}, gravel:{f:82,r:85}, mtb:{f:58,r:62}, city:{f:110,r:114} };
const SM     = { asphalt:1.0, mixed:0.88, offroad:0.74 };
const FL     = { road:40, gravel:18, mtb:10, city:28 };
const CE     = { road:120, gravel:75, mtb:50, city:90 };

function calcP(bw, biw, bt, tw, sf, tl) {
  const tot = bw + biw;
  const sp  = SPLITS[bt];
  const we  = Math.pow(tw, 0.75);
  let fP    = KK[bt].f * Math.sqrt(tot * sp.f * 2.205) / we;
  let rP    = KK[bt].r * Math.sqrt(tot * sp.r * 2.205) / we;
  fP *= SM[sf]; rP *= SM[sf];
  if (tl) { fP *= 0.9; rP *= 0.9; }
  fP = Math.max(FL[bt], Math.min(CE[bt], fP));
  rP = Math.max(FL[bt], Math.min(CE[bt], rP));
  return {
    fBar: (Math.round(fP * 0.06895 * 10) / 10).toFixed(1),
    rBar: (Math.round(rP * 0.06895 * 10) / 10).toFixed(1),
    fPsi: Math.round(fP),
    rPsi: Math.round(rP),
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

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      width:46, height:26,
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
    </div>
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

  const { fBar, rBar, fPsi, rPsi } = calcP(bw, biw, bt, tw, sf, tl);
  const total = bw + biw;

  const tip = tl ? "Tubeless låter dig köra lägre tryck utan punkteringsrisk."
    : sf === "offroad" ? "Lägre tryck ger bättre grepp och komfort i terräng."
    : bt === "road" && tw >= 32 ? "Bredare däck → mer komfort och lägre rullmotstånd."
    : total > 110 ? "Hög totalvikt – kontrollera max-trycket på däckets sida."
    : "Kontrollera alltid trycket innan varje tur!";

  const PRESETS = [23,25,28,32,35,38,42,50,57];

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", color:"var(--text)", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontSize:16 }}>
      <div style={{ maxWidth:460, margin:"0 auto", padding:"0 16px 60px" }}>

        <div style={{ background:"var(--h-grad)", margin:"0 -16px", padding:"32px 16px 24px", marginBottom:16 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:30, fontWeight:800, letterSpacing:5, color:"var(--h-text)" }}>CYKELTRYCK</div>
            <div style={{ fontSize:11, color:"var(--h-text-soft)", letterSpacing:1, marginTop:5, textTransform:"uppercase" }}>Rätt tryck · Bättre rull · Färre punkteringar</div>
          </div>
        </div>

        <Card>
          <CardTitle>Vikt</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <div style={{ fontSize:12, color:"var(--text-m)", marginBottom:5 }}>Kroppsvikt</div>
              <div style={{ fontSize:38, fontWeight:800, color:"var(--accent)", lineHeight:1, marginBottom:8 }}>
                {bw}<span style={{ fontSize:13, color:"var(--text-m)", fontWeight:400, marginLeft:3 }}>kg</span>
              </div>
              <Slider min={40} max={150} value={bw} step={1} onChange={v => setBw(parseInt(v))} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-m)", marginTop:3 }}>
                <span>40</span><span>150 kg</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:12, color:"var(--text-m)", marginBottom:5 }}>Cykel + gear</div>
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
            Totalvikt: <strong style={{ color:"var(--text)", fontSize:16 }}>{total.toFixed(1)} kg</strong>
          </div>
        </Card>

        <Card>
          <CardTitle>Cykeltyp</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <SegBtn active={bt==="road"}   onClick={() => setBt("road")}   emoji="🚴"  label="Landsväg" />
            <SegBtn active={bt==="gravel"} onClick={() => setBt("gravel")} emoji="🛤️" label="Gravel" />
            <SegBtn active={bt==="mtb"}    onClick={() => setBt("mtb")}    emoji="🚵"  label="MTB" />
            <SegBtn active={bt==="city"}   onClick={() => setBt("city")}   emoji="🏙️" label="Stad/Hybrid" />
          </div>
        </Card>

        <Card>
          <CardTitle>Däckbredd</CardTitle>
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
              <div style={{ fontSize:11, color:"var(--text-m)" }}>mm</div>
            </div>
            <div style={{ flex:1 }}>
              <Slider min={18} max={70} value={tw} step={1} onChange={v => setTw(parseInt(v))} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-m)", marginTop:3 }}>
                <span>18mm</span><span>70mm</span>
              </div>
            </div>
          </div>
          <div style={{ height:1, background:"var(--border)", margin:"14px 0" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:15, fontWeight:500 }}>Tubeless</div>
              <div style={{ fontSize:12, color:"var(--text-m)", marginTop:2 }}>Kör du utan slang?</div>
            </div>
            <Toggle on={tl} onToggle={() => setTl(v => !v)} />
          </div>
        </Card>

        <Card>
          <CardTitle>Underlag</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            <SegBtn active={sf==="asphalt"} onClick={() => setSf("asphalt")} emoji="🛣️"  label="Asfalt" />
            <SegBtn active={sf==="mixed"}   onClick={() => setSf("mixed")}   emoji="🌿"  label="Blandat" />
            <SegBtn active={sf==="offroad"} onClick={() => setSf("offroad")} emoji="🏔️" label="Grus/Trail" />
          </div>
        </Card>

        <div style={{
          background:"var(--h-grad)", border:"1px solid var(--h-border)",
          borderRadius:20, padding:"24px 20px", textAlign:"center",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,var(--accent-line),transparent)" }} />
          <div style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"var(--h-text-soft)", marginBottom:4 }}>Rekommenderat lufttryck</div>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"stretch", margin:"16px 0", gap:0 }}>
            <div style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:1, color:"var(--h-text-soft)", marginBottom:4 }}>Fram</div>
              <div style={{ fontSize:54, fontWeight:800, color:"var(--h-text)", lineHeight:1 }}>{fBar}</div>
              <div style={{ fontSize:12, color:"var(--h-text-soft)", marginTop:4 }}>bar / <strong style={{ color:"var(--h-text)" }}>{fPsi}</strong> psi</div>
            </div>
            <div style={{ width:1, background:"var(--h-border)", margin:"0 20px" }} />
            <div style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:1, color:"var(--h-text-soft)", marginBottom:4 }}>Bak</div>
              <div style={{ fontSize:54, fontWeight:800, color:"var(--h-text)", lineHeight:1 }}>{rBar}</div>
              <div style={{ fontSize:12, color:"var(--h-text-soft)", marginTop:4 }}>bar / <strong style={{ color:"var(--h-text)" }}>{rPsi}</strong> psi</div>
            </div>
          </div>
          <div style={{ fontSize:13, color:"var(--h-text-soft)", padding:"10px 14px", background:"var(--h-card)", borderRadius:8, textAlign:"left", lineHeight:1.6 }}>
            <strong style={{ color:"var(--h-text)" }}>Tips:</strong> {tip}
          </div>
        </div>

        <a href="https://apps.apple.com/app/carbplanner" target="_blank" rel="noopener noreferrer"
          style={{ display:"block", textDecoration:"none", marginTop:24, background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"14px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <img src="/carbplanner-icon.png" alt="CarbPlanner" style={{ width:40, height:40, borderRadius:9 }} />
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>CarbPlanner</div>
              <div style={{ fontSize:12, color:"var(--text-m)", marginTop:2 }}>Räkna kolhydrater enkelt — min andra app, finns på App Store</div>
            </div>
            <div style={{ marginLeft:"auto", fontSize:18, color:"var(--text-m)" }}>›</div>
          </div>
        </a>

        <div style={{ fontSize:11, color:"var(--border)", textAlign:"center", marginTop:16 }}>
          CykelTryck · Beräkningar baserade på vikt, däckbredd &amp; underlag
        </div>

      </div>
    </div>
  );
}
