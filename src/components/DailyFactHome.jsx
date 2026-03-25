import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "rocketlab_daily_fact";

export default function DailyFactHome() {
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const generateFact = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate one short, fascinating, educational fact for the date ${today}.
Topics: rockets, space exploration, aerospace physics, famous missions (Apollo, Voyager, etc.), astronauts, or aerospace engineering.
Rules:
- 2–3 sentences max.
- Must be accurate and educational.
- Make it surprising and engaging for students aged 12–18.
- Return ONLY a JSON object with: "fact" (string), "category" (one of: rocket, spacecraft, mission, astronaut, physics, engineering).`,
      response_json_schema: {
        type: "object",
        properties: {
          fact: { type: "string" },
          category: { type: "string", enum: ["rocket", "spacecraft", "mission", "astronaut", "physics", "engineering"] },
        },
        required: ["fact", "category"],
      },
    });
    const data = { date: today, fact: result.fact, category: result.category };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setFact(data);
    setLoading(false);
  };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (stored && stored.date === today) {
        setFact(stored);
        setLoading(false);
        return;
      }
    } catch (_) {}
    generateFact();
  }, []);

  const categoryEmoji = {
    rocket: "🚀", spacecraft: "🛸", mission: "🌙",
    astronaut: "👨‍🚀", physics: "⚛️", engineering: "⚙️",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-600/15 via-orange-600/8 to-transparent overflow-hidden relative">
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl" />
        <CardContent className="pt-4 pb-4 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-xs font-heading font-semibold uppercase tracking-wide">Daily Fact</span>
            </div>
            {fact && (
              <button onClick={generateFact} disabled={loading} className="text-muted-foreground hover:text-amber-400 transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-2 mt-1">
              <div className="h-3.5 bg-secondary/80 rounded animate-pulse" />
              <div className="h-3.5 bg-secondary/80 rounded animate-pulse w-5/6" />
              <div className="h-3.5 bg-secondary/60 rounded animate-pulse w-3/4" />
            </div>
          ) : fact ? (
            <div>
              <p className="text-sm text-foreground leading-relaxed font-medium">
                {categoryEmoji[fact.category] || "🚀"} {fact.fact}
              </p>
              <p className="text-xs text-muted-foreground mt-2 capitalize">{fact.category}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
