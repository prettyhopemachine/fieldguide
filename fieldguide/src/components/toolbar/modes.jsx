"use client";

export default function ModeToolbar({ mode = "view", onSave, onCancel }) {
  if (mode === "edit") {
    return (
      <div className="buttonList" style={{ display: "flex", gap: "8px", margin: "12px 0" }}>
        <button type="button">Plant</button>
        <button type="button">Move</button>
        <button type="button">Cull</button>
        <button type="button">Build</button>
        <button type="button" onClick={onSave}>Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    );
  }

  return null;
}
