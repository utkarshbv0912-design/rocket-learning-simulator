import { motion } from "framer-motion";
import { CalendarDays, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryColors = {
  rocket: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  spacecraft: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  engine: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  mission: "bg-green-500/20 text-green-300 border-green-500/30",
  astronaut: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  planet: "bg-red-500/20 text-red-300 border-red-500/30",
  general: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function DailyFactCard({ fact, isLoading }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-600/15 via-orange-600/10 to-transparent overflow-hidden relative">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

        <CardContent className="pt-5 pb-5 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-heading font-semibold">
                Fact of the Day
              </span>
            </div>
            {fact?.category && (
              <Badge className={`text-xs border ${categoryColors[fact.category] || categoryColors.general}`}>
                {fact.category}
              </Badge>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 mb-3">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{today}</span>
          </div>

          {/* Fact text */}
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-secondary/80 rounded animate-pulse" />
              <div className="h-4 bg-secondary/80 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-secondary/60 rounded animate-pulse w-3/4" />
            </div>
          ) : fact ? (
            <p className="text-foreground leading-relaxed text-base font-medium">
              {fact.fact}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm italic">
              No fact scheduled for today yet — check back soon!
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
