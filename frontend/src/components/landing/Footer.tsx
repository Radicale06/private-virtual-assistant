import { Link } from "react-router-dom";

const COLS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "#features" },
      { label: "Integrations", to: "#integrations" },
      { label: "Pricing", to: "#pricing" },
      { label: "How it works", to: "#how" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "#" },
      { label: "Blog", to: "#" },
      { label: "Careers", to: "#" },
      { label: "Contact", to: "mailto:support@musaed.pro" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Security", to: "#" },
      { label: "DPA", to: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <img src="/logos/Musaed.png" alt="Musaed" className="h-10 w-10 object-contain" />
            <span className="font-display text-xl font-semibold text-white">Musaed</span>
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
                <li key={l.label}>
                  {l.to.startsWith("/") ? (
                    <Link to={l.to} className="text-sm text-slate-400 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.to} className="text-sm text-slate-400 transition-colors hover:text-white">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-slate-500 sm:flex-row">
        <span>© {new Date().getFullYear()} Musaed. All rights reserved.</span>
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
