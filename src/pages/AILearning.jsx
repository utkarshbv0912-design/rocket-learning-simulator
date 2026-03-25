import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Beaker, Target, ChevronRight, Loader2, RefreshCw, Lock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageShell from "../components/PageShell";
import QuizCard from "../components/learning/QuizCard";
import { base44 } from "@/api/base44Client";
import { checkLessonAchievement } from "../utils/userProgress";
import { showAchievement } from "../components/AchievementToast";

const LEVELS = [
  { id: "beginner", label: "Beginner", emoji: "🌱", desc: "Basic rocket concepts", color: "text-green-400 border-green-500/40 bg-green-500/10" },
  { id: "intermediate", label: "Intermediate", emoji: "🔬", desc: "Physics & orbital mechanics", color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  { id: "advanced", label: "Advanced", emoji: "🛸", desc: "Aerospace engineering", color: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
];

const TABS = [
  { id: "lesson", label: "Lesson", icon: Sparkles },
  { id: "experiment", label: "Experiment", icon: Beaker },
  { id: "challenge", label: "Challenge", icon: Target },
];

// ── Lesson ────────────────────────────────────────────────────────
function LessonSection({ level }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const generate = async () => {
    setLoading(true);
    setLesson(null);
    setQuizDone(false);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a unique ${level} aerospace/rocket science lesson for teenagers (ages 13-18).
Topics can include: rocket propulsion, orbital mechanics, atmospheric reentry, fuel types, Newton's laws applied to rockets, escape velocity, satellite deployment, space exploration history, rocket staging, aerodynamics, propellant chemistry, or any other interesting aerospace concept.
Make it engaging and easy to understand.
Return JSON with:
- title: string
- emoji: single emoji
- summary: string (2-3 sentences, key takeaway)
- sections: array of { heading: string, content: string } (3-4 sections)
- real_example: string (a real rocket or mission that illustrates the concept)
- fun_fact: string
- quiz: { question: string, options: string[4], answer: number (0-3 index), explanation: string }`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          emoji: { type: "string" },
          summary: { type: "string" },
          sections: { type: "array", items: { type: "object", properties: { heading: { type: "string" }, content: { type: "string" } }, required: ["heading", "content"] } },
          real_example: { type: "string" },
          fun_fact: { type: "string" },
          quiz: { type: "object", properties: { question: { type: "string" }, options: { type: "array", items: { type: "string" } }, answer: { type: "number" }, explanation: { type: "string" } }, required: ["question", "options", "answer", "explanation"] },
        },
        required: ["title", "emoji", "summary", "sections", "real_example", "fun_fact", "quiz"],
      },
    });
    setLesson(res);
    setLoading(false);
  };


  return (
    <div className="space-y-3">
      <Button onClick={generate} disabled={loading} className="w-full h-11 font-heading bg-primary hover:bg-primary/90">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating lesson…</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate {level} Lesson</>}
      </Button>
      <AnimatePresence>
        {lesson && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-gradient-to-r from-primary/15 to-accent/10 rounded-2xl border border-primary/25 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{lesson.emoji}</span>
                <div>
                  <h3 className="font-heading font-bold text-foreground text-base">{lesson.title}</h3>
                  <span className={`text-xs font-heading font-semibold ${LEVELS.find(l => l.id === level)?.color.split(" ")[0]}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{lesson.summary}</p>
            </div>

            {lesson.sections?.map((s, i) => (
              <div key={i} className="bg-secondary/30 rounded-xl border border-border/30 p-3">
                <p className="text-xs font-heading font-bold text-primary uppercase tracking-wide mb-1.5">{s.heading}</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{s.content}</p>
              </div>
            ))}

            {lesson.real_example && (
              <div className="bg-accent/10 border border-accent/25 rounded-xl p-3">
                <p className="text-xs font-heading font-semibold text-accent uppercase tracking-wide mb-1">🚀 Real Example</p>
                <p className="text-sm text-foreground/80">{lesson.real_example}</p>
              </div>
            )}
            {lesson.fun_fact && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3">
                <p className="text-xs font-heading font-semibold text-amber-400 uppercase tracking-wide mb-1">⚡ Fun Fact</p>
                <p className="text-sm text-foreground/80">{lesson.fun_fact}</p>
              </div>
            )}

            {lesson.quiz && !quizDone && (
              <div>
                <p className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground mb-2">🧠 Quiz</p>
                <QuizCard quiz={lesson.quiz} onComplete={(correct) => {
                  setQuizDone(true);
                  const achs = checkLessonAchievement();
                  achs.forEach((a) => showAchievement(a));
                }} />
              </div>
            )}
            {quizDone && (
              <div className="flex items-center gap-2 text-green-400 text-sm font-heading font-semibold bg-green-500/10 border border-green-500/25 rounded-xl p-3">
                <CheckCircle className="w-4 h-4" /> Lesson complete! Generate another to keep learning.
              </div>
            )}
            <Button onClick={generate} variant="outline" size="sm" className="w-full border-border font-heading">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> New Lesson
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Experiment ────────────────────────────────────────────────────
function ExperimentSection({ level }) {
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setExp(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a unique ${level} rocket simulator experiment for teenagers. The experiment must be doable in a simple rocket simulator with: thrust (N), fuel mass (kg), dry mass (kg), burn rate (kg/s) as inputs.
Return JSON with:
- title: string
- emoji: single emoji
- concept: string (physics concept being explored)
- hypothesis: string (what students predict will happen)
- steps: array of strings (3-5 clear steps with specific example values for simulator parameters)
- suggested_configs: array of { label: string, thrust: number, fuel: number, mass: number, burnRate: number } (2-3 configs to compare)
- what_to_observe: string
- expected_result: string
- science_explanation: string`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" }, emoji: { type: "string" }, concept: { type: "string" }, hypothesis: { type: "string" },
          steps: { type: "array", items: { type: "string" } },
          suggested_configs: { type: "array", items: { type: "object", properties: { label: { type: "string" }, thrust: { type: "number" }, fuel: { type: "number" }, mass: { type: "number" }, burnRate: { type: "number" } }, required: ["label", "thrust", "fuel", "mass", "burnRate"] } },
          what_to_observe: { type: "string" }, expected_result: { type: "string" }, science_explanation: { type: "string" },
        },
        required: ["title", "emoji", "concept", "hypothesis", "steps", "suggested_configs", "what_to_observe", "expected_result", "science_explanation"],
      },
    });
    setExp(res);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <Button onClick={generate} disabled={loading} className="w-full h-11 font-heading bg-cyan-600 hover:bg-cyan-500 text-white">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating experiment…</> : <><Beaker className="w-4 h-4 mr-2" /> Generate Experiment</>}
      </Button>
      <AnimatePresence>
        {exp && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-gradient-to-r from-cyan-600/15 to-blue-600/10 rounded-2xl border border-cyan-500/25 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{exp.emoji}</span>
                <h3 className="font-heading font-bold text-foreground">{exp.title}</h3>
              </div>
              <p className="text-xs font-heading font-semibold text-cyan-400 uppercase tracking-wide">{exp.concept}</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
              <p className="text-xs font-heading font-semibold text-purple-400 mb-1">💭 Hypothesis</p>
              <p className="text-sm text-foreground/80">{exp.hypothesis}</p>
            </div>

            <div className="bg-secondary/30 rounded-xl border border-border/30 p-3">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide mb-2">📋 Steps</p>
              <ol className="space-y-1.5">
                {exp.steps?.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground/80">
                    <span className="font-heading font-bold text-primary shrink-0">{i + 1}.</span> {step}
                  </li>
                ))}
              </ol>
            </div>

            {exp.suggested_configs?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">🚀 Try These Configs</p>
                {exp.suggested_configs.map((cfg, i) => (
                  <Link key={i} to={`/simulator?thrust=${cfg.thrust}&fuel=${cfg.fuel}&mass=${cfg.mass}&burnRate=${cfg.burnRate}&preset=${encodeURIComponent(cfg.label)}`}>
                    <div className="flex items-center justify-between bg-secondary/40 rounded-xl px-3 py-2.5 hover:bg-secondary/70 transition-colors border border-border/30">
                      <div>
                        <p className="text-sm font-heading font-semibold text-foreground">{cfg.label}</p>
                        <p className="text-xs text-muted-foreground">{(cfg.thrust / 1000).toFixed(0)} kN · {cfg.fuel} kg fuel</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-xs font-heading font-semibold text-amber-400 mb-1">👁️ What to Observe</p>
              <p className="text-sm text-foreground/80">{exp.what_to_observe}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <p className="text-xs font-heading font-semibold text-green-400 mb-1">✅ Expected Result</p>
              <p className="text-sm text-foreground/80">{exp.expected_result}</p>
            </div>
            <div className="bg-secondary/40 border border-border/30 rounded-xl p-3">
              <p className="text-xs font-heading font-semibold text-primary mb-1">🔬 The Science</p>
              <p className="text-sm text-foreground/80">{exp.science_explanation}</p>
            </div>

            <Button onClick={generate} variant="outline" size="sm" className="w-full border-border font-heading">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> New Experiment
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Challenge ─────────────────────────────────────────────────────
function ChallengeSection({ level }) {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setChallenge(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a unique ${level} rocket engineering learning challenge for teenagers. It should combine a real physics/engineering concept with a hands-on simulator task.
Return JSON with:
- title: string
- emoji: single emoji
- science_concept: string (the concept being taught, e.g. "Newton's Third Law")
- story_context: string (brief exciting scenario like "NASA wants to launch a probe...")
- challenge_description: string (what they need to do)
- constraints: array of strings (2-3 rules like "fuel must be under 500kg")
- success_criteria: array of strings (how to know they succeeded)
- science_explanation: string (explains the physics concept in simple terms)
- hint: string
- suggested_thrust_range: string (e.g. "10,000 - 50,000 N")
- suggested_fuel_range: string`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" }, emoji: { type: "string" }, science_concept: { type: "string" }, story_context: { type: "string" },
          challenge_description: { type: "string" }, constraints: { type: "array", items: { type: "string" } },
          success_criteria: { type: "array", items: { type: "string" } },
          science_explanation: { type: "string" }, hint: { type: "string" },
          suggested_thrust_range: { type: "string" }, suggested_fuel_range: { type: "string" },
        },
        required: ["title", "emoji", "science_concept", "story_context", "challenge_description", "constraints", "success_criteria", "science_explanation", "hint"],
      },
    });
    setChallenge(res);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <Button onClick={generate} disabled={loading} className="w-full h-11 font-heading bg-purple-600 hover:bg-purple-500 text-white">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating challenge…</> : <><Target className="w-4 h-4 mr-2" /> Generate Challenge</>}
      </Button>
      <AnimatePresence>
        {challenge && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-gradient-to-r from-purple-600/15 to-red-600/10 rounded-2xl border border-purple-500/25 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{challenge.emoji}</span>
                <div>
                  <h3 className="font-heading font-bold text-foreground">{challenge.title}</h3>
                  <p className="text-xs font-heading font-semibold text-purple-400">{challenge.science_concept}</p>
                </div>
              </div>
              <p className="text-sm text-foreground/70 italic mt-2">{challenge.story_context}</p>
            </div>

            <div className="bg-secondary/30 rounded-xl border border-border/30 p-3">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide mb-1">🎯 Your Challenge</p>
              <p className="text-sm text-foreground/80">{challenge.challenge_description}</p>
            </div>

            {challenge.constraints?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-xs font-heading font-semibold text-red-400 mb-1.5">⚠️ Constraints</p>
                <ul className="space-y-1">{challenge.constraints.map((c, i) => <li key={i} className="text-xs text-foreground/80">• {c}</li>)}</ul>
              </div>
            )}
            {challenge.success_criteria?.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <p className="text-xs font-heading font-semibold text-green-400 mb-1.5">✅ Success Criteria</p>
                <ul className="space-y-1">{challenge.success_criteria.map((c, i) => <li key={i} className="text-xs text-foreground/80">• {c}</li>)}</ul>
              </div>
            )}

            {(challenge.suggested_thrust_range || challenge.suggested_fuel_range) && (
              <div className="grid grid-cols-2 gap-2">
                {challenge.suggested_thrust_range && <div className="bg-secondary/40 rounded-xl p-2 text-xs"><p className="text-muted-foreground">Thrust range</p><p className="font-heading font-semibold text-foreground">{challenge.suggested_thrust_range}</p></div>}
                {challenge.suggested_fuel_range && <div className="bg-secondary/40 rounded-xl p-2 text-xs"><p className="text-muted-foreground">Fuel range</p><p className="font-heading font-semibold text-foreground">{challenge.suggested_fuel_range}</p></div>}
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <p className="text-xs font-heading font-semibold text-blue-400 mb-1">🔬 The Science</p>
              <p className="text-sm text-foreground/80">{challenge.science_explanation}</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-xs font-heading font-semibold text-amber-400 mb-1">💡 Hint</p>
              <p className="text-sm text-foreground/80">{challenge.hint}</p>
            </div>

            <Link to="/simulator">
              <Button className="w-full h-11 font-heading bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0">
                🚀 Try in Simulator
              </Button>
            </Link>
            <Button onClick={generate} variant="outline" size="sm" className="w-full border-border font-heading">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> New Challenge
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AILearning() {
  const [level, setLevel] = useState("beginner");
  const [tab, setTab] = useState("lesson");

  return (
    <PageShell title="AI Learning" backTo="/learning">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Hero */}
        <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 to-purple-600/10 p-4 text-center">
          <p className="text-2xl mb-1">🤖</p>
          <h2 className="font-heading font-bold text-foreground">AI-Powered Learning</h2>
          <p className="text-xs text-muted-foreground mt-1">Infinite lessons, experiments & challenges — generated just for you.</p>
        </div>

        {/* Level selector */}
        <div>
          <p className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your Level</p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button key={l.id} onClick={() => setLevel(l.id)}
                className={`rounded-xl border p-3 text-center transition-all ${level === l.id ? l.color + " ring-2 ring-primary/40" : "border-border/40 bg-secondary/20 hover:bg-secondary/40"}`}>
                <div className="text-lg mb-0.5">{l.emoji}</div>
                <p className="text-xs font-heading font-semibold text-foreground">{l.label}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1.5 bg-secondary/40 rounded-xl p-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-heading font-semibold transition-all ${tab === t.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "lesson" && <LessonSection level={level} />}
        {tab === "experiment" && <ExperimentSection level={level} />}
        {tab === "challenge" && <ChallengeSection level={level} />}
      </motion.div>
    </PageShell>
  );
}
