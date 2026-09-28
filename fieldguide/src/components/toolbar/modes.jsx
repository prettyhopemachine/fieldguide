"use client";

import { theme } from "../../theme";

const buttons = [
  { id: "view", label: "View" },
  { id: "edit", label: "Edit" },
];

const buttonStyle = {
  minWidth: 58,
  height: 34,
  border: `1px solid ${theme.ink}`,
  background: theme.paper,
  color: theme.ink,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  padding: "0 10px",
  lineHeight: 1,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  transition: "background 0.12s ease-out, color 0.12s ease-out",
};

export default function ModeToolbar({
  mode = "view",
  onModeChange,
  onSave,
  onCancel,
  buildMode = false,
  plantMode = false,
  onBuildModeChange,
  onPlantModeChange,
  onPlantPickerOpen,
}) {
  const getModeButtonStyle = (isActive, isLast) => ({
    width: 58,
    height: 34,
    border: "none",
    borderRight: isLast ? "none" : `1px solid ${theme.ink}`,
    background: isActive ? theme.paper : theme.ink,
    color: isActive ? theme.ink : theme.paper,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    padding: 0,
    lineHeight: 1,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    transition: "background 0.12s ease-out, color 0.12s ease-out, transform 0.12s ease-out",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 80,
        zIndex: 12,
        display: "flex",
        gap: 0,
        border: `2px solid ${theme.ink}`,
        background: theme.paper,
        boxSizing: "border-box",
      }}
    >
      {buttons.map((button, index) => {
        const isActive = mode === button.id;
        const isLast = index === buttons.length - 1;

        return (
          <button
            key={button.id}
            type="button"
            onClick={() => onModeChange?.(button.id)}
            style={getModeButtonStyle(isActive, isLast)}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = theme.paper;
                e.currentTarget.style.color = theme.ink;
                e.currentTarget.style.transform = "translateY(1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = theme.ink;
                e.currentTarget.style.color = theme.paper;
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {button.label}
          </button>
        );
      })}

      {mode === "edit" && (
        <div style={{ display: "flex", gap: 0, marginLeft: 8, borderLeft: `2px solid ${theme.ink}` }}>
          <button
            type="button"
            onClick={() => onBuildModeChange?.(!buildMode)}
            style={{
              ...buttonStyle,
              borderRight: `1px solid ${theme.ink}`,
              background: buildMode ? theme.ink : theme.paper,
              color: buildMode ? theme.paper : theme.ink,
              boxShadow: buildMode ? `inset 0 0 0 2px ${theme.paper}` : "none",
            }}
            onMouseEnter={(e) => {
              if (!buildMode) {
                e.currentTarget.style.background = "#f3d6c9";
                e.currentTarget.style.transform = "translateY(1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!buildMode) {
                e.currentTarget.style.background = theme.paper;
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {buildMode ? "Done" : "Build"}
          </button>
          <button
            type="button"
            onClick={() => onPlantModeChange?.(!plantMode)}
            style={{
              ...buttonStyle,
              background: plantMode ? theme.ink : theme.paper,
              color: plantMode ? theme.paper : theme.ink,
              boxShadow: plantMode ? `inset 0 0 0 2px ${theme.paper}` : "none",
              display: "inline-flex",
              gap: 6,
              padding: "0 12px",
            }}
            onMouseEnter={(e) => {
              if (!plantMode) {
                e.currentTarget.style.background = "#f3d6c9";
                e.currentTarget.style.transform = "translateY(1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!plantMode) {
                e.currentTarget.style.background = theme.paper;
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ display: "block" }}
            >
              <path
                d="M7.5 15V7M7.5 7.5V10.5M7.5 7.5C7.5 5.29086 5.70914 3.5 3.5 3.5H0.5V6.5C0.5 8.70914 2.29086 10.5 4.5 10.5H7.5M7.5 7.5H10.5C12.7091 7.5 14.5 5.70914 14.5 3.5V0.5H11.5C9.29086 0.5 7.5 2.29086 7.5 4.5V7.5ZM7.5 7.5L11.5 3.5M7.5 10.5L3.5 6.5"
                stroke="currentColor"
                strokeWidth="1.15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Plant
          </button>
          <button
            type="button"
            onClick={onSave}
            style={{ ...buttonStyle, background: theme.ink, color: theme.paper, marginLeft: 8 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#3d1a17";
              e.currentTarget.style.transform = "translateY(1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.ink;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{ ...buttonStyle, background: theme.paper, color: theme.ink }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3d6c9";
              e.currentTarget.style.transform = "translateY(1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.paper;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
