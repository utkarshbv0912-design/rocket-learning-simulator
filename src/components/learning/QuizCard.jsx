import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizCard({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const check = () => {
    if (selected === null) return;
    setRevealed(true);
    setTimeout(() => onComplete?.(selected === quiz.answer), 1400);
  };

  return (
    <div className="bg-secondary/30 rounded-2xl border border-border/50 p-4 space-y-3">
      <p className="text-sm font-heading font-semibold text-foreground">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          let cls = "w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ";
          if (!revealed) {
            cls += selected === i ? "border-primary bg-primary/15 text-foreground" : "border-border/50 bg-secondary/40 text-foreground hover:bg-secondary/70";
          } else {
            if (i === quiz.answer) cls += "border-green-500/60 bg-green-500/15 text-green-300";
            else if (i === selected && selected !== quiz.answer) cls += "border-red-500/60 bg-red-500/15 text-red-300";
            else cls += "border-border/30 bg-secondary/20 text-muted-foreground";
          }
          return (
            <button key={i} className={cls} onClick={() => !revealed && setSelected(i)}>
              {opt}
            </button>
          );
        })}
      </div>
      {!revealed ? (
        <Button size="sm" onClick={check} disabled={selected === null} className="w-full font-heading">
          Check Answer <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 text-sm font-heading font-semibold ${selected === quiz.answer ? "text-green-400" : "text-red-400"}`}>
            {selected === quiz.answer
              ? <><CheckCircle className="w-4 h-4" /> Correct! {quiz.explanation}</>
              : <><XCircle className="w-4 h-4" /> {quiz.explanation}</>}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
