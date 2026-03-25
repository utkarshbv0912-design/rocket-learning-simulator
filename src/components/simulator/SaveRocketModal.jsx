import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveRocket } from "../../utils/savedRockets";

export default function SaveRocketModal({ open, onClose, params, onSaved }) {
  const [name, setName] = useState("");

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    saveRocket(name.trim(), params);
    onSaved?.(name.trim());
    setName("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl p-5 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-400" />
                <h3 className="font-heading font-bold text-foreground">Save Rocket</h3>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="bg-secondary/40 rounded-lg p-2">
                <p className="text-muted-foreground">Thrust</p>
                <p className="font-heading font-semibold text-foreground">{params.thrust} N</p>
              </div>
              <div className="bg-secondary/40 rounded-lg p-2">
                <p className="text-muted-foreground">Fuel</p>
                <p className="font-heading font-semibold text-foreground">{params.fuel} kg</p>
              </div>
              <div className="bg-secondary/40 rounded-lg p-2">
                <p className="text-muted-foreground">Dry Mass</p>
                <p className="font-heading font-semibold text-foreground">{params.mass} kg</p>
              </div>
              <div className="bg-secondary/40 rounded-lg p-2">
                <p className="text-muted-foreground">Burn Rate</p>
                <p className="font-heading font-semibold text-foreground">{params.burnRate} kg/s</p>
              </div>
            </div>
            <Input
              placeholder="Give your rocket a name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="mb-3 bg-secondary/50 border-border"
              autoFocus
            />
            <Button onClick={handleSave} disabled={!name.trim()} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-heading">
              <Save className="w-4 h-4 mr-2" /> Save Rocket
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
