import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { roleHome, useAuth } from "../../lib/auth";
import { AuthShell, Field, FormError, PasswordField, SocialAuth, buttonClass } from "./AuthShell";

// Best-effort guess at the user's timezone for the assistant's scheduling.
function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const me = await register({
        email,
        password,
        full_name: fullName || undefined,
        timezone: detectTimezone(),
      });
      navigate(roleHome(me.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your WhatsApp assistant in a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-violet-300 hover:text-violet-200">
            Sign in
          </Link>
        </>
      }
    >
      <SocialAuth />
      <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <Field
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Alex Johnson"
          autoFocus
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "register-error" : undefined}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use 8+ characters."
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "register-error" : undefined}
        />
        {error && <FormError id="register-error">{error}</FormError>}
        <button type="submit" disabled={busy} aria-busy={busy} className={buttonClass}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Creating account…" : "Create account"}
        </button>
        <p className="text-center text-xs text-slate-500">
          By continuing you agree to our Terms &amp; Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
