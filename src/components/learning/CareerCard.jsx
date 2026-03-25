import { motion } from "framer-motion";

export default function CareerCard({ career }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/50 bg-secondary/30 p-4 space-y-2"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{career.emoji}</span>
        <div>
          <h3 className="font-heading font-bold text-foreground text-sm">{career.title}</h3>
          <p className="text-xs text-muted-foreground">{career.tagline}</p>
        </div>
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed">{career.description}</p>
      <div>
        <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide mb-1">Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {career.skills.map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary/15 border border-primary/25 text-primary">{s}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide mb-1">Study</p>
        <p className="text-xs text-foreground/70">{career.study}</p>
      </div>
    </motion.div>
  );
}
