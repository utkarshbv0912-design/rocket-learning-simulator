import { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Calendar, Satellite, Rocket, History } from "lucide-react";
import LaunchHistory from "../components/spaceMap/LaunchHistory";
import { Card, CardContent } from "@/components/ui/card";
import PageShell from "../components/PageShell";

// ── Astronomy ─────────────────────────────────────────────────────────
const J2000 = new Date("2000-01-01T12:00:00Z");
function daysSinceJ2000(date) { return (date.getTime() - J2000.getTime()) / 86400000; }

const PLANETS = [
  { name: "Mercury", symbol: "☿", a: 0.387, color: "#94A3B8", size: 4,  L0: 252.25, rate: 4.09234,  period: 87.97,   speed: 47.4 },
  { name: "Venus",   symbol: "♀", a: 0.723, color: "#F59E0B", size: 6,  L0: 181.98, rate: 1.60214,  period: 224.70,  speed: 35.0 },
  { name: "Earth",   symbol: "🌍", a: 1.000, color: "#3B82F6", size: 7,  L0: 100.46, rate: 0.98565,  period: 365.25,  speed: 29.8 },
  { name: "Mars",    symbol: "♂", a: 1.524, color: "#EF4444", size: 5,  L0: 355.43, rate: 0.52402,  period: 686.97,  speed: 24.1 },
  { name: "Jupiter", symbol: "♃", a: 5.203, color: "#F97316", size: 13, L0:  34.40, rate: 0.08309,  period: 4332.59, speed: 13.1 },
  { name: "Saturn",  symbol: "♄", a: 9.537, color: "#EAB308", size: 11, L0:  50.08, rate: 0.03346,  period: 10759.22,speed: 9.7  },
  { name: "Uranus",  symbol: "♅", a: 19.191,color: "#06B6D4", size: 8,  L0: 314.02, rate: 0.01176,  period: 30688.5, speed: 6.8  },
  { name: "Neptune", symbol: "♆", a: 30.069,color: "#6366F1", size: 8,  L0: 304.35, rate: 0.00600,  period: 60182.0, speed: 5.4  },
];

const SVG_SIZE = 500;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;

function orbitRadius(a) { return Math.sqrt(a) * 42; }
function planetAngle(planet, days) { return ((planet.L0 + planet.rate * days) % 360 + 360) % 360; }
function planetXY(planet, days, cx, cy) {
  const angle = planetAngle(planet, days) * (Math.PI / 180);
  const r = orbitRadius(planet.a);
  return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle), r };
}

// ── Rocket classification ─────────────────────────────────────────────
function classifyRocket(result) {
  if (!result) return null;
  const { maxHeight, maxVelocity, twr } = result;
  if (maxHeight < 10000) return { label: "Sub-Atmospheric", color: "#EF4444", emoji: "💥", desc: "Failed to reach significant altitude" };
  if (maxHeight < 100000) return { label: "High Altitude", color: "#F97316", emoji: "🚀", desc: "Reached upper atmosphere" };
  if (maxHeight < 200000) return { label: "Suborbital", color: "#F59E0B", emoji: "🛸", desc: "Crossed the Kármán line (100 km)" };
  if (maxVelocity >= 7800) return { label: "Orbital", color: "#22C55E", emoji: "🛰️", desc: "Achieved orbital velocity!" };
  if (maxVelocity >= 11200) return { label: "Escape Trajectory", color: "#A855F7", emoji: "🌌", desc: "Escaped Earth's gravity!" };
  return { label: "Deep Suborbital", color: "#3B82F6", emoji: "🚀", desc: `Reached ${(maxHeight / 1000).toFixed(0)} km altitude` };
}

// ── Earth Orbit SVG constants ─────────────────────────────────────────
const EO_SIZE = 380;
const ECX = EO_SIZE / 2;
const ECY = EO_SIZE / 2;
const EARTH_R = 36;
const ISS_ORBIT_R = 62;
const ISS_PERIOD_S = 5520; // ~92 minutes

