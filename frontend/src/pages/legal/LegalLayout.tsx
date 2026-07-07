import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// Shared shell + prose primitives for the public legal pages (Terms, Privacy).
// Uses the light app tokens for maximum readability; body copy is
// secondary-foreground (AA-contrast), never muted-gray.

export function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logos/Musaed.png" alt="Musaed" className="h-8 w-8 object-contain" />
            <span className="text-lg font-semibold tracking-tight">Musaed</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        {intro && (
          <p className="mt-6 text-[15px] leading-relaxed text-secondary-foreground">{intro}</p>
        )}
        <div className="mt-2">{children}</div>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Musaed. All rights reserved.</span>
          <div className="flex gap-5">
            <Link to="/terms" className="transition-colors hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
            <a href="mailto:support@musaed.pro" className="transition-colors hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---- prose primitives -------------------------------------------------------

export function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-foreground">
        {n}. {title}
      </h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-secondary-foreground">
        {children}
      </div>
    </section>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/60 p-4 text-sm leading-relaxed text-secondary-foreground">
      {children}
    </div>
  );
}
