import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

let _show = null;
export function showAchievement(achievement) { _show?.(achievement); }

export default function AchievementToast() {
  const [queue, setQueue] = useState([]);
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    _show = (ach) => setQueue((q) => [...q, { ...ach, key: Date.now() }]);
    return () => { _show = null; };
  }, []);

  useEffect(() => {
    if (!visible && queue.length > 0) {
      const [next, ...rest] = queue;
      setVisible(next);
      setQueue(rest);
      setTimeout(() => setVisible(null), 3500);
    }
  }, [queue, visible]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={visible.key}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 backdrop-blur-md rounded-2xl px-5 py-3.5 shadow-2xl"
          >
            <span className="text-3xl">{visible.emoji}</span>
            <div>
              <p className="text-xs font-heading font-semibold text-amber-400 uppercase tracking-wide">Achievement Unlocked!</p>
              <p className="text-sm font-heading font-bold text-foreground">{visible.title}</p>
              <p className="text-xs text-muted-foreground">{visible.desc} · +{visible.points} pts</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
