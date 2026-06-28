import { PRICING_PLANS } from "@/lib/marketing/content";
import "@/components/marketing/home/marketing-home-templates.css";

export function StudentHeroVisual() {
  const studentPlan = PRICING_PLANS.find((plan) => plan.id === "student")!;

  return (
    <div className="students-hero-visual" aria-hidden>
      <div className="students-sticky students-sticky-1">
        <span className="students-sticky-label">Sticky note</span>
        NHS · Varsity captain · Food bank shifts
      </div>
      <div className="students-sticky students-sticky-2">
        <span className="students-sticky-label">Activities</span>
        Honor roll · 3.8 GPA · Spanish club
      </div>

      <div className="students-resume-stack">
        <div className="students-resume-glow" />
        <div className="students-resume-mock">
          <div className="paper">
            <div className="classic">
              <div className="head">
                <div className="r-name">Jordan Chen</div>
                <div className="r-role">High School Senior</div>
                <div className="contact">
                  jordan.chen@email.com · Portland, OR
                </div>
              </div>
              <div className="sec">
                <div className="r-h">Experience</div>
                <div className="row">
                  <span className="r-job">Varsity Soccer Captain</span>
                  <span className="r-date">2024 — Now</span>
                </div>
                <div className="r-co">Lincoln High School</div>
                <div className="r-li">Led practices and mentored underclassmen.</div>
                <div className="r-li">Organized a team service day — 40 volunteers.</div>
              </div>
              <div className="sec">
                <div className="r-h">Activities</div>
                <div className="r-li">National Honor Society · 200+ service hours</div>
                <div className="r-li">Food bank volunteer — bilingual greeter</div>
              </div>
            </div>
          </div>
          <div className="students-resume-badge">
            <span className="students-resume-badge-dot" />
            Guided builder → PDF
          </div>
        </div>
      </div>

      <div className="students-hero-card">
        <div className="students-plan-kicker">Limited-time beta offer</div>
        <div className="students-plan-price">
          Free<span> · in beta</span>
        </div>
        <p>{studentPlan.description}</p>
        <ul>
          {studentPlan.features.slice(0, 4).map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
