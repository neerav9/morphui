import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function StreamProgressBar({ tokens, attempt, maxTokens = 800 }: { tokens: number; attempt: number; maxTokens?: number }) {
  const progress = Math.min((tokens / maxTokens) * 100, 94);
  const springProgress = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  useEffect(() => {
    springProgress.set(progress);
  }, [progress, springProgress]);

  return (
    <div className="space-y-2.5 w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-blue-500">STAGE {attempt}/3 · STREAMING ANALYTICAL PLANS</span>
        <motion.span key={tokens} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 tabular-nums">
          {tokens.toLocaleString()} tkn
        </motion.span>
      </div>
      <div className="w-full bg-zinc-950 border border-zinc-900 rounded-full h-[3px] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

