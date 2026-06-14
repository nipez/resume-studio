import type { ReactNode } from "react";

type SectionShellProps = {
  children: ReactNode;
  variant?: "white" | "page" | "dark" | "gradient" | "warm";
  className?: string;
  bordered?: boolean;
};

const VARIANTS: Record<NonNullable<SectionShellProps["variant"]>, string> = {
  white: "bg-white",
  page: "bg-page",
  dark: "bg-sidebar text-white",
  gradient: "bg-gradient-to-b from-page via-white to-page",
  warm: "bg-gradient-to-br from-[#FFF8F0] via-[#FFFBF5] to-page",
};

export function SectionShell({
  children,
  variant = "white",
  className = "",
  bordered = false,
}: SectionShellProps) {
  return (
    <section
      className={`relative overflow-hidden ${VARIANTS[variant]} ${bordered ? "border-y border-border" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

type EyebrowProps = {
  children: ReactNode;
  variant?: "light" | "dark" | "accent" | "warm";
  className?: string;
};

const EYEBROW_VARIANTS: Record<NonNullable<EyebrowProps["variant"]>, string> = {
  light: "text-accent",
  dark: "text-[#7FA6FF]",
  accent: "text-accent",
  warm: "text-[#D97706]",
};

export function Eyebrow({
  children,
  variant = "light",
  className = "",
}: EyebrowProps) {
  return (
    <p
      className={`inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.14em] ${EYEBROW_VARIANTS[variant]} ${className}`}
    >
      <span
        className={`h-px w-6 ${variant === "dark" ? "bg-[#7FA6FF]/60" : variant === "warm" ? "bg-[#F59E0B]/50" : "bg-accent/40"}`}
        aria-hidden
      />
      {children}
    </p>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  eyebrowVariant?: EyebrowProps["variant"];
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  eyebrowVariant = "light",
  title,
  description,
  align = "left",
  dark = false,
  className = "",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  const maxW = align === "center" ? "max-w-2xl" : "max-w-2xl";

  return (
    <div className={`${maxW} ${alignClass} ${className}`}>
      {eyebrow ? (
        <Eyebrow variant={dark ? "dark" : eyebrowVariant}>{eyebrow}</Eyebrow>
      ) : null}
      <h2
        className={`${eyebrow ? "mt-3" : ""} font-display text-3xl font-semibold tracking-tight sm:text-4xl ${dark ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-[15px] leading-relaxed ${dark ? "text-[#AEB6C2]" : "text-muted"}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

type GlowCardProps = {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  hover?: boolean;
};

export function GlowCard({
  children,
  className = "",
  dark = false,
  hover = true,
}: GlowCardProps) {
  const base = dark
    ? "border-white/10 bg-white/[0.04] backdrop-blur-sm"
    : "border-border bg-white shadow-[0_8px_26px_rgba(15,17,22,0.04)]";
  const hoverFx = hover
    ? dark
      ? "hover:border-accent/40 hover:bg-white/[0.07] hover:shadow-[0_12px_32px_rgba(47,107,255,0.12)]"
      : "hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_14px_36px_rgba(47,107,255,0.1)]"
    : "";

  return (
    <div
      className={`rounded-2xl border p-6 transition duration-300 ${base} ${hoverFx} ${className}`}
    >
      {children}
    </div>
  );
}

export function MeshBackground({ dark = false }: { dark?: boolean }) {
  if (dark) {
    return (
      <>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(47,107,255,0.35),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_60%,rgba(122,83,255,0.18),transparent_45%)]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(47,107,255,0.06),transparent_55%)]" />
  );
}

export function LoopDiagram() {
  return (
    <div className="relative mx-auto mt-12 hidden max-w-lg lg:block" aria-hidden>
      <svg viewBox="0 0 400 400" className="w-full opacity-90">
        <defs>
          <linearGradient id="loopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2F6BFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7A53FF" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="url(#loopGrad)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
        />
        <circle
          cx="200"
          cy="200"
          r="100"
          fill="none"
          stroke="rgba(47,107,255,0.15)"
          strokeWidth="1"
        />
        <path
          d="M 200 60 A 140 140 0 1 1 199 60"
          fill="none"
          stroke="#2F6BFF"
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
        />
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 8 4, 0 8" fill="#2F6BFF" />
          </marker>
        </defs>
        <text
          x="200"
          y="205"
          textAnchor="middle"
          fill="#7FA6FF"
          fontSize="11"
          fontWeight="600"
          letterSpacing="2"
        >
          CLOSED LOOP
        </text>
        <text x="200" y="222" textAnchor="middle" fill="#6E7686" fontSize="10">
          6 modules → 1 system
        </text>
      </svg>
    </div>
  );
}

export function QuoteMark() {
  return (
    <span
      className="font-display text-5xl leading-none text-accent/20"
      aria-hidden
    >
      &ldquo;
    </span>
  );
}
