import { ImageResponse } from "next/og";

export const alt = "Anti Trap Order (ATO) — A20 Culture Technology for Digital Guardians";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#07090D",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.12) 0%, transparent 50%)",
          padding: "70px 80px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          border: "8px solid #161B22",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1.5px solid rgba(16, 185, 129, 0.4)",
              color: "#10B981",
              fontSize: "28px",
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "14px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#10B981",
                fontWeight: 700,
              }}
            >
              A20 Culture Technology
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "#94A3B8",
                fontWeight: 500,
              }}
            >
              Digital Guardian Reflex System
            </span>
          </div>
        </div>

        {/* Center Title & Core Mission */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "980px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Anti Trap Order (ATO)
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#94A3B8",
              lineHeight: 1.4,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Melatih refleks kritis masyarakat Indonesia membedah rekayasa sosial dan penipuan digital melalui pembalikan sudut pandang (Perspective Inversion).
          </p>
        </div>

        {/* Bottom Feature Badges & Watermark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                padding: "8px 18px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#F1F5F9",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Perspective Inversion
            </div>
            <div
              style={{
                padding: "8px 18px",
                borderRadius: "9999px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34D399",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              10 Modus Nyata Indonesia
            </div>
            <div
              style={{
                padding: "8px 18px",
                borderRadius: "9999px",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "#A78BFA",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Stateless Zero-DB
            </div>
          </div>

          <span
            style={{
              fontSize: "16px",
              color: "#64748B",
              fontFamily: "monospace",
              fontWeight: 600,
            }}
          >
            ato.kousozo.tech
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
