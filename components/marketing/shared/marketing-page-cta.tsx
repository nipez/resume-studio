import Link from "next/link";
import { SITE_NAME } from "@/lib/marketing/content";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";

type MarketingPageCtaProps = {
  title?: string;
  description?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function MarketingPageCta({
  title = "Ready when you are",
  description = "Sign in with a magic link and run your job search from one application OS. Free during beta.",
  secondaryHref,
  secondaryLabel,
}: MarketingPageCtaProps) {
  return (
    <section className="cta-sec">
      <div className="wrap">
        <Reveal className="cta">
          <div className="ring1" />
          <div className="ring2" />
          <div className="cta-inner">
            <h2>{title}</h2>
            <p>{description}</p>
            <Link href="/login" className="btn btn-dark">
              Open {SITE_NAME}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <div style={{ marginTop: 18 }}>
                <Link
                  href={secondaryHref}
                  className="link-underline"
                  style={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}
                >
                  {secondaryLabel}
                </Link>
              </div>
            ) : null}
            <div className="fine">No credit card · Magic link sign-in</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
