import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, RefreshCw, Rocket, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageShell from "../components/PageShell";
import { base44 } from "@/api/base44Client";
import { saveMission } from "../components/simulator/MissionPanel";
import { Link } from "react-router-dom";

const DIFFICULTY_COLORS = {
  Easy: "bg-green-500/20 text-green-300 border-green-500/30",
  Medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Hard: "bg-red-500/20 text-red-300 border-red-500/30",
  Expert: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const CATEGORY_EMOJI = {
  altitude: "📡",
  payload: "📦",
  efficiency: "⚡",
  speed: "🚀",
  budget: "💰",
  endurance: "⏱️",
};

export default function MissionMode() {
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const generateMission = async () => {
    setLoading(true);
    const recentTitles = history.slice(-5).map((m) => `"${m.title}"`).join(", ");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a unique rocket engineering mission challenge for an educational aerospace simulator.

Previous missions (do NOT repeat): ${recentTitles || "none"}.

The mission should be solvable using these tools:
- Rocket Builder (select engines, fuel tanks, nose cones, structural parts)
- Physics Simulator (inputs: thrust in Newtons, fuel in kg, dry mass in kg, burn rate in kg/s)

Return a JSON object with:
- "title": short mission name (max 6 words)
- "category": one of [altitude, payload, efficiency, speed, budget, endurance]
- "difficulty": one of [Easy, Medium, Hard, Expert]
- "briefing": 2-3 sentence mission story/context (engaging, space-themed)
- "objective": single clear goal sentence (e.g. "Reach an altitude of 50,000 m")
- "constraints": array of 2-4 specific engineering constraints (e.g. "Max total mass: 2,000 kg", "Fuel limited to 300 kg", "Must use at least one Merlin Engine")
- "success_criteria": array of 2-3 measurable conditions to win (e.g. "Altitude ≥ 50,000 m", "TWR ≥ 1.5 at liftoff")
- "hint": one short engineering tip to help the user (1 sentence)
- "suggested_thrust_range": string like "10,000 – 30,000 N"
- "suggested_fuel_range": string like "200 – 600 kg"`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          category: { type: "string" },
          difficulty: { type: "string" },
          briefing: { type: "string" },
          objective: { type: "string" },
          constraints: { type: "array", items: { type: "string" } },
          success_criteria: { type: "array", items: { type: "string" } },
          hint: { type: "string" },
          suggested_thrust_range: { type: "string" },
          suggested_fuel_range: { type: "string" },
        },
        required: ["title", "category", "difficulty", "briefing", "objective", "constraints", "success_criteria", "hint"],
      },
    });

    saveMission(result);
    setMission(result);
    setHistory((prev) => [...prev, result]);
    setLoading(false);
  };

  return (
    <PageShell title="Mission Mode">
      <div className="space-y-5">
        {/* Header */}
        <Card className="border-red-500/30 bg-gradient-to-br from-red-600/15 via-orange-600/8 to-transparent overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
          <CardContent className="pt-5 pb-4 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-red-500/20">
                <Target className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground">AI Mission Control</h2>
                <p className="text-xs text-muted-foreground">Unlimited AI-generated engineering challenges</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each mission gives you an objective and engineering constraints. Use the Rocket Builder and Simulator to complete it.
            </p>
          </CardContent>
        </Card>

        {/* Generate button */}
        <Button
          onClick={generateMission}
          disabled={loading}
          className="w-full h-12 font-heading font-semibold text-base bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white border-0"
        >
          {loading ? (
            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating Mission...</>
          ) : (
            <><Target className="w-4 h-4 mr-2" />{mission ? "Generate New Mission" : "Generate Mission"}</>
          )}
        </Button>

        {/* Loading skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-border/50 bg-card/60">
                <CardContent className="pt-5 pb-5 space-y-3">
                  <div className="h-5 bg-secondary/80 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-secondary/60 rounded animate-pulse" />
                  <div className="h-3 bg-secondary/60 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-secondary/60 rounded animate-pulse w-3/5" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mission Card */}
        <AnimatePresence mode="wait">
          {mission && !loading && (
            <motion.div
              key={mission.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-4"
            >
              {/* Mission header */}
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-600/12 to-transparent overflow-hidden">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{CATEGORY_EMOJI[mission.category] || "🎯"}</span>
                        <h3 className="font-heading font-bold text-foreground text-lg leading-tight">{mission.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`text-xs border ${DIFFICULTY_COLORS[mission.difficulty] || DIFFICULTY_COLORS.Medium}`}>
                          {mission.difficulty}
                        </Badge>
                        <Badge className="text-xs border bg-secondary/40 text-muted-foreground border-border capitalize">
                          {mission.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">{mission.briefing}</p>
                </CardContent>
              </Card>

              {/* Objective */}
              <Card className="border-blue-500/25 bg-gradient-to-br from-blue-600/10 to-transparent">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-heading font-semibold uppercase tracking-wider text-blue-400 mb-2">🎯 Primary Objective</p>
                  <p className="text-sm font-medium text-foreground">{mission.objective}</p>
                </CardContent>
              </Card>

              {/* Constraints */}
              <Card className="border-orange-500/25 bg-gradient-to-br from-orange-600/10 to-transparent">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-heading font-semibold uppercase tracking-wider text-orange-400 mb-3">⚠️ Constraints</p>
                  <ul className="space-y-2">
                    {mission.constraints.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Success Criteria */}
              <Card className="border-green-500/25 bg-gradient-to-br from-green-600/10 to-transparent">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-heading font-semibold uppercase tracking-wider text-green-400 mb-3">✅ Success Criteria</p>
                  <ul className="space-y-2">
                    {mission.success_criteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Suggested ranges + hint */}
              <Card className="border-purple-500/25 bg-gradient-to-br from-purple-600/10 to-transparent">
                <CardContent className="pt-4 pb-4 space-y-3">
                  {(mission.suggested_thrust_range || mission.suggested_fuel_range) && (
                    <div>
                      <p className="text-xs font-heading font-semibold uppercase tracking-wider text-purple-400 mb-2">💡 Suggested Ranges</p>
                      <div className="grid grid-cols-2 gap-2">
                        {mission.suggested_thrust_range && (
                          <div className="text-xs bg-secondary/40 rounded-lg p-2">
                            <p className="text-muted-foreground">Thrust</p>
                            <p className="font-heading font-semibold text-foreground">{mission.suggested_thrust_range}</p>
                          </div>
                        )}
                        {mission.suggested_fuel_range && (
                          <div className="text-xs bg-secondary/40 rounded-lg p-2">
                            <p className="text-muted-foreground">Fuel</p>
                            <p className="font-heading font-semibold text-foreground">{mission.suggested_fuel_range}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-heading font-semibold uppercase tracking-wider text-purple-400 mb-1">🔧 Engineering Hint</p>
                    <p className="text-sm text-muted-foreground">{mission.hint}</p>
                  </div>
                </CardContent>
              </Card>

              {/* CTA buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Link to="/builder">
                  <Button variant="outline" className="w-full h-11 font-heading font-semibold border-border hover:bg-secondary">
                    <Rocket className="w-4 h-4 mr-2" /> Build Rocket
                  </Button>
                </Link>
                <Link to="/simulator">
                  <Button className="w-full h-11 font-heading font-semibold bg-primary hover:bg-primary/90">
                    <ChevronRight className="w-4 h-4 mr-2" /> Go to Sim
                  </Button>
                </Link>
              </div>

              {history.length > 1 && (
                <p className="text-center text-xs text-muted-foreground">{history.length} missions generated this session</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
