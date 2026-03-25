import { Trash2, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getLaunchHistory, clearLaunchHistory } from "../../utils/savedRockets";

const STATUS_CONFIG = {
  "Escape Trajectory": { color: "#A855F7", emoji: "🌌" },
  "Orbital":           { color: "#22C55E", emoji: "🛰️" },
  "Suborbital":        { color: "#F59E0B", emoji: "🚀" },
  "High Altitude":     { color: "#F97316", emoji: "⬆️" },
  "Sub-Atmospheric":   { color: "#EF4444", emoji: "💥" },
};

function classifyLaunch(r) {
  if (r.maxVelocity >= 11200) return "Escape Trajectory";
  if (r.maxVelocity >= 7800) return "Orbital";
  if (r.maxHeight >= 100000) return "Suborbital";
  if (r.maxHeight >= 10000) return "High Altitude";
  return "Sub-Atmospheric";
}

export default function LaunchHistory({ onRefresh }) {
  const history = getLaunchHistory();

  if (history.length === 0) {
    return (
      <Card className="border-border/50 bg-card/60">
        <CardContent className="pt-4 pb-4 text-center">
          <Rocket className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No launches yet. Run the simulator to see your flight history here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/60">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground">Past Launches</p>
          <button onClick={() => { clearLaunchHistory(); onRefresh?.(); }} className="text-xs text-muted-foreground/50 hover:text-destructive flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
        <div className="space-y-2">
          {history.map((entry) => {
            const status = classifyLaunch(entry);
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={entry.id} className="flex items-center gap-3 bg-secondary/30 rounded-xl px-3 py-2.5">
                <span className="text-lg shrink-0">{cfg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-heading font-semibold text-foreground truncate">{entry.rocketName}</p>
                  <p className="text-xs font-semibold" style={{ color: cfg.color }}>{status}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-foreground font-heading">{(entry.maxHeight / 1000).toFixed(0)} km</p>
                  <p className="text-xs text-muted-foreground">{entry.maxVelocity?.toFixed(0)} m/s</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
