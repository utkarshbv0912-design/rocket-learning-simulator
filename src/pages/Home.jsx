import { useState } from "react";
import { Link } from "react-router-dom";
import TutorialOverlay, { useShouldShowTutorial } from "../components/TutorialOverlay";
import { getProgress, getLevel } from "../utils/userProgress";
import { motion } from "framer-motion";
import { Calculator, Rocket, Sparkles, Wrench, Target, Plus } from "lucide-react";
import Starfield from "../components/Starfield";
import RocketIcon from "../components/RocketIcon";
import DailyFactHome from "../components/DailyFactHome";

const TOOLS = [
  {
    to: "/builder",
    icon: Wrench,
    label: "Rocket Builder",
    description: "Visually assemble a rocket then launch it",
    gradient: "from-emerald-600/20 to-teal-600/20",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    badge: null,
  },
  {
    to: "/simulator",
    icon: Rocket,
    label: "Simulator",
    description: "Launch with live physics graphs",
    gradient: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    badge: null,
  },
  {
    to: "/missions",
    icon: Target,
    label: "Mission Mode",
    description: "AI-generated engineering challenges",
    gradient: "from-red-600/20 to-orange-600/20",
    border: "border-red-500/30",
    iconColor: "text-red-400",
    badge: "NEW",
  },
  {
    to: "/calculator",
    icon: Calculator,
    label: "Calculator",
    description: "Thrust from mass & acceleration",
    gradient: "from-purple-600/20 to-blue-600/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
    badge: null,
  },
  {
    to: "/facts",
    icon: Sparkles,
    label: "Rocket Facts",
    description: "AI facts about space & rockets",
    gradient: "from-amber-600/20 to-orange-600/20",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    badge: null,
  },
  {
    to: "/space-map",
    icon: null,
    emoji: "🌍",
    label: "Space Map",
    description: "Live solar system with real planet positions",
    gradient: "from-indigo-600/20 to-purple-600/20",
    border: "border-indigo-500/30",
    iconColor: "text-indigo-400",
    badge: null,
  },
  {
    to: "/learning",
    icon: null,
    emoji: "🎓",
    label: "Learning Hub",
    description: "Lessons, missions, quizzes & career explorer",
    gradient: "from-emerald-600/20 to-cyan-600/20",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    badge: "NEW",
  },
  {
    to: "/ai-learning",
    icon: null,
    emoji: "🤖",
    label: "AI Learning",
    description: "Infinite AI-generated lessons & experiments",
    gradient: "from-violet-600/20 to-pink-600/20",
    border: "border-violet-500/30",
    iconColor: "text-violet-400",
    badge: "NEW",
  },
  {
    to: "/parts",
    icon: null,
    emoji: "🔩",
    label: "Parts Library",
    description: "Browse & unlock rocket parts",
    gradient: "from-orange-600/20 to-amber-600/20",
    border: "border-orange-500/30",
    iconColor: "text-orange-400",
    badge: null,
  },
];

export default function Home() {
  const [showTutorial, setShowTutorial] = useState(useShouldShowTutorial());
  const progress = getProgress();
  const level = getLevel(progress.totalPoints);

  return (
    <div className="min-h-screen relative font-body">
      <Starfield />
      <div className="relative z-10 max-w-lg mx-auto px-4 py-10 flex flex-col items-center">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <RocketIcon size={72} />
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mt-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Rocket Lab
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
            Design, simulate, and explore the science of aerospace engineering.
          </p>
        </motion.div>

        {/* Daily Fact */}
        <div className="w-full mb-6">
          <DailyFactHome />
        </div>

        {/* Tools Grid */}
        <div className="w-full mb-6">
          <p className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tools</p>
          <div className="grid grid-cols-2 gap-3">
            {TOOLS.map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                className={item.label === "Rocket Builder" ? "col-span-2" : ""}
              >
                <Link to={item.to} className="block group">
                  <div className={`relative overflow-hidden rounded-2xl border ${item.border} bg-gradient-to-r ${item.gradient} backdrop-blur-sm p-4 transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-primary/10`}>
                    {item.badge && (
                      <span className="absolute top-2.5 right-2.5 text-xs font-heading font-bold text-red-300 bg-red-500/20 border border-red-500/30 rounded-full px-1.5 py-0.5">
                        {item.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-secondary/50 shrink-0">
                        {item.icon
                          ? <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                          : <span className="text-lg leading-none">{item.emoji}</span>}
                      </div>
                      <div>
                        <h2 className="font-heading font-semibold text-foreground text-sm leading-tight">{item.label}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.description}</p>
                      </div>
                    </div>
                    </div>
                    </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Feature Area — easily add new features here */}
        <FeatureArea />

        {/* Profile strip */}
        <Link to="/profile" className="w-full mb-2 block">
          <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-secondary/20 px-4 py-2.5 hover:bg-secondary/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-heading font-bold text-white shrink-0">
              {progress.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-heading font-semibold text-foreground">{progress.name}</p>
              <p className={`text-xs font-heading ${level.color}`}>{level.emoji} {level.label} · {progress.totalPoints} pts</p>
            </div>
            <span className="text-xs text-muted-foreground">Profile →</span>
          </div>
        </Link>

        <p className="text-muted-foreground/50 text-xs mt-6">
          Built for learning physics through space exploration
        </p>
      </div>

      {showTutorial && <TutorialOverlay onDone={() => setShowTutorial(false)} />}
    </div>
  );
}

// ── Feature Area ──────────────────────────────────────────────────
// Add new feature cards here — the layout expands automatically.
const UPCOMING_FEATURES = [
  { emoji: "🛸", label: "Multi-Stage Rockets", desc: "Coming soon", disabled: true },
  { emoji: "🌌", label: "Orbital Mechanics", desc: "Coming soon", disabled: true },
];

function FeatureArea() {
  if (UPCOMING_FEATURES.length === 0) return null;
  return (
    <div className="w-full mb-2">
      <p className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-3">Coming Soon</p>
      <div className="grid grid-cols-2 gap-3">
        {UPCOMING_FEATURES.map((f) => (
          <div key={f.label} className="rounded-2xl border border-border/40 bg-secondary/20 p-4 opacity-50 cursor-default">
            <span className="text-2xl">{f.emoji}</span>
            <p className="font-heading font-semibold text-sm text-foreground mt-2">{f.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
