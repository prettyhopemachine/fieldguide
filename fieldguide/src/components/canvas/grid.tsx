"use client";

import { useEffect, useRef } from "react";

export default function GardenGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawGrid = (
      x = 0,
      y = 0,
      width = canvas.width,
      height = canvas.height,
      gridCellSize = 40,
      color = "black",
      lineWidth = 1
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      for (let i = x; i <= width; i += gridCellSize) {
        ctx.moveTo(i, y);
        ctx.lineTo(i, height);
      }

      for (let j = y; j <= height; j += gridCellSize) {
        ctx.moveTo(x, j);
        ctx.lineTo(width, j);
      }

      ctx.stroke();
      ctx.restore();
    };

    drawGrid();
  }, []);

  return <canvas ref={canvasRef} />;
}
