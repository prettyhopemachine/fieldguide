"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import type { GridPlot } from "../components/canvas/grid";
import PlantPicker from "../components/plants/plant-picker";
import ModeToolbar from "../components/toolbar/modes";
import Toolshed, { type PlotTool } from "../components/toolbar/toolshed";
import CanvasToolbar from "../components/toolbar/zoom";
import type { PlantRecord } from "../lib/plants";
import { theme } from "../theme";

const greenhouseStyle = {
  position: "absolute" as const,
  left: 80,
  top: 136,
  width: 280,
  zIndex: 8,
  border: "2px solid #2a1311",
  background: "#dfe9d5",
  boxShadow: "8px 8px 0 rgba(132, 208, 151, 0.7)",
  maxHeight: "calc(100vh - 170px)",
  overflow: "hidden",
  transition: "transform 0.22s ease, box-shadow 0.22s ease",
};

const MY_PLANTS_STORAGE_KEY = "fieldguide-my-plants";

export default function Home() {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [buildMode, setBuildMode] = useState(false);
  const [plantMode, setPlantMode] = useState(false);
  const [plantPickerOpen, setPlantPickerOpen] = useState(false);
  const [plotTool, setPlotTool] = useState<PlotTool>("select");
  const [plots, setPlots] = useState<GridPlot[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [myPlants, setMyPlants] = useState<PlantRecord[]>([]);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(MY_PLANTS_STORAGE_KEY);
      if (storedValue) {
        setMyPlants(JSON.parse(storedValue) as PlantRecord[]);
      }

      const hasSeenWelcome = window.localStorage.getItem("fieldguide-welcome-seen");
      setWelcomeOpen(hasSeenWelcome !== "true");
    } catch {
      setMyPlants([]);
      setWelcomeOpen(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(MY_PLANTS_STORAGE_KEY, JSON.stringify(myPlants));
  }, [myPlants]);

  const handleWelcomeClose = () => {
    setWelcomeOpen(false);
    window.localStorage.setItem("fieldguide-welcome-seen", "true");
  };

  const addPlant = (plant: PlantRecord) => {
    setMyPlants((current) =>
      current.some((entry) => entry.id === plant.id) ? current : [...current, plant],
    );
  };

  const addPlot = (plot: GridPlot) => {
    setPlots((current) => [...current, plot]);
    setSelectedPlotId(plot.id);
    setPlotTool("select");
  };

  const handlePlantDrop = (plant: PlantRecord, x: number, y: number) => {
    const nextPlot: GridPlot = {
      id: `plant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      kind: "rect",
      x: Math.round(x / 50) * 50,
      y: Math.round(y / 50) * 50,
      width: 110,
      height: 80,
      plantName: plant.name,
      plantImageUrl: "/plants/flower-svgrepo-com (2).svg",
    };

    addPlot(nextPlot);
  };

  const removePlot = (plotId: string) => {
    setPlots((current) => current.filter((plot) => plot.id !== plotId));
    setSelectedPlotId((current) => (current === plotId ? null : current));
  };

  const movePlot = (plotId: string, nextX: number, nextY: number) => {
    setPlots((current) =>
      current.map((plot) =>
        plot.id === plotId
          ? {
              ...plot,
              x: nextX,
              y: nextY,
            }
          : plot,
      ),
    );
  };

  const resizePlot = (plotId: string, nextWidth: number, nextHeight: number) => {
    setPlots((current) =>
      current.map((plot) =>
        plot.id === plotId
          ? {
              ...plot,
              width: nextWidth,
              height: nextHeight,
            }
          : plot,
      ),
    );
  };

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#d9b8aa",
        overflow: "hidden",
      }}
    >
      {welcomeOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "24px",
            backgroundColor: "rgba(217, 184, 170, 0.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            backgroundImage:
              "linear-gradient(rgba(42, 19, 17, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(42, 19, 17, 0.05) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        >
          <div
            style={{
              display: "grid",
              placeItems: "center",
              gap: 12,
              textAlign: "center",
              width: "min(90vw, 520px)",
              padding: "14px 14px 12px",
              background: theme.paper,
              border: `3px solid ${theme.ink}`,
              boxShadow: "14px 14px 0 rgba(42, 19, 17, 0.16)",
              position: "relative",
            }}
          >
            <img
              src="/plants/molumen-filigree.svg"
              alt="Fieldguide floral emblem"
              style={{
                width: 136,
                height: 136,
                display: "block",
                marginBottom: -4,
                filter: "none",
                color: theme.red,
                fill: theme.red,
              }}
            />

            <img
              src="/assets/Fieldguidelogo.png"
              alt="Fieldguide logo"
              style={{
                width: 280,
                height: "auto",
                display: "block",
                filter: "none",
                marginTop: -6,
              }}
            />

            <p
              style={{
                margin: "2px 0 0",
                fontFamily: '"Times New Roman", Georgia, serif',
                fontSize: 14,
                lineHeight: .8,
                fontStyle: "italic",
                fontWeight: 700,
                color: theme.ink,
                letterSpacing: "0.04em",
              }}
            >
              Keep track. Keep growing.
            </p>

            <button
              type="button"
              onClick={handleWelcomeClose}
              style={{
                marginTop: 6,
                border: `2px solid ${theme.ink}`,
                background: theme.red,
                color: theme.ink,
                padding: "8px 14px",
                fontFamily: '"Times New Roman", Georgia, serif',
                fontSize: 18,
                cursor: "pointer",
                boxShadow: "4px 4px 0 rgba(42, 19, 17, 0.12)",
              }}
            >
              ENTER
            </button>

            <img
              src="/plants/molumen-filigree.svg"
              alt="Fieldguide floral emblem bottom"
              style={{
                width: 136,
                height: 136,
                display: "block",
                marginTop: 4,
                opacity: 0.9,
                filter: "none",
                color: theme.red,
                fill: theme.red,
              }}
            />
          </div>
        </div>
      )}

      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 50 }}>
          <Sidebar />
        </div>

        <div style={{ width: "100%", height: "100vh" }}>
          <ModeToolbar
            mode={mode}
            buildMode={buildMode}
            plantMode={plantMode}
            onModeChange={(nextMode: "view" | "edit") => {
              setMode(nextMode);
              setBuildMode(false);
              setPlantMode(false);
              setPlotTool("select");
              if (nextMode === "view") {
                setSelectedPlotId(null);
              }
            }}
            onSave={() => {
              setMode("view");
              setBuildMode(false);
              setPlantMode(false);
              setPlotTool("select");
              setSelectedPlotId(null);
            }}
            onCancel={() => {
              setMode("view");
              setBuildMode(false);
              setPlantMode(false);
              setPlotTool("select");
              setSelectedPlotId(null);
            }}
            onBuildModeChange={(nextBuildMode: boolean) => {
              setBuildMode(nextBuildMode);
              setPlantMode(false);
              setSelectedPlotId(null);
              setPlotTool(nextBuildMode ? "rect" : "select");
            }}
            onPlantModeChange={(nextPlantMode: boolean) => {
              setPlantMode(nextPlantMode);
              setBuildMode(false);
              setSelectedPlotId(null);
              setPlotTool(nextPlantMode ? "move" : "select");
            }}
            onPlantPickerOpen={() => setPlantPickerOpen(true)}
          />

          <Toolshed
            mode={mode}
            buildMode={buildMode}
            plantMode={plantMode}
            activeTool={plotTool}
            onToolChange={setPlotTool}
            onPlantPickerOpen={() => setPlantPickerOpen(true)}
          />

          <CanvasToolbar
            mode={mode}
            buildMode={buildMode}
            plots={plots}
            plotTool={plotTool}
            selectedPlotId={selectedPlotId}
            onPlotAdd={addPlot}
            onPlotRemove={removePlot}
            onSelectPlot={setSelectedPlotId}
            onPlotMove={movePlot}
            onPlotResize={resizePlot}
            onPlantDrop={handlePlantDrop}
          />
        </div>
      </div>

      <aside
        style={{
          ...greenhouseStyle,
          opacity: mode === "edit" && plantMode ? 1 : 0,
          pointerEvents: mode === "edit" && plantMode ? "auto" : "none",
          transform: mode === "edit" && plantMode ? "translateX(0)" : "translateX(-340px)",
          boxShadow:
            mode === "edit" && plantMode
              ? "12px 12px 0 rgba(42, 19, 17, 0.14)"
              : "8px 8px 0 rgba(42, 19, 17, 0.14)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #2a1311",
            background: "#2a1311",
            color: "#f7efe9",
            padding: "12px 14px",
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          <span>Greenhouse</span>
          <button
            type="button"
            aria-label="Open plant picker"
            onClick={() => setPlantPickerOpen(true)}
            style={{
              width: 28,
              height: 28,
              border: "2px solid #f7efe9",
              background: "transparent",
              color: "#f7efe9",
              fontSize: 22,
              lineHeight: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              boxSizing: "border-box",
              transform: "translateY(-1px)",
            }}
          >
            +
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
            padding: 12,
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
          }}
        >
          {myPlants.length === 0 ? (
            <div style={{ fontWeight: 700, color: "#2a1311", textShadow: "none", fontStyle: "italic" }}>
              Find plants to start your tray.
            </div>
          ) : (
            myPlants.map((plant) => (
              <div
                key={plant.id}
                draggable
                onDragStart={(event) => {
                  const dragImage = new Image();
                  dragImage.src = "/plants/shovel-svgrepo-com.svg";
                  dragImage.onload = () => {
                    event.dataTransfer.setDragImage(dragImage, dragImage.width / 2, dragImage.height / 2);
                  };

                  event.dataTransfer.setData("application/fieldguide-plant", JSON.stringify(plant));
                  event.dataTransfer.effectAllowed = "copy";
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr",
                  gap: 10,
                  alignItems: "center",
                  padding: 8,
                  border: "2px solid #2a1311",
                  background: "#2a1311",
                  color: "#f7efe9",
                  cursor: "grab",
                  boxShadow: "0 2px 0 rgba(42, 19, 17, 0.12)",
                  transition: "transform 0.16s ease, box-shadow 0.16s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = "translateY(-2px)";
                  event.currentTarget.style.boxShadow = "0 6px 0 rgba(42, 19, 17, 0.18)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.boxShadow = "0 2px 0 rgba(42, 19, 17, 0.12)";
                }}
              >
                {plant.image_url ? (
                  <img
                    src={plant.image_url}
                    alt={plant.name}
                    style={{
                      width: 56,
                      height: 56,
                      objectFit: "cover",
                      border: "2px solid #2a1311",
                      background: "#e8cdbd",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      display: "grid",
                      placeItems: "center",
                      border: "2px solid #2a1311",
                      background: "#e8cdbd",
                      fontSize: 20,
                    }}
                  >
                    🌿
                  </div>
                )}

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 13,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "#f7efe9",
                    }}
                  >
                    {plant.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.8,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "#f7efe9",
                    }}
                  >
                    {plant.type}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <PlantPicker
        open={plantPickerOpen}
        onClose={() => setPlantPickerOpen(false)}
        mode={mode}
        onAddPlant={addPlant}
        existingPlants={myPlants}
      />
    </main>
  );
}