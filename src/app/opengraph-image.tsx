import { ImageResponse } from "next/og";

// The preview image shown when someone shares the PostKori link on Facebook, LinkedIn, etc.
// Kept in English: the default OG renderer has no Bangla font.
export const alt = "PostKori — AI Facebook post generator for Bangladeshi online sellers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const EMERALD = "#0f3d2e";
const GOLD = "#b08d57";
const IVORY = "#fbf8f1";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: EMERALD,
          padding: "36px",
          fontFamily: "serif",
        }}
      >
        {/* Ivory panel framed by a double gold rule */}
        <div
          style={{
            flex: 1,
            display: "flex",
            border: `2px solid ${GOLD}`,
            padding: "10px",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${GOLD}`,
              background: IVORY,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "999px",
                background: EMERALD,
                border: `3px solid ${GOLD}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f3ead9",
                fontSize: "44px",
              }}
            >
              P
            </div>
            <div style={{ display: "flex", marginTop: "28px", fontSize: "84px", color: EMERALD }}>PostKori</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: "12px", color: GOLD, fontSize: "24px" }}>
              <div style={{ width: "120px", height: "1px", background: GOLD }} />
              <div style={{ margin: "0 18px" }}>◆</div>
              <div style={{ width: "120px", height: "1px", background: GOLD }} />
            </div>
            <div style={{ display: "flex", marginTop: "22px", fontSize: "40px", color: "#1c1917" }}>
              Product photo in. Facebook post out.
            </div>
            <div style={{ display: "flex", marginTop: "12px", fontSize: "26px", color: "#6b6358" }}>
              Captions, descriptions, hashtags and price posts in Bangla and English
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
