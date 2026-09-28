"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Circle, Group, Image, Label, Line, Rect, Tag, Text, Transformer } from "react-konva";
import { theme } from "../../theme";

export type GridPlot = {
  id: string;
  kind: "rect" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  plantName?: string;
  plantImageUrl?: string;
};

const snapToGrid = (value: number, step = 50) => Math.round(value / step) * step;

export default function GardenGrid({
  mode = "view",
  buildMode = false,
  plots = [],
  plotTool = "select",
  selectedPlotId = null,
  onRemovePlot,
  onSelectPlot,
  onPlotMove,
  onPlotResize,
}: {
  mode?: "view" | "edit";
  buildMode?: boolean;
  plots?: GridPlot[];
  plotTool?: "select" | "move" | "rect" | "circle" | "erase";
  selectedPlotId?: string | null;
  onRemovePlot?: (id: string) => void;
  onSelectPlot?: (id: string | null) => void;
  onPlotMove?: (id: string, nextX: number, nextY: number) => void;
  onPlotResize?: (id: string, nextWidth: number, nextHeight: number) => void;
}) {
  const gridSize = 50;
  const gridExtent = 2000;
  const canEditPlots = mode === "edit" && (buildMode || plotTool === "move");
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredPlotId, setHoveredPlotId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});
  const shapeRefs = useRef<Record<string, Konva.Node | null>>({});
  const transformerRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    const sources = Array.from(
      new Set(plots.filter((plot) => plot.plantImageUrl).map((plot) => plot.plantImageUrl as string)),
    );

    if (sources.length === 0) return;

    const nextImages: Record<string, HTMLImageElement> = { ...loadedImages };
    let pending = 0;

    sources.forEach((src) => {
      if (nextImages[src]) return;
      pending += 1;

      const image = new window.Image();
      image.src = src;
      image.onload = () => {
        nextImages[src] = image;
        if (--pending === 0) {
          setLoadedImages(nextImages);
        }
      };
      image.onerror = () => {
        if (--pending === 0) {
          setLoadedImages(nextImages);
        }
      };
    });

    if (pending === 0) {
      return;
    }
  }, [loadedImages, plots]);

  const gridLines = useMemo(() => {
    const lines = [];

    for (let x = -gridExtent; x <= gridExtent; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, -gridExtent, x, gridExtent]}
          stroke={theme.grid}
          strokeWidth={2.5}
        />
      );
    }

    for (let y = -gridExtent; y <= gridExtent; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[-gridExtent, y, gridExtent, y]}
          stroke={theme.grid}
          strokeWidth={2.5}
        />
      );
    }

    return lines;
  }, [gridExtent, gridSize]);

  const cellRects = useMemo(() => {
    if (!canEditPlots) return [];

    const cells = [];

    for (let x = -gridExtent; x < gridExtent; x += gridSize) {
      for (let y = -gridExtent; y < gridExtent; y += gridSize) {
        const key = `${x}:${y}`;
        const isHovered = hoveredCell === key;

        cells.push(
          <Rect
            key={`cell-${key}`}
            x={x}
            y={y}
            width={gridSize}
            height={gridSize}
            fill={isHovered ? "rgba(232, 205, 189, 0.75)" : "rgba(255,255,255,0.02)"}
            stroke={isHovered ? theme.grid : "transparent"}
            strokeWidth={1}
            onMouseEnter={() => setHoveredCell(key)}
            onMouseLeave={() => setHoveredCell(null)}
            listening={plotTool === "select"}
          />
        );
      }
    }

    return cells;
  }, [canEditPlots, gridExtent, gridSize, hoveredCell, plotTool]);

  useEffect(() => {
    if (!selectedPlotId || !canEditPlots) {
      transformerRef.current?.nodes([]);
      transformerRef.current?.getLayer()?.batchDraw();
      return;
    }

    const selectedNode = shapeRefs.current[selectedPlotId];
    if (selectedNode && transformerRef.current) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [canEditPlots, selectedPlotId, plots]);

  const plotShapes = useMemo(
    () =>
      plots.map((plot) => {
        const isEraseTool = plotTool === "erase";
        const isSelected = selectedPlotId === plot.id;
        const baseFill = isEraseTool ? "rgba(42, 19, 17, 0.12)" : "rgba(76, 51, 37, 0.46)";
        const isEditable = canEditPlots;

        const clampBound = (value: number, min: number, max: number) =>
          Math.max(min, Math.min(max, value));

        const handleSelect = (event: any) => {
          if (!canEditPlots) return;

          event.cancelBubble = true;
          onSelectPlot?.(plot.id);
          if (plotTool === "erase") {
            onRemovePlot?.(plot.id);
          }
        };

        if (plot.kind === "circle") {
          return (
            <Fragment key={plot.id}>
              <Circle
                ref={(node) => {
                  if (node) {
                    shapeRefs.current[plot.id] = node;
                  } else {
                    delete shapeRefs.current[plot.id];
                  }
                }}
                x={plot.x + plot.width / 2}
                y={plot.y + plot.height / 2}
                radius={Math.min(plot.width, plot.height) / 2}
                fill={baseFill}
                stroke={isSelected ? theme.ink : "#2a1311"}
                strokeWidth={isSelected ? 3 : 2}
                dash={isSelected ? [8, 6] : undefined}
                draggable={isEditable}
                dragBoundFunc={(pos) => {
                  const nextLeft = clampBound(pos.x - plot.width / 2, -gridExtent, gridExtent);
                  const nextTop = clampBound(pos.y - plot.height / 2, -gridExtent, gridExtent);
                  return {
                    x: nextLeft + plot.width / 2,
                    y: nextTop + plot.height / 2,
                  };
                }}
                onDragEnd={(event) => {
                  const nextLeft = snapToGrid(event.target.x() - plot.width / 2);
                  const nextTop = snapToGrid(event.target.y() - plot.height / 2);
                  onPlotMove?.(plot.id, nextLeft, nextTop);
                }}
                onTransformEnd={(event) => {
                  const node = event.target as Konva.Circle;
                  const nextRadius = Math.max(25, node.radius() * Math.max(node.scaleX(), node.scaleY()));
                  node.scaleX(1);
                  node.scaleY(1);
                  onPlotResize?.(plot.id, nextRadius * 2, nextRadius * 2);
                }}
                onClick={handleSelect}
                onMouseDown={(event) => {
                  event.cancelBubble = true;
                  onSelectPlot?.(plot.id);
                }}
                onDragStart={() => onSelectPlot?.(plot.id)}
                listening={canEditPlots}
              />
            </Fragment>
          );
        }

        if (plot.plantImageUrl) {
          const plantImage = loadedImages[plot.plantImageUrl];

          return (
            <Fragment key={plot.id}>
              <Group
                x={plot.x}
                y={plot.y}
                draggable={isEditable}
                dragBoundFunc={(pos: { x: number; y: number }) => ({
                  x: clampBound(pos.x, -gridExtent, gridExtent - plot.width),
                  y: clampBound(pos.y, -gridExtent, gridExtent - plot.height),
                })}
                onDragEnd={(event: any) => {
                  onPlotMove?.(plot.id, snapToGrid(event.target.x()), snapToGrid(event.target.y()));
                }}
                onClick={handleSelect}
                onMouseDown={(event: any) => {
                  event.cancelBubble = true;
                  onSelectPlot?.(plot.id);
                }}
                onDragStart={() => onSelectPlot?.(plot.id)}
                onMouseEnter={() => setHoveredPlotId(plot.id)}
                onMouseLeave={() => setHoveredPlotId(null)}
                listening={canEditPlots || mode === "view"}
              >
                <Rect
                  x={0}
                  y={0}
                  width={plot.width}
                  height={plot.height}
                  fill={isSelected ? "rgba(42, 19, 17, 0.12)" : "rgba(255,255,255,0.03)"}
                  stroke={isSelected ? theme.ink : "transparent"}
                  strokeWidth={isSelected ? 2 : 0}
                  dash={isSelected ? [6, 6] : undefined}
                />

                {plantImage && (
                  <Image
                    image={plantImage}
                    x={plot.width / 2 - 28}
                    y={plot.height / 2 - 28}
                    width={56}
                    height={56}
                    opacity={0.95}
                    stroke={"#000000"}
                    strokeWidth={1}
                  />
                )}

                {hoveredPlotId === plot.id && plot.plantName && (
                  <Label x={plot.width + 8} y={plot.height / 2 - 16}>
                    <Tag
                      fill="rgba(42, 19, 17, 0.9)"
                      pointerDirection="left"
                      pointerWidth={10}
                      pointerHeight={12}
                    />
                    <Text
                      text={plot.plantName}
                      padding={8}
                      fontSize={12}
                      fontStyle="700"
                      fill="#f7efe9"
                    />
                  </Label>
                )}
              </Group>
            </Fragment>
          );
        }

        return (
          <Fragment key={plot.id}>
            <Rect
              ref={(node) => {
                if (node) {
                  shapeRefs.current[plot.id] = node;
                } else {
                  delete shapeRefs.current[plot.id];
                }
              }}
              x={plot.x}
              y={plot.y}
              width={plot.width}
              height={plot.height}
              fill={baseFill}
              stroke={isSelected ? theme.ink : "#2a1311"}
              strokeWidth={isSelected ? 3 : 2}
              dash={isSelected ? [8, 6] : undefined}
              draggable={isEditable}
              dragBoundFunc={(pos) => ({
                x: clampBound(pos.x, -gridExtent, gridExtent - plot.width),
                y: clampBound(pos.y, -gridExtent, gridExtent - plot.height),
              })}
              onDragEnd={(event) => {
                onPlotMove?.(plot.id, snapToGrid(event.target.x()), snapToGrid(event.target.y()));
              }}
              onTransformEnd={(event) => {
                const node = event.target as Konva.Rect;
                const nextWidth = Math.max(50, snapToGrid(node.width() * node.scaleX()));
                const nextHeight = Math.max(50, snapToGrid(node.height() * node.scaleY()));
                node.scaleX(1);
                node.scaleY(1);
                onPlotResize?.(plot.id, nextWidth, nextHeight);
              }}
              onClick={handleSelect}
              onMouseDown={(event) => {
                event.cancelBubble = true;
                onSelectPlot?.(plot.id);
              }}
              onDragStart={() => onSelectPlot?.(plot.id)}
              listening={mode === "edit"}
            />
            {plot.plantName && (
              <Text
                x={plot.x + 10}
                y={plot.y + plot.height / 2 - 10}
                text={plot.plantName}
                fontSize={12}
                fontStyle="700"
                fill={theme.ink}
                width={plot.width - 20}
                ellipsis={true}
                wrap="word"
              />
            )}
          </Fragment>
        );
      }),
    [canEditPlots, gridExtent, mode, onPlotMove, onPlotResize, onRemovePlot, onSelectPlot, plots, plotTool, selectedPlotId],
  );

  return (
    <>
      {[...gridLines, ...cellRects, ...plotShapes]}
      {selectedPlotId && canEditPlots && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          keepRatio={false}
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) => ({
            ...newBox,
            width: Math.max(50, newBox.width),
            height: Math.max(50, newBox.height),
          })}
        />
      )}
    </>
  );
}