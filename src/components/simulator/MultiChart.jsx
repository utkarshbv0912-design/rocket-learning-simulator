import { useState } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

const TABS = [
  { key: "height", label: "Altitude", unit: "m", color: "hsl(262 83% 58%)", gradId: "hGrad" },
  { key: "velocity", label: "Velocity", unit: "m/s", color: "hsl(199 89% 48%)", gradId: "vGrad" },
  { key: "fuel", label: "Fuel", unit: "kg", color: "hsl(142 71% 45%)", gradId: "fGrad" },
];

const tooltipStyle = {
  contentStyle: { background: "hsl(230 20% 11%)", border: "1px solid hsl(230 15% 20%)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "hsl(215 20% 55%)" },
};

export default function MultiChart({ data }) {
  const [active, setActive] = useState("height");
  const tab = TABS.find((t) => t.key === active);

  return (
    <Card className="border-border bg-card/80">
      <CardContent className="pt-4 pb-3">
        {/* Tab bar */}
        <div className="flex gap-1 mb-4 bg-secondary/40 rounded-lg p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`flex-1 text-xs font-heading font-semibold py-1.5 rounded-md transition-all ${
                active === t.key ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={tab.gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tab.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={tab.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
              <XAxis
                dataKey="time"
                stroke="hsl(215 20% 55%)"
                fontSize={10}
                label={{ value: "Time (s)", position: "insideBottom", offset: -2, fill: "hsl(215 20% 55%)", fontSize: 9 }}
              />
              <YAxis
                stroke="hsl(215 20% 55%)"
                fontSize={10}
                label={{ value: `${tab.label} (${tab.unit})`, angle: -90, position: "insideLeft", fill: "hsl(215 20% 55%)", fontSize: 9 }}
                width={55}
              />
              <Tooltip
                {...tooltipStyle}
                itemStyle={{ color: tab.color }}
                formatter={(v) => [`${v} ${tab.unit}`, tab.label]}
              />
              <Area
                type="monotone"
                dataKey={active}
                stroke={tab.color}
                strokeWidth={2}
                fill={`url(#${tab.gradId})`}
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
