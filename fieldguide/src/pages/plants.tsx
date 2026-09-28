"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import type { PlantRecord } from "../lib/plants";
import { theme } from "../theme";

const STORAGE_KEY = "fieldguide-my-plants";

// Prototype note: Trefle's search response does not include native/lifecycle/light metadata,
// so these fields are intentionally disabled for now to avoid false filters in the UI.
// const nativeOptions = ["all", "native", "non-native"] as const;
// const lifeCycleOptions = ["all", "annual", "perennial", "biennial"] as const;
// const lightOptions = ["all", "full sun", "part sun", "part shade", "shade"] as const;

export default function PlantsPage() {
  const [activeTab, setActiveTab] = useState<"my-plants" | "browse">("browse");
  const [savedPlants, setSavedPlants] = useState<PlantRecord[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlantRecord[]>([]);
  // const [nativeFilter, setNativeFilter] = useState<(typeof nativeOptions)[number]>("all");
  // const [lifeCycleFilter, setLifeCycleFilter] = useState<(typeof lifeCycleOptions)[number]>("all");
  // const [lightFilter, setLightFilter] = useState<(typeof lightOptions)[number]>("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedPlants(JSON.parse(stored) as PlantRecord[]);
      }
    } catch {
      setSavedPlants([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlants));
  }, [savedPlants]);

  useEffect(() => {
    const trimmed = query.trim();
    if (activeTab !== "browse" || !trimmed) {
      setResults([]);
      return;
    }

    let active = true;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/plants/search?q=${encodeURIComponent(trimmed)}`);
        const payload = await response.json();
        if (!active) return;
        setResults(payload.plants ?? []);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = window.setTimeout(fetchResults, 220);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [activeTab, query]);

  const matchesFilters = (plant: PlantRecord) => {
    const queryText = query.trim().toLowerCase();
    const searchable = [
      plant.name,
      plant.scientific_name ?? "",
      plant.type,
      ...(plant.tags ?? []),
    ].join(" ").toLowerCase();

    return !queryText || searchable.includes(queryText);
  };

  const filteredResults = useMemo(
    () => results.filter(matchesFilters),
    [results, query],
  );

  const selectedPlants = useMemo(
    () => savedPlants.filter(matchesFilters),
    [savedPlants, query],
  );

  const addPlant = (plant: PlantRecord) => {
    setSavedPlants((current) =>
      current.some((entry) => entry.id === plant.id) ? current : [...current, plant],
    );
  };

  const removePlant = (plantId: string) => {
    setSavedPlants((current) => current.filter((plant) => plant.id !== plantId));
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7efe9",
        color: theme.ink,
        position: "relative",
        paddingBottom: 40,
      }}
    >
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 20 }}>
        <Sidebar />
      </div>

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          background: "#f7efe9",
          border: `3px solid ${theme.ink}`,
          boxShadow: "10px 10px 0 rgba(42, 19, 17, 0.12)",
          transform: "translateY(24px)",
          backgroundImage:
            "linear-gradient(rgba(42, 19, 17, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(42, 19, 17, 0.04) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${theme.ink}`,
            padding: "18px 20px",
            gap: 12,
            background: "rgba(255,255,255,0.12)",
          }}
        >
          <div>
            <h1
              style={{
                margin: "8px 0 0",
                color: theme.red,
                fontSize: 30,
                textTransform: "uppercase",
                fontFamily: 'var(--font-serif), "Times New Roman", serif',
              }}
            >
              My plants
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <a
              href="/"
              style={{
                border: `2px solid ${theme.ink}`,
                background: theme.paper,
                color: theme.ink,
                fontWeight: 800,
                padding: "10px 14px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Back to field
            </a>

            <div style={{ display: "flex", gap: 8 }}>
              {[
                ["my-plants", "My plants"],
                ["browse", "Browse"],
              ].map(([tab, label]) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab as "my-plants" | "browse")}
                    style={{
                      border: `2px solid ${theme.ink}`,
                      background: isActive ? theme.ink : theme.paper,
                      color: isActive ? theme.paper : theme.ink,
                      fontWeight: 800,
                      padding: "10px 16px",
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: activeTab === "browse" ? "1.35fr 0.95fr" : "1fr",
            minHeight: 560,
          }}
        >
          <div
            style={{
              padding: 20,
              borderRight: activeTab === "browse" ? `2px solid ${theme.ink}` : "none",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            {activeTab === "browse" ? (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    border: `2px solid ${theme.ink}`,
                    background: theme.paperSoft,
                    padding: "10px 12px",
                    marginBottom: 16,
                    boxShadow: "inset 0 0 0 1px rgba(42,19,17,0.05)",
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>⌕</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by plant or tag"
                    style={{
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      width: "100%",
                      fontSize: 16,
                      color: theme.ink,
                      fontFamily: 'var(--font-serif), "Times New Roman", serif',
                    }}
                  />
                </div>

                {loading ? (
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-serif), "Times New Roman", serif' }}>
                    Loading plants…
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-serif), "Times New Roman", serif' }}>
                    {query.trim() ? "No plants match that search." : "Search for plants to add to your collection."}
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {filteredResults.map((plant) => (
                      <div
                        key={plant.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          border: `2px solid ${theme.ink}`,
                          background: theme.paperSoft,
                          padding: 12,
                          boxShadow: "0 2px 0 rgba(42, 19, 17, 0.1)",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-serif), "Times New Roman", serif' }}>
                            {plant.name}
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{plant.type}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                            {plant.tags.map((tag) => (
                              <span
                                key={`${plant.id}-${tag}`}
                                style={{
                                  border: `2px solid ${theme.ink}`,
                                  background: theme.paper,
                                  padding: "4px 7px",
                                  fontSize: 11,
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addPlant(plant)}
                          style={{
                            border: `2px solid ${theme.ink}`,
                            background: theme.ink,
                            color: theme.paper,
                            fontWeight: 800,
                            cursor: "pointer",
                            padding: "8px 12px",
                            minWidth: 64,
                          }}
                        >
                          Pick
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.2 }}>
                  {savedPlants.length} saved plants
                </div>

                {savedPlants.length === 0 ? (
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-serif), "Times New Roman", serif' }}>
                    No plants saved yet. Forage and pick a few.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {selectedPlants.map((plant) => (
                      <div
                        key={plant.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          border: `2px solid ${theme.ink}`,
                          background: theme.paperSoft,
                          padding: 12,
                          boxShadow: "0 2px 0 rgba(42, 19, 17, 0.1)",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-serif), "Times New Roman", serif' }}>
                            {plant.name}
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{plant.type}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                            {plant.tags.map((tag) => (
                              <span
                                key={`${plant.id}-saved-${tag}`}
                                style={{
                                  border: `2px solid ${theme.ink}`,
                                  background: theme.paper,
                                  padding: "4px 7px",
                                  fontSize: 11,
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removePlant(plant.id)}
                          style={{
                            border: `2px solid ${theme.ink}`,
                            background: theme.paper,
                            color: theme.ink,
                            fontWeight: 800,
                            cursor: "pointer",
                            padding: "8px 10px",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {activeTab === "browse" && (
            <aside style={{ padding: 20, background: "rgba(255,255,255,0.08)" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Saved list
              </div>

              {savedPlants.length === 0 ? (
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-serif), "Times New Roman", serif' }}>
                  Your plant list is empty.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {savedPlants.map((plant) => (
                    <div
                      key={plant.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: `2px solid ${theme.ink}`,
                        background: theme.paperSoft,
                        padding: "10px 12px",
                        boxShadow: "0 2px 0 rgba(42, 19, 17, 0.08)",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-serif), "Times New Roman", serif' }}>
                          {plant.name}
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                          {plant.tags.map((tag) => (
                            <span
                              key={`${plant.id}-sidebar-${tag}`}
                              style={{
                                border: `2px solid ${theme.ink}`,
                                background: theme.paper,
                                padding: "3px 6px",
                                fontSize: 10,
                                fontWeight: 800,
                                textTransform: "uppercase",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlant(plant.id)}
                        style={{
                          border: `2px solid ${theme.ink}`,
                          background: theme.paper,
                          color: theme.ink,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
