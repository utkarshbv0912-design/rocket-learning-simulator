import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";

const TYPE_ORDER = { nose: 0, fuel: 1, engine: 2, structure: 3 };

export default function RocketAssembly({ stages, onRemove, onReset }) {
  const sorted = [...stages].sort((a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9));

  return (
    <Card className="border-border bg-card/80">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-heading font-semibold text-foreground">Your Rocket</p>
          {stages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-destructive h-7 px-2">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>

        {stages.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-3xl mb-2">🚀</p>
            <p className="text-sm">Add components above to build your rocket</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <AnimatePresence>
              {sorted.map((comp) => (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-full max-w-xs"
                >
                  <div className={`border rounded-lg px-3 py-2 flex items-center gap-2 bg-gradient-to-br to-transparent ${comp.color}`}>
                    <span className="text-lg">{comp.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-heading font-semibold text-foreground">{comp.name}</p>
                      <p className="text-xs text-muted-foreground">{(comp.mass / 1000).toFixed(2)} t</p>
                    </div>
                    <button
                      onClick={() => onRemove(comp.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Connector line */}
                  <div className="w-0.5 h-2 bg-border mx-auto" />
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="text-2xl mt-1">🔥</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
