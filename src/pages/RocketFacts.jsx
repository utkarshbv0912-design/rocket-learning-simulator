import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import PageShell from "../components/PageShell";
import DailyFactCard from "../components/DailyFactCard";
import FactGenerator from "../components/FactGenerator";
import { base44 } from "@/api/base44Client";

const staticFacts = [
  { title: "Saturn V", emoji: "🚀", fact: "The Saturn V rocket remains the tallest, heaviest, and most powerful rocket ever brought to operational status.", color: "border-purple-500/30 from-purple-600/10" },
  { title: "Falcon 9 Reusability", emoji: "🔄", fact: "SpaceX's Falcon 9 was the first orbital-class rocket to successfully land and be reflown, reducing launch costs by up to 30%.", color: "border-blue-500/30 from-blue-600/10" },
  { title: "Escape Velocity", emoji: "🌍", fact: "To escape Earth's gravity, a rocket must reach 11.2 km/s — about 25,000 mph, or 33 times the speed of sound.", color: "border-cyan-500/30 from-cyan-600/10" },
  { title: "Fuel Weight", emoji: "⛽", fact: "About 90% of a rocket's weight at liftoff is fuel. The Space Shuttle carried over 2 million liters of liquid hydrogen and oxygen.", color: "border-amber-500/30 from-amber-600/10" },
  { title: "Speed Record", emoji: "⚡", fact: "NASA's Parker Solar Probe reached 635,266 km/h — the fastest human-made object ever built.", color: "border-red-500/30 from-red-600/10" },
];


export default function RocketFacts() {
  const [todayFact, setTodayFact] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    base44.entities.DailyFact.filter({ date: todayStr }).then((results) => {
      setTodayFact(results[0] || null);
      setLoading(false);
    });
  }, []);

  return (
    <PageShell title="Rocket Facts">
      <div className="space-y-6">
        {/* Today's daily fact */}
        <DailyFactCard fact={todayFact} isLoading={loading} />

        {/* AI Fact Generator */}
        <div>
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
            AI Fact Generator
          </h2>
          <FactGenerator />
        </div>



        {/* Static curated facts */}
        <div>
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Featured Facts
          </h2>
          <div className="space-y-3">
            {staticFacts.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className={`border ${f.color} bg-gradient-to-br to-transparent`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{f.emoji}</span>
                      <div>
                        <h3 className="font-heading font-semibold text-foreground text-sm">{f.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{f.fact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
