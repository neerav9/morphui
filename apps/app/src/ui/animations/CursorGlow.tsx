import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div
        className="absolute w-72 h-72 rounded-full bg-blue-500/[0.015] blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${pos.x - 144}px, ${pos.y - 144}px)` }}
      />
    </div>
  );
}
