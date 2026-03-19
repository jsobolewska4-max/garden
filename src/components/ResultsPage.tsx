"use client";

import { useMemo, useEffect, useState } from "react";
import { PlantData } from "@/data/plants";
import { ZoneData } from "@/data/zones";
import { GardenConfig, generateLayout, LayoutResult } from "@/lib/layout";
import { generateTimeline, formatDate, TimelineEvent } from "@/lib/timeline";

interface Props {
  city: string;
  zoneData: ZoneData;
  gardenConfig: GardenConfig;
  selectedPlants: PlantData[];
  onStartOver: () => void;
}

const actionColors: Record<string, { bg: string; text: string; label: string; emoji: string }> = {
  "start-indoors": { bg: "bg-purple-100", text: "text-purple-800", label: "Start Indoors", emoji: "🏠" },
  transplant: { bg: "bg-blue-100", text: "text-blue-800", label: "Transplant", emoji: "🔄" },
  "direct-sow": { bg: "bg-amber-100", text: "text-amber-800", label: "Direct Sow", emoji: "🌱" },
  harvest: { bg: "bg-green-100", text: "text-green-800", label: "Harvest", emoji: "🎉" },
};

function Confetti() {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; color: string; size: number }[]>([]);

  useEffect(() => {
    const colors = ["#58cc02", "#1cb0f6", "#ff9600", "#ce82ff", "#ff4b4b", "#ffc800"];
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confettiFall ${2 + Math.random() * 2}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function ResultsPage({
  city,
  zoneData,
  gardenConfig,
  selectedPlants,
  onStartOver,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const layout = useMemo(
    () => generateLayout(gardenConfig, selectedPlants),
    [gardenConfig, selectedPlants]
  );

  const timeline = useMemo(
    () => generateTimeline(zoneData, selectedPlants, layout.plantAllocations),
    [zoneData, selectedPlants, layout.plantAllocations]
  );

  const eventsByMonth = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    for (const event of timeline) {
      const key = event.date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    }
    return groups;
  }, [timeline]);

  const plantColors = useMemo(() => {
    const colors = [
      { bg: "bg-red-100", border: "border-red-400", text: "text-red-800" },
      { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-800" },
      { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-800" },
      { bg: "bg-emerald-100", border: "border-emerald-400", text: "text-emerald-800" },
      { bg: "bg-violet-100", border: "border-violet-400", text: "text-violet-800" },
      { bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-800" },
      { bg: "bg-cyan-100", border: "border-cyan-400", text: "text-cyan-800" },
      { bg: "bg-pink-100", border: "border-pink-400", text: "text-pink-800" },
      { bg: "bg-lime-100", border: "border-lime-400", text: "text-lime-800" },
      { bg: "bg-sky-100", border: "border-sky-400", text: "text-sky-800" },
      { bg: "bg-rose-100", border: "border-rose-400", text: "text-rose-800" },
      { bg: "bg-teal-100", border: "border-teal-400", text: "text-teal-800" },
      { bg: "bg-indigo-100", border: "border-indigo-400", text: "text-indigo-800" },
      { bg: "bg-yellow-100", border: "border-yellow-400", text: "text-yellow-800" },
      { bg: "bg-fuchsia-100", border: "border-fuchsia-400", text: "text-fuchsia-800" },
      { bg: "bg-green-100", border: "border-green-400", text: "text-green-800" },
    ];
    const map: Record<string, typeof colors[0]> = {};
    selectedPlants.forEach((p, i) => {
      map[p.id] = colors[i % colors.length];
    });
    return map;
  }, [selectedPlants]);

  const allAllocations = layout.plantAllocations;

  return (
    <div className="max-w-4xl mx-auto">
      {showConfetti && <Confetti />}

      {/* Hero celebration */}
      <div className="text-center mb-10 animate-bounce-in">
        <span className="text-7xl inline-block mb-3">🎉</span>
        <h2 className="text-3xl font-extrabold text-[var(--foreground)] mb-2">
          Your Garden Plan is Ready!
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <span className="badge-duo" style={{ background: "var(--duo-green-light)", color: "var(--duo-green-dark)" }}>
            📍 {city}
          </span>
          <span className="badge-duo" style={{ background: "#e8f4fd", color: "var(--duo-blue-dark)" }}>
            🌡️ Zone {zoneData.zone}
          </span>
          <span className="badge-duo" style={{ background: "#fff3e0", color: "var(--duo-orange-dark)" }}>
            {gardenConfig.type === "inground"
              ? `📐 ${gardenConfig.widthFeet}' x ${gardenConfig.lengthFeet}' bed`
              : `🪴 ${gardenConfig.containers?.length} container${(gardenConfig.containers?.length || 0) > 1 ? "s" : ""}`}
          </span>
          <span className="badge-duo" style={{ background: "#f3e8ff", color: "var(--duo-purple-dark)" }}>
            🌱 {selectedPlants.length} plant{selectedPlants.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Garden Layout Section */}
      <section className="mb-10">
        <h3 className="section-header-duo mb-4">
          <span className="text-3xl">🗺️</span> Suggested Layout
        </h3>

        <div className="card-duo">
          {gardenConfig.type === "inground" ? (
            <InGroundGrid layout={layout} plantColors={plantColors} selectedPlants={selectedPlants} />
          ) : (
            <ContainerGrids layout={layout} plantColors={plantColors} selectedPlants={selectedPlants} gardenConfig={gardenConfig} />
          )}
        </div>

        {layout.unplacedPlants.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl flex items-start gap-3" style={{ background: "#fff3e0" }}>
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--duo-orange-dark)" }}>
                Could not fit these plants:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {layout.unplacedPlants.map((p) => (
                  <span key={p.id} className="text-sm font-medium" style={{ color: "var(--duo-orange)" }}>
                    {p.emoji} {p.name}
                  </span>
                ))}
              </div>
              <p className="text-xs mt-1 font-medium" style={{ color: "var(--duo-orange)" }}>
                Consider a larger garden or additional containers.
              </p>
            </div>
          </div>
        )}

        <CompanionTips selectedPlants={selectedPlants} />
      </section>

      {/* Timeline Section */}
      <section className="mb-10">
        <h3 className="section-header-duo mb-4">
          <span className="text-3xl">📅</span> Planting Timeline
        </h3>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-duo" style={{ background: "var(--duo-green-light)", color: "var(--duo-green-dark)" }}>
              🌸 Spring / Summer
            </span>
          </div>
          <TimelineEvents
            eventsByMonth={filterEventsByMonth(eventsByMonth, "spring")}
          />
        </div>

        {hasFallEvents(eventsByMonth) && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-duo" style={{ background: "#fff3e0", color: "var(--duo-orange-dark)" }}>
                🍂 Fall Planting
              </span>
            </div>
            <TimelineEvents
              eventsByMonth={filterEventsByMonth(eventsByMonth, "fall")}
            />
          </div>
        )}
      </section>

      {/* Seed Shopping Summary */}
      <section className="mb-10">
        <h3 className="section-header-duo mb-4">
          <span className="text-3xl">🛒</span> Seed Shopping List
        </h3>
        <div className="card-duo overflow-hidden !p-0">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--duo-green-light)" }}>
                <th className="text-left px-4 py-3 font-bold text-[var(--duo-green-dark)]">Plant</th>
                <th className="text-center px-4 py-3 font-bold text-[var(--duo-green-dark)]">Plants</th>
                <th className="text-center px-4 py-3 font-bold text-[var(--duo-green-dark)]">Seeds/Spot</th>
                <th className="text-center px-4 py-3 font-bold text-[var(--duo-green-dark)]">Total Seeds</th>
                <th className="text-center px-4 py-3 font-bold text-[var(--duo-green-dark)]">Fall?</th>
              </tr>
            </thead>
            <tbody>
              {allAllocations.map((alloc) => {
                const totalSeeds = alloc.count * alloc.plant.seedsPerSpot;
                return (
                  <tr key={`${alloc.plant.id}-${alloc.containerIndex ?? ""}`} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-bold">
                      {alloc.plant.emoji} {alloc.plant.name}
                    </td>
                    <td className="text-center px-4 py-3 font-medium">{alloc.count}</td>
                    <td className="text-center px-4 py-3">
                      {alloc.plant.seedsPerSpot}
                      {alloc.plant.needsThinning && (
                        <span className="text-gray-400 text-xs ml-1 font-medium">(thin)</span>
                      )}
                    </td>
                    <td className="text-center px-4 py-3 font-bold" style={{ color: "var(--duo-green-dark)" }}>{totalSeeds}</td>
                    <td className="text-center px-4 py-3">
                      {alloc.plant.canFallPlant ? (
                        <span className="font-bold" style={{ color: "var(--duo-green)" }}>Yes (+{totalSeeds})</span>
                      ) : (
                        <span className="text-gray-300 font-medium">No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2 font-medium">
          Seed counts include extras for thinning where applicable. Buy a few extra as insurance!
        </p>
      </section>

      {/* Growing Tips */}
      <section className="mb-10">
        <h3 className="section-header-duo mb-4">
          <span className="text-3xl">💡</span> Growing Tips
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {selectedPlants.map((plant) => (
            <div key={plant.id} className="card-duo">
              <div className="font-bold text-[var(--foreground)] mb-1 flex items-center gap-2">
                <span className="text-2xl">{plant.emoji}</span> {plant.name}
              </div>
              <p className="text-sm text-gray-500 font-medium">{plant.tip}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="badge-duo text-xs" style={{ background: "#fff3e0", color: "var(--duo-orange-dark)" }}>
                  ☀️ {plant.sun} sun
                </span>
                <span className="badge-duo text-xs" style={{ background: "#e8f4fd", color: "var(--duo-blue-dark)" }}>
                  ⏱️ {plant.daysToHarvest} days
                </span>
                <span className="badge-duo text-xs" style={{ background: "#f3e8ff", color: "var(--duo-purple-dark)" }}>
                  📏 {plant.spacingInches}&quot; spacing
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center pb-8">
        <button onClick={onStartOver} className="btn-duo btn-duo-blue text-lg">
          Start a New Plan
        </button>
      </div>
    </div>
  );
}


interface PlantCluster {
  plantId: string;
  emoji: string;
  name: string;
  rowStart: number;
  colStart: number;
  rowSpan: number;
  colSpan: number;
}

function clusterGrid(
  grid: (string | null)[][],
  rows: number,
  cols: number,
  plantLookup: Record<string, PlantData>
): PlantCluster[] {
  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );
  const clusters: PlantCluster[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (visited[r][c] || !grid[r][c]) continue;
      const plantId = grid[r][c]!;

      let maxC = c;
      while (maxC + 1 < cols && grid[r][maxC + 1] === plantId && !visited[r][maxC + 1]) {
        maxC++;
      }

      let maxR = r;
      outer: while (maxR + 1 < rows) {
        for (let cc = c; cc <= maxC; cc++) {
          if (grid[maxR + 1][cc] !== plantId || visited[maxR + 1][cc]) break outer;
        }
        maxR++;
      }

      for (let rr = r; rr <= maxR; rr++) {
        for (let cc = c; cc <= maxC; cc++) {
          visited[rr][cc] = true;
        }
      }

      const plant = plantLookup[plantId];
      clusters.push({
        plantId,
        emoji: plant?.emoji || "",
        name: plant?.name || plantId,
        rowStart: r,
        colStart: c,
        rowSpan: maxR - r + 1,
        colSpan: maxC - c + 1,
      });
    }
  }

  return clusters;
}

function SpatialGrid({
  grid,
  rows,
  cols,
  cellSizeInches,
  plantColors,
  selectedPlants,
  widthLabel,
  lengthLabel,
  allocations,
}: {
  grid: (string | null)[][];
  rows: number;
  cols: number;
  cellSizeInches: number;
  plantColors: Record<string, { bg: string; border: string; text: string }>;
  selectedPlants: PlantData[];
  widthLabel: string;
  lengthLabel: string;
  allocations: { plant: PlantData; count: number }[];
}) {
  const plantLookup: Record<string, PlantData> = {};
  for (const p of selectedPlants) plantLookup[p.id] = p;

  const clusters = clusterGrid(grid, rows, cols, plantLookup);

  const maxDisplayWidth = 560;
  const cellPx = Math.max(4, Math.min(18, Math.floor(maxDisplayWidth / cols)));
  const gapPx = 1;
  const gridWidthPx = cols * (cellPx + gapPx);
  const gridHeightPx = rows * (cellPx + gapPx);

  return (
    <div>
      <div className="inline-block rounded-2xl p-4" style={{ border: "3px solid var(--duo-green)", background: "var(--duo-green-light)" }}>
        <div className="text-xs text-[var(--duo-green-dark)] font-bold text-center mb-1">{widthLabel}</div>
        <div className="flex items-start gap-1">
          <div
            style={{
              position: "relative",
              width: gridWidthPx,
              height: gridHeightPx,
              backgroundColor: "rgba(255, 255, 255, 0.4)",
              borderRadius: 8,
            }}
          >
            {clusters.map((cl, i) => {
              const color = plantColors[cl.plantId];
              const left = cl.colStart * (cellPx + gapPx);
              const top = cl.rowStart * (cellPx + gapPx);
              const width = cl.colSpan * (cellPx + gapPx) - gapPx;
              const height = cl.rowSpan * (cellPx + gapPx) - gapPx;
              const minDim = Math.min(width, height);
              const showEmoji = minDim >= 14;
              const showLabel = minDim >= 30 && width >= 50;
              const fontSize = Math.min(minDim * 0.6, 20);

              return (
                <div
                  key={`cl-${i}`}
                  className={`absolute flex flex-col items-center justify-center rounded-lg border-2 ${color?.bg || "bg-gray-100"} ${color?.border || "border-gray-300"}`}
                  style={{ left, top, width, height }}
                  title={`${cl.name} (${plantLookup[cl.plantId]?.spacingInches}" spacing)`}
                >
                  {showEmoji && (
                    <span style={{ fontSize, lineHeight: 1 }}>{cl.emoji}</span>
                  )}
                  {showLabel && (
                    <span className="text-gray-600 font-bold leading-tight text-center" style={{ fontSize: Math.min(9, fontSize * 0.5) }}>
                      {cl.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-xs text-[var(--duo-green-dark)] font-bold flex items-center ml-1" style={{ writingMode: "vertical-rl" }}>
            {lengthLabel}
          </div>
        </div>
        <div className="text-xs text-[var(--duo-green-dark)] font-medium text-center mt-1">
          Each cell = {cellSizeInches}&quot;
        </div>
      </div>

      {allocations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {allocations.map((alloc) => {
            const color = plantColors[alloc.plant.id];
            return (
              <span
                key={alloc.plant.id}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border-2 ${color?.bg || "bg-gray-100"} ${color?.border || "border-gray-300"} text-gray-700`}
              >
                {alloc.plant.emoji} {alloc.count} {alloc.plant.name} ({alloc.plant.spacingInches}&quot;)
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InGroundGrid({
  layout,
  plantColors,
  selectedPlants,
}: {
  layout: LayoutResult;
  plantColors: Record<string, { bg: string; border: string; text: string }>;
  selectedPlants: PlantData[];
}) {
  if (layout.plantAllocations.length === 0) return null;

  const widthInches = layout.cols * layout.cellSizeInches;
  const lengthInches = layout.rows * layout.cellSizeInches;

  return (
    <SpatialGrid
      grid={layout.grid}
      rows={layout.rows}
      cols={layout.cols}
      cellSizeInches={layout.cellSizeInches}
      plantColors={plantColors}
      selectedPlants={selectedPlants}
      allocations={layout.plantAllocations}
      widthLabel={`${widthInches}" wide`}
      lengthLabel={`${lengthInches}" long`}
    />
  );
}

function ContainerGrids({
  layout,
  plantColors,
  selectedPlants,
  gardenConfig,
}: {
  layout: LayoutResult;
  plantColors: Record<string, { bg: string; border: string; text: string }>;
  selectedPlants: PlantData[];
  gardenConfig: GardenConfig;
}) {
  if (!layout.containerLayouts) return null;

  return (
    <div className="space-y-6">
      {layout.containerLayouts.map((cl) => {
        const container = gardenConfig.containers?.[cl.containerIndex];

        return (
          <div key={cl.containerIndex}>
            <div className="text-sm font-bold text-[var(--foreground)] mb-2">
              🪴 Container {cl.containerIndex + 1}{" "}
              {container && (
                <span className="text-gray-400 font-medium">
                  ({container.widthInches}&quot; x {container.lengthInches}&quot; x{" "}
                  {container.depthInches}&quot; deep)
                </span>
              )}
            </div>
            <SpatialGrid
              grid={cl.grid}
              rows={cl.rows}
              cols={cl.cols}
              cellSizeInches={layout.cellSizeInches}
              plantColors={plantColors}
              selectedPlants={selectedPlants}
              allocations={cl.plantAllocations}
              widthLabel={`${container?.widthInches}" wide`}
              lengthLabel={`${container?.lengthInches}" long`}
            />
          </div>
        );
      })}
    </div>
  );
}

function CompanionTips({ selectedPlants }: { selectedPlants: PlantData[] }) {
  const tips: { good: string[]; bad: string[] } = { good: [], bad: [] };

  for (let i = 0; i < selectedPlants.length; i++) {
    for (let j = i + 1; j < selectedPlants.length; j++) {
      const a = selectedPlants[i];
      const b = selectedPlants[j];

      if (a.companions.includes(b.id) || b.companions.includes(a.id)) {
        tips.good.push(`${a.emoji} ${a.name} + ${b.emoji} ${b.name}`);
      }
      if (a.enemies.includes(b.id) || b.enemies.includes(a.id)) {
        tips.bad.push(`${a.emoji} ${a.name} + ${b.emoji} ${b.name}`);
      }
    }
  }

  if (tips.good.length === 0 && tips.bad.length === 0) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {tips.good.length > 0 && (
        <div className="card-duo card-duo-selected">
          <div className="text-sm font-bold mb-1" style={{ color: "var(--duo-green-dark)" }}>
            💚 Good Companions
          </div>
          {tips.good.map((tip, i) => (
            <div key={i} className="text-sm font-medium" style={{ color: "var(--duo-green-dark)" }}>
              {tip}
            </div>
          ))}
        </div>
      )}
      {tips.bad.length > 0 && (
        <div className="card-duo" style={{ borderColor: "var(--duo-red)", background: "#fff5f5" }}>
          <div className="text-sm font-bold mb-1" style={{ color: "var(--duo-red-dark)" }}>
            ⚡ Keep Apart
          </div>
          {tips.bad.map((tip, i) => (
            <div key={i} className="text-sm font-medium" style={{ color: "var(--duo-red)" }}>
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineEvents({ eventsByMonth }: { eventsByMonth: Record<string, TimelineEvent[]> }) {
  const entries = Object.entries(eventsByMonth);
  if (entries.length === 0) return <p className="text-sm text-gray-400 italic font-medium">No events for this season.</p>;

  return (
    <div className="space-y-6">
      {entries.map(([month, events]) => (
        <div key={month}>
          <h4 className="text-lg font-extrabold text-[var(--foreground)] mb-3 pb-1" style={{ borderBottom: "3px solid var(--duo-green-light)" }}>
            {month}
          </h4>
          <div className="space-y-2">
            {events.map((event, i) => {
              const color = actionColors[event.action];
              return (
                <div
                  key={`${event.plantId}-${event.action}-${event.season}-${i}`}
                  className="card-duo flex items-start gap-3 !py-3"
                >
                  <div className="text-sm text-gray-400 min-w-[80px] font-bold">
                    {formatDate(event.date)}
                  </div>
                  <span
                    className={`badge-duo text-xs ${color.bg} ${color.text}`}
                  >
                    {color.emoji} {color.label}
                  </span>
                  <div className="text-sm text-[var(--foreground)] font-medium">
                    {event.plantEmoji} {event.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function filterEventsByMonth(
  eventsByMonth: Record<string, TimelineEvent[]>,
  season: "spring" | "fall"
): Record<string, TimelineEvent[]> {
  const filtered: Record<string, TimelineEvent[]> = {};
  for (const [month, events] of Object.entries(eventsByMonth)) {
    const seasonEvents = events.filter((e) => e.season === season);
    if (seasonEvents.length > 0) {
      filtered[month] = seasonEvents;
    }
  }
  return filtered;
}

function hasFallEvents(eventsByMonth: Record<string, TimelineEvent[]>): boolean {
  return Object.values(eventsByMonth).some((events) =>
    events.some((e) => e.season === "fall")
  );
}
