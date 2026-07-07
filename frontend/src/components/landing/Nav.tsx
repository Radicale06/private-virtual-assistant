import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { roleHome, useAuth } from "../../lib/auth";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
];

export function Nav() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* scroll progress */}
      <motion.div
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left"
        style={{ scaleX: progress, background: "linear-gradient(90deg,#22d3ee,#7c3aed,#d946ef)" }}
      />
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          scrolled ? "glass border-b border-white/10" : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2">
            <img src="/logos/Musaed.png" alt="Musaed" className="h-10 w-10 object-contain" />
            <span className="font-display text-xl font-semibold text-white">Musaed</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                to={roleHome(user.role)}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:text-white sm:block"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
