import { cn } from "@/lib/utils";

const PALETTES = [
  ["oklch(0.62 0.2 30)", "oklch(0.32 0.1 300)"],
  ["oklch(0.7 0.17 190)", "oklch(0.3 0.12 265)"],
  ["oklch(0.72 0.19 62)", "oklch(0.35 0.14 350)"],
  ["oklch(0.6 0.2 350)", "oklch(0.28 0.09 250)"],
  ["oklch(0.68 0.16 140)", "oklch(0.3 0.1 200)"],
  ["oklch(0.66 0.21 20)", "oklch(0.26 0.08 285)"],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Poster({
  title,
  subtitle,
  seed,
  className,
  rounded = "rounded-2xl",
}: {
  title: string;
  subtitle?: string;
  seed?: string;
  className?: string;
  rounded?: string;
}) {
  const p = PALETTES[hash(seed ?? title) % PALETTES.length]!;
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative flex items-end overflow-hidden shadow-card",
        rounded,
        className,
      )}
      style={{ backgroundImage: `linear-gradient(150deg, ${p[0]}, ${p[1]})` }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(70% 60% at 80% 10%, rgba(255,255,255,0.35), transparent 60%)",
        }}
      />
      <span className="pointer-events-none absolute right-3 top-2 font-display text-5xl font-bold text-foreground/25">
        {initials}
      </span>
      <div className="relative z-10 w-full bg-gradient-to-t from-black/70 to-transparent p-3">
        <p className="line-clamp-2 font-display text-sm font-semibold leading-tight text-foreground">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-foreground/70">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
