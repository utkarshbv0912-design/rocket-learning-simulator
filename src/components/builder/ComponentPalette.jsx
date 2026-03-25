import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const COMPONENTS = [
  // Nose cones
  { type: "nose", name: "Standard Nose", emoji: "🔺", mass: 200, thrust: 0, isp: 0, color: "border-slate-500/40 from-slate-600/15", desc: "Aerodynamic fairing" },
  { type: "nose", name: "Payload Fairing", emoji: "📦", mass: 500, thrust: 0, isp: 0, payload: 1000, color: "border-blue-500/40 from-blue-600/15", desc: "+1000 kg payload" },

  // Fuel tanks
  { type: "fuel", name: "RP-1 Tank", emoji: "🛢️", mass: 800, thrust: 0, isp: 0, fuelMass: 8000, fuelType: "RP-1", color: "border-amber-500/40 from-amber-600/15", desc: "Kerosene fuel tank" },
  { type: "fuel", name: "LOX Tank", emoji: "❄️", mass: 600, thrust: 0, isp: 0, fuelMass: 6000, fuelType: "LOX", color: "border-cyan-500/40 from-cyan-600/15", desc: "Liquid oxygen" },
  { type: "fuel", name: "LH2 Tank", emoji: "⚗️", mass: 400, thrust: 0, isp: 0, fuelMass: 2000, fuelType: "LH2", color: "border-purple-500/40 from-purple-600/15", desc: "Liquid hydrogen (light!)" },
  { type: "fuel", name: "Solid Booster", emoji: "🔥", mass: 3000, thrust: 1200000, isp: 280, fuelMass: 12000, fuelType: "Solid", color: "border-red-500/40 from-red-600/15", desc: "High-thrust solid fuel" },

  // Engines
  { type: "engine", name: "Merlin Engine", emoji: "⚙️", mass: 470, thrust: 845000, isp: 311, color: "border-violet-500/40 from-violet-600/15", desc: "RP-1/LOX, 845 kN" },
  { type: "engine", name: "Raptor Engine", emoji: "🌀", mass: 1500, thrust: 2200000, isp: 380, color: "border-pink-500/40 from-pink-600/15", desc: "CH4/LOX, 2200 kN" },
  { type: "engine", name: "RL-10 Engine", emoji: "💎", mass: 168, thrust: 110000, isp: 451, color: "border-emerald-500/40 from-emerald-600/15", desc: "LH2/LOX, high ISP" },
  { type: "engine", name: "Solid Motor", emoji: "💥", mass: 200, thrust: 500000, isp: 270, color: "border-orange-500/40 from-orange-600/15", desc: "Simple solid rocket" },

  // Fins / structure
  { type: "structure", name: "Grid Fins", emoji: "🩻", mass: 150, thrust: 0, isp: 0, color: "border-green-500/40 from-green-600/15", desc: "Aerodynamic control" },
  { type: "structure", name: "Landing Legs", emoji: "🦵", mass: 300, thrust: 0, isp: 0, color: "border-teal-500/40 from-teal-600/15", desc: "Reusable recovery" },
];

const GROUPS = [
  { label: "Nose / Payload", type: "nose" },
  { label: "Fuel Tanks", type: "fuel" },
  { label: "Engines", type: "engine" },
  { label: "Structure", type: "structure" },
];

export default function ComponentPalette({ onAdd }) {
  return (
    <div className="space-y-4">
      {GROUPS.map((group) => (
        <div key={group.type}>
          <h2 className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {group.label}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {COMPONENTS.filter((c) => c.type === group.type).map((comp) => (
              <motion.button
                key={comp.name}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAdd(comp)}
                className="text-left"
              >
                <Card className={`border ${comp.color} bg-gradient-to-br to-transparent cursor-pointer hover:scale-[1.02] transition-transform`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{comp.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-heading font-semibold text-foreground leading-tight">{comp.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{comp.desc}</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
