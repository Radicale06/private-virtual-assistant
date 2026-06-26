# Product

## Register

product

## Users

**Primary — the customer ("admin"… role `user`).** Busy solo professionals: consultants,
founders, freelancers, agency owners. Their context is *on the move* — they live in WhatsApp,
often hands-busy (commuting, between meetings), and reach for the assistant by text or voice
note rather than opening an app. The job to be done: offload the administrative weight of the
day — calendar, reminders, email triage, meeting links — to something that just takes the
action. The web app is not where they spend time; it's where they set up, connect accounts,
and *trust* that the assistant is doing its job.

**Secondary — the platform operator (role `admin`).** Runs the multi-tenant service from the
Platform Console: monitors tenants, message volume, LLM/WhatsApp cost, integration health,
and system status. Their context is a back-office console; the job is to catch problems
(runaway cost, a number hitting rate limits, broken OAuth) before customers feel them.

## Product Purpose

PVA ("Aria") is a private AI assistant that lives on a single shared WhatsApp number. Each
customer configures **one** assistant, connects their productivity accounts (Google Calendar &
Gmail, Microsoft Outlook & Teams, Calendly, Zoom), links their phone by scanning a QR code,
and from then on simply *talks* to it — by text or voice note — to manage their calendar,
reminders, email, and meetings. The assistant interprets intent and takes the real action,
confirming destructive/outbound steps first.

It exists because the $15/mo version of a human EA didn't exist: professionals feel calendar
and inbox chaos daily but can't justify a person. Success looks like **retention through
trust** — the assistant never drops a reminder, never acts without confirming the risky stuff,
and remembers the user's preferences so it feels personal. The product wins on reliability and
effortlessness, not feature count.

## Brand Personality

**Calm & trustworthy, sharp & efficient.** Three words: *reassuring, precise, effortless.*

Voice: direct and outcome-first. It confirms what it did in one line; it asks before sending
an email or deleting an event; it never hypes. Premium but restrained — the polish shows in
how little the user has to do, not in decoration. The customer surfaces should feel like a
quiet, competent control room; the marketing surface may be more expressive, but it carries
the same composed confidence rather than excitement for its own sake.

## Anti-references

- **Crypto / web3 neon.** No glowing-neon-on-black, no aggressive gradient shouting, no
  hype-futurism. "Futuristic" here means *calm and capable*, not loud.
- **Generic SaaS template.** No Stripe-clone hero, no endless identical icon + heading + text
  card grids, no tiny tracked all-caps eyebrow over every section, no purple-gradient-on-white
  default. If a section could be lifted onto any other SaaS site unchanged, it's wrong.
- (Also out: cluttered grey enterprise chart-soup for the console, and anything childish or
  cartoonish — these users pay for the tool.)

## Design Principles

1. **Trust is the interface.** Reliability must be *legible*: surface what the assistant did
   (activity feed), what it will do (confirm-before-act), and what's healthy vs. broken
   (integration/WhatsApp status). A dropped reminder is a product failure, and the UI should
   make "nothing was dropped" visible.
2. **Minimize effort — the assistant acts, the app doesn't make you operate it.** The dashboard
   is for setup, control, and trust, not daily operation. Lead every screen with the outcome
   and one primary action; never make the user do work the assistant should do.
3. **Clarity over density.** These users scan between meetings. Strong hierarchy, generous
   rhythm, plain language. The Platform Console can be information-rich but must stay scannable —
   never chart-soup.
4. **Calm confidence, not hype.** Restraint carries the premium feel. Motion and color are
   intentional and quiet; the brand's energy lives in typography, spacing, and a confident
   accent — not in neon or gradient noise.
5. **Two registers, one product.** The marketing landing may be expressive and motion-rich;
   the app and console stay efficient and composed. Both must read as the same assistant —
   same voice, same restraint, same trustworthiness.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**. Body text ≥ 4.5:1 against its background (no light-gray-on-tint),
large text ≥ 3:1; placeholders meet body contrast. Visible focus states and full keyboard
navigation on all interactive surfaces (forms, tables, the assistant setup wizard). Honor
`prefers-reduced-motion` everywhere — the landing is deliberately motion-rich (aurora, 3D
tilt, scroll beam), so every animation needs a calm crossfade/instant fallback, and reveals
must enhance already-visible content (never gate visibility on a transition). Don't rely on
color alone for status — pair every status color with a dot/icon/label.
