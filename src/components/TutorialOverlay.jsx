import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { emoji: "👋", title: "Welcome to Rocket Lab!", body: "You're about to design, build, and launch rockets using real physics. This quick tour will show you how everything works.", cta: "Let's go!" },
  { emoji: "🔧", title: "Build Your Rocket", body: "Head to Rocket Builder to assemble a rocket from parts — engines, fuel tanks, nose cones, and more. Each part affects how your rocket flies.", cta: "Got it" },
  { emoji: "🚀", title: "Run Simulations", body: "The Rocket Simulator lets you enter thrust, fuel, mass, and burn rate to run a live physics simulation. Watch altitude, speed, and fuel in real time!", cta: "Cool!" },
  { emoji: "🎯", title: "Complete Missions", body: "Mission Mode gives you AI-generated engineering challenges. Hit the targets — reach a specific altitude, stay under a fuel limit, or hit orbital speed.", cta: "Nice" },
  { emoji: "🌍", title: "Explore the Space Map", body: "The Space Map shows real planetary positions, your launch trajectories, and flight history. See where your rockets went!", cta: "Awesome" },
  { emoji: "🎓", title: "Learn Aerospace Science", body: "The Learning Hub has lessons, experiments, and quizzes. The AI Learning page generates infinite new content — lessons, challenges, and experiments — just for you.", cta: "Let's launch!" },
];

const TUTORIAL_KEY = "rocketlab_tutorial_done";

export function useShouldShowTutorial() {
  return !localStorage.getItem(TUTORIAL_KEY);
}

export default function TutorialOverlay({ onDone }) {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem(TUTORIAL_KEY, "1");
      onDone?.();
    }
  };

  const skip = () => {
    localStorage.setItem(TUTORIAL_KEY, "1");
    onDone?.();
  };

  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-10 px-4 bg-black/60 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-border"}`} />
              ))}
            </div>
            <button onClick={skip} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
          </div>

          <div className="text-center mb-5">
            <span className="text-5xl block mb-3">{s.emoji}</span>
            <h2 className="font-heading font-bold text-foreground text-lg mb-2">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </div>

          <Button onClick={next} className="w-full h-11 font-heading font-semibold">
            {s.cta} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <button onClick={skip} className="w-full text-center text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors">
            Skip tutorial
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
