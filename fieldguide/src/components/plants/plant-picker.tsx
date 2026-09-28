"use client";

import { useEffect, useMemo, useState } from "react";
import { theme } from "../../theme";
import type { PlantRecord } from "../../lib/plants";

const panelStyle = {
  background: theme.paper,
  border: `2px solid ${theme.ink}`,
  boxSizing: "border-box" as const,
};

export default function PlantPicker({
  open,
  onClose,
  mode,
  onAddPlant,
  existingPlants = [],
}: {
  open: boolean;
  onClose?: () => void;
  mode: "view" | "edit";
  onAddPlant?: (plant: PlantRecord) => void;
  existingPlants?: PlantRecord[];
}) {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [plants, setPlants] = useState<PlantRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const value = query.trim();
    if (!value) {
      setPlants([]);
      return;
    }

    let active = true;

    const fetchPlants = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/plants/search?q=${encodeURIComponent(value)}`);
        const payload = await response.json();

        if (!active) return;

        setPlants(payload.plants ?? []);
      } catch {
        if (active) setPlants([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchPlants, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, query]);

  const selectedPlant =
    plants.find((plant) => plant.id === selectedPlantId) ?? plants[0] ?? null;

  const favoritePlants = useMemo(
    () => plants.filter((plant) => favorites.includes(plant.id)),
    [favorites, plants],
  );

  const myPlants = useMemo(() => {
    const merged = [...existingPlants, ...favoritePlants];
    return Array.from(new Map(merged.map((plant) => [plant.id, plant])).values());
  }, [existingPlants, favoritePlants]);

  const toggleFavorite = (plantId: string) => {
    setFavorites((current) =>
      current.includes(plantId)
        ? current.filter((id) => id !== plantId)
        : [...current, plantId],
    );
  };

  const handleAddToMyPlants = (plant: PlantRecord) => {
    onAddPlant?.(plant);
    setSelectedPlantId(plant.id);
    setFavorites((current) => (current.includes(plant.id) ? current : [...current, plant.id]));
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(42, 19, 17, 0.18)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          margin: "auto",
          width: "min(1200px, calc(100vw - 32px))",
          height: "min(760px, calc(100vh - 32px))",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          color: theme.ink,
          ...panelStyle,
          background: theme.paper,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: `2px solid ${theme.ink}`,
            background: theme.paper,
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: theme.ink }}>
              Plant Picker
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: theme.ink }}>
              What will you plant today?
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              border: `2px solid ${theme.ink}`,
              background: theme.paper,
              color: theme.ink,
              fontSize: 22,
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.12s ease-out, color 0.12s ease-out",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = theme.ink;
              event.currentTarget.style.color = theme.paper;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = theme.paper;
              event.currentTarget.style.color = theme.ink;
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.9fr", minHeight: 0 }}>
          <div style={{ borderRight: `2px solid ${theme.ink}`, padding: 18, minHeight: 0, display: "grid", gridTemplateRows: "auto 1fr" }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "10px 12px",
                border: `2px solid ${theme.ink}`,
                background: theme.paper,
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 18 }}>⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search plants by name or type"
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontSize: 16,
                  color: theme.ink,
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                alignContent: "start",
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {loading ? (
                <div style={{ color: theme.ink, fontWeight: 700 }}>Loading plants…</div>
              ) : plants.length === 0 ? (
                <div style={{ color: theme.ink, fontWeight: 700 }}>
                  {query.trim() ? "No plants found." : "Search for a plant to begin."}
                </div>
              ) : (
                plants.map((plant) => {
                  const isFavorite = favorites.includes(plant.id);
                  const isSelected = selectedPlantId === plant.id;

                  return (
                    <div
                      key={plant.id}
                      onClick={() => setSelectedPlantId(plant.id)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "52px 1fr auto",
                        width: "100%",
                        alignItems: "center",
                        textAlign: "left",
                        border: `2px solid ${theme.ink}`,
                        background: isSelected ? theme.paperSoft : theme.paper,
                        padding: "12px 14px",
                        cursor: "pointer",
                        color: theme.ink,
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          border: `2px solid ${theme.ink}`,
                          background: "#f9f1ee",
                          overflow: "hidden",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {plant.image_url ? (
                          <img
                            src={plant.image_url}
                            alt={plant.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 20 }}>🌿</span>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: theme.ink }}>{plant.name}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, marginTop: 2, color: theme.ink }}>{plant.type}</div>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFavorite(plant.id);
                        }}
                        aria-label={isFavorite ? `Unfavorite ${plant.name}` : `Favorite ${plant.name}`}
                        style={{
                          border: `2px solid ${isFavorite ? theme.red : theme.ink}`,
                          background: isFavorite ? theme.red : theme.paper,
                          color: isFavorite ? theme.paper : theme.ink,
                          width: 32,
                          height: 32,
                          cursor: "pointer",
                          fontSize: 18,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          transition: "background 0.12s ease-out, transform 0.12s ease-out",
                        }}
                        onMouseEnter={(event) => {
                          if (!isFavorite) {
                            event.currentTarget.style.background = theme.redSoft;
                            event.currentTarget.style.transform = "translateY(-1px)";
                          }
                        }}
                        onMouseLeave={(event) => {
                          if (!isFavorite) {
                            event.currentTarget.style.background = theme.paper;
                            event.currentTarget.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        {isFavorite ? "♥" : "♡"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <aside style={{ padding: 18, display: "grid", gridTemplateRows: "auto auto 1fr auto" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", opacity: 0.8, color: theme.ink }}>
              Selected plant
            </div>

            {selectedPlant ? (
              <>
                <div style={{ border: `2px solid ${theme.ink}`, background: theme.paperSoft, padding: 16, marginTop: 10, color: theme.ink }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: theme.ink }}>{selectedPlant.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: theme.ink }}>{selectedPlant.type}</div>
                  <div style={{ fontSize: 14, marginTop: 12, color: theme.ink }}>{selectedPlant.notes}</div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", opacity: 0.8, color: theme.ink }}>
                    My plants
                  </div>

                  <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                    {myPlants.length === 0 ? (
                      <div style={{ color: theme.ink, fontWeight: 700 }}>Press "♥" to add a plant to your list.</div>
                    ) : (
                      myPlants.map((plant) => {
                        const isAlreadyAdded = existingPlants.some((entry) => entry.id === plant.id);

                        return (
                        <div
                          key={plant.id}
                          onClick={() => setSelectedPlantId(plant.id)}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "36px 1fr auto",
                            gap: 8,
                            alignItems: "center",
                            border: `1px solid ${theme.ink}`,
                            padding: "8px 10px",
                            cursor: "pointer",
                            background: selectedPlantId === plant.id ? theme.paperSoft : theme.paper,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              border: `2px solid ${theme.ink}`,
                              background: "#f9f1ee",
                              overflow: "hidden",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            {plant.image_url ? (
                              <img
                                src={plant.image_url}
                                alt={plant.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              />
                            ) : (
                              <span style={{ fontSize: 16 }}>🌿</span>
                            )}
                          </div>
                          <span style={{ fontWeight: 700, color: theme.ink }}>{plant.name}</span>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAddToMyPlants(plant);
                            }}
                            aria-label={`Add ${plant.name} to My plants`}
                            style={{
                              border: `2px solid ${isAlreadyAdded ? theme.sageDark : theme.ink}`,
                              background: isAlreadyAdded ? theme.sageDark : theme.paper,
                              color: isAlreadyAdded ? "#f7efe9" : theme.ink,
                              width: 28,
                              height: 28,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                              transition: "background 0.12s ease-out, transform 0.12s ease-out",
                            }}
                          >
                            <svg
                              width={14}
                              height={14}
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              <path
                                d="M7.5 15V7M7.5 7.5V10.5M7.5 7.5C7.5 5.29086 5.70914 3.5 3.5 3.5H0.5V6.5C0.5 8.70914 2.29086 10.5 4.5 10.5H7.5M7.5 7.5H10.5C12.7091 7.5 14.5 5.70914 14.5 3.5V0.5H11.5C9.29086 0.5 7.5 2.29086 7.5 4.5V7.5ZM7.5 7.5L11.5 3.5M7.5 10.5L3.5 6.5"
                                stroke="currentColor"
                                strokeWidth="1.15"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddPlant) {
                        onAddPlant(selectedPlant);
                      }
                      if (onClose) {
                        onClose();
                      }
                    }}
                    style={{
                      width: "100%",
                      border: `2px solid ${theme.ink}`,
                      background: theme.ink,
                      color: theme.paper,
                      fontWeight: 800,
                      cursor: "pointer",
                      padding: "12px 14px",
                    }}
                  >
                    Start Planting
                  </button>
                </div>
              </>
            ) : (
              <div style={{ color: theme.ink, fontWeight: 700, marginTop: 18 }}>
                Select a plant to preview it here.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
