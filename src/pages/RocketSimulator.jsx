import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, RotateCcw, Play, Square, ChevronDown, ChevronUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import PageShell from "../components/PageShell";
import PresetSelector from "../components/simulator/PresetSelector";
import LaunchAnimation from "../components/simulator/LaunchAnimation";
import MultiChart from "../components/simulator/MultiChart";
import SimStats from "../components/simulator/SimStats";
import MissionPanel from "../components/simulator/MissionPanel";
import SaveRocketModal from "../components/simulator/SaveRocketModal";
import { addLaunchToHistory } from "../utils/savedRockets";
import { checkLaunchAchievements } from "../utils/userProgress";
import { showAchievement } from "../components/AchievementToast";

const GRAVITY = 9.81;
const DT = 0.1;

export default function RocketSimulator() {
  const [thrust, setThrust] = useState("");
  const [fuel, setFuel] = useState("");
  const [rocketMass, setRocketMass] = useState("");
  const [burnRate, setBurnRate] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showPresets, setShowPresets] = useState(true);

  // Accept params from Rocket Builder via URL
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("thrust")) {
      setThrust(p.get("thrust"));
      setFuel(p.get("fuel") || "");
      setRocketMass(p.get("mass") || "");
      setBurnRate(p.get("burnRate") || "");
      const name = p.get("preset") || "Custom Build";
      setSelectedPreset({ name, emoji: "🔧" });
      setShowPresets(false);
    }
  }, []);

  const [simData, setSimData] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [currentState, setCurrentState] = useState({ height: 0, velocity: 0, fuel: 0, initialFuel: 1 });
  const [showMission, setShowMission] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetRefreshKey, setPresetRefreshKey] = useState(0);

  const intervalRef = useRef(null);
  const stateRef = useRef(null);

  const applyPreset = (preset) => {
    setSelectedPreset(preset);
    setThrust(String(preset.thrust));
    setFuel(String(preset.fuel));
    setRocketMass(String(preset.mass));
    setBurnRate(String(preset.burnRate));
    setShowPresets(false);
  };

  const startSim = useCallback(() => {
    const thrustN = parseFloat(thrust);
    const fuelKg = parseFloat(fuel);
    const dryMass = parseFloat(rocketMass) || 1000;
    const br = parseFloat(burnRate) || 10;
    if (isNaN(thrustN) || isNaN(fuelKg) || thrustN <= 0 || fuelKg <= 0) return;

    setSimData([{ time: 0, height: 0, velocity: 0, fuel: fuelKg }]);
    setDone(false);
    setRunning(true);
    setCurrentState({ height: 0, velocity: 0, fuel: fuelKg, initialFuel: fuelKg });

    stateRef.current = { t: 0, h: 0, v: 0, fuelRemaining: fuelKg, initialFuel: fuelKg, dryMass, br };

    intervalRef.current = setInterval(() => {
      const s = stateRef.current;
      const totalMass = s.dryMass + s.fuelRemaining;
      let accel;
      if (s.fuelRemaining > 0) {
        accel = thrustN / totalMass - GRAVITY;
        s.fuelRemaining = Math.max(0, s.fuelRemaining - s.br * DT);
      } else {
        accel = -GRAVITY;
      }
      s.v += accel * DT;
      s.h += s.v * DT;
      s.t += DT;

      if (s.h <= 0 && s.t > DT * 2) {
        s.h = 0; s.v = 0;
        clearInterval(intervalRef.current);
        setRunning(false);
        setDone(true);
      }

      const point = {
        time: parseFloat(s.t.toFixed(1)),
        height: Math.max(0, parseFloat(s.h.toFixed(1))),
        velocity: parseFloat(s.v.toFixed(1)),
        fuel: parseFloat(s.fuelRemaining.toFixed(1)),
      };
      setCurrentState({ height: point.height, velocity: point.velocity, fuel: point.fuel, initialFuel: s.initialFuel });
      setSimData((prev) => [...prev, point]);
    }, 30);
  }, [thrust, fuel, rocketMass, burnRate]);

  const stopSim = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDone(true);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setThrust(""); setFuel(""); setRocketMass(""); setBurnRate("");
    setSelectedPreset(null); setShowPresets(true);
    setSimData([]); setRunning(false); setDone(false);
    setCurrentState({ height: 0, velocity: 0, fuel: 0, initialFuel: 1 });
  };

  const maxHeight = simData.length > 0 ? Math.max(...simData.map((d) => d.height)) : 0;
  const maxHeightTime = simData.find((d) => d.height === maxHeight)?.time || 0;
  const totalTime = simData.length > 0 ? simData[simData.length - 1].time : 0;
  const maxVelocity = simData.length > 0 ? Math.max(...simData.map((d) => d.velocity)) : 0;
  const fuelPct = currentState.initialFuel > 0 ? Math.max(0, currentState.fuel / currentState.initialFuel) : 0;

  // Physics summary
  const thrustN = parseFloat(thrust) || 0;
  const dryMass = parseFloat(rocketMass) || 1000;
  const fuelKg = parseFloat(fuel) || 0;
  const grossMass = dryMass + fuelKg;
  const twr = grossMass > 0 ? thrustN / (grossMass * GRAVITY) : 0;
  const burnTime = (parseFloat(burnRate) || 10) > 0 ? fuelKg / (parseFloat(burnRate) || 10) : 0;

  const simResults = done && simData.length > 1 ? {
    maxHeight, maxVelocity, totalTime, thrust: thrustN, fuel: fuelKg, rocketMass: dryMass, twr
  } : null;

  // Save to localStorage for Space Map + history
  useEffect(() => {
    if (simResults) {
      localStorage.setItem("rocketlab_last_launch", JSON.stringify(simResults));
      addLaunchToHistory(simResults, selectedPreset?.name || "Custom Rocket");
      const newAchs = checkLaunchAchievements(simResults);
      newAchs.forEach((a) => showAchievement(a));
    }
  }, [done]);

  return (
    <PageShell title="Rocket Simulator">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

        {/* Mission Panel */}
        <div>
          <button
            onClick={() => setShowMission((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-red-500/25 bg-red-600/8 hover:bg-red-600/15 transition-colors mb-3"
          >
            <span className="text-sm font-heading font-semibold text-red-400">🎯 Mission Mode</span>
            {showMission ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showMission && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
                <MissionPanel simResults={simResults} onMissionChange={() => {}} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Presets toggle */}
        <button
          onClick={() => setShowPresets((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <span className="text-sm font-heading font-semibold text-foreground">
            {selectedPreset ? `Preset: ${selectedPreset.emoji} ${selectedPreset.name}` : "Choose a Preset"}
          </span>
          {showPresets ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showPresets && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <PresetSelector onSelect={applyPreset} selected={selectedPreset} refreshKey={presetRefreshKey} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Thrust (N)</Label>
            <Input type="number" placeholder="e.g. 20000" value={thrust} onChange={(e) => setThrust(e.target.value)} disabled={running} className="bg-secondary/50 border-border h-10 font-heading text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Fuel (kg)</Label>
            <Input type="number" placeholder="e.g. 500" value={fuel} onChange={(e) => setFuel(e.target.value)} disabled={running} className="bg-secondary/50 border-border h-10 font-heading text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Dry Mass (kg)</Label>
            <Input type="number" placeholder="e.g. 1000" value={rocketMass} onChange={(e) => setRocketMass(e.target.value)} disabled={running} className="bg-secondary/50 border-border h-10 font-heading text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Burn Rate (kg/s)</Label>
            <Input type="number" placeholder="e.g. 10" value={burnRate} onChange={(e) => setBurnRate(e.target.value)} disabled={running} className="bg-secondary/50 border-border h-10 font-heading text-sm" />
          </div>
        </div>

        {/* Pre-launch physics */}
        {thrustN > 0 && (
          <Card className="border-border/50 bg-secondary/20">
            <CardContent className="pt-3 pb-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">TWR</p>
                  <p className={`text-sm font-heading font-bold ${twr >= 1 ? "text-green-400" : "text-red-400"}`}>{twr.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Burn Time</p>
                  <p className="text-sm font-heading font-bold text-blue-400">{burnTime.toFixed(1)}s</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gross Mass</p>
                  <p className="text-sm font-heading font-bold text-foreground">{(grossMass / 1000).toFixed(2)}t</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {!running ? (
            <Button onClick={startSim} disabled={!thrust || !fuel} className="flex-1 h-11 font-heading font-semibold bg-primary hover:bg-primary/90">
              <Play className="w-4 h-4 mr-2" /> Launch
            </Button>
          ) : (
            <Button onClick={stopSim} variant="destructive" className="flex-1 h-11 font-heading font-semibold">
              <Square className="w-4 h-4 mr-2" /> Stop
            </Button>
          )}
          <Button onClick={reset} variant="outline" className="h-11 px-5 border-border hover:bg-secondary">
            <RotateCcw className="w-4 h-4" />
          </Button>
          {thrust && fuel && !running && (
            <Button onClick={() => setShowSaveModal(true)} variant="outline" className="h-11 px-4 border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/10">
              <Save className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Live Launch Animation */}
        <AnimatePresence>
          {(running || done) && simData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LaunchAnimation
                running={running}
                done={done}
                maxHeight={maxHeight}
                currentHeight={currentState.height}
                currentVelocity={currentState.velocity}
                fuelPct={fuelPct}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multi-tab Charts */}
        <AnimatePresence>
          {simData.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <MultiChart data={simData} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <AnimatePresence>
          {done && simData.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <SimStats maxHeight={maxHeight} maxHeightTime={maxHeightTime} totalTime={totalTime} maxVelocity={maxVelocity} />
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      <SaveRocketModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        params={{ thrust: parseFloat(thrust), fuel: parseFloat(fuel), mass: parseFloat(rocketMass) || 1000, burnRate: parseFloat(burnRate) || 10 }}
        onSaved={() => setPresetRefreshKey((k) => k + 1)}
      />
    </PageShell>
  );
}
