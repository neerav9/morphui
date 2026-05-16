import type { Severity } from "../../types";
export const severityColors: Record<Severity, string> = {
  critical: "text-rose-400 border-rose-500/20 bg-rose-500/[0.03]",
  high: "text-orange-400 border-orange-500/20 bg-orange-500/[0.03]",
  medium: "text-amber-400 border-amber-500/20 bg-amber-500/[0.03]",
  low: "text-blue-400 border-blue-500/20 bg-blue-500/[0.03]",
};