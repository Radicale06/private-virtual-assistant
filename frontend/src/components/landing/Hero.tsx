import { ArrowRight, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { roleHome, useAuth } from "../../lib/auth";
import { HeroDevice } from "./HeroDevice";
import { GradientText, Reveal, SectionLabel } from "./primitives";

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-32 sm:pt-40">
      {/* aurora background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="aurora-blob drift-a -left-20 top-10 h-80 w-80" style={{ background: "#7c3aed" }} />
        <div className="aurora-blob drift-b right-0 top-0 h-96 w-96" style={{ background: "#d946ef" }} />
        <div className="aurora-blob drift-c left-1/3 top-40 h-72 w-72" style={{ background: "#22d3ee" }} />
      </div>
      <div className="grid-fade pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        {/* copy */}
        <div className="text-center lg:text-left">
          <Reveal>
            <SectionLabel>
              <Sparkles className="h-3 w-3" /> Your assistant, on WhatsApp
            </SectionLabel>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-6xl">
              Meet <GradientText>Musaed</GradientText>  the AI that runs your day.
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300 lg:mx-0">
              Chat or send a voice note. Musaed manages your calendar, reminders, email and
              meetings  right inside WhatsApp. No new app to learn.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to={user ? roleHome(user.role) : "/register"}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-transform duration-200 hover:scale-[1.03]"
              >
                {user ? "Open dashboard" : "Get started free"}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/[0.07]"
              >
                See how it works
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400 lg:justify-start">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" /> Private &amp; encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9/5 from early users
              </span>
              <span>No credit card required</span>
            </div>
          </Reveal>
        </div>

        {/* product device mockup */}
        <Reveal delay={0.1}>
          <HeroDevice />
        </Reveal>
      </div>
    </section>
  );
}
