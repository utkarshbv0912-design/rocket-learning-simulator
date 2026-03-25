import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Weight, Zap, Package } from "lucide-react";

const G = 9.81; // m/s²

function calcStats(stages) {
  const totalMass = stages.reduce((sum, c) => sum + c.mass, 0); // kg dry
  const fuelMass = stages.reduce((sum, c) => sum + (c.fuelMass || 0), 0);
  const payloadCapacity = stages.reduce((sum, c) => sum + (c.payload || 0), 0);
  const totalThrust = stages.reduce((sum, c) => sum + (c.thrust || 0), 0); // N

  const grossMass = totalMass + fuelMass + payloadCapacity;
  const weight = grossMass * G; // N
  const twr = weight > 0 ? totalThrust / weight : 0;

  // Weighted avg ISP
  const engineStages = stages.filter((c) => c.isp > 0);
  const avgIsp = engineStages.length > 0
    ? engineStages.reduce((sum, c) => sum + c.isp * c.thrust, 0) /
      engineStages.reduce((sum, c) => sum + c.thrust, 1)
    : 0;

  return { totalMass, fuelMass, payloadCapacity, totalThrust, twr, avgIsp, grossMass };
}

function StatItem({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
      <div className={`p-1.5 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground font-heading">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60">{sub}</p>}
      </div>
      <p className="text-sm font-heading font-bold text-foreground">{value}</p>
    </div>
  );
}

function TwrBar({ twr }) {
  const capped = Math.min(twr, 5);
  const pct = (capped / 5) * 100;
  const color = twr >= 1.5 ? "bg-green-500" : twr >= 1 ? "bg-amber-500" : "bg-red-500";
  const label = twr >= 1.5 ? "Good liftoff" : twr >= 1 ? "Marginal — barely lifts off" : "Too low — won't launch";

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Thrust-to-Weight Ratio</span>
        <span className={twr >= 1.5 ? "text-green-400" : twr >= 1 ? "text-amber-400" : "text-red-400"}>
          {twr.toFixed(2)} — {label}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground/50 mt-0.5">
        <span>0</span><span>1 (orbit min)</span><span>5+</span>
      </div>
    </div>
  );
}

export default function BuildStats({ stages }) {
  if (stages.length === 0) return null;

  const { totalMass, fuelMass, payloadCapacity, totalThrust, twr, avgIsp, grossMass } = calcStats(stages);

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-cyan-600/10 to-transparent">
      <CardContent className="pt-5 pb-4">
        <p className="text-sm font-heading font-semibold text-accent mb-3">Performance Stats</p>

        <StatItem
          icon={Weight}
          label="Gross Liftoff Mass"
          value={`${(grossMass / 1000).toFixed(1)} t`}
          color="bg-slate-500/20 text-slate-300"
          sub={`${(totalMass / 1000).toFixed(1)} t dry + ${(fuelMass / 1000).toFixed(1)} t fuel`}
        />
        <StatItem
          icon={Package}
          label="Payload Capacity"
          value={payloadCapacity > 0 ? `${(payloadCapacity / 1000).toFixed(2)} t` : "—"}
          color="bg-blue-500/20 text-blue-300"
        />
        <StatItem
          icon={Zap}
          label="Total Thrust"
          value={totalThrust > 0 ? `${(totalThrust / 1000).toFixed(0)} kN` : "—"}
          color="bg-purple-500/20 text-purple-300"
        />
        <StatItem
          icon={Gauge}
          label="Avg. Engine ISP"
          value={avgIsp > 0 ? `${avgIsp.toFixed(0)} s` : "—"}
          color="bg-emerald-500/20 text-emerald-300"
          sub="Specific impulse = efficiency"
        />

        {totalThrust > 0 && <TwrBar twr={twr} />}

        {totalThrust === 0 && (
          <p className="text-xs text-muted-foreground mt-3 italic">Add engines to calculate thrust & TWR</p>
        )}
      </CardContent>
    </Card>
  );
}
