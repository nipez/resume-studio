import { Reveal } from "./reveal-on-scroll";

export function MarketingHomeTemplates() {
  return (
    <Reveal className="tgrid">
      <div className="tcard">
        <div className="tpaper">
          <div className="bar" style={{ height: 14, width: "55%", background: "var(--ink)" }} />
          <div className="bar" style={{ height: 7, width: "38%", background: "var(--coral)", marginTop: 8 }} />
          <div style={{ height: 1, background: "rgba(40,20,30,.12)", margin: "16px 0" }} />
          <div className="bar" style={{ height: 6, width: "90%", background: "rgba(40,20,30,.14)", marginBottom: 7 }} />
          <div className="bar" style={{ height: 6, width: "82%", background: "rgba(40,20,30,.14)", marginBottom: 7 }} />
          <div className="bar" style={{ height: 6, width: "88%", background: "rgba(40,20,30,.14)", marginBottom: 18 }} />
          <div className="bar" style={{ height: 8, width: "30%", background: "var(--ink)", marginBottom: 9 }} />
          <div className="bar" style={{ height: 6, width: "85%", background: "rgba(40,20,30,.12)", marginBottom: 7 }} />
          <div className="bar" style={{ height: 6, width: "78%", background: "rgba(40,20,30,.12)" }} />
        </div>
        <div className="tname">Classic</div>
      </div>
      <div className="tcard">
        <div className="tpaper" style={{ padding: 0, display: "grid", gridTemplateColumns: "34% 1fr" }}>
          <div style={{ background: "var(--ink)", padding: "18px 14px" }}>
            <div style={{ height: 40, width: 40, borderRadius: "50%", background: "rgba(255,255,255,.2)", marginBottom: 14 }} />
            <div className="bar" style={{ height: 6, width: "80%", background: "rgba(255,255,255,.3)", marginBottom: 7 }} />
            <div className="bar" style={{ height: 6, width: "65%", background: "rgba(255,255,255,.2)", marginBottom: 7 }} />
            <div className="bar" style={{ height: 6, width: "72%", background: "rgba(255,255,255,.2)" }} />
          </div>
          <div style={{ padding: "20px 16px" }}>
            <div className="bar" style={{ height: 11, width: "60%", background: "var(--ink)" }} />
            <div className="bar" style={{ height: 6, width: "40%", background: "var(--coral)", marginTop: 7, marginBottom: 16 }} />
            <div className="bar" style={{ height: 6, width: "92%", background: "rgba(40,20,30,.13)", marginBottom: 7 }} />
            <div className="bar" style={{ height: 6, width: "84%", background: "rgba(40,20,30,.13)", marginBottom: 7 }} />
            <div className="bar" style={{ height: 6, width: "88%", background: "rgba(40,20,30,.13)" }} />
          </div>
        </div>
        <div className="tname">Two-Column</div>
      </div>
      <div className="tcard">
        <div className="tpaper">
          <div className="bar" style={{ height: 26, width: "70%", background: "var(--coral)" }} />
          <div className="bar" style={{ height: 7, width: "45%", background: "rgba(40,20,30,.3)", marginTop: 10, marginBottom: 20 }} />
          <div style={{ display: "flex", gap: 7, marginBottom: 18 }}>
            <div style={{ height: 18, width: 46, background: "rgba(255,92,56,.16)", borderRadius: 5 }} />
            <div style={{ height: 18, width: 46, background: "rgba(255,92,56,.16)", borderRadius: 5 }} />
            <div style={{ height: 18, width: 46, background: "rgba(255,92,56,.16)", borderRadius: 5 }} />
          </div>
          <div className="bar" style={{ height: 6, width: "90%", background: "rgba(40,20,30,.13)", marginBottom: 7 }} />
          <div className="bar" style={{ height: 6, width: "84%", background: "rgba(40,20,30,.13)", marginBottom: 7 }} />
          <div className="bar" style={{ height: 6, width: "78%", background: "rgba(40,20,30,.13)" }} />
        </div>
        <div className="tname">Editorial</div>
      </div>
    </Reveal>
  );
}
