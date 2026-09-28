"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Konva from "konva";
import { Stage, Layer } from "react-konva";
import { theme } from "../../theme";
import type { PlantRecord } from "../../lib/plants";
import GardenGrid, { type GridPlot } from "../canvas/grid";

const GRID_EXTENT = 1000;
const ZOOM_STEP = 1.2;

const buildControlButtonStyle = (active: boolean) => ({
  width: "100%",
  height: 42,
  fontSize: 26,
  fontWeight: 700,
  border: "none",
  borderBottom: "1px solid #2a1311",
  background: active ? "#e8cdbd" : theme.paper,
  color: theme.ink,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  padding: 0,
  lineHeight: 1,
  transition: "background 0.12s ease-out, transform 0.12s ease-out",
});

// This component owns the canvas viewport controls and the edit-time drawing/drop behavior,
// not just zoom. Keeping those responsibilities together makes the toolbar easier to reason about.
export default function CanvasToolbar({
  mode,
  buildMode = false,
  plots = [],
  plotTool = "select",
  selectedPlotId = null,
  onPlotAdd,
  onPlotRemove,
  onSelectPlot,
  onPlotMove,
  onPlotResize,
  onPlantDrop,
}: {
  mode: "view" | "edit";
  buildMode?: boolean;
  plots?: GridPlot[];
  plotTool?: "select" | "move" | "rect" | "circle" | "erase";
  selectedPlotId?: string | null;
  onPlotToolChange?: (tool: "select" | "move" | "rect" | "circle" | "erase") => void;
  onPlotAdd?: (plot: GridPlot) => void;
  onPlotRemove?: (id: string) => void;
  onSelectPlot?: (id: string | null) => void;
  onPlotMove?: (id: string, nextX: number, nextY: number) => void;
  onPlotResize?: (id: string, nextWidth: number, nextHeight: number) => void;
  onPlantDrop?: (plant: PlantRecord, x: number, y: number) => void;
}) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 900, height: 600 });
  const [hoveredControl, setHoveredControl] = useState<string | null>(null);
  const [draftPlot, setDraftPlot] = useState<GridPlot | null>(null);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);
  const canEditPlots = mode === "edit" && (buildMode || plotTool === "move");

  const clampPosition = useCallback(
    (x: number, y: number) => {
      const stage = stageRef.current;
      if (!stage) return { x, y };

      const scaleX = stage.scaleX();
      const scaleY = stage.scaleY();
      const halfWorldX = GRID_EXTENT * scaleX;
      const halfWorldY = GRID_EXTENT * scaleY;

      const minX = size.width / 2 - halfWorldX;
      const maxX = size.width / 2 + halfWorldX;
      const minY = size.height / 2 - halfWorldY;
      const maxY = size.height / 2 + halfWorldY;

      return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY),
      };
    },
    [size.height, size.width],
  );

  useLayoutEffect(() => {
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;

      const isZoomGesture = e.evt.ctrlKey || e.evt.metaKey;

      if (isZoomGesture) {
        e.evt.preventDefault();

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (!pointer) return;

        const scaleBy = 1.05;
        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };

        stage.scale({ x: newScale, y: newScale });

        const bounded = clampPosition(newPos.x, newPos.y);
        stage.position(bounded);
        stage.batchDraw();
        return;
      }

      if (Math.abs(e.evt.deltaY) > 0 || Math.abs(e.evt.deltaX) > 0) {
        e.evt.preventDefault();

        const scaleX = stage.scaleX();
        const scaleY = stage.scaleY();
        const next = clampPosition(
          stage.x() + e.evt.deltaX / scaleX,
          stage.y() + e.evt.deltaY / scaleY,
        );

        stage.position(next);
        stage.batchDraw();
      }
    },
    [clampPosition],
  );

  const zoomIn = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const scale = stage.scaleX();
    stage.scale({ x: scale * ZOOM_STEP, y: scale * ZOOM_STEP });
    stage.batchDraw();
  }, []);

  const zoomOut = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const scale = stage.scaleX();
    stage.scale({ x: scale / ZOOM_STEP, y: scale / ZOOM_STEP });
    stage.batchDraw();
  }, []);

  const applyFitState = useCallback(
    (scaleFactor = 1.12) => {
      const stage = stageRef.current;
      if (!stage) return;

      const scale =
        Math.min(size.width / (GRID_EXTENT * 2), size.height / (GRID_EXTENT * 2)) * scaleFactor;

      stage.scale({ x: scale, y: scale });
      stage.position({ x: size.width / 2, y: size.height / 2 });
      stage.batchDraw();
    },
    [size.height, size.width],
  );

  const getWorldPoint = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;

    const pointer = stage.getPointerPosition();
    if (!pointer) return null;

    return {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY(),
    };
  }, []);

  const fitToView = useCallback(() => {
    applyFitState(1.12);
  }, [applyFitState]);

  const resetTransform = useCallback(() => {
    applyFitState(1.12);
  }, [applyFitState]);

  const handlePlantDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const rawPlant = event.dataTransfer.getData("application/fieldguide-plant");
      if (!rawPlant) return;

      try {
        const plant = JSON.parse(rawPlant) as PlantRecord;
        const stage = stageRef.current;
        const container = stage?.container();
        if (!stage || !container) return;

        const rect = container.getBoundingClientRect();
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        const worldX = (localX - stage.x()) / stage.scaleX();
        const worldY = (localY - stage.y()) / stage.scaleY();

        onPlantDrop?.(plant, worldX, worldY);
      } catch {
        // drop payload is ignored if it is not a valid stored plant
      }
    },
    [onPlantDrop],
  );

  useLayoutEffect(() => {
    if (size.width > 0 && size.height > 0) {
      const frame = requestAnimationFrame(() => {
        applyFitState(1.12);
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [applyFitState, size.height, size.width]);

  return (
    <div
      ref={containerRef}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handlePlantDrop}
      style={{
        position: "relative",
        zIndex: 1,
        width: "100vw",
        height: "100vh",
        maxHeight: "100vh",
        margin: 0,
        overflow: "hidden",
        border: "none",
        background: "#f4ded7",
        borderRadius: 0,
        boxShadow: "none",
      }}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        draggable={mode === "view" || plotTool === "select"}
        dragBoundFunc={(pos) => clampPosition(pos.x, pos.y)}
        style={{ touchAction: "none" }}
        onWheel={handleWheel}
        onMouseDown={(event) => {
          const stage = stageRef.current;
          if (!stage) return;

          const clickedOnCanvas =
            event.target === stage || event.target === stage.findOne(".layer") || event.target === event.target.getStage();

          if (!canEditPlots || plotTool === "select" || plotTool === "move" || plotTool === "erase") {
            if (clickedOnCanvas) {
              onSelectPlot?.(null);
            }
            return;
          }

          if (!clickedOnCanvas) return;

          const draftKind = plotTool === "rect" || plotTool === "circle" ? plotTool : null;
          if (!draftKind) return;

          const pointer = getWorldPoint();
          if (!pointer) return;

          drawStartRef.current = pointer;
          setDraftPlot({
            id: `draft-${Date.now()}`,
            kind: draftKind,
            x: Math.round(pointer.x / 50) * 50,
            y: Math.round(pointer.y / 50) * 50,
            width: 0,
            height: 0,
          });
        }}
        onMouseMove={() => {
          if (!drawStartRef.current || !draftPlot) return;

          const stage = stageRef.current;
          if (!stage) return;

          const point = getWorldPoint();
          if (!point) return;

          const start = drawStartRef.current;
          const x = Math.min(start.x, point.x);
          const y = Math.min(start.y, point.y);
          const rawWidth = Math.abs(point.x - start.x);
          const rawHeight = Math.abs(point.y - start.y);

          setDraftPlot({
            ...draftPlot,
            x: Math.round(x / 50) * 50,
            y: Math.round(y / 50) * 50,
            width: Math.max(50, Math.round(rawWidth / 50) * 50),
            height: Math.max(50, Math.round(rawHeight / 50) * 50),
          });
        }}
        onMouseUp={() => {
          if (!draftPlot || !drawStartRef.current) return;

          const finalPlot: GridPlot = {
            ...draftPlot,
            id: `plot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          };

          onPlotAdd?.(finalPlot);
          setDraftPlot(null);
          drawStartRef.current = null;
        }}
      >
        <Layer>
          <GardenGrid
            mode={mode}
            buildMode={buildMode}
            plots={draftPlot ? [...plots, draftPlot] : plots}
            plotTool={plotTool}
            selectedPlotId={selectedPlotId}
            onRemovePlot={onPlotRemove}
            onSelectPlot={onSelectPlot}
            onPlotMove={onPlotMove}
            onPlotResize={onPlotResize}
          />
        </Layer>
      </Stage>

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
          display: "grid",
          gridTemplateRows: "repeat(4, 1fr)",
          width: 48,
          border: `2px solid ${theme.ink}`,
          background: theme.paper,
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={zoomIn}
          type="button"
          onMouseEnter={(event) => {
            setHoveredControl("zoomIn");
            event.currentTarget.style.transform = "translateY(1px)";
          }}
          onMouseLeave={(event) => {
            setHoveredControl(null);
            event.currentTarget.style.transform = "translateY(0)";
          }}
          style={buildControlButtonStyle(hoveredControl === "zoomIn")}
        >
          +
        </button>
        <button
          onClick={zoomOut}
          type="button"
          onMouseEnter={(event) => {
            setHoveredControl("zoomOut");
            event.currentTarget.style.transform = "translateY(1px)";
          }}
          onMouseLeave={(event) => {
            setHoveredControl(null);
            event.currentTarget.style.transform = "translateY(0)";
          }}
          style={buildControlButtonStyle(hoveredControl === "zoomOut")}
        >
          -
        </button>
        <button
          onClick={fitToView}
          type="button"
          onMouseEnter={(event) => {
            setHoveredControl("fit");
            event.currentTarget.style.transform = "translateY(1px)";
          }}
          onMouseLeave={(event) => {
            setHoveredControl(null);
            event.currentTarget.style.transform = "translateY(0)";
          }}
          style={{
            ...buildControlButtonStyle(hoveredControl === "fit"),
            fontSize: 18,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 4h3c1.1 0 2 .9 2 2v2h-2V6h-3V4zM4 8V6h3V4H4c-1.1 0-2 .9-2 2v2h2zm16 8v2h-3v2h3c1.1 0 2-.9 2-2v-2h-2zM7 18H4v-2H2v2c0 1.1.9 2 2 2h3v-2zM18 8H6v8h12V8z" fill="#2a1311"/></svg>
        </button>
        <button
          onClick={resetTransform}
          type="button"
          onMouseEnter={(event) => {
            setHoveredControl("reset");
            event.currentTarget.style.transform = "translateY(1px)";
          }}
          onMouseLeave={(event) => {
            setHoveredControl(null);
            event.currentTarget.style.transform = "translateY(0)";
          }}
          style={{
            ...buildControlButtonStyle(hoveredControl === "reset"),
            fontSize: 20,
            borderBottom: "none",
          }}
        >
          x
        </button>
      </div>
    </div>
  );
}