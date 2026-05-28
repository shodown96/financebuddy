import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/constants/app";

export const runtime = "edge";

export const alt = `${APP_NAME} — Free financial calculators for tax, savings, and wealth`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          backgroundColor: "#FAFAF9",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        {/* Left content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 72px",
            flex: 1,
          }}
        >
          {/* Brand label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#0F766E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#CCFBF1",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#0F766E",
                letterSpacing: "0.04em",
              }}
            >
              Finance Buddy
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "76px",
              fontWeight: "800",
              color: "#1C1917",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: "44px",
            }}
          >
            <span>Financial tools</span>
            <span>that work for you.</span>
          </div>

          {/* Tool type pills */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Tax", "Savings", "Budget", "Dictionary"].map((label) => (
              <div
                key={label}
                style={{
                  backgroundColor: "#F0FDF4",
                  border: "1.5px solid #BBF7D0",
                  color: "#15803D",
                  borderRadius: "999px",
                  padding: "10px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right teal panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "360px",
            backgroundColor: "#0F766E",
            padding: "64px 48px",
          }}
        >
          {/* Panel heading */}
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#99F6E4",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "32px",
              display: "flex",
            }}
          >
            Tools
          </div>

          {/* Feature list — titles only */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", flex: 1 }}>
            {[
              "Tax Calculators",
              "Compound Interest",
              "Savings Estimator",
              "Budget Calculator",
              "Financial Dictionary",
            ].map((title) => (
              <div
                key={title}
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#5EEAD4",
                    flexShrink: 0,
                    display: "flex",
                  }}
                />
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  {title}
                </span>
              </div>
            ))}
          </div>

          {/* Panel footer */}
          <div
            style={{
              paddingTop: "24px",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#CCFBF1" }}>
              Finance Buddy
            </span>
            <span style={{ fontSize: "12px", color: "#5EEAD4" }}>
              financebuddy.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
