import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { getSavedRockets, deleteSavedRocket } from "../../utils/savedRockets";

const PRESETS = [
  {
    name: "Student Rocket",
    emoji: "🎓",
    desc: "Small educational rocket",
    thrust: 5000,
    fuel: 50,
    mass: 150,
    burnRate: 2,
    color: "border-green-500/40 from-green-600/15",
  },
  {
    name: "Sounding Rocket",
    emoji: "🔬",
    desc: "Scientific research vehicle",
    thrust: 18000,
    fuel: 200,
    mass: 500,
    burnRate: 8,
    color: "border-cyan-500/40 from-cyan-600/15",
  },
  {
    name: "Falcon-Style",
    emoji: "🦅",
    desc: "Reusable orbital booster",
    thrust: 845000,
    fuel: 25000,
    mass: 22000,
    burnRate: 250,
    color: "border-blue-500/40 from-blue-600/15",
  },
  {
    name: "Heavy Lift",
    emoji: "🏋️",
    desc: "Maximum payload capacity",
    thrust: 3500000,
    fuel: 120000,
    mass: 85000,
    burnRate: 1000,
    color: "border-purple-500/40 from-purple-600/15",
  },
];

export { PRESETS };

export default function PresetSelector({ onSelect, selected, refreshKey }) {
  const [customRockets, setCustomRockets] = useState([]);

  useEffect(() => {
    setCustomRockets(getSavedRockets());
  }, [refreshKey]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteSavedRocket(id);
    setCustomRockets(getSavedRockets());
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick Presets</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <motion.button
              key={preset.name}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(preset)}
              className={`text-left rounded-xl border bg-gradient-to-br to-transparent p-3 transition-all ${preset.color} ${
                selected?.name === preset.name
                  ? "ring-2 ring-primary/60 shadow-lg shadow-primary/20"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className="text-xl mb-1">{preset.emoji}</div>
              <p className="text-xs font-heading font-semibold text-foreground leading-tight">{preset.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{preset.desc}</p>
              <div className="mt-2 space-y-0.5">
                <p className="text-xs text-muted-foreground">{(preset.thrust / 1000).toFixed(0)} kN thrust</p>
                <p className="text-xs text-muted-foreground">{preset.fuel.toLocaleString()} kg fuel</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {customRockets.length > 0 && (
        <div>
          <p className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-2">💾 Saved Rockets</p>
          <div className="grid grid-cols-2 gap-2">
            {customRockets.map((rocket) => (
              <motion.button
                key={rocket.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect(rocket)}
                className={`relative text-left rounded-xl border bg-gradient-to-br to-transparent p-3 transition-all ${rocket.color} ${
                  selected?.id === rocket.id
                    ? "ring-2 ring-primary/60 shadow-lg shadow-primary/20"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <button
                  onClick={(e) => handleDelete(e, rocket.id)}
                  className="absolute top-2 right-2 text-muted-foreground/40 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="text-xl mb-1">{rocket.emoji}</div>
                <p className="text-xs font-heading font-semibold text-foreground leading-tight">{rocket.name}</p>
                <div className="mt-2 space-y-0.5">
                  <p className="text-xs text-muted-foreground">{(rocket.thrust / 1000).toFixed(0)} kN thrust</p>
                  <p className="text-xs text-muted-foreground">{rocket.fuel?.toLocaleString()} kg fuel</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
