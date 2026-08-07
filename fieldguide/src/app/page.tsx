"use client";

import { useState } from "react";
import GardenGrid from "../components/canvas/grid";
import Sidebar from "../components/sidebar/sidebar";
import ModeToolbar from "../components/toolbar/modes";
import ZoomToolbar from "../components/toolbar/zoom";

export default function Home() {
  const [mode, setMode] = useState("view");

  return (
    <main>
      <div>
        <h1>Field Guide</h1>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button type="button" onClick={() => setMode("view")}>
          View
        </button>
        <button type="button" onClick={() => setMode("edit")}>
          Edit
        </button>
      </div>

      <ModeToolbar
        mode={mode}
        onSave={() => setMode("view")}
        onCancel={() => setMode("view")}
      />

      <Sidebar />

      <ZoomToolbar>
        <GardenGrid />
      </ZoomToolbar>
    </main>
  );
}