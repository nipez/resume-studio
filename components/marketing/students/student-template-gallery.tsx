import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import "@/components/marketing/home/marketing-home-templates.css";

// Mirrors the homepage "print-ready" template mockups (same markup, CSS, and
// hover effect) but with high-school student sample content. Wrapped in
// `.marketing-home` so the shared `marketing-home-templates.css` styles apply.
export function StudentTemplateGallery() {
  return (
    <div className="marketing-home">
      <Reveal className="tgrid">
        <div className="tcard">
          <div className="paper">
            <div className="classic">
              <div className="head">
                <div className="r-name">Jordan Chen</div>
                <div className="r-role">High School Senior</div>
                <div className="contact">
                  jordan.chen@email.com · (503) 555-0142 · Portland, OR
                </div>
              </div>

              <div className="sec">
                <div className="r-h">Summary</div>
                <div className="r-p">
                  Motivated senior with leadership in athletics and community
                  service. National Honor Society member seeking a part-time
                  role or summer internship.
                </div>
              </div>

              <div className="sec">
                <div className="r-h">Experience</div>
                <div className="row">
                  <span className="r-job">Varsity Soccer Captain</span>
                  <span className="r-date">2024 — Now</span>
                </div>
                <div className="r-co">Lincoln High School</div>
                <div className="r-li">
                  Led weekly practices and mentored underclassmen.
                </div>
                <div className="r-li">
                  Organized a team service day — 40 volunteers, 120 meal kits.
                </div>
                <div className="row" style={{ marginTop: 9 }}>
                  <span className="r-job">Barista</span>
                  <span className="r-date">2024 — Now</span>
                </div>
                <div className="r-co">River Roast Coffee</div>
                <div className="r-li">
                  Handled register and mobile orders; trained two new hires.
                </div>
              </div>

              <div className="sec">
                <div className="r-h">Education</div>
                <div className="row">
                  <span className="r-job">Diploma · GPA 3.8</span>
                  <span className="r-date">2026</span>
                </div>
                <div className="r-co">Lincoln High School · AP Bio, AP English</div>
              </div>

              <div className="sec">
                <div className="r-h">Skills</div>
                <div className="skills">
                  <span className="chip">Leadership</span>
                  <span className="chip">Public Speaking</span>
                  <span className="chip">Customer Service</span>
                  <span className="chip">Spanish</span>
                  <span className="chip">MS Office</span>
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
            <div className="twocol">
              <div className="side">
                <div className="avatar">JC</div>
                <div className="r-h">Contact</div>
                <div className="txt">
                  jordan.chen@email.com
                  <br />
                  (503) 555-0142
                  <br />
                  Portland, OR
                </div>

                <div className="r-h">Skills</div>
                <div className="sk">
                  <span>Leadership</span>
                  <span className="meter">
                    <span style={{ width: "92%" }} />
                  </span>
                </div>
                <div className="sk">
                  <span>Public Speaking</span>
                  <span className="meter">
                    <span style={{ width: "85%" }} />
                  </span>
                </div>
                <div className="sk">
                  <span>Spanish</span>
                  <span className="meter">
                    <span style={{ width: "70%" }} />
                  </span>
                </div>

                <div className="r-h">Education</div>
                <div className="txt">
                  <b style={{ color: "#fff" }}>Lincoln HS</b>
                  <br />
                  Diploma · GPA 3.8
                  <br />
                  Class of 2026
                </div>
              </div>
              <div className="main">
                <div className="r-name">Jordan Chen</div>
                <div className="r-role">High School Senior</div>

                <div className="r-h">Profile</div>
                <div className="r-p">
                  Senior with strong leadership in athletics and community
                  service. Reliable, organized, and eager to contribute.
                </div>

                <div className="r-h">Experience</div>
                <div className="row">
                  <span className="r-job">Soccer Captain</span>
                  <span className="r-date">2024—Now</span>
                </div>
                <div className="r-co">Lincoln High School</div>
                <div className="r-li">Led practices; mentored underclassmen.</div>
                <div className="r-li">Ran a team service day for 40 volunteers.</div>

                <div className="row" style={{ marginTop: 8 }}>
                  <span className="r-job">Volunteer</span>
                  <span className="r-date">2022—Now</span>
                </div>
                <div className="r-co">Portland Food Bank</div>
                <div className="r-li">Packs groceries for 50+ families weekly.</div>
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
                  Jordan<b>Chen</b>
                </div>
                <div className="badge">JC</div>
              </div>
              <div className="r-role">High School Senior</div>
              <div className="rule" />

              <div className="chips">
                <span className="chip">Leadership</span>
                <span className="chip alt">Volunteering</span>
                <span className="chip alt">Honor Roll</span>
                <span className="chip">Athletics</span>
              </div>

              <div className="cols">
                <div className="lead">
                  <div className="ed-blk">
                    <div className="r-h">Experience</div>
                    <div className="row">
                      <span className="r-job">Soccer Captain</span>
                      <span className="r-date">&apos;24—Now</span>
                    </div>
                    <div className="r-co">Lincoln High School</div>
                    <div className="r-li">Led practices; mentored teammates.</div>
                    <div className="r-li">Organized a 40-person service day.</div>
                  </div>
                  <div className="ed-blk">
                    <div className="row">
                      <span className="r-job">Volunteer</span>
                      <span className="r-date">&apos;22—Now</span>
                    </div>
                    <div className="r-co">Portland Food Bank</div>
                    <div className="r-li">Bilingual greeter; packs groceries.</div>
                  </div>
                </div>
                <div className="side">
                  <div className="r-h">Profile</div>
                  <div className="r-p">
                    Senior with a 3.8 GPA, leadership in sports, and 200+ service
                    hours.
                  </div>
                  <div className="r-h">Top Skills</div>
                  <div className="skill-row">
                    <span>Leadership</span>
                    <span>Strong</span>
                  </div>
                  <div className="skill-row">
                    <span>Public Speaking</span>
                    <span>Strong</span>
                  </div>
                  <div className="skill-row" style={{ border: "none" }}>
                    <span>Spanish</span>
                    <span>Conversational</span>
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
    </div>
  );
}
