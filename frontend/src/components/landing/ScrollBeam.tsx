import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * A vertical "lightning" beam fixed to the left rail that follows scroll:
 * the gradient fill grows with progress and a glowing comet node rides the tip.
 * Desktop only; collapses to a static hairline under reduced-motion.
 */
export function ScrollBeam() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.4 });
  const nodeTop = useTransform(progress, (v) => `${v * 100}%`);

  if (reduce) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-16 left-6 top-28 z-30 hidden w-px bg-white/10 lg:block"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-16 left-6 top-28 z-30 hidden w-px lg:block"
    >
      {/* faint full-height track */}
      <div className="absolute inset-0 bg-white/[0.08]" />
      {/* growing gradient fill */}
      <motion.div
        className="absolute inset-x-0 top-0 h-full origin-top"
        style={{
          scaleY: progress,
          background: "linear-gradient(180deg,#22d3ee,#7c3aed,#d946ef)",
          boxShadow: "0 0 12px rgba(124,58,237,0.7)",
        }}
      />
      {/* comet node riding the leading edge */}
      <motion.div
        className="absolute -left-[3.5px] h-2 w-2 rounded-full"
        style={{
          top: nodeTop,
          background: "#a5f3fc",
          boxShadow: "0 0 10px 3px #22d3ee, 0 0 24px 8px rgba(124,58,237,0.8)",
        }}
      />
    </div>
  );
}
