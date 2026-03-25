import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle, AlertCircle, RefreshCw, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const MISSION_KEY = "rocketlab_active_mission";

export function saveMission(mission) {
  localStorage.setItem(MISSION_KEY, JSON.stringify(mission));
}
export function loadMission() {
  try { return JSON.parse(localStorage.getItem(MISSION_KEY) || "null"); } catch { return null; }
}
export function clearMission() {
  localStorage.removeItem(MISSION_KEY);
}

const DIFFICULTY_COLORS = {
  Easy: "text-green-400 border-green-500/30 bg-green-500/10",
  Medium: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  Hard: "text-red-400 border-red-500/30 bg-red-500/10",
  Expert: "text-purple-400 border-purple-500/30 bg-purple-500/10",
};

export default function MissionPanel({ simResults, onMissionChange }) {
  const [mission, setMission] = useState(loadMission);
  const [open, setOpen] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const generateMission = async () => {
    setGenerating(true);
    setEvaluation(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a unique rocket engineering mission challenge for an educational aerospace simulator.
The mission should be solvable using: thrust (N), fuel (kg), dry mass (kg), burn rate (kg/s).
Return JSON with: title (string), difficulty (Easy/Medium/Hard/Expert), objective (string), constraints (array of strings, 2-4 items), success_criteria (array of strings, 2-3 items), hint (string), suggested_thrust_range (string), suggested_fuel_range (string).`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          difficulty: { type: "string" },
          objective: { type: "string" },
          constraints: { type: "array", items: { type: "string" } },
          success_criteria: { type: "array", items: { type: "string" } },
          hint: { type: "string" },
          suggested_thrust_range: { type: "string" },
          suggested_fuel_range: { type: "string" },
        },
        required: ["title", "difficulty", "objective", "constraints", "success_criteria", "hint"],
      },
    });
    saveMission(result);
    setMission(result);
    setGenerating(false);
    onMissionChange?.(result);
  };

  const checkRequirements = async () => {
    if (!simResults || !mission) return;
    setEvaluating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Evaluate if this rocket simulation meets the mission requirements.

Mission: "${mission.title}"
Objective: ${mission.objective}
Constraints: ${mission.constraints.join("; ")}
Success Criteria: ${mission.success_criteria.join("; ")}

Simulation Results:
- Max Altitude: ${simResults.maxHeight?.toFixed(0)} m
- Max Velocity: ${simResults.maxVelocity?.toFixed(1)} m/s
- Total Flight Time: ${simResults.totalTime?.toFixed(1)} s
- Thrust: ${simResults.thrust} N
- Fuel: ${simResults.fuel} kg
- Dry Mass: ${simResults.rocketMass} kg
- TWR: ${simResults.twr?.toFixed(2)}

Evaluate each success criterion. Be brief and encouraging for students.
Return JSON: { passed: boolean, score: number (0-100), summary: string (1-2 sentences), criteria_results: array of { criterion: string, passed: boolean, note: string } }`,
      response_json_schema: {
        type: "object",
        properties: {
          passed: { type: "boolean" },
          score: { type: "number" },
          summary: { type: "string" },
          criteria_results: {
            type: "array",
            items: {
              type: "object",
              properties: { criterion: { type: "string" }, passed: { type: "boolean" }, note: { type: "string" } },
            },
          },
        },
        required: ["passed", "score", "summary", "criteria_results"],
      },
    });
    setEvaluation(result);
    setEvaluating(false);
  };

  const dismiss = () => { clearMission(); setMission(null); setEvaluation(null); onMissionChange?.(null); };

  if (!mission && !generating) {
    return (
      <button
        onClick={generateMission}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 bg-red-600/10 hover:bg-red-600/20 transition-colors text-sm font-heading font-semibold text-red-400"
      >
        <Target className="w-4 h-4" /> Start a Mission
      </button>
    );
  }

  return (
    <Card className="border-red-500/25 bg-gradient-to-br from-red-600/10 to-transparent overflow-hidden">
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 flex-1">
            <Target className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm font-heading font-bold text-foreground truncate">
              {generating ? "Generating mission…" : (mission?.title || "Mission")}
            </span>
            {mission?.difficulty && (
              <span className={`text-xs border rounded-full px-1.5 py-0.5 font-heading font-semibold shrink-0 ${DIFFICULTY_COLORS[mission.difficulty]}`}>
                {mission.difficulty}
              </span>
            )}
            {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />}
          </button>
          <button onClick={dismiss} className="ml-2 text-muted-foreground/50 hover:text-muted-foreground shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <AnimatePresence>
          {open && mission && !generating && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">

              {/* Objective */}
              <div className="bg-secondary/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground font-heading uppercase tracking-wide mb-1">🎯 Objective</p>
                <p className="text-sm text-foreground">{mission.objective}</p>
              </div>

              {/* Constraints */}
              <div>
                <p className="text-xs text-muted-foreground font-heading uppercase tracking-wide mb-2">⚠️ Constraints</p>
                <ul className="space-y-1">
                  {mission.constraints?.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                      <AlertCircle className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" /> {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Success criteria */}
              <div>
                <p className="text-xs text-muted-foreground font-heading uppercase tracking-wide mb-2">✅ Success Criteria</p>
                <ul className="space-y-1">
                  {mission.success_criteria?.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                      <CheckCircle className="w-3 h-3 text-green-400 shrink-0 mt-0.5" /> {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hint */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2.5">
                <p className="text-xs text-purple-300">💡 {mission.hint}</p>
              </div>

              {/* Suggested ranges */}
              {(mission.suggested_thrust_range || mission.suggested_fuel_range) && (
                <div className="grid grid-cols-2 gap-2">
                  {mission.suggested_thrust_range && (
                    <div className="text-xs bg-secondary/40 rounded-lg p-2">
                      <p className="text-muted-foreground">Thrust range</p>
                      <p className="font-heading font-semibold text-foreground">{mission.suggested_thrust_range}</p>
                    </div>
                  )}
                  {mission.suggested_fuel_range && (
                    <div className="text-xs bg-secondary/40 rounded-lg p-2">
                      <p className="text-muted-foreground">Fuel range</p>
                      <p className="font-heading font-semibold text-foreground">{mission.suggested_fuel_range}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Evaluation result */}
              {evaluation && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg p-3 border ${evaluation.passed ? "border-green-500/30 bg-green-600/10" : "border-red-500/30 bg-red-600/10"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {evaluation.passed
                      ? <CheckCircle className="w-4 h-4 text-green-400" />
                      : <AlertCircle className="w-4 h-4 text-red-400" />}
                    <span className={`text-sm font-heading font-bold ${evaluation.passed ? "text-green-300" : "text-red-300"}`}>
                      {evaluation.passed ? "Mission Complete!" : "Mission Failed"} — {evaluation.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{evaluation.summary}</p>
                  <ul className="space-y-1">
                    {evaluation.criteria_results?.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs">
                        {r.passed
                          ? <CheckCircle className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                          : <AlertCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />}
                        <span className={r.passed ? "text-green-300" : "text-red-300"}>{r.note}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {simResults && (
                  <Button onClick={checkRequirements} disabled={evaluating} size="sm" className="flex-1 bg-green-600 hover:bg-green-500 text-white font-heading text-xs">
                    {evaluating ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Checking…</> : <><CheckCircle className="w-3 h-3 mr-1" /> Check Requirements</>}
                  </Button>
                )}
                <Button onClick={generateMission} disabled={generating} size="sm" variant="outline" className="flex-1 border-border font-heading text-xs">
                  {generating ? <><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Loading…</> : <><RefreshCw className="w-3 h-3 mr-1" /> New Mission</>}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
