import { Reveal } from "./reveal-on-scroll";
import "./marketing-home-templates.css";

export function MarketingHomeTemplates() {
  return (
    <Reveal className="tgrid">
      <div className="tcard">
        <div className="paper">
          <div className="classic">
            <div className="head">
              <div className="r-name">Jordan Avery</div>
              <div className="r-role">Senior Product Designer</div>
              <div className="contact">
                jordan.avery@email.com · (415) 555-0182 · San Francisco, CA ·
                linkedin.com/in/javery
              </div>
            </div>

            <div className="sec">
              <div className="r-h">Summary</div>
              <div className="r-p">
                Product designer with 8+ years shaping B2B SaaS platforms
                end-to-end. Led design systems, research, and 0→1 launches
                across fintech and developer tools.
              </div>
            </div>

            <div className="sec">
              <div className="r-h">Experience</div>
              <div className="row">
                <span className="r-job">Senior Product Designer</span>
                <span className="r-date">2021 — Present</span>
              </div>
              <div className="r-co">Northwind Labs</div>
              <div className="r-li">
                Owned the core dashboard redesign, lifting weekly active use by
                34%.
              </div>
              <div className="r-li">
                Built and maintained a 60-component design system adopted
                org-wide.
              </div>
              <div className="row" style={{ marginTop: 9 }}>
                <span className="r-job">Product Designer</span>
                <span className="r-date">2018 — 2021</span>
              </div>
              <div className="r-co">Cobalt Software</div>
              <div className="r-li">
                Shipped onboarding flow that cut time-to-value from 9 days to 2.
              </div>
            </div>

            <div className="sec">
              <div className="r-h">Education</div>
              <div className="row">
                <span className="r-job">B.F.A. Interaction Design</span>
                <span className="r-date">2014 — 2018</span>
              </div>
              <div className="r-co">Rhode Island School of Design</div>
            </div>

            <div className="sec">
              <div className="r-h">Skills</div>
              <div className="skills">
                <span className="chip">Figma</span>
                <span className="chip">Prototyping</span>
                <span className="chip">Design Systems</span>
                <span className="chip">User Research</span>
                <span className="chip">HTML/CSS</span>
                <span className="chip">Accessibility</span>
              </div>
            </div>
          </div>
        </div>
        <div className="tname">
          Classic <span className="pill">Single column</span>
        </div>
      </div>

      <div className="tcard">
        <div className="paper">
          <div className="modern">
            <div className="r-name">Jordan Avery</div>
            <div className="r-role">Senior Product Designer</div>
            <div className="contact">
              <span>jordan.avery@email.com</span>
              <span>(415) 555-0182</span>
              <span>San Francisco</span>
            </div>
            <div className="grid">
              <div className="main">
                <div className="r-h">Summary</div>
                <div className="r-p">
                  Product designer with 8+ years shaping B2B SaaS end-to-end —
                  systems, research, and 0→1 launches.
                </div>
                <div className="r-h">Experience</div>
                <div className="r-job">Senior Product Designer</div>
                <div className="r-co">Northwind Labs</div>
                <div className="r-meta">2021 — Present</div>
                <div className="r-li">Dashboard redesign — +34% weekly active use.</div>
                <div className="r-li">Scaled a 60-component design system org-wide.</div>
              </div>
              <div className="side">
                <div className="r-h">Key Achievements</div>
                <div className="ach-t">Design system adoption</div>
                <div className="ach-d">Rolled out across 4 product teams in 6 months.</div>
                <div className="r-h">Skills</div>
                <div className="skills">
                  Figma, Prototyping, Research, Design Systems
                </div>
                <div className="r-h">Education</div>
                <div className="edu-t">B.F.A. Interaction Design</div>
                <div className="edu-d">RISD</div>
              </div>
            </div>
          </div>
        </div>
        <div className="tname">
          Modern <span className="pill">Light columns</span>
        </div>
      </div>

      <div className="tcard">
        <div className="paper">
          <div className="twocol">
            <div className="side">
              <div className="avatar">JA</div>
              <div className="r-h">Contact</div>
              <div className="txt">
                jordan.avery@email.com
                <br />
                (415) 555-0182
                <br />
                San Francisco, CA
                <br />
                linkedin.com/in/javery
              </div>

              <div className="r-h">Skills</div>
              <div className="sk">
                <span>Figma</span>
                <span className="meter">
                  <span style={{ width: "92%" }} />
                </span>
              </div>
              <div className="sk">
                <span>Prototyping</span>
                <span className="meter">
                  <span style={{ width: "85%" }} />
                </span>
              </div>
              <div className="sk">
                <span>Research</span>
                <span className="meter">
                  <span style={{ width: "78%" }} />
                </span>
              </div>
              <div className="sk">
                <span>Front-end</span>
                <span className="meter">
                  <span style={{ width: "70%" }} />
                </span>
              </div>

              <div className="r-h">Education</div>
              <div className="txt">
                <b style={{ color: "#fff" }}>RISD</b>
                <br />
                B.F.A. Interaction Design
                <br />
                2014 — 2018
              </div>
            </div>
            <div className="main">
              <div className="r-name">Jordan Avery</div>
              <div className="r-role">Senior Product Designer</div>

              <div className="r-h">Profile</div>
              <div className="r-p">
                Product designer with 8+ years building B2B SaaS from research
                through launch, with a focus on design systems and developer
                tooling.
              </div>

              <div className="r-h">Experience</div>
              <div className="row">
                <span className="r-job">Senior Product Designer</span>
                <span className="r-date">2021—Now</span>
              </div>
              <div className="r-co">Northwind Labs</div>
              <div className="r-li">
                Led dashboard redesign — +34% weekly active use.
              </div>
              <div className="r-li">
                Scaled a 60-component design system org-wide.
              </div>

              <div className="row" style={{ marginTop: 8 }}>
                <span className="r-job">Product Designer</span>
                <span className="r-date">2018—21</span>
              </div>
              <div className="r-co">Cobalt Software</div>
              <div className="r-li">Rebuilt onboarding; time-to-value 9d → 2d.</div>
              <div className="r-li">Ran the research program across 4 squads.</div>
            </div>
          </div>
        </div>
        <div className="tname">
          Two-Column <span className="pill">Sidebar</span>
        </div>
      </div>

      <div className="tcard">
        <div className="paper">
          <div className="editorial">
            <div className="topbar">
              <div className="r-name">
                Jordan<b>Avery</b>
              </div>
              <div className="badge">JA</div>
            </div>
            <div className="r-role">Senior Product Designer</div>
            <div className="rule" />

            <div className="chips">
              <span className="chip">Design Systems</span>
              <span className="chip alt">Research</span>
              <span className="chip alt">Prototyping</span>
              <span className="chip">0→1</span>
            </div>

            <div className="cols">
              <div className="lead">
                <div className="ed-blk">
                  <div className="r-h">Experience</div>
                  <div className="row">
                    <span className="r-job">Senior Product Designer</span>
                    <span className="r-date">&apos;21—Now</span>
                  </div>
                  <div className="r-co">Northwind Labs</div>
                  <div className="r-li">Core dashboard redesign — +34% WAU.</div>
                  <div className="r-li">Built 60-component design system.</div>
                </div>
                <div className="ed-blk">
                  <div className="row">
                    <span className="r-job">Product Designer</span>
                    <span className="r-date">&apos;18—&apos;21</span>
                  </div>
                  <div className="r-co">Cobalt Software</div>
                  <div className="r-li">Onboarding redesign, 9d → 2d to value.</div>
                </div>
              </div>
              <div className="side">
                <div className="r-h">Profile</div>
                <div className="r-p">
                  8+ years designing B2B SaaS end-to-end across fintech &amp; dev
                  tools.
                </div>
                <div className="r-h">Top Skills</div>
                <div className="skill-row">
                  <span>Figma</span>
                  <span>Expert</span>
                </div>
                <div className="skill-row">
                  <span>Design Systems</span>
                  <span>Expert</span>
                </div>
                <div className="skill-row">
                  <span>User Research</span>
                  <span>Advanced</span>
                </div>
                <div className="skill-row" style={{ border: "none" }}>
                  <span>HTML / CSS</span>
                  <span>Advanced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="tname">
          Editorial <span className="pill">Statement</span>
        </div>
      </div>
    </Reveal>
  );
}
