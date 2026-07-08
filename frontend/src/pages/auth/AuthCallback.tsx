import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { roleHome, useAuth } from "../../lib/auth";

/**
 * Landing spot for the Google sign-in redirect. The backend appends the JWT as a
 * URL fragment (#token=…) — we adopt it, then route to the role's home. The
 * fragment (not a query string) keeps the token out of referrers and server logs.
 */
export function AuthCallback() {
  const { applySession } = useAuth();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard React 18 StrictMode double-invoke
    ran.current = true;

    const token = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token");
    if (!token) {
      setFailed(true);
      return;
    }
    // Strip the token from the address bar before we navigate on.
    window.history.replaceState(null, "", window.location.pathname);

    applySession(token)
      .then((me) => navigate(roleHome(me.role), { replace: true }))
      .catch(() => setFailed(true));
  }, [applySession, navigate]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#0b1020] px-6 text-center">
      <img src="/logos/Musaed.png" alt="" className="h-12 w-12 object-contain" />
      {failed ? (
        <div className="max-w-sm">
          <p className="text-base font-semibold text-white">Sign-in didn't complete</p>
          <p className="mt-1 text-sm text-slate-400">
            Something went wrong with Google sign-in. Please try again.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Signing you in…</span>
        </div>
      )}
    </div>
  );
}
