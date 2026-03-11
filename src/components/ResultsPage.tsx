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
    () => generateTimeline(zoneData, selectedPlants),
    [zoneData, selectedPlants]
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

  // Build color map for plants
  const plantColors = useMemo(() => {
    const colors = [
      "bg-red-200",
      "bg-blue-200",
      "bg-yellow-200",
      "bg-purple-200",
      "bg-pink-200",
      "bg-indigo-200",
      "bg-teal-200",
      "bg-orange-200",
      "bg-cyan-200",
      "bg-lime-200",
      "bg-emerald-200",
      "bg-fuchsia-200",
      "bg-rose-200",
      "bg-sky-200",
      "bg-violet-200",
      "bg-amber-200",
    ];
    const map: Record<string, string> = {};
    selectedPlants.forEach((p, i) => {
      map[p.id] = colors[i % colors.length];
    });
    return map;
  }, [selectedPlants]);

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
          {" "}&middot; {selectedPlants.length} plants
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

        {/* Plant legend */}
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedPlants.map((p) => (
            <div
              key={p.id}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${plantColors[p.id]} text-gray-700`}
            >
              {p.emoji} {p.name}
            </div>
          ))}
        </div>

        {/* Companion planting tips */}
        <CompanionTips selectedPlants={selectedPlants} />
      </section>

      {/* Timeline Section */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">&#128197;</span> Planting Timeline
        </h3>

        <div className="space-y-6">
          {Object.entries(eventsByMonth).map(([month, events]) => (
            <div key={month}>
              <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                {month}
              </h4>
              <div className="space-y-2">
                {events.map((event, i) => {
                  const color = actionColors[event.action];
                  return (
                    <div
                      key={`${event.plantId}-${event.action}-${i}`}
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
                {plant.sun} sun &middot; {plant.daysToHarvest} days to harvest
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

function InGroundGrid({
  layout,
  plantColors,
  selectedPlants,
}: {
  layout: LayoutResult;
  plantColors: Record<string, string>;
  selectedPlants: PlantData[];
}) {
  if (layout.rows === 0 || layout.cols === 0) return null;

  // Show merged cells — find rectangular regions for each plant
  const regions = getPlantRegions(layout.grid, layout.rows, layout.cols);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block border-2 border-amber-700 rounded-lg bg-amber-50 p-1">
        <div className="text-xs text-gray-400 text-center mb-1">&#8593; North (place tall plants here)</div>
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, minmax(20px, 28px))`,
            gridTemplateRows: `repeat(${layout.rows}, minmax(20px, 28px))`,
          }}
        >
          {Array.from({ length: layout.rows }).map((_, r) =>
            Array.from({ length: layout.cols }).map((_, c) => {
              const plantId = layout.grid[r][c];
              const plant = plantId
                ? selectedPlants.find((p) => p.id === plantId)
                : null;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`w-full h-full rounded-sm flex items-center justify-center text-[10px] ${
                    plantId
                      ? plantColors[plantId] || "bg-gray-200"
                      : "bg-amber-100/50"
                  }`}
                  title={plant ? plant.name : "Empty"}
                >
                  {plantId && isRegionOrigin(regions, plantId, r, c) && (
                    <span className="text-sm">{plant?.emoji}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className="text-xs text-gray-400 text-center mt-1">&#8595; South</div>
      </div>
    </div>
  );
}

function ContainerGrids({
  layout,
  plantColors,
  selectedPlants,
  gardenConfig,
}: {
  layout: LayoutResult;
  plantColors: Record<string, string>;
  selectedPlants: PlantData[];
  gardenConfig: GardenConfig;
}) {
  if (!layout.containerLayouts) return null;

  return (
    <div className="space-y-4">
      {layout.containerLayouts.map((cl) => {
        const container = gardenConfig.containers?.[cl.containerIndex];
        return (
          <div key={cl.containerIndex} className="inline-block">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Container {cl.containerIndex + 1}{" "}
              {container && (
                <span className="text-gray-400">
                  ({container.widthInches}&quot; x {container.lengthInches}&quot; x{" "}
                  {container.depthInches}&quot; deep)
                </span>
              )}
            </div>
            <div className="border-2 border-amber-700 rounded-lg bg-amber-50 p-1 inline-block">
              <div
                className="grid gap-px"
                style={{
                  gridTemplateColumns: `repeat(${cl.cols}, minmax(24px, 32px))`,
                  gridTemplateRows: `repeat(${cl.rows}, minmax(24px, 32px))`,
                }}
              >
                {Array.from({ length: cl.rows }).map((_, r) =>
                  Array.from({ length: cl.cols }).map((_, c) => {
                    const plantId = cl.grid[r][c];
                    const plant = plantId
                      ? selectedPlants.find((p) => p.id === plantId)
                      : null;
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`w-full h-full rounded-sm flex items-center justify-center ${
                          plantId
                            ? plantColors[plantId] || "bg-gray-200"
                            : "bg-amber-100/50"
                        }`}
                        title={plant ? plant.name : "Empty"}
                      >
                        {plant && <span className="text-sm">{plant.emoji}</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CompanionTips({ selectedPlants }: { selectedPlants: PlantData[] }) {
  const tips: { good: string[]; bad: string[] } = { good: [], bad: [] };
  const selectedIds = new Set(selectedPlants.map((p) => p.id));

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
            Good Companions (plant near each other)
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
            Keep Apart (plant away from each other)
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

// Helper to find the first cell of each plant region (for emoji placement)
interface Region {
  plantId: string;
  startRow: number;
  startCol: number;
}

function getPlantRegions(
  grid: (string | null)[][],
  rows: number,
  cols: number
): Region[] {
  const seen = new Set<string>();
  const regions: Region[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = grid[r][c];
      if (id && !seen.has(`${id}-${r}-${c}`)) {
        // Check if this is the top-left of a new region for this plant
        const key = `${id}-region-${regions.filter((x) => x.plantId === id).length}`;
        if (
          (r === 0 || grid[r - 1][c] !== id) &&
          (c === 0 || grid[r][c - 1] !== id)
        ) {
          regions.push({ plantId: id, startRow: r, startCol: c });
        }
      }
    }
  }

  return regions;
}

function isRegionOrigin(
  regions: Region[],
  plantId: string,
  row: number,
  col: number
): boolean {
  return regions.some(
    (r) => r.plantId === plantId && r.startRow === row && r.startCol === col
  );
}
