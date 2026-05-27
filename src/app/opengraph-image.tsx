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
            padding: "72px 64px",
            flex: 1,
          }}
        >
          {/* Brand label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#0F766E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#CCFBF1",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "18px",
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
              fontSize: "60px",
              fontWeight: "800",
              color: "#1C1917",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              marginBottom: "22px",
            }}
          >
            Financial tools
            <br />
            that work for you.
          </div>

          {/* Subheadline */}
          <div
            style={{
              fontSize: "20px",
              color: "#78716C",
              lineHeight: 1.5,
              marginBottom: "44px",
              maxWidth: "510px",
            }}
          >
            Tax calculators, savings estimators, budget planner, and financial
            dictionary — all free, all private.
          </div>

          {/* Tool type pills */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              "Tax Calculators",
              "Savings Tools",
              "Budget Planner",
              "Financial Dictionary",
            ].map((label) => (
              <div
                key={label}
                style={{
                  backgroundColor: "#F0FDF4",
                  border: "1.5px solid #BBF7D0",
                  color: "#15803D",
                  borderRadius: "999px",
                  padding: "8px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Bottom privacy note */}
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#A8A29E",
                display: "flex",
              }}
            />
            <span style={{ fontSize: "13px", color: "#A8A29E" }}>
              All calculations run in your browser. Nothing is sent anywhere.
            </span>
          </div>
        </div>

        {/* Right teal panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "380px",
            backgroundColor: "#0F766E",
            padding: "56px 44px",
          }}
        >
          {/* Panel heading */}
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#99F6E4",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "28px",
              display: "flex",
            }}
          >
            What&apos;s inside
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
            {[
              { title: "Tax Calculators", desc: "Nigeria · UK · Canada · US · Rwanda" },
              { title: "Compound Interest", desc: "Monthly, annual & Nigerian FD modes" },
              { title: "Savings Estimator", desc: "Multi-year projections with top-ups" },
              { title: "Budget Calculator", desc: "Allocate income across categories" },
              { title: "Financial Dictionary", desc: "146 terms, plain English" },
            ].map((item) => (
              <div
                key={item.title}
                style={{ display: "flex", flexDirection: "column", gap: "3px" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      backgroundColor: "#5EEAD4",
                      flexShrink: 0,
                      display: "flex",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    {item.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#5EEAD4",
                    paddingLeft: "13px",
                    display: "flex",
                  }}
                >
                  {item.desc}
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
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#CCFBF1" }}>
              Finance Buddy
            </span>
            <span style={{ fontSize: "11px", color: "#5EEAD4" }}>
              financebuddy.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
