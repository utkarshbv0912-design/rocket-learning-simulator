import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import PageShell from "../components/PageShell";

export default function RocketCalculator() {
  const [mass, setMass] = useState("");
  const [acceleration, setAcceleration] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const m = parseFloat(mass);
    const a = parseFloat(acceleration);
    if (isNaN(m) || isNaN(a) || m <= 0 || a <= 0) return;
    setResult({
      thrust: m * a,
      mass: m,
      acceleration: a,
    });
  };

  const reset = () => {
    setMass("");
    setAcceleration("");
    setResult(null);
  };

  return (
    <PageShell title="Rocket Calculator">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        {/* Formula Card */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-transparent">
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-muted-foreground text-sm mb-1">Newton's Second Law</p>
            <p className="font-heading text-2xl font-bold text-foreground">
              F = m × a
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Thrust (N) = Mass (kg) × Acceleration (m/s²)
            </p>
          </CardContent>
        </Card>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">
              Mass (kg)
            </Label>
            <Input
              type="number"
              placeholder="e.g. 500"
              value={mass}
              onChange={(e) => setMass(e.target.value)}
              className="bg-secondary/50 border-border h-12 text-lg font-heading"
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">
              Acceleration (m/s²)
            </Label>
            <Input
              type="number"
              placeholder="e.g. 9.8"
              value={acceleration}
              onChange={(e) => setAcceleration(e.target.value)}
              className="bg-secondary/50 border-border h-12 text-lg font-heading"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={calculate}
            disabled={!mass || !acceleration}
            className="flex-1 h-12 text-base font-heading font-semibold bg-primary hover:bg-primary/90"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Calculate
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            className="h-12 px-5 border-border hover:bg-secondary"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Card className="border-accent/30 bg-gradient-to-br from-blue-600/15 to-cyan-600/10 overflow-hidden">
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-accent">Result</span>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Thrust Required</p>
                    <p className="font-heading text-4xl font-bold text-foreground mt-1">
                      {result.thrust.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      <span className="text-lg text-muted-foreground ml-2">N</span>
                    </p>
                  </div>
                  <div className="flex justify-center gap-8 mt-5 pt-4 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Mass</p>
                      <p className="font-heading font-semibold">
                        {result.mass.toLocaleString()} kg
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Acceleration</p>
                      <p className="font-heading font-semibold">
                        {result.acceleration.toLocaleString()} m/s²
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageShell>
  );
}
