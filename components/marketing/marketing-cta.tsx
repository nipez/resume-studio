import Link from "next/link";

type MarketingCtaProps = {
  title?: string;
  description?: string;
};

export function MarketingCta({
  title = "Ready when you are",
  description = "Sign in with a magic link and start building your resume library in minutes. Free during beta.",
}: MarketingCtaProps) {
  return (
    <section className="bg-gradient-to-br from-sidebar via-[#1b2740] to-sidebar">
      <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-[#AEB6C2]">
          {description}
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-[11px] bg-accent px-6 py-3 text-[14px] font-semibold text-white shadow-accent transition hover:bg-accent-dark"
        >
          Open Resume Studio
        </Link>
      </div>
    </section>
  );
}
