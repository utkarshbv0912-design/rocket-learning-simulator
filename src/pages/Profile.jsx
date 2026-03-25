import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit2, Check, Trophy, Rocket, BookOpen, Target, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageShell from "../components/PageShell";
import { getProgress, saveProgress, getLevel, ACHIEVEMENTS } from "../utils/userProgress";
import { getSavedRockets } from "../utils/savedRockets";
import { getLaunchHistory } from "../utils/savedRockets";

export default function Profile() {
  const [progress, setProgress] = useState(getProgress);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(progress.name);
  const savedRockets = getSavedRockets();
  const launchHistory = getLaunchHistory();
  const level = getLevel(progress.totalPoints);

  const saveName = () => {
    const p = { ...progress, name: nameInput || "Explorer" };
    saveProgress(p);
    setProgress(p);
    setEditingName(false);
  };

  const nextLevelPoints = (() => {
    const pts = progress.totalPoints;
    if (pts < 40) return 40;
    if (pts < 100) return 100;
    if (pts < 250) return 250;
    if (pts < 500) return 500;
    return null;
  })();

  const unlockedAchs = ACHIEVEMENTS.filter((a) => progress.achievements.includes(a.id));
  const lockedAchs = ACHIEVEMENTS.filter((a) => !progress.achievements.includes(a.id));

  const stats = [
    { icon: Rocket, label: "Launches", value: progress.launchCount || 0, color: "text-blue-400" },
    { icon: BookOpen, label: "Lessons", value: progress.lessonCount || 0, color: "text-emerald-400" },
    { icon: Target, label: "Missions", value: progress.missionCount || 0, color: "text-red-400" },
    { icon: Star, label: "Points", value: progress.totalPoints, color: "text-amber-400" },
  ];

  return (
    <PageShell title="My Profile">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

        {/* Profile card */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-heading font-bold text-white shrink-0">
              {progress.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex gap-2">
                  <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="h-8 text-sm bg-secondary/60" autoFocus onKeyDown={(e) => e.key === "Enter" && saveName()} />
                  <button onClick={saveName} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-foreground text-lg">{progress.name}</h2>
                  <button onClick={() => setEditingName(true)} className="text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
              <div className={`flex items-center gap-1.5 mt-0.5 ${level.color}`}>
                <span>{level.emoji}</span>
                <span className="text-sm font-heading font-semibold">{level.label}</span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{progress.totalPoints} pts</span>
              {nextLevelPoints && <span>Next level: {nextLevelPoints} pts</span>}
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nextLevelPoints ? Math.min(100, (progress.totalPoints / nextLevelPoints) * 100) : 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border/40 bg-secondary/30 p-3 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className={`text-lg font-heading font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Saved rockets */}
        <div className="rounded-2xl border border-border/50 bg-card/60 p-4">
          <p className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-3">💾 Saved Rockets ({savedRockets.length})</p>
          {savedRockets.length === 0
            ? <p className="text-xs text-muted-foreground text-center py-2">No saved rockets yet. Build and save one!</p>
            : savedRockets.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                <span className="text-lg">{r.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-heading font-semibold text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{(r.thrust / 1000).toFixed(0)} kN · {r.fuel} kg fuel</p>
                </div>
              </div>
            ))
          }
        </div>

        {/* Recent launches */}
        <div className="rounded-2xl border border-border/50 bg-card/60 p-4">
          <p className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-3">🚀 Recent Launches ({launchHistory.length})</p>
          {launchHistory.length === 0
            ? <p className="text-xs text-muted-foreground text-center py-2">No launches yet. Run the simulator!</p>
            : launchHistory.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                <span className="text-base">🚀</span>
                <div className="flex-1">
                  <p className="text-sm font-heading font-semibold text-foreground">{r.rocketName}</p>
                  <p className="text-xs text-muted-foreground">{(r.maxHeight / 1000).toFixed(1)} km · {r.maxVelocity?.toFixed(0)} m/s</p>
                </div>
              </div>
            ))
          }
        </div>

        {/* Achievements */}
        <div className="rounded-2xl border border-border/50 bg-card/60 p-4">
          <p className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            🏆 Achievements ({unlockedAchs.length}/{ACHIEVEMENTS.length})
          </p>
          <div className="space-y-2">
            {unlockedAchs.map((a) => (
              <div key={a.id} className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                <span className="text-xl">{a.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-heading font-semibold text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <span className="text-xs font-heading font-bold text-amber-400">+{a.points}</span>
              </div>
            ))}
            {lockedAchs.map((a) => (
              <div key={a.id} className="flex items-center gap-3 bg-secondary/20 border border-border/30 rounded-xl px-3 py-2 opacity-50">
                <span className="text-xl grayscale">{a.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-heading font-semibold text-muted-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground/60">{a.desc}</p>
                </div>
                <span className="text-xs font-heading font-bold text-muted-foreground/50">+{a.points}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </PageShell>
  );
}
