"use client";

import { useMemo } from "react";
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

const actionColors: Record<string, { bg: string; text: string; label: string }> = {
  "start-indoors": { bg: "bg-purple-100", text: "text-purple-800", label: "Start Indoors" },
  transplant: { bg: "bg-blue-100", text: "text-blue-800", label: "Transplant" },
  "direct-sow": { bg: "bg-amber-100", text: "text-amber-800", label: "Direct Sow" },
  harvest: { bg: "bg-green-100", text: "text-green-800", label: "Harvest" },
};

export default function ResultsPage({
  city,
  zoneData,
  gardenConfig,
  selectedPlants,
  onStartOver,
}: Props) {
  const layout = useMemo(
    () => generateLayout(gardenConfig, selectedPlants),
    [gardenConfig, selectedPlants]
  );

  const timeline = useMemo(
    () => generateTimeline(zoneData, selectedPlants, layout.plantAllocations),
    [zoneData, selectedPlants, layout.plantAllocations]
  );

  // Group timeline events by month
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

  // Build color map for plants — high-contrast, perceptually distinct palette
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

  // Gather all allocations for the summary
  const allAllocations = layout.plantAllocations;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Your Garden Plan
        </h2>
        <p className="text-gray-600">
          {city} &middot; Zone {zoneData.zone} &middot;{" "}
          {gardenConfig.type === "inground"
            ? `${gardenConfig.widthFeet}' x ${gardenConfig.lengthFeet}' bed`
            : `${gardenConfig.containers?.length} container${(gardenConfig.containers?.length || 0) > 1 ? "s" : ""}`}
          {" "}&middot; {selectedPlants.length} plant type{selectedPlants.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Garden Layout Section */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">&#127793;</span> Suggested Layout
        </h3>

        {gardenConfig.type === "inground" ? (
          <InGroundGrid layout={layout} plantColors={plantColors} selectedPlants={selectedPlants} />
        ) : (
          <ContainerGrids layout={layout} plantColors={plantColors} selectedPlants={selectedPlants} gardenConfig={gardenConfig} />
        )}

        {layout.unplacedPlants.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800">
              Could not fit these plants in your space:
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {layout.unplacedPlants.map((p) => (
                <span key={p.id} className="text-sm text-amber-700">
                  {p.emoji} {p.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Consider a larger garden or additional containers.
            </p>
          </div>
        )}

        {/* Plant legend with counts */}
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-600 mb-2">Plant counts based on your space:</div>
          <div className="flex flex-wrap gap-2">
            {allAllocations.map((alloc) => {
              const color = plantColors[alloc.plant.id];
              return (
                <div
                  key={`${alloc.plant.id}-${alloc.containerIndex ?? "all"}`}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${color?.bg || "bg-gray-100"} ${color?.border || "border-gray-300"} text-gray-700`}
                >
                  {alloc.plant.emoji} {alloc.plant.name} &times; {alloc.count}
                  <span className="text-gray-500 ml-1">({alloc.plant.spacingInches}&quot; apart)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Companion planting tips */}
        <CompanionTips selectedPlants={selectedPlants} />
      </section>

      {/* Timeline Section */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">&#128197;</span> Planting Timeline
        </h3>

        {/* Spring/Summer section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-green-700 mb-3 flex items-center gap-1">
            <span>&#127793;</span> Spring / Summer
          </h4>
          <TimelineEvents
            eventsByMonth={filterEventsByMonth(eventsByMonth, "spring")}
          />
        </div>

        {/* Fall section */}
        {hasFallEvents(eventsByMonth) && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-orange-700 mb-3 flex items-center gap-1">
              <span>&#127810;</span> Fall Planting
            </h4>
            <TimelineEvents
              eventsByMonth={filterEventsByMonth(eventsByMonth, "fall")}
            />
          </div>
        )}
      </section>

      {/* Seed Shopping Summary */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">&#127793;</span> Seed Shopping List
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-medium text-gray-700">Plant</th>
                <th className="text-center px-4 py-2 font-medium text-gray-700">Plants in Layout</th>
                <th className="text-center px-4 py-2 font-medium text-gray-700">Seeds/Spot</th>
                <th className="text-center px-4 py-2 font-medium text-gray-700">Total Seeds (Spring)</th>
                <th className="text-center px-4 py-2 font-medium text-gray-700">Fall Crop?</th>
              </tr>
            </thead>
            <tbody>
              {allAllocations.map((alloc) => {
                const totalSeeds = alloc.count * alloc.plant.seedsPerSpot;
                return (
                  <tr key={`${alloc.plant.id}-${alloc.containerIndex ?? ""}`} className="border-b border-gray-100">
                    <td className="px-4 py-2">
                      {alloc.plant.emoji} {alloc.plant.name}
                    </td>
                    <td className="text-center px-4 py-2">{alloc.count}</td>
                    <td className="text-center px-4 py-2">
                      {alloc.plant.seedsPerSpot}
                      {alloc.plant.needsThinning && (
                        <span className="text-gray-400 text-xs ml-1">(thin)</span>
                      )}
                    </td>
                    <td className="text-center px-4 py-2 font-medium">{totalSeeds}</td>
                    <td className="text-center px-4 py-2">
                      {alloc.plant.canFallPlant ? (
                        <span className="text-green-600">Yes (+{totalSeeds})</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Seed counts include extras for thinning where applicable. Buy a few extra seeds as insurance for poor germination.
        </p>
      </section>

      {/* Growing Tips */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">&#128161;</span> Growing Tips
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {selectedPlants.map((plant) => (
            <div
              key={plant.id}
              className="p-3 bg-white border border-gray-100 rounded-lg"
            >
              <div className="font-medium text-gray-800 mb-1">
                {plant.emoji} {plant.name}
              </div>
              <p className="text-sm text-gray-600">{plant.tip}</p>
              <div className="text-xs text-gray-400 mt-1">
                {plant.sun} sun &middot; {plant.daysToHarvest} days to harvest &middot; {plant.spacingInches}&quot; spacing
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center pb-8">
        <button
          onClick={onStartOver}
          className="py-3 px-8 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Start a New Plan
        </button>
      </div>
    </div>
  );
}


/**
 * Cluster contiguous same-plant cells into rectangular regions for cleaner rendering.
 * Uses greedy maximal-rectangle: scan L→R, T→B; for each unvisited plant cell,
 * expand right then down while all cells match the same plant.
 */
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

      // Expand right
      let maxC = c;
      while (maxC + 1 < cols && grid[r][maxC + 1] === plantId && !visited[r][maxC + 1]) {
        maxC++;
      }

      // Expand down while entire row matches
      let maxR = r;
      outer: while (maxR + 1 < rows) {
        for (let cc = c; cc <= maxC; cc++) {
          if (grid[maxR + 1][cc] !== plantId || visited[maxR + 1][cc]) break outer;
        }
        maxR++;
      }

      // Mark visited
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

function InGroundGrid({
  layout,
  plantColors,
  selectedPlants,
}: {
  layout: LayoutResult;
  plantColors: Record<string, typeof plantColorType>;
  selectedPlants: PlantData[];
}) {
  if (layout.rows === 0 || layout.cols === 0) return null;

  const maxGridWidth = 500;
  const cellPx = Math.min(20, Math.floor(maxGridWidth / layout.cols));
  const gapPx = 1;

  const plantLookup: Record<string, PlantData> = {};
  for (const p of selectedPlants) plantLookup[p.id] = p;

  const clusters = clusterGrid(layout.grid, layout.rows, layout.cols, plantLookup);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block border-2 border-amber-700 rounded-lg bg-amber-50 p-2">
        <div className="text-xs text-gray-400 text-center mb-1">&#8593; North (tall plants)</div>
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: `repeat(${layout.cols}, ${cellPx}px)`,
            gridTemplateRows: `repeat(${layout.rows}, ${cellPx}px)`,
            gap: `${gapPx}px`,
          }}
        >
          {/* Empty cell background */}
          {Array.from({ length: layout.rows }).map((_, r) =>
            Array.from({ length: layout.cols }).map((_, c) => (
              <div
                key={`bg-${r}-${c}`}
                style={{
                  gridRow: r + 1,
                  gridColumn: c + 1,
                  width: cellPx,
                  height: cellPx,
                }}
                className="bg-amber-100/30"
              />
            ))
          )}
          {/* Plant clusters */}
          {clusters.map((cl, i) => {
            const color = plantColors[cl.plantId];
            const clusterWidthPx = cl.colSpan * cellPx + (cl.colSpan - 1) * gapPx;
            const clusterHeightPx = cl.rowSpan * cellPx + (cl.rowSpan - 1) * gapPx;
            const fontSize = Math.min(clusterWidthPx, clusterHeightPx, 28) * 0.7;
            return (
              <div
                key={`cl-${i}`}
                className={`flex items-center justify-center border rounded-md ${color?.bg || "bg-gray-100"} ${color?.border || "border-gray-300"}`}
                style={{
                  gridRow: `${cl.rowStart + 1} / span ${cl.rowSpan}`,
                  gridColumn: `${cl.colStart + 1} / span ${cl.colSpan}`,
                  zIndex: 1,
                }}
                title={`${cl.name} (${plantLookup[cl.plantId]?.spacingInches}" spacing)`}
              >
                {fontSize >= 8 && (
                  <span style={{ fontSize: Math.max(8, fontSize), lineHeight: 1 }}>{cl.emoji}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-400 text-center mt-1">&#8595; South</div>
        <div className="text-xs text-gray-400 text-center">
          Each cell = {layout.cellSizeInches}&quot; &middot; Grid = {layout.cols * layout.cellSizeInches}&quot; &times; {layout.rows * layout.cellSizeInches}&quot;
        </div>
      </div>
    </div>
  );
}

// Type helper for plantColors values
const plantColorType = { bg: "", border: "", text: "" };

function ContainerGrids({
  layout,
  plantColors,
  selectedPlants,
  gardenConfig,
}: {
  layout: LayoutResult;
  plantColors: Record<string, typeof plantColorType>;
  selectedPlants: PlantData[];
  gardenConfig: GardenConfig;
}) {
  if (!layout.containerLayouts) return null;

  const plantLookup: Record<string, PlantData> = {};
  for (const p of selectedPlants) plantLookup[p.id] = p;

  return (
    <div className="space-y-6">
      {layout.containerLayouts.map((cl) => {
        const container = gardenConfig.containers?.[cl.containerIndex];
        const maxWidth = 600;
        const cellPx = Math.min(24, Math.floor(maxWidth / cl.cols));
        const gapPx = 1;

        const clusters = clusterGrid(cl.grid, cl.rows, cl.cols, plantLookup);

        return (
          <div key={cl.containerIndex}>
            <div className="text-sm font-medium text-gray-600 mb-2">
              Container {cl.containerIndex + 1}{" "}
              {container && (
                <span className="text-gray-400">
                  ({container.widthInches}&quot; x {container.lengthInches}&quot; x{" "}
                  {container.depthInches}&quot; deep)
                </span>
              )}
            </div>
            <div className="inline-block border-2 border-amber-700 rounded-lg bg-amber-50 p-2">
              <div className="text-xs text-gray-400 text-center mb-1">
                {container?.widthInches}&quot; wide
              </div>
              <div className="flex items-start gap-1">
                <div
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: `repeat(${cl.cols}, ${cellPx}px)`,
                    gridTemplateRows: `repeat(${cl.rows}, ${cellPx}px)`,
                    gap: `${gapPx}px`,
                  }}
                >
                  {/* Empty cell background */}
                  {Array.from({ length: cl.rows }).map((_, r) =>
                    Array.from({ length: cl.cols }).map((_, c) => (
                      <div
                        key={`bg-${r}-${c}`}
                        style={{
                          gridRow: r + 1,
                          gridColumn: c + 1,
                          width: cellPx,
                          height: cellPx,
                        }}
                        className="bg-amber-100/30"
                      />
                    ))
                  )}
                  {/* Plant clusters */}
                  {clusters.map((cluster, i) => {
                    const color = plantColors[cluster.plantId];
                    const clusterWidthPx = cluster.colSpan * cellPx + (cluster.colSpan - 1) * gapPx;
                    const clusterHeightPx = cluster.rowSpan * cellPx + (cluster.rowSpan - 1) * gapPx;
                    const fontSize = Math.min(clusterWidthPx, clusterHeightPx, 28) * 0.7;
                    return (
                      <div
                        key={`cl-${i}`}
                        className={`flex items-center justify-center border rounded-md ${color?.bg || "bg-gray-100"} ${color?.border || "border-gray-300"}`}
                        style={{
                          gridRow: `${cluster.rowStart + 1} / span ${cluster.rowSpan}`,
                          gridColumn: `${cluster.colStart + 1} / span ${cluster.colSpan}`,
                          zIndex: 1,
                        }}
                        title={`${cluster.name} (${plantLookup[cluster.plantId]?.spacingInches}" spacing)`}
                      >
                        {fontSize >= 8 && (
                          <span style={{ fontSize: Math.max(8, fontSize), lineHeight: 1 }}>{cluster.emoji}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-400 flex items-center" style={{ writingMode: "vertical-rl" }}>
                  {container?.lengthInches}&quot; long
                </div>
              </div>
              <div className="text-xs text-gray-400 text-center mt-1">
                Each cell = {layout.cellSizeInches}&quot;
              </div>
            </div>

            {/* Per-container plant summary */}
            {cl.plantAllocations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {cl.plantAllocations.map((alloc) => {
                  const color = plantColors[alloc.plant.id];
                  return (
                    <span
                      key={alloc.plant.id}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${color?.bg || "bg-gray-100"} ${color?.border || "border-gray-300"} text-gray-700`}
                    >
                      {alloc.plant.emoji} {alloc.count} {alloc.plant.name} ({alloc.plant.spacingInches}&quot; apart)
                    </span>
                  );
                })}
              </div>
            )}
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
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-1">
            Good Companions (placed near each other)
          </div>
          {tips.good.map((tip, i) => (
            <div key={i} className="text-sm text-green-700">
              {tip}
            </div>
          ))}
        </div>
      )}
      {tips.bad.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm font-medium text-red-800 mb-1">
            Keep Apart (placed away from each other)
          </div>
          {tips.bad.map((tip, i) => (
            <div key={i} className="text-sm text-red-700">
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
  if (entries.length === 0) return <p className="text-sm text-gray-400 italic">No events for this season.</p>;

  return (
    <div className="space-y-6">
      {entries.map(([month, events]) => (
        <div key={month}>
          <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-1">
            {month}
          </h4>
          <div className="space-y-2">
            {events.map((event, i) => {
              const color = actionColors[event.action];
              return (
                <div
                  key={`${event.plantId}-${event.action}-${event.season}-${i}`}
                  className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg"
                >
                  <div className="text-sm text-gray-500 min-w-[80px] font-medium">
                    {formatDate(event.date)}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${color.bg} ${color.text} min-w-[90px] text-center`}
                  >
                    {color.label}
                  </span>
                  <div className="text-sm text-gray-700">
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
