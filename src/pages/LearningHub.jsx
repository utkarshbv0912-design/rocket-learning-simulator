import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Beaker, Trophy, Briefcase, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import QuizCard from "../components/learning/QuizCard";
import CareerCard from "../components/learning/CareerCard";
import { Button } from "@/components/ui/button";

// ── Static Lessons ────────────────────────────────────────────────
const LESSONS = [
  {
    id: "thrust",
    emoji: "🔥",
    title: "Thrust & Newton's Third Law",
    level: "Beginner",
    levelColor: "text-green-400",
    summary: "Every action has an equal and opposite reaction. When hot gas shoots downward out of a rocket engine, the rocket is pushed upward with the same force.",
    body: `Thrust is the force that propels a rocket. It's created by burning fuel and pushing exhaust gases out at high speed.

**Newton's Third Law** states: *For every action, there is an equal and opposite reaction.*

In rockets:
• Burning fuel creates hot gas
• Gas accelerates downward through the nozzle
• The rocket accelerates upward with equal force

**Thrust formula:** F = ṁ × Ve
Where ṁ is mass flow rate (kg/s) and Ve is exhaust velocity (m/s).

**Try it:** In the Simulator, increase burn rate and watch how thrust changes liftoff speed.`,
    experiment: { label: "Try in Simulator", path: "/simulator?thrust=20000&fuel=500&mass=1000&burnRate=10&preset=Newton+Demo" },
    quiz: {
      question: "What does Newton's Third Law say?",
      options: ["Objects fall at the same rate", "Every action has an equal and opposite reaction", "Force equals mass times acceleration", "Energy is always conserved"],
      answer: 1,
      explanation: "Rockets push gas downward and the reaction pushes the rocket upward!"
    }
  },
  {
    id: "twr",
    emoji: "⚖️",
    title: "Thrust-to-Weight Ratio",
    level: "Beginner",
    levelColor: "text-green-400",
    summary: "A rocket can only lift off if its thrust is greater than its weight. The ratio of thrust to weight tells us whether a rocket can fly.",
    body: `The **Thrust-to-Weight Ratio (TWR)** tells you if a rocket has enough thrust to lift off.

TWR = Thrust ÷ (Total Mass × 9.81)

• TWR < 1 → rocket stays on the pad
• TWR = 1 → barely lifts
• TWR > 1.5 → good performance
• TWR > 2 → high performance

**Real examples:**
• Saturn V: TWR ≈ 1.15 at liftoff
• Falcon 9: TWR ≈ 1.35
• Space Shuttle: TWR ≈ 1.5

The simulator shows your TWR in real time — aim for at least 1.2!`,
    experiment: { label: "Check TWR in Simulator", path: "/simulator" },
    quiz: {
      question: "What TWR is needed to lift off?",
      options: ["Greater than 0", "Exactly 1.0", "Greater than 1.0", "Greater than 10.0"],
      answer: 2,
      explanation: "TWR must exceed 1.0 — more thrust than weight — to accelerate upward."
    }
  },
  {
    id: "escape",
    emoji: "🌌",
    title: "Escape Velocity",
    level: "Intermediate",
    levelColor: "text-amber-400",
    summary: "To leave Earth permanently, a rocket must reach 11.2 km/s — the speed at which gravity can no longer pull it back.",
    body: `**Escape velocity** is the minimum speed an object needs to escape a planet's gravity without any further propulsion.

For Earth: **11.2 km/s** (about 40,000 km/h!)

The formula: v_escape = √(2GM/r)

Where:
• G = gravitational constant
• M = planet's mass
• r = distance from center

**Different planets, different speeds:**
• Moon: 2.4 km/s
• Mars: 5.0 km/s
• Jupiter: 60 km/s
• Sun: 618 km/s

To reach orbit you only need ~7.8 km/s — but to leave Earth entirely you need 11.2 km/s.`,
    experiment: { label: "Try Escape in Simulator", path: "/simulator?thrust=10000000&fuel=5000&mass=5000&burnRate=200&preset=Escape+Test" },
    quiz: {
      question: "What is Earth's escape velocity?",
      options: ["7.8 km/s", "9.8 km/s", "11.2 km/s", "30 km/s"],
      answer: 2,
      explanation: "11.2 km/s — anything slower and gravity eventually pulls the object back."
    }
  },
  {
    id: "orbit",
    emoji: "🛰️",
    title: "Orbits & Trajectories",
    level: "Intermediate",
    levelColor: "text-amber-400",
    summary: "An orbit is a continuous free-fall. Satellites aren't floating — they're falling and moving sideways so fast they keep missing the Earth.",
    body: `An **orbit** happens when an object moves sideways fast enough that as it falls toward Earth, the Earth curves away beneath it at the same rate.

**Orbital velocity:** ~7.8 km/s at low Earth orbit

**Types of orbits:**
• **LEO** (Low Earth Orbit) — 200–2000 km, used by ISS
• **MEO** (Medium) — 2000–35,786 km, GPS satellites
• **GEO** (Geostationary) — 35,786 km, stays over same point

**Kepler's laws** govern orbital motion:
1. Orbits are ellipses with the planet at one focus
2. Objects move faster when closer to the planet
3. Orbital period² is proportional to distance³

The Space Map shows your rocket's trajectory after simulation!`,
    experiment: { label: "See orbits on Space Map", path: "/space-map" },
    quiz: {
      question: "What keeps a satellite in orbit?",
      options: ["Anti-gravity engines", "Solar wind pushing it", "Moving sideways fast while falling", "Magnetic fields"],
      answer: 2,
      explanation: "Satellites continuously fall toward Earth but move sideways so fast they keep missing it!"
    }
  },
  {
    id: "staging",
    emoji: "🚀",
    title: "Rocket Staging",
    level: "Advanced",
    levelColor: "text-purple-400",
    summary: "Multi-stage rockets drop empty fuel tanks mid-flight to shed dead weight, allowing the remaining stages to accelerate much faster.",
    body: `**Rocket staging** is the technique of using multiple rocket stages that separate as their fuel runs out.

**Why staging works:**
Empty fuel tanks are heavy and serve no purpose once empty. By dropping them, the remaining rocket is lighter and can accelerate more efficiently.

**Tsiolkovsky Rocket Equation:**
Δv = ve × ln(m0/mf)

Where:
• Δv = change in velocity
• ve = exhaust velocity
• m0 = initial mass
• mf = final mass (after burn)

**Famous staged rockets:**
• Saturn V — 3 stages to reach the Moon
• Falcon 9 — 2 stages + reusable booster
• Space Launch System — 2 stages + boosters

Multi-stage rockets can achieve much higher velocities than single-stage designs.`,
    experiment: { label: "Build staged rocket", path: "/builder" },
    quiz: {
      question: "Why do rockets use multiple stages?",
      options: ["To carry more passengers", "To drop empty tanks and reduce mass mid-flight", "To use different types of fuel", "To make them look cooler"],
      answer: 1,
      explanation: "Dropping empty stages reduces mass, so the rocket can accelerate much more efficiently!"
    }
  },
];

