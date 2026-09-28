"use client";

import { theme } from "../../theme";

export type PlotTool = "select" | "move" | "rect" | "circle" | "erase";

const buildToolOptions: Array<{ id: PlotTool; label: string; iconSrc: string }> = [
  { id: "select", label: "Select", iconSrc: "/plants/select-svgrepo-com (1).svg" },
  { id: "rect", label: "Rect", iconSrc: "/plants/rectangle-4-svgrepo-com.svg" },
  { id: "circle", label: "Circle", iconSrc: "/plants/circle-dashed-svgrepo-com.svg" },
  { id: "erase", label: "Erase", iconSrc: "/plants/erase-svgrepo-com.svg" },
];

const plantToolOptions: Array<{ id: PlotTool; label: string; iconSrc: string }> = [
  { id: "move", label: "Move", iconSrc: "/plants/shovel-svgrepo-com.svg" },
];

export default function Toolshed({
  mode,
  buildMode,
  plantMode,
  activeTool,
  onToolChange,
  onPlantPickerOpen,
}: {
  mode: "view" | "edit";
  buildMode?: boolean;
  plantMode?: boolean;
  activeTool: PlotTool;
  onToolChange?: (tool: PlotTool) => void;
  onPlantPickerOpen?: () => void;
}) {
  if (mode !== "edit" || (!buildMode && !plantMode)) return null;

  const visibleTools = buildMode ? buildToolOptions : plantToolOptions;

  return (
    <div
      style={{
        position: "absolute",
        top: 58,
        left: 80,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: 8,
        maxWidth: "calc(100vw - 120px)",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: `2px solid ${theme.ink}`,
          background: theme.paper,
          padding: "10px 12px",
          boxSizing: "border-box",
          minHeight: 44,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.3,
            textTransform: "uppercase",
            color: theme.ink,
            marginRight: 4,
            minWidth: 90,
            lineHeight: 1.1,
          }}
        >
          Toolshed
        </div>

        {visibleTools.map((tool) => {
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onToolChange?.(tool.id)}
              aria-label={tool.label}
              style={{
                border: `2px solid ${theme.ink}`,
                background: isActive ? theme.ink : theme.paper,
                color: isActive ? theme.paper : theme.ink,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: "8px 10px",
                minWidth: 42,
                height: 38,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                transition: "background 0.12s ease-out, transform 0.12s ease-out, box-shadow 0.12s ease-out",
              }}
              onMouseEnter={(event) => {
                if (!isActive) {
                  event.currentTarget.style.background = "#f3d6c9";
                  event.currentTarget.style.transform = "translateY(1px)";
                  event.currentTarget.style.boxShadow = "4px 4px 0 rgba(42, 19, 17, 0.08)";
                }
              }}
              onMouseLeave={(event) => {
                if (!isActive) {
                  event.currentTarget.style.background = theme.paper;
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {tool.id === "move" ? (
                <img
                  src={tool.iconSrc}
                  alt={tool.label}
                  aria-hidden="true"
                  style={{
                    width: 18,
                    height: 18,
                    display: "block",
                    filter: isActive ? "brightness(0) invert(1)" : "none",
                  }}
                />
              ) : (
                <img
                  src={tool.iconSrc}
                  alt={tool.label}
                  aria-hidden="true"
                  style={{
                    width: 16,
                    height: 16,
                    display: "block",
                    filter: isActive ? "brightness(0) invert(1)" : "none",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
