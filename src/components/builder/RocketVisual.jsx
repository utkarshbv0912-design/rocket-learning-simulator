import { motion, AnimatePresence } from "framer-motion";

const TYPE_ORDER = { nose: 0, fuel: 1, engine: 2, structure: 3 };

// Visual segment shapes per type
function NoseSegment({ comp }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="w-0 h-0"
        style={{
          borderLeft: "28px solid transparent",
          borderRight: "28px solid transparent",
          borderBottom: "36px solid hsl(230 20% 22%)",
          filter: "drop-shadow(0 0 6px hsl(262 83% 58% / 0.4))",
        }}
      />
      <div className="w-14 py-1 text-center" style={{ background: "hsl(230 20% 18%)", borderLeft: "2px solid hsl(262 83% 58% / 0.5)", borderRight: "2px solid hsl(262 83% 58% / 0.5)" }}>
        <span className="text-xs">{comp.emoji}</span>
      </div>
    </div>
  );
}

function FuelSegment({ comp }) {
  const fuelColors = { "RP-1": "#D97706", LOX: "#0891B2", LH2: "#7C3AED", Solid: "#DC2626" };
  const color = fuelColors[comp.fuelType] || "#6B7280";
  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="w-16 flex items-center justify-center gap-1 py-2 rounded-sm relative overflow-hidden"
        style={{ background: "hsl(230 20% 16%)", border: `2px solid ${color}44`, minHeight: 44 }}
      >
        <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(90deg, ${color}33, transparent)` }} />
        <span className="text-sm relative z-10">{comp.emoji}</span>
        <span className="text-xs font-heading font-semibold text-foreground relative z-10 truncate max-w-[40px]">{comp.fuelType || "Tank"}</span>
      </div>
    </div>
  );
}

function EngineSegment({ comp }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="w-16 py-2 flex items-center justify-center gap-1 relative overflow-hidden"
        style={{ background: "hsl(230 20% 14%)", border: "2px solid hsl(262 83% 58% / 0.4)" }}
      >
        <span className="text-sm">{comp.emoji}</span>
        <span className="text-xs font-heading text-purple-300 truncate max-w-[44px]">{comp.name.replace(" Engine", "")}</span>
      </div>
      {/* Nozzle shape */}
      <div
        className="w-0 h-0 mx-auto"
        style={{
          borderLeft: "20px solid transparent",
          borderRight: "20px solid transparent",
          borderTop: "18px solid hsl(230 20% 14%)",
        }}
      />
    </div>
  );
}

function StructureSegment({ comp }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="w-16 py-1 flex items-center justify-center gap-1"
        style={{ background: "hsl(230 20% 17%)", border: "2px solid hsl(142 71% 45% / 0.3)", borderStyle: "dashed" }}
      >
        <span className="text-xs">{comp.emoji}</span>
        <span className="text-xs text-muted-foreground truncate max-w-[40px]">{comp.name}</span>
      </div>
    </div>
  );
}

function RocketSegment({ comp, onRemove }) {
  const SegComp = comp.type === "nose" ? NoseSegment
    : comp.type === "fuel" ? FuelSegment
    : comp.type === "engine" ? EngineSegment
    : StructureSegment;

  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.5, y: -10 }}
      animate={{ opacity: 1, scaleY: 1, y: 0 }}
      exit={{ opacity: 0, scaleY: 0.5 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative group flex justify-center"
    >
      <SegComp comp={comp} />
      <button
        onClick={() => onRemove(comp.id)}
        className="absolute -right-5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 group-hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
      >
        ✕
      </button>
    </motion.div>
  );
}

export default function RocketVisual({ stages, onRemove }) {
  const sorted = [...stages].sort((a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9));

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <div className="text-4xl mb-3 opacity-30">🚀</div>
        <p className="text-sm">Tap components to build your rocket</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-4 gap-0">
      <AnimatePresence>
        {sorted.map((comp) => (
          <RocketVisual.Segment key={comp.id} comp={comp} onRemove={onRemove} />
        ))}
      </AnimatePresence>
      {/* Flame */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="text-2xl mt-0"
      >
        🔥
      </motion.div>
    </div>
  );
}

RocketVisual.Segment = RocketSegment;
