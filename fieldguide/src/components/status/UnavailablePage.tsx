import Sidebar from "../sidebar/sidebar";
import { theme } from "../../theme";

type UnavailablePageProps = {
  title?: string;
  message?: string;
  variant?: "standard" | "welcome";
  showSidebar?: boolean;
};

export default function UnavailablePage({
  title = "Page under construction",
  message = "This section is temporarily closed for the season.",
  variant = "standard",
  showSidebar = true,
}: UnavailablePageProps) {
  const isWelcome = variant === "welcome";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f7efe9",
        color: theme.ink,
        padding: 24,
        position: "relative",
      }}
    >
      {showSidebar && (
        <div style={{ position: "absolute", top: 20, left: 20, zIndex: 20 }}>
          <Sidebar />
        </div>
      )}

      {isWelcome ? (
        <div
          style={{
            width: "min(90vw, 520px)",
            border: `3px solid ${theme.ink}`,
            background: theme.paper,
            boxShadow: "14px 14px 0 rgba(42, 19, 17, 0.16)",
            textAlign: "center",
            padding: "28px 24px 26px",
            display: "grid",
            placeItems: "center",
            gap: 12,
          }}
        >
          <img
            src="/plants/molumen-filigree.svg"
            alt="Fieldguide floral emblem"
            style={{
              width: 128,
              height: 128,
              display: "block",
              color: theme.red,
              fill: theme.red,
            }}
          />

          <img
            src="/assets/Fieldguidelogo.png"
            alt="Fieldguide logo"
            style={{
              width: 260,
              height: "auto",
              display: "block",
            }}
          />

          <p
            style={{
              margin: "2px 0 0",
              fontFamily: '"Times New Roman", Georgia, serif',
              fontSize: 16,
              lineHeight: 1.3,
              fontStyle: "italic",
              fontWeight: 700,
              color: theme.ink,
              letterSpacing: "0.04em",
            }}
          >
            Keep track. Keep growing.
          </p>

          <img
            src="/plants/molumen-filigree.svg"
            alt="Fieldguide floral emblem bottom"
            style={{
              width: 128,
              height: 128,
              display: "block",
              color: theme.red,
              fill: theme.red,
              opacity: 0.9,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: "min(90vw, 560px)",
            border: `3px solid ${theme.ink}`,
            background: theme.paper,
            boxShadow: "12px 12px 0 rgba(42, 19, 17, 0.14)",
            textAlign: "center",
            padding: "32px 24px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              lineHeight: 1,
              color: theme.red,
              fontFamily: '"Times New Roman", Georgia, serif',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            404
          </div>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: 28,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: theme.ink,
              fontFamily: '"Times New Roman", Georgia, serif',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.5,
              fontStyle: "italic",
              fontWeight: 700,
              color: theme.ink,
              fontFamily: '"Times New Roman", Georgia, serif',
            }}
          >
            {message}
          </p>
        </div>
      )}
    </main>
  );
}
