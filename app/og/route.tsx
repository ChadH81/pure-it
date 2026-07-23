import { ImageResponse } from "next/og";
import { decodeShare } from "@/lib/share";

export const runtime = "edge";

// 1200x630 branded result card for social unfurls.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const payload = decodeShare(searchParams.get("d"));

  const game = payload?.game ?? "Pure it!";
  const headline = payload?.headline ?? "Golf's side games, settled in seconds.";
  const sub = payload?.sub ?? "";
  const rows = (payload?.rows ?? []).slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          color: "#eef1f6",
          fontFamily: "sans-serif",
          background:
            "radial-gradient(900px 700px at 100% 0%, rgba(95,214,160,0.22), transparent 55%), linear-gradient(160deg, #2c3540 0%, #171b21 100%)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "#3fae7a",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "34px",
                fontWeight: 800,
                color: "#06231a",
              }}
            >
              P
            </div>
            <div style={{ marginLeft: "18px", fontSize: "30px", fontWeight: 700 }}>Pure it!</div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: "999px",
              border: "1px solid rgba(203,211,223,0.25)",
              color: "#cbd3df",
              fontSize: "26px",
              fontWeight: 600,
            }}
          >
            {game}
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: "64px", fontWeight: 800, lineHeight: 1.1 }}>
            {headline}
          </div>
          {sub ? (
            <div style={{ display: "flex", marginTop: "12px", fontSize: "30px", color: "#9aa5b4" }}>
              {sub}
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                marginTop: i === 0 ? "0px" : "10px",
                borderRadius: "16px",
                background: r.lead ? "rgba(95,214,160,0.16)" : "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "30px",
              }}
            >
              <div style={{ display: "flex", fontWeight: 600 }}>{r.label}</div>
              <div style={{ display: "flex", color: "#5fd6a0", fontWeight: 700 }}>{r.value}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", color: "#9aa5b4", fontSize: "26px" }}>
          <div style={{ display: "flex" }}>Free golf game calculators</div>
          <div style={{ display: "flex", color: "#cbd3df" }}>pure-it.vercel.app</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