export default function SpaceMap() {
  const today = new Date();
  const [date, setDate] = useState(today.toISOString().split("T")[0]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [tab, setTab] = useState("solar");
  const [historyKey, setHistoryKey] = useState(0);
  const [issAngle, setIssAngle] = useState(0);
  const [rocketResult, setRocketResult] = useState(null);
  const svgRef = useRef(null);

  // Load last rocket launch result
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rocketlab_last_launch");
      if (saved) setRocketResult(JSON.parse(saved));
    } catch {}
  }, []);

  // Animate ISS in real time
  useEffect(() => {
    if (tab !== "earth") return;
    const now = Date.now();
    const degsPerMs = 360 / (ISS_PERIOD_S * 1000);
    const startAngle = (now * degsPerMs) % 360;
    setIssAngle(startAngle);
    const interval = setInterval(() => {
      setIssAngle((a) => (a + 360 / (ISS_PERIOD_S * 1000) * 100) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, [tab]);

  const currentDate = new Date(date + "T12:00:00Z");
  const days = daysSinceJ2000(currentDate);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((z) => Math.min(5, Math.max(0.3, z * (e.deltaY > 0 ? 0.9 : 1.1))));
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const onMouseDown = (e) => { setDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const onMouseMove = (e) => { if (!dragging || !dragStart) return; setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMouseUp = () => { setDragging(false); setDragStart(null); };

  const rocketClass = classifyRocket(rocketResult);

  // ISS XY
  const issRad = issAngle * (Math.PI / 180);
  const issX = ECX + ISS_ORBIT_R * Math.cos(issRad);
  const issY = ECY - ISS_ORBIT_R * Math.sin(issRad);

  // Rocket orbit radius (if orbital or higher)
  const isOrbital = rocketResult && rocketResult.maxVelocity >= 7800;
  const isSuborbital = rocketResult && rocketResult.maxHeight >= 100000 && !isOrbital;
  const [rocketAngle, setRocketAngle] = useState(45);
  useEffect(() => {
    if (!isOrbital) return;
    const interval = setInterval(() => setRocketAngle((a) => (a + 0.3) % 360), 50);
    return () => clearInterval(interval);
  }, [isOrbital]);
  const rocketOrbitR = isOrbital ? Math.min(100, EARTH_R + 20 + (rocketResult.maxHeight / 100000) * 10) : 0;
  const rocketRad = rocketAngle * (Math.PI / 180);
  const rocketX = ECX + rocketOrbitR * Math.cos(rocketRad);
  const rocketY = ECY - rocketOrbitR * Math.sin(rocketRad);

  return (
    <PageShell title="Space Map">
      <div className="space-y-4">

        {/* Tabs */}
        <div className="flex rounded-xl border border-border bg-secondary/30 p-1 gap-1">
          {[
            { id: "solar", label: "☀️ Solar System" },
            { id: "earth", label: "🌍 Earth Orbit" },
            { id: "history", label: "📋 History" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-heading font-semibold transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "solar" && (
          <>
            {/* Date picker */}
            <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-600/10 to-transparent">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-heading font-semibold text-indigo-300">View Date</span>
                </div>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-heading focus:outline-none focus:ring-1 focus:ring-primary" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {currentDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </CardContent>
            </Card>

            {/* Solar system SVG */}
            <Card className="border-border bg-card/80 overflow-hidden">
              <CardContent className="p-0 relative">
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                  <button onClick={() => setZoom((z) => Math.min(5, z * 1.3))} className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => setZoom((z) => Math.max(0.3, z / 1.3))} className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary flex items-center justify-center">
                    <ZoomOut className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary flex items-center justify-center">
                    <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>

                <svg ref={svgRef} width="100%" viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="block"
                  style={{ cursor: dragging ? "grabbing" : "grab", background: "hsl(230 25% 5%)", userSelect: "none" }}
                  onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                >
                  <g transform={`translate(${pan.x},${pan.y}) scale(${zoom}) translate(${CX * (1 - 1 / zoom)},${CY * (1 - 1 / zoom)})`}>
                    {/* Stars */}
                    {[...Array(80)].map((_, i) => {
                      const s = i * 137.508;
                      return <circle key={i} cx={(s * 31) % SVG_SIZE} cy={(s * 17) % SVG_SIZE} r={0.5 + (i % 3) * 0.4} fill="white" opacity={0.15 + (i % 4) * 0.1} />;
                    })}
                    {/* Orbit paths */}
                    {PLANETS.map((p) => (
                      <circle key={`o-${p.name}`} cx={CX} cy={CY} r={orbitRadius(p.a)} fill="none" stroke={p.color} strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4" />
                    ))}
                    {/* Sun */}
                    <circle cx={CX} cy={CY} r={28} fill="#FCD34D" opacity="0.05" />
                    <circle cx={CX} cy={CY} r={20} fill="#FCD34D" opacity="0.12" />
                    <circle cx={CX} cy={CY} r={14} fill="#FCD34D" opacity="0.95" />
                    <text x={CX} y={CY + 26} textAnchor="middle" fill="#FCD34D" fontSize="9" opacity="0.7">☀ Sun</text>
                    {/* Planets */}
                    {PLANETS.map((p) => {
                      const { x, y } = planetXY(p, days, CX, CY);
                      const isH = hovered === p.name;
                      return (
                        <g key={p.name} onMouseEnter={() => setHovered(p.name)} onMouseLeave={() => setHovered(null)} style={{ cursor: "default" }}>
                          <circle cx={x} cy={y} r={p.size + 5} fill={p.color} opacity={isH ? 0.25 : 0.08} />
                          <circle cx={x} cy={y} r={p.size} fill={p.color} opacity={isH ? 1 : 0.9} />
                          {p.name === "Saturn" && <ellipse cx={x} cy={y} rx={p.size + 7} ry={3} fill="none" stroke="#EAB308" strokeWidth="2" strokeOpacity="0.5" />}
                          <text x={x} y={y - p.size - 4} textAnchor="middle" fill={p.color} fontSize={isH ? 9 : 7} opacity={isH ? 1 : 0.7}>{p.name}</text>
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Hovered planet info */}
                {hovered && (() => {
                  const p = PLANETS.find((pl) => pl.name === hovered);
                  return (
                    <div className="absolute bottom-3 left-3 bg-card/95 border border-border rounded-xl px-3 py-2 pointer-events-none backdrop-blur-sm">
                      <p className="text-sm font-heading font-bold" style={{ color: p.color }}>{p.symbol} {p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.a} AU from Sun</p>
                      <p className="text-xs text-cyan-400 font-semibold">🚀 {p.speed} km/s orbital speed</p>
                      <p className="text-xs text-muted-foreground">Period: {p.period.toLocaleString()} days</p>
                      <p className="text-xs text-muted-foreground">Longitude: {planetAngle(p, days).toFixed(1)}°</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Planet speed table */}
            <Card className="border-border/50 bg-card/60">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-3">Orbital Speeds</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PLANETS.map((p) => (
                    <div key={p.name} className="flex items-center justify-between bg-secondary/30 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                        <span className="text-xs text-foreground">{p.name}</span>
                      </div>
                      <span className="text-xs font-heading font-semibold text-cyan-400">{p.speed} km/s</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/50 mt-3 text-center">Mean ecliptic longitude (J2000). Drag to pan, scroll to zoom.</p>
              </CardContent>
            </Card>
          </>
        )}

        {tab === "history" && (
          <LaunchHistory onRefresh={() => setHistoryKey((k) => k + 1)} key={historyKey} />
        )}

        {tab === "earth" && (
          <>
            {/* Satellite info */}
            <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-600/10 to-transparent">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Satellite className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-heading font-semibold text-cyan-300">Active Satellites in Orbit</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Total Satellites", value: "~9,000+", color: "text-cyan-400" },
                    { label: "LEO Objects", value: "~6,700", color: "text-blue-400" },
                    { label: "Starlink Sats", value: "~5,500", color: "text-purple-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-secondary/40 rounded-lg p-2 text-center">
                      <p className={`text-sm font-heading font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Earth orbit SVG */}
            <Card className="border-border bg-card/80 overflow-hidden">
              <CardContent className="p-0 relative">
                <svg width="100%" viewBox={`0 0 ${EO_SIZE} ${EO_SIZE}`} className="block" style={{ background: "hsl(230 25% 5%)" }}>
                  {/* Stars */}
                  {[...Array(60)].map((_, i) => {
                    const s = i * 173.1;
                    return <circle key={i} cx={(s * 23) % EO_SIZE} cy={(s * 41) % EO_SIZE} r={0.4 + (i % 3) * 0.3} fill="white" opacity={0.1 + (i % 5) * 0.07} />;
                  })}

                  {/* ISS orbit */}
                  <circle cx={ECX} cy={ECY} r={ISS_ORBIT_R} fill="none" stroke="#06B6D4" strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="4 3" />

                  {/* Rocket orbit if orbital */}
                  {isOrbital && (
                    <circle cx={ECX} cy={ECY} r={rocketOrbitR} fill="none" stroke="#22C55E" strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="3 3" />
                  )}

                  {/* Suborbital arc */}
                  {isSuborbital && (() => {
                    const arcR = EARTH_R + 15 + (rocketResult.maxHeight / 100000) * 8;
                    const pts = [];
                    for (let a = 60; a <= 120; a += 5) {
                      const rad = a * Math.PI / 180;
                      pts.push(`${ECX + arcR * Math.cos(rad)},${ECY - arcR * Math.sin(rad)}`);
                    }
                    return <polyline points={pts.join(" ")} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="4 2" />;
                  })()}

                  {/* Earth */}
                  <circle cx={ECX} cy={ECY} r={EARTH_R + 6} fill="#3B82F6" opacity="0.08" />
                  <circle cx={ECX} cy={ECY} r={EARTH_R} fill="#1D4ED8" opacity="0.9" />
                  <circle cx={ECX} cy={ECY} r={EARTH_R} fill="none" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.5" />
                  <text x={ECX} y={ECY + 4} textAnchor="middle" fill="white" fontSize="11" opacity="0.9">🌍</text>

                  {/* Atmosphere ring */}
                  <circle cx={ECX} cy={ECY} r={EARTH_R + 3} fill="none" stroke="#60A5FA" strokeWidth="2" strokeOpacity="0.15" />

                  {/* ISS */}
                  <circle cx={issX} cy={issY} r={5} fill="#06B6D4" opacity="0.9" />
                  <circle cx={issX} cy={issY} r={8} fill="#06B6D4" opacity="0.15" />
                  <text x={issX} y={issY - 9} textAnchor="middle" fill="#06B6D4" fontSize="7" opacity="0.9">ISS</text>

                  {/* Rocket in orbit */}
                  {isOrbital && (
                    <>
                      <circle cx={rocketX} cy={rocketY} r={5} fill="#22C55E" opacity="0.9" />
                      <circle cx={rocketX} cy={rocketY} r={8} fill="#22C55E" opacity="0.15" />
                      <text x={rocketX} y={rocketY - 9} textAnchor="middle" fill="#22C55E" fontSize="7" opacity="0.9">🚀</text>
                    </>
                  )}

                  {/* Rocket escape trajectory */}
                  {rocketResult && rocketResult.maxVelocity >= 11200 && (() => {
                    const pts = [];
                    for (let t = 0; t <= 1; t += 0.05) {
                      const px = ECX + (EARTH_R + 10) * Math.cos(0.5) + t * 80 * Math.cos(0.5);
                      const py = ECY - (EARTH_R + 10) * Math.sin(0.5) - t * 80 * Math.sin(0.5);
                      pts.push(`${px},${py}`);
                    }
                    return <polyline points={pts.join(" ")} fill="none" stroke="#A855F7" strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="5 2" />;
                  })()}

                  {/* Legend */}
                  <text x="8" y="16" fill="#06B6D4" fontSize="7.5">— ISS orbit (~408 km, 92 min)</text>
                  {isOrbital && <text x="8" y="27" fill="#22C55E" fontSize="7.5">— Your rocket orbit</text>}
                  {isSuborbital && <text x="8" y="27" fill="#F59E0B" fontSize="7.5">— Suborbital trajectory</text>}
                </svg>

                {/* ISS info overlay */}
                <div className="absolute bottom-3 left-3 bg-card/95 border border-cyan-500/30 rounded-xl px-3 py-2 pointer-events-none backdrop-blur-sm">
                  <p className="text-xs font-heading font-bold text-cyan-300">🛸 ISS</p>
                  <p className="text-xs text-muted-foreground">Altitude: ~408 km</p>
                  <p className="text-xs text-muted-foreground">Speed: 7.66 km/s</p>
                  <p className="text-xs text-muted-foreground">Period: 92.7 min</p>
                </div>
              </CardContent>
            </Card>

            {/* Rocket result card */}
            <Card className={`border-border/50 ${rocketClass ? "border-opacity-100" : ""}`} style={rocketClass ? { borderColor: rocketClass.color + "50" } : {}}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-heading font-semibold text-foreground">Your Last Launch</span>
                </div>
                {rocketResult && rocketClass ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{rocketClass.emoji}</span>
                      <div>
                        <p className="text-sm font-heading font-bold" style={{ color: rocketClass.color }}>{rocketClass.label}</p>
                        <p className="text-xs text-muted-foreground">{rocketClass.desc}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {[
                        { label: "Max Altitude", value: `${(rocketResult.maxHeight / 1000).toFixed(1)} km` },
                        { label: "Max Velocity", value: `${rocketResult.maxVelocity?.toFixed(0)} m/s` },
                        { label: "Flight Time", value: `${rocketResult.totalTime?.toFixed(1)} s` },
                        { label: "TWR", value: rocketResult.twr?.toFixed(2) },
                      ].map((s) => (
                        <div key={s.label} className="bg-secondary/30 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                          <p className="text-sm font-heading font-semibold text-foreground">{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg p-2 text-xs text-muted-foreground bg-secondary/20 border border-border">
                      {rocketResult.maxVelocity >= 11200 && "🌌 Your rocket has escape velocity — it's leaving Earth's gravity well!"}
                      {rocketResult.maxVelocity >= 7800 && rocketResult.maxVelocity < 11200 && "🛰️ Orbital velocity achieved — shown orbiting Earth above."}
                      {rocketResult.maxHeight >= 100000 && rocketResult.maxVelocity < 7800 && "🚀 Suborbital flight — crossed the Kármán line (100 km)!"}
                      {rocketResult.maxHeight < 100000 && "⬆️ Run the simulator and launch to see your rocket here."}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Launch a rocket in the Simulator to see its trajectory here!
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageShell>
  );
}
