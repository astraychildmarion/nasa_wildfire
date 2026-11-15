import React, { useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 *  GlobalHomePage – illustrative global wildfire overview
 *  Zero dependencies besides React. Pure SVG hexbin world map.
 *  Usage:
 *    <GlobalHomePage onSelectRegion={(lat, lng, name) => navigate(...)} />
 * ------------------------------------------------------------------ */

export interface GlobalHomePageProps {
  onSelectRegion?: (lat: number, lng: number, name: string) => void;
  theme?: "light" | "dark";
}

/* ----------------------------- Themes ----------------------------- */
const THEMES = {
  light: {
    bg: "#F4F6FA", panel: "#FFFFFF", text: "#1E2340", sub: "#6B7390",
    land: "#FFFFFF", bar: "#D9DEE8", border: "#E6EAF2", shadow: "rgba(70,80,140,.16)", track: "#E9EDF5",
  },
  dark: {
    bg: "#0B1220", panel: "#131C31", text: "#E8ECF8", sub: "#8D97B5",
    land: "#1E293B", bar: "#2B3957", border: "#222E48", shadow: "rgba(0,0,0,.5)", track: "#22304D",
  },
};

/* -------------------------- Mock 2026 data ------------------------- */
const STATS = {
  burnedHa: 48520400,
  frpMW: 18940210,
  incidents: 312450,
  vsAvg: 18,
  anomalous: 34,
};

interface Top5 {
  rank: number; name: string; lat: number; lng: number; count: number;
  color: string; dx?: number;
}
const TOP5: Top5[] = [
  { rank: 1, name: "Amazon Basin, Brazil", lat: -8, lng: -58, count: 239570, color: "#F97316" },
  { rank: 2, name: "Congo Basin, Central Africa", lat: -4, lng: 23, count: 198420, color: "#E11D48" },
  { rank: 3, name: "California & Pacific NW, USA", lat: 40, lng: -121, count: 87310, color: "#8B5CF6" },
  { rank: 4, name: "Siberian Boreal Forest", lat: 60, lng: 108, count: 74950, color: "#0EA5E9" },
  { rank: 5, name: "Queensland & NSW, Australia", lat: -26, lng: 148, count: 61880, color: "#F59E0B" },
];

/* Relative global fire frequency, 2002 → 2026 YTD (mock, 0–100) */
const YEARLY = [62,66,64,70,68,72,63,69,74,71,67,73,78,70,76,81,74,79,84,77,86,82,88,85,96];
const FIRST_YEAR = 2002;

/* Heat sources used to synthesize per-hex intensity (lon, lat, σlon, σlat, amplitude) */
const HOT = [
  { name: "Amazon Basin", lng: -58, lat: -9, sx: 9, sy: 6, a: 1.0 },
  { name: "Cerrado, Brazil", lng: -48, lat: -14, sx: 5, sy: 5, a: 0.55 },
  { name: "Gran Chaco", lng: -61, lat: -22, sx: 4, sy: 4, a: 0.35 },
  { name: "Congo Basin", lng: 22, lat: -5, sx: 11, sy: 6, a: 0.95 },
  { name: "Sahel & Savanna Belt", lng: 10, lat: 9, sx: 22, sy: 3, a: 0.5 },
  { name: "Southern Africa", lng: 28, lat: -14, sx: 7, sy: 4, a: 0.6 },
  { name: "California & Pacific NW", lng: -121, lat: 40, sx: 3.5, sy: 6.5, a: 0.9 },
  { name: "Canadian Boreal", lng: -112, lat: 57, sx: 12, sy: 4, a: 0.45 },
  { name: "Siberian Boreal Forest", lng: 108, lat: 60, sx: 18, sy: 5, a: 0.8 },
  { name: "Kazakh Steppe", lng: 68, lat: 50, sx: 8, sy: 3, a: 0.3 },
  { name: "Indochina", lng: 102, lat: 18, sx: 5, sy: 5, a: 0.55 },
  { name: "Indian Subcontinent", lng: 79, lat: 22, sx: 5, sy: 5, a: 0.3 },
  { name: "Queensland & NSW", lng: 148, lat: -25, sx: 4.5, sy: 5, a: 0.9 },
  { name: "N. Australia Savanna", lng: 130, lat: -14, sx: 8, sy: 2.5, a: 0.5 },
  { name: "Mediterranean Basin", lng: 8, lat: 40, sx: 14, sy: 3, a: 0.25 },
];

/* Search gazetteer */
const PLACES = [
  { keys: ["amazon", "亚马逊", "manaus", "马瑙斯"], name: "Amazon Basin, Brazil", lat: -8, lng: -58 },
  { keys: ["congo", "central africa", "刚果", "中非"], name: "Congo Basin, Central Africa", lat: -4, lng: 23 },
  { keys: ["california", "加州", "加利福尼亚", "pacific nw", "oregon"], name: "California & Pacific NW, USA", lat: 40, lng: -121 },
  { keys: ["los angeles", "洛杉矶"], name: "Los Angeles, USA", lat: 34.05, lng: -118.24 },
  { keys: ["siberia", "西伯利亚"], name: "Siberian Boreal Forest", lat: 60, lng: 108 },
  { keys: ["queensland", "nsw", "昆士兰", "澳大利亚", "australia"], name: "Queensland & NSW, Australia", lat: -26, lng: 148 },
  { keys: ["cerrado", "塞拉多"], name: "Cerrado, Brazil", lat: -14, lng: -48 },
  { keys: ["canada", "boreal", "加拿大"], name: "Canadian Boreal", lat: 57, lng: -112 },
  { keys: ["mediterranean", "地中海", "greece", "希腊", "portugal", "葡萄牙"], name: "Mediterranean Basin", lat: 39, lng: 8 },
  { keys: ["indochina", "中南半岛", "thailand", "泰国"], name: "Indochina", lat: 18, lng: 102 },
  { keys: ["sahel", "萨赫勒"], name: "Sahel & Savanna Belt", lat: 11, lng: 10 },
  { keys: ["kazakh", "哈萨克"], name: "Kazakh Steppe", lat: 50, lng: 68 },
];

/* ------------------------ Hex world-map data ----------------------- */
type Poly = [number, number][];
const LAND: { name: string; pts: Poly }[] = [
  { name: "North America", pts: [[-168,66],[-162,70],[-141,70],[-125,70],[-95,72],[-82,69],[-80,63],[-94,59],[-90,52],[-80,52],[-78,58],[-70,60],[-62,58],[-56,52],[-66,45],[-70,42],[-76,35],[-81,31],[-80,25],[-83,29],[-90,29],[-97,27],[-97,21],[-95,18],[-91,19],[-87,21],[-88,16],[-83,10],[-79,8.5],[-84,8],[-92,14],[-105,20],[-110,24],[-115,30],[-117,32],[-124,40],[-124,48],[-135,58],[-150,60],[-165,60]] },
  { name: "North America", pts: [[-120,70],[-95,76],[-80,74],[-90,68]] },
  { name: "North America", pts: [[-80,64],[-62,67],[-70,72],[-78,70]] },
  { name: "Greenland", pts: [[-55,60],[-45,60],[-20,70],[-20,82],[-60,82],[-70,76]] },
  { name: "South America", pts: [[-78,8],[-72,12],[-62,10],[-52,5],[-50,0],[-35,-6],[-39,-15],[-41,-22],[-48,-26],[-58,-35],[-65,-42],[-68,-52],[-70,-55],[-75,-50],[-73,-38],[-71,-20],[-76,-14],[-81,-5],[-80,0]] },
  { name: "Eurasia", pts: [[-10,37],[-9,43],[-1,46],[-4,48],[2,51],[9,54],[10,58],[5,60],[5,62],[14,68],[25,71],[40,68],[60,69],[70,73],[80,73],[100,77],[115,74],[140,72],[160,70],[180,68],[180,65],[170,60],[163,58],[156,51],[142,59],[135,54],[140,48],[130,42],[127,38],[126,35],[122,40],[119,37],[122,31],[120,26],[110,21],[106,20],[108,15],[109,11],[105,9],[100,13],[100,8],[104,1],[98,8],[98,16],[92,20],[88,22],[80,15],[78,8],[73,16],[72,21],[67,24],[57,25],[56,27],[50,30],[48,29],[52,24],[56,26],[59,22],[52,16],[43,13],[39,21],[35,28],[34,31],[36,36],[28,36.5],[26,40],[24,38],[22,37],[19,41],[14,45],[12,44],[16,38],[12,38],[8,44],[3,43],[-1,37],[-5,36]] },
  { name: "Africa", pts: [[-17,21],[-10,30],[-6,36],[10,37],[11,33],[20,31],[32,31],[35,28],[43,12],[51,12],[41,-3],[40,-15],[35,-24],[32,-29],[20,-35],[18,-32],[12,-17],[13,-5],[9,4],[-8,4],[-13,8],[-17,15]] },
  { name: "Africa", pts: [[44,-25],[49,-15],[50,-13],[47,-25]] },
  { name: "Australia", pts: [[114,-22],[122,-18],[130,-12],[137,-12],[141,-11],[146,-19],[153,-26],[150,-37],[141,-38],[135,-35],[130,-32],[115,-34]] },
  { name: "Europe", pts: [[-5,50],[2,51],[0,55],[-3,58],[-6,56]] },
  { name: "Europe", pts: [[-24,64],[-14,65],[-18,63]] },
  { name: "East Asia", pts: [[130,32],[135,34],[141,38],[142,45],[140,41],[132,35]] },
  { name: "Southeast Asia", pts: [[109,1],[117,7],[119,1],[116,-4],[110,-3]] },
  { name: "Southeast Asia", pts: [[95,5],[104,-2],[106,-6],[100,-2]] },
  { name: "Oceania", pts: [[131,-1],[141,-3],[150,-10],[141,-9]] },
  { name: "Oceania", pts: [[172,-34],[178,-38],[174,-41],[167,-46],[171,-44]] },
];

const VB_W = 1000, VB_H = 420, SC = 1000 / 350, LON0 = -170, LAT0 = 80;
const px = (lng: number) => (lng - LON0) * SC;
const py = (lat: number) => (LAT0 - lat) * SC;

function inPoly(x: number, y: number, p: Poly) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const noise = (i: number, j: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

interface Hex { pts: string; lat: number; lng: number; t: number; count: number; region: string; }

function buildHexes(): Hex[] {
  const r = 6.4, w = Math.sqrt(3) * r, out: Hex[] = [];
  const corner = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 180) * (60 * k - 30);
    return [Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92];
  });
  for (let j = 0; r + j * 1.5 * r < VB_H; j++) {
    const y = r + j * 1.5 * r;
    for (let i = 0; i * w < VB_W; i++) {
      const x = w / 2 + i * w + (j % 2) * (w / 2);
      const lng = x / SC + LON0, lat = LAT0 - y / SC;
      const land = LAND.find((l) => inPoly(lng, lat, l.pts));
      if (!land) continue;
      let sum = 0, best = 0, bestName = land.name;
      for (const h of HOT) {
        const g = h.a * Math.exp(-(((lng - h.lng) / h.sx) ** 2 + ((lat - h.lat) / h.sy) ** 2));
        sum += g;
        if (g > best) { best = g; bestName = h.name; }
      }
      const n = noise(i, j);
      let t = sum * (0.45 + 0.9 * n) + (n > 0.93 ? 0.12 : 0);
      t = Math.min(1, t);
      out.push({
        pts: corner.map(([dx, dy]) => `${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`).join(" "),
        lat, lng, t,
        count: t < 0.08 ? 0 : Math.round(t * t * 14000 + n * 60),
        region: best > 0.15 ? bestName : land.name,
      });
    }
  }
  return out;
}
const HEXES = buildHexes();

