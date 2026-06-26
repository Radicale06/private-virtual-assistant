import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Bell, Calendar, Check, Mail, Mic, Plus, Sparkles } from "lucide-react";
import type { PointerEvent } from "react";

/**
 * Hero visual  a 3D-perspective phone mockup running the Aria WhatsApp chat,
 * surrounded by floating "action" chips that show what the assistant just did.
 * Tilts with the pointer (parallax) and floats gently; both are disabled under
 * reduced-motion. Pure CSS/transform 3D  no WebGL bundle.
 */

type Msg =
  | { from: "aria"; text: string; time: string; voice?: false }
  | { from: "user"; text: string; time: string; voice?: boolean };

const THREAD: Msg[] = [
  { from: "aria", text: "Good morning, Alex ☀️ You've got 3 meetings today.", time: "8:00" },
  { from: "user", text: "Move my 2pm to tomorrow & remind me 1h before", time: "8:02", voice: true },
  { from: "aria", text: "Done  moved to Tue 2:00 PM. Reminder set for 1:00 PM.", time: "8:02" },
  { from: "user", text: "Summarize my unread emails", time: "8:05" },
  { from: "aria", text: "📬 3 unread: Sara (design review), David (invoice), Newsletter.", time: "8:05" },
];

function Bubble({ m }: { m: Msg }) {
  const mine = m.from === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug ${
          mine
            ? "rounded-br-sm bg-violet-500 text-white"
            : "rounded-bl-sm bg-white/10 text-slate-100"
        }`}
      >
        <div className="flex items-start gap-1.5">
          {m.voice && <Mic className="mt-0.5 h-3 w-3 shrink-0 opacity-90" />}
          <span>{m.text}</span>
        </div>
        <div className={`mt-0.5 text-[9px] ${mine ? "text-white/70" : "text-slate-400"}`}>
          {m.time}
        </div>
      </div>
    </div>
  );
}

function Chip({
  icon: Icon,
  title,
  sub,
  className,
  delay,
}: {
  icon: typeof Bell;
  title: string;
  sub: string;
  className: string;
  delay: number;
}) {
  return (
    <div
      className={`glass float-y absolute flex items-center gap-2.5 rounded-xl px-3 py-2 shadow-xl ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
        <Icon className="h-3.5 w-3.5 text-white" />
      </span>
      <span className="leading-tight">
        <span className="block text-[11px] font-semibold text-white">{title}</span>
        <span className="block text-[10px] text-slate-400">{sub}</span>
      </span>
    </div>
  );
}

export function HeroDevice() {
  const reduce = useReducedMotion();

  // Pointer-driven 3D tilt.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 18 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div
      className="relative mx-auto flex w-full max-w-md items-center justify-center"
      style={{ perspective: 1200 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {/* aurora glow behind the device */}
      <div
        className="pointer-events-none absolute h-[80%] w-[80%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.45), transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <motion.div
        className="relative"
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* phone frame */}
        <div className="relative h-[540px] w-[270px] rounded-[2.6rem] border border-white/12 bg-[#0b0f1c] p-2.5 shadow-2xl">
          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-[#141a2e] to-[#0d1120]">
            {/* notch */}
            <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/70" />

            {/* chat header */}
            <div className="flex items-center gap-2.5 border-b border-white/10 bg-white/[0.03] px-4 pb-3 pt-7">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">Aria</div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> online
                </div>
              </div>
            </div>

            {/* messages */}
            <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden px-3 py-3">
              {THREAD.map((m, i) => (
                <Bubble key={i} m={m} />
              ))}
            </div>

            {/* input bar */}
            <div className="flex items-center gap-2 border-t border-white/10 px-3 py-3">
              <Plus className="h-4 w-4 text-slate-400" />
              <div className="flex-1 rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] text-slate-400">
                Message Aria…
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Mic className="h-3.5 w-3.5 text-white" />
              </span>
            </div>
          </div>
        </div>

        {/* floating action chips */}
        <Chip
          icon={Calendar}
          title="Event moved"
          sub="Tue · 2:00 PM"
          className="-left-12 top-16 hidden sm:flex"
          delay={0}
        />
        <Chip
          icon={Bell}
          title="Reminder set"
          sub="Today · 1:00 PM"
          className="-right-10 top-40 hidden sm:flex"
          delay={1.2}
        />
        <Chip
          icon={Mail}
          title="3 emails summarized"
          sub="just now"
          className="-left-10 bottom-24 hidden sm:flex"
          delay={2.1}
        />
        <Chip
          icon={Check}
          title="Voice note done"
          sub="transcribed"
          className="-right-8 bottom-12 hidden sm:flex"
          delay={0.6}
        />
      </motion.div>
    </div>
  );
}
