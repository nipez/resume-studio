import type { ReactNode } from "react";

type DetailSectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  variant?: "default" | "dark";
};

export function DetailSection({
  title,
  description,
  actions,
  children,
  className = "",
  bodyClassName = "",
  variant = "default",
}: DetailSectionProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={`rounded-2xl border p-5 ${
        isDark
          ? "border-transparent bg-sidebar text-[#E4E8EE]"
          : "border-border bg-white"
      } ${className}`}
    >
      <div
        className={`mb-4 flex flex-wrap items-start justify-between gap-3 ${
          actions ? "" : "mb-3"
        }`}
      >
        <div className="min-w-0">
          <h2
            className={`font-display text-[13px] font-semibold uppercase tracking-[0.07em] ${
              isDark ? "text-[#9FC0FF]" : "text-[#8A92A0]"
            }`}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={`mt-1 text-[12px] leading-[1.45] ${
                isDark ? "text-[#AEB6C2]" : "text-[#8A92A0]"
              }`}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
