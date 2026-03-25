import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Lock } from "lucide-react";
import PageShell from "../components/PageShell";
import { getProgress } from "../utils/userProgress";

const CATEGORIES = ["All", "Engines", "Fuel Tanks", "Nose Cones", "Materials"];

const PARTS = [
  // Engines
  { id: "eng_basic", cat: "Engines", emoji: "🔥", name: "Hobbyist Engine", desc: "Small solid-fuel engine for beginners.", thrust: 5000, isp: 180, mass: 20, unlock: 0, stats: { Thrust: "5 kN", ISP: "180s", Mass: "20 kg" } },
  { id: "eng_liquid", cat: "Engines", emoji: "⚗️", name: "Liquid Engine Mk1", desc: "Throttleable liquid engine. Better efficiency than solid motors.", thrust: 50000, isp: 280, mass: 120, unlock: 40, stats: { Thrust: "50 kN", ISP: "280s", Mass: "120 kg" } },
  { id: "eng_heavy", cat: "Engines", emoji: "💪", name: "Heavy Lifter Engine", desc: "High-thrust engine for massive payloads.", thrust: 400000, isp: 310, mass: 500, unlock: 100, stats: { Thrust: "400 kN", ISP: "310s", Mass: "500 kg" } },
  { id: "eng_cryo", cat: "Engines", emoji: "❄️", name: "Cryogenic Engine", desc: "Liquid hydrogen/oxygen engine. Highest ISP available.", thrust: 200000, isp: 450, mass: 300, unlock: 250, stats: { Thrust: "200 kN", ISP: "450s", Mass: "300 kg" } },
  // Fuel Tanks
  { id: "tank_small", cat: "Fuel Tanks", emoji: "🛢️", name: "Small Tank", desc: "50 kg capacity. Perfect for hobby flights.", fuel: 50, mass: 30, unlock: 0, stats: { Capacity: "50 kg", "Dry Mass": "30 kg", Material: "Aluminum" } },
  { id: "tank_medium", cat: "Fuel Tanks", emoji: "⛽", name: "Medium Tank", desc: "500 kg capacity. The workhorse of rocketry.", fuel: 500, mass: 200, unlock: 0, stats: { Capacity: "500 kg", "Dry Mass": "200 kg", Material: "Aluminum" } },
  { id: "tank_large", cat: "Fuel Tanks", emoji: "🏭", name: "Large Cryogenic Tank", desc: "5,000 kg capacity with thermal insulation.", fuel: 5000, mass: 800, unlock: 100, stats: { Capacity: "5,000 kg", "Dry Mass": "800 kg", Material: "Titanium" } },
  { id: "tank_super", cat: "Fuel Tanks", emoji: "🚂", name: "Super Heavy Tank", desc: "Enormous capacity for orbital missions.", fuel: 30000, mass: 4000, unlock: 250, stats: { Capacity: "30,000 kg", "Dry Mass": "4,000 kg", Material: "Carbon Fiber" } },
  // Nose Cones
  { id: "nose_blunt", cat: "Nose Cones", emoji: "🔵", name: "Blunt Nose Cone", desc: "Simple blunt cone. High drag, low cost.", drag: "High", unlock: 0, stats: { "Drag Coefficient": "0.47", Material: "Steel", Weight: "15 kg" } },
  { id: "nose_ogive", cat: "Nose Cones", emoji: "🔺", name: "Ogive Nose Cone", desc: "Streamlined shape with reduced drag.", drag: "Medium", unlock: 40, stats: { "Drag Coefficient": "0.18", Material: "Aluminum", Weight: "20 kg" } },
  { id: "nose_von_karman", cat: "Nose Cones", emoji: "🔱", name: "Von Kármán Cone", desc: "Optimal aerodynamic shape for supersonic flight.", drag: "Very Low", unlock: 100, stats: { "Drag Coefficient": "0.12", Material: "Carbon Fiber", Weight: "25 kg" } },
  // Materials
  { id: "mat_steel", cat: "Materials", emoji: "⚙️", name: "Steel Frame", desc: "Heavy but strong. Standard for small rockets.", mass: "+30%", cost: "Low", unlock: 0, stats: { Weight: "+30%", Strength: "High", Cost: "Low" } },
  { id: "mat_aluminum", cat: "Materials", emoji: "🔩", name: "Aluminum Alloy Frame", desc: "Lighter than steel with good strength.", mass: "+15%", cost: "Medium", unlock: 40, stats: { Weight: "+15%", Strength: "Good", Cost: "Medium" } },
  { id: "mat_carbon", cat: "Materials", emoji: "🕶️", name: "Carbon Fiber Frame", desc: "Ultra-light aerospace composite material.", mass: "+5%", cost: "High", unlock: 250, stats: { Weight: "+5%", Strength: "Excellent", Cost: "High" } },
];

function PartCard({ part, points }) {
  const [expanded, setExpanded] = useState(false);
  const locked = points < part.unlock;
  const simParams = part.thrust ? `?thrust=${part.thrust}&fuel=${part.fuel || 500}&mass=${(part.mass || 100) + (part.fuel || 500)}&burnRate=${Math.round((part.thrust / 100000) * 5 + 2)}&preset=${encodeURIComponent(part.name)}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-secondary/20 overflow-hidden transition-all ${locked ? "border-border/30 opacity-60" : "border-border/50"}`}
    >
      <button onClick={() => !locked && setExpanded((e) => !e)} className="w-full flex items-center gap-3 p-4 text-left">
        <span className="text-2xl shrink-0">{locked ? "🔒" : part.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-heading font-semibold text-foreground">{part.name}</p>
          <p className="text-xs text-muted-foreground">{locked ? `Unlock at ${part.unlock} pts` : part.desc}</p>
        </div>
        {!locked && <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />}
      </button>
      <AnimatePresence>
        {expanded && !locked && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(part.stats).map(([k, v]) => (
                  <div key={k} className="bg-secondary/40 rounded-xl p-2 text-center">
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="text-xs font-heading font-bold text-foreground mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              {simParams && (
                <Link to={`/simulator${simParams}`}>
                  <div className="flex items-center justify-between bg-primary/15 border border-primary/30 rounded-xl px-3 py-2.5 hover:bg-primary/25 transition-colors">
                    <span className="text-xs font-heading font-semibold text-primary">Test in Simulator</span>
                    <ChevronRight className="w-3.5 h-3.5 text-primary" />
                  </div>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PartsLibrary() {
  const [cat, setCat] = useState("All");
  const progress = getProgress();
  const filtered = cat === "All" ? PARTS : PARTS.filter((p) => p.cat === cat);
  const unlocked = PARTS.filter((p) => progress.totalPoints >= p.unlock).length;

  return (
    <PageShell title="Parts Library">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm font-heading font-bold text-foreground">🔩 Rocket Parts</p>
          <p className="text-xs text-muted-foreground mt-0.5">{unlocked}/{PARTS.length} parts unlocked · {progress.totalPoints} pts</p>
          <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${(unlocked / PARTS.length) * 100}%` }} />
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`text-xs px-3 py-1.5 rounded-full border font-heading font-semibold transition-all ${cat === c ? "border-primary bg-primary/20 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/50"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((p) => <PartCard key={p.id} part={p} points={progress.totalPoints} />)}
        </div>
      </motion.div>
    </PageShell>
  );
}
