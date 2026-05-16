import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import StreamProgressBar from "./StreamProgressBar";

const LOADING_PHASES = [
  "Initializing…",
  "Loading resources…",
  "Finalizing…",
];

export default function LoadingPhases({ streamingTokens, streamingAttempt }: { streamingTokens: number; streamingAttempt: number }) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if(streamingTokens > 0) return;
    const interval = setInterval(() => setPhaseIndex(i => Math.min(i+1, LOADING_PHASES.length-1)), 600);
    return () => clearInterval(interval);
  }, [streamingTokens]);

  return (
    <div className="space-y-4 flex flex-col items-center">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="2.5"/>
          <motion.circle
            cx="32" cy="32" r="28" fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="2.5"
            strokeLinecap="round" strokeDasharray="175.9"
            animate={{ strokeDashoffset: [175.9, 0, 175.9] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
      <AnimatePresence mode="wait">
        {streamingTokens > 0 ? (
          <motion.div key="streaming" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full">
            <StreamProgressBar tokens={streamingTokens} attempt={streamingAttempt}/>
          </motion.div>
        ) : (
          <motion.div key={phaseIndex} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center">
            <p className="text-blue-400 text-xs font-mono">{LOADING_PHASES[phaseIndex]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}