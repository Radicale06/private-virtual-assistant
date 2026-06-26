import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const COLS = [
  { title: "Product", links: ["Features", "Integrations", "Pricing", "Changelog"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-400">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-lg font-semibold text-white">Aria</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            The private AI personal assistant that lives on WhatsApp.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold text-white">{c.title}</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-slate-500 sm:flex-row">
        <span>© {new Date().getFullYear()} Aria. All rights reserved.</span>
        <div className="flex gap-5">
          <Link to="/login" className="transition-colors hover:text-white">
            Log in
          </Link>
          <Link to="/register" className="transition-colors hover:text-white">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}
