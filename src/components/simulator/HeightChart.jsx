import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export default function HeightChart({ data }) {
  return (
    <Card className="border-border bg-card/80">
      <CardContent className="pt-5 pb-3">
        <p className="text-sm font-medium text-muted-foreground mb-3 font-heading">
          Height vs Time
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="heightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
              <XAxis
                dataKey="time"
                stroke="hsl(215 20% 55%)"
                fontSize={11}
                label={{ value: "Time (s)", position: "insideBottom", offset: -2, fill: "hsl(215 20% 55%)", fontSize: 10 }}
              />
              <YAxis
                stroke="hsl(215 20% 55%)"
                fontSize={11}
                label={{ value: "Height (m)", angle: -90, position: "insideLeft", fill: "hsl(215 20% 55%)", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(230 20% 11%)",
                  border: "1px solid hsl(230 15% 20%)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(215 20% 55%)" }}
                itemStyle={{ color: "hsl(262 83% 70%)" }}
              />
              <Area
                type="monotone"
                dataKey="height"
                stroke="hsl(262 83% 58%)"
                strokeWidth={2}
                fill="url(#heightGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
