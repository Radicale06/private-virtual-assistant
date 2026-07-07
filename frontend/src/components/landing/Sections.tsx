import {
  Bell,
  BrainCircuit,
  Calendar,
  Check,
  Mail,
  MessageCircle,
  Mic,
  QrCode,
  Quote,
  Sparkles,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { roleHome, useAuth } from "../../lib/auth";
import { GradientText, Reveal, SectionLabel, Stagger, staggerChild } from "./primitives";

// ----------------------------------------------------------------- shared
function SectionHead({
  label,
  title,
  sub,
}: {
  label: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <SectionLabel>{label}</SectionLabel>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{title}</h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.12}>
          <p className="mt-4 text-lg text-slate-400">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- social proof
const LOGOS = ["Acme", "Globex", "Initech", "Umbra", "Hooli", "Stark", "Wayne", "Soylent"];

export function SocialProof() {
  const row = [...LOGOS, ...LOGOS];
  return (
    <section className="border-y border-white/5 py-10">
      <p className="mb-6 text-center text-xs uppercase tracking-widest text-slate-500">
        Trusted by busy professionals at
      </p>
      <div className="marquee-track relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee">
          {row.map((name, i) => (
            <span key={i} className="font-display text-2xl font-semibold text-white/30">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------- how it works
const STEPS = [
  {
    icon: Sparkles,
    title: "Set up your assistant",
    body: "Name it, pick a tone, and connect Google, Calendly, Zoom in two clicks.",
  },
  {
    icon: QrCode,
    title: "Scan the QR code",
    body: "Link your phone to Musaed's WhatsApp number. No new app to install.",
  },
  {
    icon: MessageCircle,
    title: "Just talk",
    body: "Text or send a voice note. Musaed takes the action and confirms  instantly.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="px-6 py-24">
      <SectionHead
        label="How it works"
        title={<>Up and running in <GradientText>under two minutes</GradientText></>}
        sub="From sign-up to your first reminder  no setup headaches."
      />
      <Stagger className="relative mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            variants={staggerChild}
            className="glass relative rounded-2xl p-6"
          >
            <span className="absolute right-5 top-5 font-display text-5xl font-bold text-white/5">
              0{i + 1}
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/80 to-cyan-500/80">
              <s.icon className="h-5 w-5 text-white" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}

// ----------------------------------------------------------------- features bento
interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  className: string;
  tint: string;
}
const FEATURES: Feature[] = [
  {
    icon: Bell,
    title: "Reminders that never slip",
    body: "“Remind me in 3 hours” → a durable, reliable nudge on WhatsApp. Ask in plain language.",
    className: "md:col-span-2",
    tint: "from-violet-500/20",
  },
  {
    icon: Calendar,
    title: "Calendar, handled",
    body: "Create, move, and cancel events by chatting.",
    className: "",
    tint: "from-cyan-500/20",
  },
  {
    icon: Mail,
    title: "Inbox triage",
    body: "Summarize and draft email on your behalf.",
    className: "",
    tint: "from-fuchsia-500/20",
  },
  {
    icon: Mic,
    title: "Voice-first",
    body: "Send a voice note  Musaed transcribes and acts on it. Perfect on the move.",
    className: "md:col-span-2",
    tint: "from-indigo-500/20",
  },
  {
    icon: Sun,
    title: "Morning briefing",
    body: "Wake up to your agenda, every day.",
    className: "",
    tint: "from-amber-500/20",
  },
  {
    icon: BrainCircuit,
    title: "It remembers",
    body: "Preferences like “no meetings before 10am” stick  so it feels personal.",
    className: "md:col-span-2",
    tint: "from-emerald-500/20",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <SectionHead
        label="Features"
        title={<>One assistant, your <GradientText>whole day</GradientText></>}
        sub="Everything you'd hand to a human assistant  minus the $2,000/month."
      />
      <Stagger className="mx-auto mt-16 grid max-w-5xl auto-rows-[180px] gap-4 md:grid-cols-3">
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={staggerChild}
            className={`group glass relative overflow-hidden rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1 ${f.className}`}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.tint} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
              <f.icon className="h-5 w-5 text-violet-200" />
            </span>
            <h3 className="relative mt-4 text-lg font-semibold text-white">{f.title}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}

// ----------------------------------------------------------------- integrations
const INTEGRATIONS = [
  { logo: "/logos/google-calendar.svg", label: "Google Calendar" },
  { logo: "/logos/gmail.svg", label: "Gmail" },
  { logo: "/logos/google-meet.svg", label: "Google Meet" },
  { logo: "/logos/outlook.svg", label: "Outlook Calendar" },
  { logo: "/logos/outlook.svg", label: "Outlook Mail" },
  { logo: "/logos/microsoft-teams.svg", label: "Microsoft Teams" },
  { logo: "/logos/calendly.svg", label: "Calendly" },
  { logo: "/logos/zoom.svg", label: "Zoom" },
  { logo: "/logos/whatsapp.svg", label: "WhatsApp" },
];

export function Integrations() {
  const row = [...INTEGRATIONS, ...INTEGRATIONS];
  return (
    <section id="integrations" className="px-6 py-24">
      <SectionHead
        label="Integrations"
        title={<>Plugs into the tools you <GradientText>already use</GradientText></>}
      />
      <div className="marquee-track relative mx-auto mt-14 max-w-5xl overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee">
          {row.map((it, i) => (
            <span
              key={i}
              className="glass flex shrink-0 items-center gap-3 rounded-full py-3 pl-3 pr-5 text-sm font-medium text-slate-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                <img src={it.logo} alt="" className="h-5 w-5" loading="lazy" />
              </span>
              {it.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------- testimonials
const QUOTES = [
  {
    quote: "It's the first assistant that actually feels like mine. I just talk to it like a person.",
    name: "Sara C.",
    role: "Design lead",
  },
  {
    quote: "Voice notes on the school run → my whole week scheduled. Genuinely magic.",
    name: "Marcus W.",
    role: "Founder",
  },
  {
    quote: "Replaced three apps and my own forgetfulness. The morning briefing is unmissable.",
    name: "Priya S.",
    role: "Consultant",
  },
];

export function Testimonials() {
  return (
    <section className="px-6 py-24">
      <SectionHead label="Loved by users" title={<>Don't take our word for it</>} />
      <Stagger className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
        {QUOTES.map((q) => (
          <motion.figure key={q.name} variants={staggerChild} className="glass rounded-2xl p-6">
            <Quote className="h-6 w-6 text-violet-400" />
            <blockquote className="mt-4 text-sm leading-relaxed text-slate-200">
              “{q.quote}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-semibold text-white">
                {q.name[0]}
              </span>
              <span className="text-sm">
                <span className="block font-medium text-white">{q.name}</span>
                <span className="text-slate-400">{q.role}</span>
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </Stagger>
    </section>
  );
}

// ----------------------------------------------------------------- pricing
const PLANS = [
  {
    name: "Free",
    price: "$0",
    blurb: "Try the magic.",
    features: ["100 messages / mo", "Calendar + reminders", "1 integration"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    blurb: "For busy professionals.",
    features: [
      "5,000 messages / mo",
      "All integrations",
      "Voice notes + briefings",
      "Priority delivery",
    ],
    highlight: true,
  },
  {
    name: "Team",
    price: "$29",
    blurb: "Shared assistants.",
    features: ["25,000 messages / mo", "Everything in Pro", "Team management"],
    highlight: false,
  },
];

export function Pricing() {
  const { user } = useAuth();
  return (
    <section id="pricing" className="px-6 py-24">
      <SectionHead
        label="Pricing"
        title={<>Simple pricing, <GradientText>cancel anytime</GradientText></>}
        sub="Start free. Upgrade when Musaed becomes indispensable."
      />
      <Stagger className="mx-auto mt-16 grid max-w-5xl items-stretch gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <motion.div
            key={p.name}
            variants={staggerChild}
            className={`glow-ring relative flex flex-col rounded-2xl p-7 ${
              p.highlight ? "glass bg-white/[0.06]" : "glass"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            )}
            <h3 className="font-display text-lg font-semibold text-white">{p.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{p.blurb}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-white">{p.price}</span>
              <span className="text-sm text-slate-400">/mo</span>
            </div>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-200">
                  <Check className="h-4 w-4 shrink-0 text-cyan-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to={user ? roleHome(user.role) : "/register"}
              className={`mt-7 rounded-xl py-3 text-center text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] ${
                p.highlight
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white"
                  : "border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              }`}
            >
              {p.name === "Free" ? "Start free" : `Choose ${p.name}`}
            </Link>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}

// ----------------------------------------------------------------- final CTA
export function FinalCTA() {
  const { user } = useAuth();
  return (
    <section className="px-6 py-24">
      <Reveal>
        <div className="glow-ring relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-8 py-16 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="aurora-blob drift-a left-10 top-0 h-64 w-64" style={{ background: "#7c3aed" }} />
            <div className="aurora-blob drift-c right-10 bottom-0 h-64 w-64" style={{ background: "#22d3ee" }} />
          </div>
          <div className="relative">
            <span className="flex mx-auto h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400">
              <Zap className="h-6 w-6 text-white" />
            </span>
            <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
              Your day, <GradientText>on autopilot</GradientText>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Set Musaed up in two minutes and start delegating from your favorite chat app today.
            </p>
            <Link
              to={user ? roleHome(user.role) : "/register"}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-transform duration-200 hover:scale-[1.03]"
            >
              {user ? "Open dashboard" : "Get started free"}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
