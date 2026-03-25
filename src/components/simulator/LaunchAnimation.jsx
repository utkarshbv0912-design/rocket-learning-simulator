import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function LaunchAnimation({ running, done, maxHeight, currentHeight, currentVelocity, fuelPct }) {
  // How high up the rocket is (0 = bottom, 1 = top)
  const progress = maxHeight > 0 ? Math.min(currentHeight / maxHeight, 1) : 0;
  const isFlying = running || (done && currentHeight > 0);
  const showFlame = running && currentVelocity > 0;

  return (
    <Card className="border-border bg-card/60 overflow-hidden">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-4">
          {/* Rocket launch column */}
          <div className="flex flex-col items-center" style={{ height: 140 }}>
            {/* Sky */}
            <div className="flex-1 flex items-end justify-center relative w-12">
              <AnimatePresence>
                {isFlying && (
                  <motion.div
                    key="rocket"
                    initial={{ y: 0 }}
                    animate={{ y: -progress * 90 }}
                    transition={{ type: "spring", stiffness: 60, damping: 20 }}
                    className="absolute bottom-0 flex flex-col items-center"
                  >
                    {/* Rocket SVG */}
                    <svg width="28" height="60" viewBox="0 0 28 60" fill="none">
                      {/* Flame */}
                      {showFlame && (
                        <motion.ellipse
                          cx="14" cy="57" rx="5" ry="6"
                          fill="#F59E0B" opacity="0.9"
                          animate={{ ry: [5, 8, 5], opacity: [0.8, 1, 0.8] }}
                          transition={{ duration: 0.15, repeat: Infinity }}
                        />
                      )}
                      {showFlame && (
                        <motion.ellipse
                          cx="14" cy="54" rx="3" ry="4"
                          fill="#EF4444"
                          animate={{ ry: [3, 5, 3] }}
                          transition={{ duration: 0.1, repeat: Infinity }}
                        />
                      )}
                      {/* Body */}
                      <path d="M10 48 L10 22 Q14 4 18 22 L18 48 Z" fill="url(#bodyGrad)" stroke="hsl(262 83% 58%)" strokeWidth="0.5" />
                      {/* Window */}
                      <circle cx="14" cy="26" r="3.5" fill="#0EA5E9" stroke="#38BDF8" strokeWidth="0.8" />
                      <circle cx="13" cy="25" r="1.2" fill="white" opacity="0.4" />
                      {/* Fins */}
                      <path d="M10 42 L4 50 L10 46 Z" fill="hsl(262 83% 58%)" />
                      <path d="M18 42 L24 50 L18 46 Z" fill="hsl(262 83% 58%)" />
                      <defs>
                        <linearGradient id="bodyGrad" x1="10" y1="48" x2="18" y2="8" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#94A3B8" />
                          <stop offset="1" stopColor="#E2E8F0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ground line */}
              <div className="absolute bottom-0 w-12 h-0.5 bg-border rounded" />
            </div>
          </div>

          {/* Live metrics */}
          <div className="flex-1 space-y-2.5 pt-1">
            <LiveMetric label="Altitude" value={`${Math.max(0, currentHeight).toFixed(0)} m`} color="text-purple-400" pct={progress} barColor="bg-purple-500" />
            <LiveMetric label="Velocity" value={`${currentVelocity.toFixed(1)} m/s`} color="text-blue-400" pct={Math.min(Math.abs(currentVelocity) / 1000, 1)} barColor="bg-blue-500" />
            <LiveMetric label="Fuel" value={`${(fuelPct * 100).toFixed(0)}%`} color={fuelPct > 0.3 ? "text-green-400" : fuelPct > 0.1 ? "text-amber-400" : "text-red-400"} pct={fuelPct} barColor={fuelPct > 0.3 ? "bg-green-500" : fuelPct > 0.1 ? "bg-amber-500" : "bg-red-500"} />
          </div>
        </div>

        {done && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-muted-foreground mt-3">
            🏁 Mission Complete
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
}

function LiveMetric({ label, value, color, pct, barColor }) {
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-xs text-muted-foreground font-heading">{label}</span>
        <span className={`text-xs font-heading font-bold ${color}`}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: "tween", duration: 0.1 }}
        />
      </div>
    </div>
  );
}