// ── Beginner Missions ─────────────────────────────────────────────
const BEGINNER_MISSIONS = [
  { emoji: "🎓", title: "First Launch", desc: "Build any rocket and press Launch.", goal: "Just get off the ground!", path: "/simulator", levelColor: "text-green-400", level: "Beginner" },
  { emoji: "⛰️", title: "Reach 10 km", desc: "Design a rocket that reaches 10,000 m altitude.", goal: "Max altitude ≥ 10,000 m", path: "/simulator", levelColor: "text-green-400", level: "Beginner" },
  { emoji: "🌍", title: "Edge of Space", desc: "Reach the Kármán line at 100 km altitude.", goal: "Max altitude ≥ 100,000 m", path: "/simulator", levelColor: "text-amber-400", level: "Intermediate" },
  { emoji: "🛰️", title: "Reach Orbital Speed", desc: "Hit 7,800 m/s velocity to enter orbit.", goal: "Max velocity ≥ 7,800 m/s", path: "/simulator", levelColor: "text-amber-400", level: "Intermediate" },
  { emoji: "🌌", title: "Escape Earth", desc: "Reach escape velocity of 11,200 m/s.", goal: "Max velocity ≥ 11,200 m/s", path: "/simulator", levelColor: "text-purple-400", level: "Advanced" },
  { emoji: "💡", title: "Efficient Design", desc: "Reach space (100 km) using under 1,000 kg fuel.", goal: "Altitude ≥ 100k m with fuel ≤ 1,000 kg", path: "/builder", levelColor: "text-purple-400", level: "Advanced" },
];

// ── Careers ───────────────────────────────────────────────────────
const CAREERS = [
  { emoji: "🛸", title: "Aerospace Engineer", tagline: "Design rockets and spacecraft", description: "Aerospace engineers design, build, and test aircraft and spacecraft. They apply physics, math, and materials science to create vehicles that survive extreme conditions.", skills: ["Physics", "Math", "CAD design", "Problem solving"], study: "Aerospace Engineering, Mechanical Engineering, or Physics degree" },
  { emoji: "👨‍🚀", title: "Astronaut", tagline: "Live and work in space", description: "Astronauts conduct scientific experiments in microgravity, perform spacewalks, operate spacecraft systems, and inspire the next generation of space explorers.", skills: ["Physical fitness", "Science", "Piloting", "Teamwork"], study: "STEM degree + military or test pilot experience" },
  { emoji: "🔥", title: "Propulsion Engineer", tagline: "Build the engines that reach space", description: "Propulsion engineers design and optimize rocket engines — the most powerful machines humans have ever built. They work on fuel systems, combustion, and thrust efficiency.", skills: ["Thermodynamics", "Chemistry", "Fluid dynamics", "Math"], study: "Mechanical or Aerospace Engineering with focus on propulsion" },
  { emoji: "🎛️", title: "Mission Control Specialist", tagline: "Guide missions from the ground", description: "Mission controllers monitor every system on a spacecraft in real time. They troubleshoot problems and make critical decisions to keep crew and missions safe.", skills: ["Systems thinking", "Communication", "Coolness under pressure", "Engineering"], study: "Engineering or Science degree + flight controller training" },
  { emoji: "📡", title: "Satellite Engineer", tagline: "Build the tech orbiting Earth right now", description: "Satellite engineers design and operate satellites for communications, GPS, weather, and science. There are over 8,000 satellites in orbit — and the number is growing fast.", skills: ["Electronics", "Orbital mechanics", "Software", "Systems engineering"], study: "Electrical Engineering, Systems Engineering, or Computer Science" },
];

