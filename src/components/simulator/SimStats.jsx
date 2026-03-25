import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Clock, Timer, Zap } from "lucide-react";

export default function SimStats({ maxHeight, maxHeightTime, totalTime, maxVelocity }) {
  const stats = [
    { icon: ArrowUp, label: "Max Altitude", value: `${maxHeight.toLocaleString(undefined, { maximumFractionDigits: 0 })} m`, color: "text-purple-400" },
    { icon: Zap, label: "Max Velocity", value: `${(maxVelocity || 0).toFixed(1)} m/s`, color: "text-cyan-400" },
    { icon: Timer, label: "Time to Peak", value: `${maxHeightTime.toFixed(1)} s`, color: "text-blue-400" },
    { icon: Clock, label: "Total Flight", value: `${totalTime.toFixed(1)} s`, color: "text-green-400" },
  ];

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-cyan-600/10 to-transparent">
      <CardContent className="pt-5 pb-4">
        <p className="text-sm font-medium text-accent mb-3 font-heading">
          Flight Summary
        </p>
        <div className="grid grid-cols-2 gap-3">
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
