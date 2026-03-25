import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";

const categoryColors = {
  rocket: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  spacecraft: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  engine: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  mission: "bg-green-500/20 text-green-300 border-green-500/30",
  astronaut: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  planet: "bg-red-500/20 text-red-300 border-red-500/30",
  general: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function FactGenerator() {
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const generate = async () => {
    setLoading(true);
    const recentFacts = history.slice(-5).map((f) => `"${f.fact}"`).join(", ");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate one short, interesting, and educational space or rocket fact suitable for teenagers.

Rules:
- 1 to 2 sentences only.
- Topics: rockets, spacecraft, engines, astronauts, space missions, or space history milestones.
- Make it engaging, surprising, and easy to understand for a teen audience.
- Do NOT repeat any of these recently shown facts: ${recentFacts || "none yet"}.
- Return ONLY a JSON object with two fields: "fact" (string) and "category" (one of: rocket, spacecraft, engine, mission, astronaut, planet, general).`,
      response_json_schema: {
        type: "object",
        properties: {
          fact: { type: "string" },
          category: {
            type: "string",
            enum: ["rocket", "spacecraft", "engine", "mission", "astronaut", "planet", "general"],
          },
        },
        required: ["fact", "category"],
      },
    });

    const newFact = { fact: result.fact, category: result.category };
    setFact(newFact);
    setHistory((prev) => [...prev, newFact]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <Button
        onClick={generate}
        disabled={loading}
        className="w-full h-12 font-heading font-semibold text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            {fact ? "Generate Another Fact" : "Generate a Fact"}
          </>
        )}
      </Button>

      {/* Fact Display */}
      <AnimatePresence mode="wait">
        {fact && !loading && (
          <motion.div
            key={fact.fact}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="border-purple-500/25 bg-gradient-to-br from-purple-600/10 via-blue-600/5 to-transparent overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
              <CardContent className="pt-5 pb-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-heading font-semibold text-purple-400 uppercase tracking-wide">
                      AI Generated
                    </span>
                  </div>
                  {fact.category && (
                    <Badge className={`text-xs border ${categoryColors[fact.category] || categoryColors.general}`}>
                      {fact.category}
                    </Badge>
                  )}
                </div>
                <p className="text-foreground leading-relaxed text-base font-medium">
                  {fact.fact}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border-border/50 bg-card/60">
              <CardContent className="pt-5 pb-5 space-y-2">
                <div className="h-3 bg-secondary/80 rounded animate-pulse w-1/3 mb-3" />
                <div className="h-4 bg-secondary/80 rounded animate-pulse" />
                <div className="h-4 bg-secondary/80 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-secondary/60 rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Count */}
      {history.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {history.length} fact{history.length !== 1 ? "s" : ""} generated this session
        </p>
      )}
    </div>
  );
}
