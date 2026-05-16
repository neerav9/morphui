import { motion } from "framer-motion";

export default function MorphLogo() {
  const letters = "Morph".split("");

  return (
    <div className="flex justify-center items-center gap-0.5">
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          animate={{ y:[0,-2,1,0], scaleY:[1,1.1,0.97,1], scaleX:[1,0.95,1.03,1], color:["#ffffff","#60a5fa","#a78bfa","#ffffff"] }}
          transition={{ duration:4+index*0.12, repeat:Infinity, ease:"easeInOut", delay:index*0.06 }}
          className="text-4xl inline-block font-extrabold tracking-tighter select-none"
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}