/* Colour ramp: amber → deep red */
const STOPS: [number, number[]][] = [
  [0.08, [253, 230, 190]], [0.3, [245, 158, 11]], [0.6, [249, 105, 55]], [1, [225, 29, 72]],
];
function ramp(t: number, land: string) {
  if (t < 0.08) return land;
  for (let k = 1; k < STOPS.length; k++) {
    if (t <= STOPS[k][0]) {
      const [t0, c0] = STOPS[k - 1], [t1, c1] = STOPS[k], f = (t - t0) / (t1 - t0);
      return `rgb(${c0.map((v, m) => Math.round(v + (c1[m] - v) * f)).join(",")})`;
    }
  }
  return "rgb(225,29,72)";
}

const fmt = (n: number) => n.toLocaleString("en-US");

/* ------------------------------ UI bits ---------------------------- */
const Flame = ({ c = "#fff" }: { c?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M12 2c1 4-2 5.5-2 8.5 0 1.2.6 2 1.4 2.5C10 12 9 10.5 9 9c-3 2-5 5-5 8a8 8 0 0016 0c0-4-3-6-4-9-1 1.5-2 2-3 1 .8-2 .5-4.5-1-7z" /></svg>
);
const Icon = ({ d, bg }: { d: string; bg: string }) => (
  <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: "grid", placeItems: "center", flex: "none" }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  </div>
);

