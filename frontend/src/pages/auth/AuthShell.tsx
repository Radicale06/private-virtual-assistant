import { Bell, Calendar, Eye, EyeOff, Mic, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import "../landing/landing.css";

const BULLETS = [
  { icon: Calendar, label: "Schedules & reschedules your calendar" },
  { icon: Bell, label: "Reminders you'll never miss" },
  { icon: Mic, label: "Send a voice note, it's handled" },
];

/**
 * Auth shell: ONE continuous aurora background spanning the whole page, with the
 * brand story on the left and a floating glass form on the right. No split/seam --
 * both columns sit over the same shared backdrop.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="landing-root relative min-h-full overflow-hidden">
      {/* one shared aurora backdrop across the entire page (no per-side bg) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="aurora-blob drift-a -left-24 -top-20 h-[30rem] w-[30rem]" style={{ background: "#7c3aed" }} />
        <div className="aurora-blob drift-b left-1/2 top-1/4 h-[26rem] w-[26rem]" style={{ background: "#d946ef" }} />
        <div className="aurora-blob drift-c -right-16 bottom-[-4rem] h-[28rem] w-[28rem]" style={{ background: "#22d3ee" }} />
      </div>
      <div className="grid-fade pointer-events-none absolute inset-0" />
      {/* edge vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(8,11,24,0.7))" }}
      />

      <div className="relative mx-auto grid min-h-full max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:gap-20">
        {/* brand story (over shared bg) */}
        <aside className="hidden flex-col gap-8 lg:flex">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400">
              <Sparkles className="h-[18px] w-[18px] text-white" />
            </span>
            <span className="font-display text-xl font-semibold text-white">Aria</span>
          </a>

          <div className="max-w-md">
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              Your day, <span className="aurora-text">on autopilot</span>.
            </h2>
            <p className="mt-3 text-slate-300">
              The private AI assistant that lives on WhatsApp. Chat or send a voice note, and it
              takes the action.
            </p>

            <ul className="mt-8 flex flex-col gap-4">
              {BULLETS.map((b) => (
                <li key={b.label} className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                    <b.icon className="h-4 w-4 text-violet-200" />
                  </span>
                  {b.label}
                </li>
              ))}
            </ul>

            <div className="glass mt-8 w-fit max-w-[300px] rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-slate-100">
              Reminder set for <span className="font-semibold text-cyan-300">2:00 PM</span>. I'll
              ping you here.
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400" /> Private &amp; encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9/5
            </span>
          </div>
        </aside>

        {/* floating glass form (over the same shared bg) */}
        <div className="mx-auto w-full max-w-sm">
          {/* mobile logo */}
          <a href="/" className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-400">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-lg font-semibold text-white">Aria</span>
          </a>

          <div className="relative">
            {/* subtle, balanced outer glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet-600/25 to-cyan-500/15 blur-3xl"
            />
            {/* thin gradient rim */}
            <div className="relative rounded-2xl bg-gradient-to-b from-white/20 via-violet-400/15 to-cyan-300/15 p-px shadow-2xl">
              {/* opaque dark glass card — readable, not a pink wash */}
              <div className="rounded-[15px] bg-[#0d1326]/90 p-7 backdrop-blur-xl">
                {/* icon header */}
                <div className="flex flex-col items-center text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 shadow-lg shadow-violet-900/40">
                    <Sparkles className="h-5 w-5 text-white" />
                  </span>
                  <h1 className="mt-4 font-display text-2xl font-bold text-white">{title}</h1>
                  <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>
                </div>
                <div className="mt-6">{children}</div>
              </div>
            </div>
          </div>

          <div className="mt-5 text-center text-sm text-slate-400">{footer}</div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 focus:bg-white/[0.07]";

export function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input {...props} className={inputClass} />
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function PasswordField({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <div className="relative">
        <input {...props} type={show ? "text" : "password"} className={`${inputClass} pr-10`} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

/** Shared inline form error (aria-live for screen readers). */
export function FormError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300"
    >
      {children}
    </p>
  );
}

export const buttonClass =
  "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-transform duration-200 hover:scale-[1.02] disabled:scale-100 disabled:opacity-60";

/** Official 4-color Google "G". */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/** Social sign-in row + "or" divider. Google auth isn't wired server-side yet,
 *  so it shows a brief "coming soon" note instead of faking a flow. */
export function SocialAuth() {
  const [note, setNote] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setNote(true)}
        className="flex items-center justify-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.04] py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
      >
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </button>
      {note && (
        <p className="text-center text-xs text-slate-400">
          Google sign-in is coming soon — use your email below for now.
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>
    </div>
  );
}
