// Option lists for the My Assistant form selects.

export const TONE_PRESETS = ["Professional", "Friendly", "Concise", "Detailed"];

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Casablanca",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
];

export const WORKING_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// "HH:MM" 24h values with friendly 12h labels, on the half hour.
export function timeOptions(stepMinutes = 30): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  for (let m = 0; m < 24 * 60; m += stepMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const value = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const ampm = h < 12 ? "AM" : "PM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const label = `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
    out.push({ value, label });
  }
  return out;
}

export function toneToPreset(tone: string | null | undefined): string {
  const t = (tone ?? "").toLowerCase();
  const match = TONE_PRESETS.find((p) => t.includes(p.toLowerCase()));
  return match ?? "Friendly";
}