function Donut({ pct, color, label, sub, text, track }: { pct: number; color: string; label: string; sub: React.ReactNode; text: string; track: string }) {
  const r = 26, C = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width="68" height="68" viewBox="0 0 68 68" role="img" aria-label={`${label} ${pct}%`}>
        <circle cx="34" cy="34" r={r} fill="none" stroke={track} strokeWidth="5" />
        <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${(Math.min(100, Math.abs(pct)) / 100) * C} ${C}`} transform="rotate(-90 34 34)" />
        <text x="34" y="39" textAnchor="middle" fontSize="15" fontWeight="600" fill={text}>{label}</text>
      </svg>
      <div style={{ fontSize: 12, lineHeight: 1.4, maxWidth: 120 }}>{sub}</div>
    </div>
  );
}

/* ------------------------------ Component -------------------------- */
export default function GlobalHomePage({ onSelectRegion, theme = "light" }: GlobalHomePageProps) {
  const T = THEMES[theme];
  const go = (lat: number, lng: number, name: string) => onSelectRegion?.(lat, lng, name);

  const [hover, setHover] = useState<{ h: Hex; x: number; y: number } | null>(null);
  const [focus, setFocus] = useState(false);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);

  const colors = useMemo(() => HEXES.map((h) => ramp(h.t, T.land)), [T.land]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const s = q.trim();
    if (!s) return;
    const m = s.match(/^(-?\d+(?:\.\d+)?)\s*[,，\s]\s*(-?\d+(?:\.\d+)?)$/);
    if (m) {
      const lat = +m[1], lng = +m[2];
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) { setErr(""); setFocus(false); return go(lat, lng, `${lat.toFixed(2)}, ${lng.toFixed(2)}`); }
      return setErr("Latitude must be -90 to 90 and longitude -180 to 180");
    }
    const low = s.toLowerCase();
    const p = PLACES.find((x) => x.keys.some((k) => low.includes(k) || k.includes(low)));
    if (p) { setErr(""); setFocus(false); return go(p.lat, p.lng, p.name); }
    setErr("Region not found. Try coordinates such as 34.25, -118.05");
  };

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const t = e.target as SVGElement;
    const i = t.tagName === "polygon" ? Number(t.getAttribute("data-i")) : -1;
    const box = mapRef.current?.getBoundingClientRect();
    if (i < 0 || !box) return setHover(null);
    setHover({ h: HEXES[i], x: e.clientX - box.left, y: e.clientY - box.top });
  };
  const onClickHex = (e: React.MouseEvent<SVGSVGElement>) => {
    const t = e.target as SVGElement;
    if (t.tagName !== "polygon") return;
    const h = HEXES[Number(t.getAttribute("data-i"))];
    go(h.lat, h.lng, h.region);
  };

  const onPageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("form, [data-region-select]")) return;
    go(0, 0, "Global overview");
  };

  const stat = (icon: string, bg: string, label: string, value: string, note: string) => (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <Icon d={icon} bg={bg} />
      <div>
        <div style={{ fontSize: 13, color: T.sub }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</div>
        <div style={{ fontSize: 11, color: T.sub }}>{note}</div>
      </div>
    </div>
  );

  return (
    <div onClick={onPageClick} style={{ height: "100vh", width: "100%", overflow: "hidden", display: "grid", gridTemplateColumns: "27% 73%", background: T.bg, color: T.text, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @keyframes gwPulse{0%,100%{opacity:1}50%{opacity:.55}}
        .gw-hot{animation:gwPulse 2.4s ease-in-out infinite}
        .gw-card{transition:transform .18s ease,box-shadow .18s ease;cursor:pointer}
        .gw-card:hover,.gw-card:focus-visible{transform:scale(1.07);outline:none;box-shadow:0 12px 30px var(--gw-sh)}
        .gw-card:focus-visible{box-shadow:0 0 0 2px #8B5CF6}
        .gw-sg:hover{background:rgba(139,92,246,.1)}
        @media (prefers-reduced-motion:reduce){.gw-hot{animation:none}.gw-card{transition:none}}
      `}</style>

      {/* ------------------------- Left panel ------------------------- */}
      <aside style={{ padding: "5vh 2.2vw 4vh", display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: "7vh", minWidth: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "clamp(22px,1.9vw,32px)", fontWeight: 400 }}>Global Wildfire Overview</h1>
          <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}><b>Illustrative demo data</b> · 2026 YTD · MODIS &amp; VIIRS Harmonized</div>

        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2.6vh" }}>
          {stat("M3 17l6-6 4 4 8-8M15 7h6v6", "linear-gradient(135deg,#8B5CF6,#6D5DF6)", "Est. Burned Area", `${fmt(STATS.burnedHa)} ha`, "Footprint of detected burning")}
          {stat("M13 2L4 14h7l-1 8 9-12h-7z", "linear-gradient(135deg,#38BDF8,#0EA5E9)", "Total Radiative Power", `${fmt(STATS.frpMW)} MW`, "Global energy released by fires")}
          {stat("M12 3l9 16H3zM12 10v4M12 17h.01", "linear-gradient(135deg,#FB7185,#F97316)", "High-Confidence Incidents", fmt(STATS.incidents), "Excludes agricultural & industrial heat")}
        </div>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Donut pct={STATS.vsAvg} color="#E11D48" label={`+${STATS.vsAvg}%`} track={T.track} text={T.text}
            sub={<><b>vs. 20-Yr Historical Avg</b><br /><span style={{ color: T.sub }}>Above 2001–2025 Median</span></>} />
          <Donut pct={STATS.anomalous} color="#F59E0B" label={`${STATS.anomalous}%`} track={T.track} text={T.text}
            sub={<><b>Anomalous Regions</b><br /><span style={{ color: T.sub }}>Regions Exceeding +2σ Threshold</span></>} />
        </div>
      </aside>

      {/* --------------------------- Map area -------------------------- */}
      <main style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0, padding: "0 1.5vw 0 0" }}>
        {/* Search */}
        <div style={{ position: "absolute", top: "3.5vh", right: "2.5vw", width: "min(440px,60%)", zIndex: 30 }}>
          <form onSubmit={submit} style={{ display: "flex", alignItems: "center", background: T.panel, borderRadius: 999, boxShadow: `0 6px 22px ${T.shadow}`, padding: "0 16px", height: 44 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.sub} strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            <input value={q} onChange={(e) => { setQ(e.target.value); setErr(""); }}
              onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
              placeholder="Enter coordinates (e.g. 34.25, -118.05) or a region name to view local history..."
              aria-label="Search region or coordinates"
              style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: T.text, fontSize: 13, padding: "0 10px" }} />
          </form>
          {err && <div style={{ marginTop: 6, fontSize: 12, color: "#E11D48", paddingLeft: 16 }}>{err}</div>}
          {focus && (
            <div style={{ marginTop: 8, background: T.panel, borderRadius: 16, boxShadow: `0 10px 30px ${T.shadow}`, padding: 8 }}>
              <div style={{ fontSize: 11, color: T.sub, padding: "4px 10px" }}>Top 5 hot regions</div>
              {TOP5.map((r) => (
                <div key={r.rank} className="gw-sg" role="button" tabIndex={0} data-region-select
                  onMouseDown={() => go(r.lat, r.lng, r.name)}
                  onKeyDown={(e) => e.key === "Enter" && go(r.lat, r.lng, r.name)}
                  style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>
                  <span>#{r.rank} {r.name}</span>
                  <span style={{ color: T.sub, fontVariantNumeric: "tabular-nums" }}>{fmt(r.count)}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: T.sub, padding: "8px 10px 4px" }}>Also try</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 6px 6px" }}>
                {PLACES.filter((p) => ["Cerrado, Brazil", "Canadian Boreal", "Mediterranean Basin", "Indochina", "Sahel & Savanna Belt", "Los Angeles, USA"].includes(p.name)).map((p) => (
                  <span key={p.name} className="gw-sg" data-region-select onMouseDown={() => go(p.lat, p.lng, p.name)}
                    style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, border: `1px solid ${T.border}`, cursor: "pointer" }}>{p.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map + overlays share one aspect-locked box so % anchors stay on the hexes */}
        <div style={{ width: "100%", maxWidth: "calc((100vh - 230px) * 2.38)", marginTop: "4vh" }}>
        <div ref={mapRef} style={{ position: "relative", width: "100%", aspectRatio: `${VB_W} / ${VB_H}` }}>
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" onMouseMove={onMove} onMouseLeave={() => setHover(null)} onClick={onClickHex}
            role="img" aria-label="World map of 2026 wildfire hotspot frequency" style={{ display: "block", filter: `drop-shadow(0 14px 18px ${T.shadow})` }}>
            {HEXES.map((h, i) => (
              <polygon key={i} data-i={i} data-region-select points={h.pts} fill={colors[i]} stroke={T.border} strokeWidth={0.4} className={h.t > 0.8 ? "gw-hot" : undefined}
                style={{ cursor: "pointer" }} />
            ))}
          </svg>

          {TOP5.map((r) => (
            <div key={r.rank} style={{ position: "absolute", left: `${(px(r.lng) / VB_W) * 100}%`, top: `${(py(r.lat) / VB_H) * 100}%`, transform: "translate(-50%,calc(-100% - 8px))", zIndex: 10 }}>
              <div className="gw-card" role="button" tabIndex={0} data-region-select aria-label={`${r.name}, rank ${r.rank}, ${fmt(r.count)} fires`}
                onClick={() => go(r.lat, r.lng, r.name)} onKeyDown={(e) => e.key === "Enter" && go(r.lat, r.lng, r.name)}
                style={{ ["--gw-sh" as string]: T.shadow, position: "relative", display: "flex", gap: 9, alignItems: "center", background: T.panel, borderRadius: 14, padding: "8px 12px 8px 8px", boxShadow: `0 6px 18px ${T.shadow}`, whiteSpace: "nowrap" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: r.color, display: "grid", placeItems: "center" }}><Flame /></div>
                <div>
                  <div style={{ fontSize: 11, color: T.sub, maxWidth: "11vw", overflow: "hidden", textOverflow: "ellipsis" }}>
                    <b style={{ color: r.color }}>#{r.rank}</b> {r.name.split(",")[0]}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(r.count)}</div>
                </div>
                <div style={{ position: "absolute", left: "50%", bottom: -5, width: 10, height: 10, background: T.panel, transform: "translateX(-50%) rotate(45deg)" }} />
              </div>
            </div>
          ))}

          {hover && (
            <div style={{ position: "absolute", left: hover.x + 14, top: hover.y + 14, zIndex: 40, pointerEvents: "none", background: T.panel, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 10px", fontSize: 12, boxShadow: `0 8px 22px ${T.shadow}` }}>
              <div style={{ fontWeight: 600 }}>{hover.h.region}</div>
              <div style={{ color: T.sub, fontVariantNumeric: "tabular-nums" }}>{hover.h.lat.toFixed(1)}°, {hover.h.lng.toFixed(1)}°</div>
              <div style={{ fontVariantNumeric: "tabular-nums" }}>2026 hotspots: <b>{fmt(hover.h.count)}</b></div>
            </div>
          )}

          {/* Legend */}
          <div style={{ position: "absolute", left: 0, bottom: "2%", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.sub }}>
            <span>Low</span>
            <div style={{ width: 120, height: 8, borderRadius: 4, background: `linear-gradient(90deg,${T.land},#FDE6BE,#F59E0B,#F9693A,#E11D48)` }} />
            <span>High</span>
          </div>
        </div>

        {/* 25-year frequency trend */}
        <div style={{ marginTop: "2.5vh", background: "#FFFFFF", borderRadius: 18, boxShadow: `0 6px 22px ${T.shadow}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ flex: "none", color: "#6B7390" }}>
            <div style={{ fontSize: 12 }}>Fire Frequency</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1E2340" }}>Past 25 Years</div>
          </div>
          <div role="img" aria-label="Bar chart of global fire frequency from 2002 to 2026" style={{ flex: 1, height: "clamp(44px,8vh,84px)", display: "flex", alignItems: "flex-end", gap: 4 }}>
            {YEARLY.map((v, i) => (
              <div key={i} title={`${FIRST_YEAR + i}`} style={{ flex: 1, height: `${v}%`, borderRadius: 3, background: i === YEARLY.length - 1 ? "#F59E0B" : T.bar }} />
            ))}
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
