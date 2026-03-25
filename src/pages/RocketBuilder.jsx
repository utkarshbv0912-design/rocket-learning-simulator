import { useState } from "react";
import SaveRocketModal from "../components/simulator/SaveRocketModal";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "../components/PageShell";
import ComponentPalette from "../components/builder/ComponentPalette";
import RocketVisual from "../components/builder/RocketVisual";
import BuildStats from "../components/builder/BuildStats";

export default function RocketBuilder() {
  const [stages, setStages] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const navigate = useNavigate();

  const addComponent = (component) => {
    setStages((prev) => [...prev, { ...component, id: Date.now() + Math.random() }]);
  };

  const removeComponent = (id) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
  };

  const reset = () => setStages([]);

  // Calculate sim params from the built rocket
  const launchInSimulator = () => {
    const totalThrust = stages.reduce((s, c) => s + (c.thrust || 0), 0);
    const dryMass = stages.reduce((s, c) => s + c.mass, 0);
    const fuelMass = stages.reduce((s, c) => s + (c.fuelMass || 0), 0);
    // Estimate burn rate: total fuel / (ISP * ln mass ratio) rough approximation — use fixed 10% of max stage fuel rate
    const totalBurnRate = stages.filter((c) => c.isp > 0).reduce((s, c) => s + (c.fuelMass ? c.fuelMass / 30 : 0), 10);
    const params = new URLSearchParams({
      thrust: String(Math.round(totalThrust)),
      fuel: String(Math.round(fuelMass)),
      mass: String(Math.round(dryMass)),
      burnRate: String(Math.round(Math.max(5, totalBurnRate))),
      preset: "Built Rocket",
    });
    navigate(`/simulator?${params.toString()}`);
  };

  const hasEngines = stages.some((s) => s.thrust > 0);
  const hasFuel = stages.some((s) => (s.fuelMass || 0) > 0);

  return (
    <PageShell title="Rocket Builder">
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Tap components to assemble your rocket. The visual updates as you build.
        </p>

        <ComponentPalette onAdd={addComponent} />

        {/* Rocket Visual Assembly */}
        <div className="rounded-2xl border border-border bg-gradient-to-b from-secondary/30 to-card/80 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-sm font-heading font-semibold text-foreground">Assembly Preview</p>
            {stages.length > 0 && (
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                Reset
              </button>
            )}
          </div>
          <RocketVisual stages={stages} onRemove={removeComponent} />
        </div>

        <BuildStats stages={stages} />

        {/* Launch in Simulator button */}
        {stages.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Button
              onClick={launchInSimulator}
              disabled={!hasEngines || !hasFuel}
              className="w-full h-12 font-heading font-semibold text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Launch in Simulator
            </Button>
            <Button
              onClick={() => setShowSaveModal(true)}
              disabled={!hasEngines || !hasFuel}
              variant="outline"
              className="w-full h-11 font-heading font-semibold border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/10"
            >
              💾 Save Rocket as Preset
            </Button>
            {(!hasEngines || !hasFuel) && (
              <p className="text-xs text-center text-muted-foreground">
                {!hasEngines ? "Add an engine to launch" : "Add a fuel tank to launch"}
              </p>
            )}
          </motion.div>
        )}
      </div>
      {showSaveModal && (() => {
        const totalThrust = stages.reduce((s, c) => s + (c.thrust || 0), 0);
        const fuelMass = stages.reduce((s, c) => s + (c.fuelMass || 0), 0);
        const dryMass = stages.reduce((s, c) => s + c.mass, 0);
        const totalBurnRate = Math.max(5, stages.filter((c) => c.isp > 0).reduce((s, c) => s + (c.fuelMass ? c.fuelMass / 30 : 0), 10));
        return (
          <SaveRocketModal
            open={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            params={{ thrust: Math.round(totalThrust), fuel: Math.round(fuelMass), mass: Math.round(dryMass), burnRate: Math.round(totalBurnRate) }}
          />
        );
      })()}
    </PageShell>
  );
}
