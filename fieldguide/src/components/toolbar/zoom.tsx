"use client";

import type { ReactNode } from "react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

type ZoomProps = {
  children: ReactNode;
};

export default function ZoomToolbar({ children }: ZoomProps) {
  const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    return (
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}>
        <button onClick={() => zoomIn()}>+</button>
        <button onClick={() => zoomOut()}>-</button>
        <button onClick={() => resetTransform()}>x</button>
      </div>
    );
  };

  return (
    <TransformWrapper initialScale={1} minScale={0.5} maxScale={3}>
      <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
        <Controls />
        <TransformComponent>
          <div style={{ width: "100vw", height: "100vh" }}>{children}</div>
        </TransformComponent>
      </div>
    </TransformWrapper>
  );
}