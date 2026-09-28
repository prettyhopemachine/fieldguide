"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import { theme } from "../theme";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  plants: string[];
  weather: string;
  weatherNotes: string;
  status: string;
  tags: string[];
  createdAt: string;
};

type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

const JOURNAL_STORAGE_KEY = "fieldguide-journal";
const TODO_STORAGE_KEY = "fieldguide-journal-todos";
const PLANTS_STORAGE_KEY = "fieldguide-my-plants";

const weatherOptions = [
  { label: "Sunny", value: "sunny" },
  { label: "Cloudy", value: "cloudy" },
  { label: "Rainy", value: "rainy" },
  { label: "Windy", value: "windy" },
  { label: "Cool", value: "cool" },
  { label: "Warm", value: "warm" },
];

const statusOptions = [
  { label: "Healthy", value: "healthy" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Planning", value: "planning" },
  { label: "Harvest day", value: "harvest-day" },
  { label: "Watering", value: "watering" },
];

const weatherStyles: Record<string, { background: string; color: string; border: string }> = {
  sunny: { background: "#f5e7bf", color: theme.ink, border: "#d7b96e" },
  cloudy: { background: "#dfe8f3", color: theme.ink, border: "#9bb3c9" },
  rainy: { background: "#d7dfdf", color: theme.ink, border: "#7f9ea0" },
  windy: { background: "#e9d7c7", color: theme.ink, border: "#c99a82" },
  cool: { background: "#dfe9d5", color: theme.ink, border: "#8aa17d" },
  warm: { background: "#f7d9c7", color: theme.ink, border: "#d88c6e" },
};

const statusStyles: Record<string, { background: string; color: string; border: string }> = {
  healthy: { background: theme.sage, color: theme.ink, border: theme.sageDark },
  maintenance: { background: "#f3d6c9", color: theme.ink, border: theme.red },
  planning: { background: "#dfe8f3", color: theme.ink, border: "#8ea0b5" },
  "harvest-day": { background: "#f5e7bf", color: theme.ink, border: "#d7b96e" },
  watering: { background: "#d9e8f1", color: theme.ink, border: "#7e9cbc" },
};

const renderFieldPreview = (entry: JournalEntry) => {
  const palette = ["#dfe9d5", "#c7d8b8", "#e9d7c7", "#9cc5a1", "#f5e7bf", "#c7d4df"];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 10px)",
        gap: 4,
        width: 64,
        padding: 8,
        border: `2px solid ${theme.ink}`,
        background: "linear-gradient(135deg, rgba(223,233,213,0.9), rgba(255,255,255,0.28))",
        boxShadow: "inset 0 0 0 1px rgba(42,19,17,0.08)",
      }}
    >
      {Array.from({ length: 20 }).map((_, index) => {
        const tone = palette[(index + entry.plants.length + entry.weather.length) % palette.length];
        return (
          <span
            key={`${entry.id}-field-${index}`}
            style={{
              width: 10,
              height: 10,
              background: tone,
              border: "1px solid rgba(42, 19, 17, 0.35)",
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
};

export default function FieldnotesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [savedPlants, setSavedPlants] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [plantFocus, setPlantFocus] = useState<string[]>([]);
  const [weather, setWeather] = useState("sunny");
  const [weatherNotes, setWeatherNotes] = useState("");
  const [status, setStatus] = useState("on-track");
  const [tags, setTags] = useState("");
  const [todoInput, setTodoInput] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    try {
      const storedEntries = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries) as JournalEntry[]);
      }

      const storedPlants = window.localStorage.getItem(PLANTS_STORAGE_KEY);
      if (storedPlants) {
        const parsedPlants = JSON.parse(storedPlants) as Array<{ name?: string }>;
        setSavedPlants(parsedPlants.map((item) => item.name ?? "Garden").filter(Boolean));
      }

      const storedTodos = window.localStorage.getItem(TODO_STORAGE_KEY);
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos) as TodoItem[]);
      }
    } catch {
      setEntries([]);
      setSavedPlants([]);
      setTodos([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const summary = useMemo(() => {
    const totalEntries = entries.length;
    const trackedPlants = new Set(
      entries.flatMap((entry) => entry.plants.filter((plant) => plant && plant !== "General garden")),
    );
    const mostRecent = entries[0];

    return { totalEntries, plantEntries: trackedPlants.size, mostRecent };
  }, [entries]);

  const togglePlantFocus = (plant: string) => {
    setPlantFocus((current) =>
      current.includes(plant) ? current.filter((item) => item !== plant) : [...current, plant],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle && !trimmedContent) {
      return;
    }

    const nextEntry: JournalEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: trimmedTitle || "Garden note",
      content: trimmedContent,
      plants: plantFocus.length > 0 ? plantFocus : ["General garden"],
      weather,
      weatherNotes: weatherNotes.trim(),
      status,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 6),
      createdAt: new Date().toISOString(),
    };

    setEntries((current) => [nextEntry, ...current]);
    setTitle("");
    setContent("");
    setPlantFocus([]);
    setWeather("sunny");
    setWeatherNotes("");
    setStatus("on-track");
    setTags("");
  };

  const addTodo = () => {
    const trimmed = todoInput.trim();
    if (!trimmed) return;

    setTodos((current) => [
      ...current,
      { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text: trimmed, done: false },
    ]);
    setTodoInput("");
  };

  const toggleTodo = (todoId: string) => {
    setTodos((current) =>
      current.map((todo) => (todo.id === todoId ? { ...todo, done: !todo.done } : todo)),
    );
  };

  const removeTodo = (todoId: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== todoId));
  };

  const removeEntry = (entryId: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== entryId));
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
          }}
        >
          <div>
            <h1 style={{ margin: "8px 0 0", color: theme.red, fontSize: 30, textTransform: "uppercase", fontFamily: 'var(--font-serif), "Times New Roman", serif' }}>Field notes</h1>
          </div>

          <a
            href="/"
            style={{
              border: `2px solid ${theme.ink}`,
              background: "#f3d6c9",
              color: theme.ink,
              fontWeight: 800,
              padding: "10px 14px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "4px 4px 0 rgba(42, 19, 17, 0.08)",
            }}
          >
            Back to field
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.78fr 1.42fr",
            minHeight: 660,
          }}
        >
          <aside
            style={{
              padding: 20,
              display: "grid",
              gap: 18,
              alignContent: "start",
              background: "#2a1311",
              color: theme.ink,
              borderRight: `2px solid ${theme.ink}`,
            }}
          >
            <div
              style={{
                border: `2px solid ${theme.ink}`,
                background: "#f1eadf",
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>
                tally
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ border: `2px solid ${theme.ink}`, background: theme.paper, padding: 12, boxShadow: "4px 4px 0 rgba(42, 19, 17, 0.04)" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", opacity: 0.7 }}>Notes</div>
                  <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>{summary.totalEntries}</div>
                </div>

                <div style={{ border: `2px solid ${theme.ink}`, background: theme.paper, padding: 12, boxShadow: "4px 4px 0 rgba(42, 19, 17, 0.04)" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", opacity: 0.7 }}>Plants noted</div>
                  <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>{summary.plantEntries}</div>
                </div>
              </div>

              {summary.mostRecent && (
                <div style={{ marginTop: 14, fontWeight: 700 }}>
                  Latest check-in: “{summary.mostRecent.title}”
                </div>
              )}
            </div>

            <div
              style={{
                border: `2px solid ${theme.ink}`,
                background: "#f4e5dc",
                padding: 16,
                boxShadow: "6px 6px 0 rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>
                To-do list
              </div>

              <div style={{ fontStyle: "italic", display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  value={todoInput}
                  onChange={(event) => setTodoInput(event.target.value)}
                  placeholder="Add a task"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTodo();
                    }
                  }}
                  style={{
                    flex: 1,
                    border: `2px solid ${theme.ink}`,
                    background: theme.paper,
                    padding: "8px 10px",
                    color: theme.ink,
                    fontStyle: "italic",
                    fontSize: 14,
                    fontFamily: 'var(--font-cormorant), Georgia, "Times New Roman", serif',
                  }}
                />
                <button
                  type="button"
                  onClick={addTodo}
                  style={{
                    border: `2px solid ${theme.ink}`,
                    background: theme.ink,
                    color: theme.paper,
                    padding: "8px 10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontFamily: 'var(--font-cormorant), Georgia, "Times New Roman", serif',
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {todos.length === 0 ? (
                  <div style={{ fontWeight: 600, fontStyle: "italic" }}>As ye sow, so shall ye reap.</div>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        border: `2px solid ${theme.ink}`,
                        background: todo.done ? "rgba(132, 208, 151, 0.22)" : theme.paper,
                        padding: "8px 10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => toggleTodo(todo.id)}
                        style={{ accentColor: theme.ink }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontWeight: 700,
                          textDecoration: todo.done ? "line-through" : "none",
                          opacity: todo.done ? 0.7 : 1,
                        }}
                      >
                        {todo.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTodo(todo.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: theme.ink,
                          fontSize: 16,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          <section
            style={{
              padding: 20,
              background: "#f2e7dc",
              backgroundImage:
                "linear-gradient(rgba(42,19,17,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(42,19,17,0.12) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              boxShadow: "inset 0 0 0 1px rgba(42,19,17,0.08)",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                display: "grid",
                gap: 14,
                border: `2px solid ${theme.ink}`,
                background: theme.paper,
                padding: 18,
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    justifySelf: "start",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 1.1,
                    textTransform: "uppercase",
                    marginBottom: 8,
                    background: theme.ink,
                    color: theme.paper,
                    border: `2px solid ${theme.ink}`,
                    padding: "6px 8px",
                  }}
                >
                  New entry
                </div>
                 <label style={{ display: "grid", gap: 6 }}>
                 <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>
                    Title
                  </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="How fareth the field this day?"
                  style={{
                    width: "100%",
                    border: `2px solid ${theme.ink}`,
                    background: theme.paper,
                    padding: "11px 12px",
                    fontSize: 16,
                    color: theme.ink,
                    outline: "none",
                    boxSizing: "border-box",
                    fontStyle: "italic",
                    fontFamily: 'var(--font-cormorant), Georgia, "Times New Roman", serif',
                    lineHeight: 1.5,
                  }}
                /></label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>
                    Weather
                  </span>
                  <select
                    value={weather}
                    onChange={(event) => setWeather(event.target.value)}
                    style={{
                      border: `2px solid ${theme.ink}`,
                      background: theme.paper,
                      padding: "10px 12px",
                      fontSize: 15,
                      color: theme.ink,
                      fontFamily: 'var(--font-cormorant), Georgia, "Times New Roman", serif',
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {weatherOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>
                    Status
                  </span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    style={{
                      border: `2px solid ${theme.ink}`,
                      background: theme.paper,
                      padding: "10px 12px",
                      fontSize: 15,
                      color: theme.ink,
                      fontFamily: 'var(--font-cormorant), Georgia, "Times New Roman", serif',
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {statusOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>
                  Planting
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {savedPlants.length === 0 ? (
                    <div style={{ fontWeight: 700, fontStyle: "italic", color: theme.red }}>Add plants to the greenhouse to start tagging your field notes.</div>
                  ) : (
                    savedPlants.map((savedPlant) => {
                      const checked = plantFocus.includes(savedPlant);

                      return (
                        <label
                          key={savedPlant}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            border: `2px solid ${theme.ink}`,
                            background: checked ? "#f5e7bf" : theme.paper,
                            color: theme.ink,
                            padding: "6px 8px",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: checked ? "4px 4px 0 rgba(42, 19, 17, 0.08)" : "none",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePlantFocus(savedPlant)}
                            style={{ accentColor: theme.ink }}
                          />
                          {savedPlant}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>
                  Notes
                </span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Herein Lie Observations, Reflections, & Findings from the Field...  ⋆˚✿˖°"
                  rows={6}
                  style={{
                    width: "100%",
                    border: `2px solid ${theme.ink}`,
                    background: theme.paper,
                    padding: "12px",
                    fontSize: 15,
                    color: theme.ink,
                    resize: "vertical",
                    boxSizing: "border-box",
                    outline: "none",
                    fontStyle: "italic",
                    fontFamily: 'var(--font-cormorant), Georgia, "Times New Roman", serif',
                    lineHeight: 1.6,
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>
                  Tags
                </span>
                <input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="watering, basil, bloom, harvest"
                  style={{
                    width: "100%",
                    border: `2px solid ${theme.ink}`,
                    background: theme.paper,
                    padding: "10px 12px",
                    fontSize: 15,
                    fontStyle: "italic",
                    color: theme.ink,
                    boxSizing: "border-box",
                    fontFamily: 'var(--font-cormorant), Georgia, "Times New Roman", serif',
                  }}
                />
              </label>

              <button
                type="submit"
                style={{
                  justifySelf: "center",
                  border: `2px solid ${theme.ink}`,
                  background: theme.sageDark,
                  color: theme.ink,
                  fontWeight: 700,
                  fontFamily: 'var(--font-cormorant), Georgia, "Times New Roman", serif',
                  padding: "12px 16px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "4px 4px 0 rgba(42, 19, 17, 0.1)",
                }}
              >
                Keep
              </button>
            </form>

            <div style={{ display: "grid", gap: 14 }}>
              {entries.length === 0 ? (
                <div
                  style={{
                    border: `2px solid ${theme.ink}`,
                    background: theme.paperSoft,
                    padding: 20,
                    fontWeight: 600,
                    fontStyle: "italic",
                  }}
                >
                  No notes hath yet been kept.
                  What tale wilt thou tell?
                </div>
              ) : (
                entries.map((entry) => (
                  <article
                    key={entry.id}
                    style={{
                      border: `2px solid ${theme.ink}`,
                      background: "#f3e7df",
                      padding: 16,
                      boxShadow: "6px 6px 0 rgba(42, 19, 17, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: 1.1,
                            textTransform: "uppercase",
                            opacity: 0.8,
                            display: "inline-block",
                            padding: "5px 8px",
                            border: `2px solid ${theme.ink}`,
                            background: theme.sage,
                          }}
                        >
                          {entry.plants.join(" · ") || "General garden"}
                        </div>
                        <h2 style={{ margin: "6px 0 0", fontSize: 24 }}>{entry.title}</h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        style={{
                          border: `2px solid ${theme.ink}`,
                          background: theme.paper,
                          color: theme.ink,
                          fontWeight: 800,
                          cursor: "pointer",
                          padding: "6px 10px",
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        marginTop: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "5px 8px",
                            border: `2px solid ${theme.ink}`,
                            background: weatherStyles[entry.weather]?.background ?? theme.paper,
                            color: weatherStyles[entry.weather]?.color ?? theme.ink,
                          }}
                        >
                          {entry.weather}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "5px 8px",
                            border: `2px solid ${statusStyles[entry.status]?.border ?? theme.ink}`,
                            background: statusStyles[entry.status]?.background ?? theme.paper,
                            color: statusStyles[entry.status]?.color ?? theme.ink,
                          }}
                        >
                          {statusOptions.find((option) => option.value === entry.status)?.label ?? entry.status}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>
                        {new Date(entry.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>

                      {renderFieldPreview(entry)}
                    </div>

                    {entry.weatherNotes && (
                      <div style={{ marginTop: 10, fontWeight: 700, opacity: 0.85 }}>
                        Weather: {entry.weatherNotes}
                      </div>
                    )}

                    <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {entry.content}
                    </p>

                    {entry.tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                        {entry.tags.map((tag) => (
                          <span
                            key={`${entry.id}-${tag}`}
                            style={{
                              border: `2px solid ${theme.ink}`,
                              background: theme.paper,
                              padding: "5px 8px",
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}