// ── Section toggle ────────────────────────────────────────────────
function Section({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-heading font-semibold text-foreground text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Lesson card ───────────────────────────────────────────────────
function LessonCard({ lesson }) {
  const [open, setOpen] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  return (
    <div className="rounded-2xl border border-border/50 bg-secondary/20 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xl">{lesson.emoji}</span>
          <div className="text-left">
            <p className="text-sm font-heading font-semibold text-foreground">{lesson.title}</p>
            <p className={`text-xs font-heading ${lesson.levelColor}`}>{lesson.level}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-border/30">
              <p className="text-sm text-muted-foreground pt-3 leading-relaxed">{lesson.summary}</p>
              <div className="bg-secondary/40 rounded-xl p-3">
                {lesson.body.split("\n").map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <p key={i} className="text-sm font-heading font-semibold text-foreground mb-1">{line.replace(/\*\*/g, "")}</p>;
                  }
                  if (line.startsWith("• ")) {
                    return <p key={i} className="text-xs text-foreground/80 ml-2 mb-0.5">• {line.slice(2)}</p>;
                  }
                  if (line.startsWith("*") && line.endsWith("*")) {
                    return <p key={i} className="text-xs text-accent italic mb-1">{line.replace(/\*/g, "")}</p>;
                  }
                  return line ? <p key={i} className="text-xs text-foreground/70 leading-relaxed mb-1">{line}</p> : <div key={i} className="h-2" />;
                })}
              </div>
              {lesson.experiment && (
                <Link to={lesson.experiment.path}>
                  <Button size="sm" variant="outline" className="w-full border-accent/40 text-accent hover:bg-accent/10 font-heading">
                    <Beaker className="w-3.5 h-3.5 mr-1.5" /> {lesson.experiment.label}
                  </Button>
                </Link>
              )}
              {!quizDone ? (
                <div>
                  <p className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground mb-2">🧠 Quick Quiz</p>
                  <QuizCard quiz={lesson.quiz} onComplete={(correct) => setQuizDone(true)} />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-400 text-xs font-heading font-semibold">
                  <Trophy className="w-3.5 h-3.5" /> Lesson complete!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function LearningHub() {
  const [careerIdx, setCareerIdx] = useState(0);

  return (
    <PageShell title="Learning Hub">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Hero */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 to-accent/10 p-4 text-center">
          <p className="text-2xl mb-1">🎓</p>
          <h2 className="font-heading font-bold text-foreground">Aerospace Learning Hub</h2>
          <p className="text-xs text-muted-foreground mt-1">Lessons, missions, quizzes & careers — all connected to the simulator.</p>
        </div>

        {/* AI Learning link */}
        <Link to="/ai-learning">
          <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 to-purple-600/10 p-4 flex items-center gap-3 hover:bg-accent/15 transition-colors">
            <span className="text-2xl">🤖</span>
            <div className="flex-1">
              <p className="font-heading font-semibold text-foreground text-sm">AI-Powered Learning</p>
              <p className="text-xs text-muted-foreground">Infinite AI-generated lessons, experiments & challenges</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>

        {/* Lessons */}
        <Section icon={BookOpen} title="Lessons" defaultOpen={true}>
          {LESSONS.map((l) => <LessonCard key={l.id} lesson={l} />)}
        </Section>

        {/* Beginner Missions */}
        <Section icon={Trophy} title="Step-by-Step Missions">
          {BEGINNER_MISSIONS.map((m) => (
            <Link key={m.title} to={m.path}>
              <div className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-3 hover:bg-secondary/50 transition-colors">
                <span className="text-xl shrink-0">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-semibold text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                  <p className={`text-xs font-heading font-semibold mt-0.5 ${m.levelColor}`}>{m.level} — {m.goal}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </Link>
          ))}
        </Section>

        {/* Careers */}
        <Section icon={Briefcase} title="Career Explorer">
          <div className="flex gap-1.5 flex-wrap mb-2">
            {CAREERS.map((c, i) => (
              <button key={c.title} onClick={() => setCareerIdx(i)}
                className={`text-xs px-2.5 py-1 rounded-full border font-heading transition-all ${i === careerIdx ? "border-primary bg-primary/20 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/50"}`}>
                {c.emoji} {c.title.split(" ")[0]}
              </button>
            ))}
          </div>
          <CareerCard career={CAREERS[careerIdx]} />
        </Section>
      </motion.div>
    </PageShell>
  );
}
