import { ImageResponse } from "next/og";

// The preview image shown when someone shares the PostKori link on Facebook, LinkedIn, etc.
export const alt = "PostKori — AI Facebook post generator for Bangladeshi online sellers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #eef6ff 0%, #ffffff 60%, #fff3e8 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "24px",
              background: "#2f6bff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "56px",
            }}
          >
            📸
          </div>
          <div style={{ display: "flex", fontSize: "80px", fontWeight: 800, color: "#0f172a" }}>
            Post<span style={{ color: "#2f6bff" }}>Kori</span>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: "40px", fontSize: "44px", fontWeight: 700, color: "#0f172a" }}>
          Product photo in. Facebook post out.
        </div>
        <div style={{ display: "flex", marginTop: "16px", fontSize: "30px", color: "#64748b" }}>
          AI captions, descriptions, hashtags & price posts in Bangla and English.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "48px",
            alignSelf: "flex-start",
            background: "#ff7a1a",
            color: "white",
            fontSize: "26px",
            fontWeight: 700,
            padding: "12px 28px",
            borderRadius: "999px",
          }}
        >
          Free for Bangladeshi online sellers
        </div>
      </div>
    ),
    size,
  );
}
