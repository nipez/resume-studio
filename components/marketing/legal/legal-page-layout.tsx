import Link from "next/link";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import type { LegalSection } from "@/lib/marketing/legal";
import "@/components/marketing/home/marketing-home.css";
import "@/components/marketing/shared/marketing-subpage.css";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
};

export function LegalPageLayout({
  eyebrow,
  title,
  subtitle,
  updated,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="marketing-home">
      <section className="sub-hero">
        <div className="wrap">
          <Reveal className="sub-hero-inner">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p className="sub-hero-sub">{subtitle}</p>
            <p className="legal-updated">Last updated: {updated}</p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="legal-prose">
            {sections.map((section) => (
              <div key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            <p style={{ marginTop: 40 }}>
              <Link href="/" className="features-inline-link">
                ← Back to home
              </Link>
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
