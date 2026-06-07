export function getRiskColorClass(score: number): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  if (score >= 90) {
    return {
      text: "text-rose-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      glow: "shadow-[0_0_12px_rgba(239,68,68,0.4)]"
    };
  }
  if (score >= 70) {
    return {
      text: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      glow: "shadow-[0_0_12px_rgba(249,115,22,0.4)]"
    };
  }
  if (score >= 40) {
    return {
      text: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      glow: "shadow-[0_0_12px_rgba(234,179,8,0.3)]"
    };
  }
  return {
    text: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_12px_rgba(34,197,94,0.3)]"
  };
}

export const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
