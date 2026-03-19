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
          <InGroundGrid layout={layout} plantColors={plantColors} />
        ) : (
          <ContainerGrids layout={layout} plantColors={plantColors} gardenConfig={gardenConfig} />
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
 * Simplified zone-based layout: shows proportional colored blocks per plant type
 * instead of rendering every 3" cell. Much cleaner and communicates the same info.
 */
function PlantZoneMap({
  allocations,
  plantColors,
  widthLabel,
  lengthLabel,
}: {
  allocations: { plant: PlantData; count: number }[];
  plantColors: Record<string, { bg: string; border: string; text: string }>;
  widthLabel: string;
  lengthLabel: string;
}) {
  if (allocations.length === 0) return null;

  // Calculate proportional area for each plant: count × spacing²
  const totalArea = allocations.reduce(
    (sum, a) => sum + a.count * a.plant.spacingInches * a.plant.spacingInches,
    0
  );

  return (
    <div className="inline-block border-2 border-amber-700 rounded-lg bg-amber-50 p-3">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>{widthLabel}</span>
      </div>
      <div className="flex items-start gap-1">
        <div className="flex flex-wrap gap-1.5" style={{ maxWidth: 520 }}>
          {allocations.map((alloc) => {
            const areaFraction = (alloc.count * alloc.plant.spacingInches * alloc.plant.spacingInches) / totalArea;
            const minWidth = 80;
            const maxWidth = 520;
            const width = Math.max(minWidth, Math.round(areaFraction * maxWidth));
            const color = plantColors[alloc.plant.id];
            return (
              <div
                key={alloc.plant.id}
                className={`flex flex-col items-center justify-center rounded-lg border-2 px-2 py-3 ${color?.bg || "bg-gray-100"} ${color?.border || "border-gray-300"}`}
                style={{ width, minHeight: 70 }}
                title={`${alloc.plant.name}: ${alloc.count} plants, ${alloc.plant.spacingInches}" spacing`}
              >
                <span className="text-2xl mb-1">{alloc.plant.emoji}</span>
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                  {alloc.plant.name}
                </span>
                <span className="text-xs text-gray-500">
                  {alloc.count} plants &middot; {alloc.plant.spacingInches}&quot;
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-400 flex items-center ml-1" style={{ writingMode: "vertical-rl" }}>
          {lengthLabel}
        </div>
      </div>
    </div>
  );
}

function InGroundGrid({
  layout,
  plantColors,
}: {
  layout: LayoutResult;
  plantColors: Record<string, { bg: string; border: string; text: string }>;
}) {
  if (layout.plantAllocations.length === 0) return null;

  const widthInches = layout.cols * layout.cellSizeInches;
  const lengthInches = layout.rows * layout.cellSizeInches;

  return (
    <PlantZoneMap
      allocations={layout.plantAllocations}
      plantColors={plantColors}
      widthLabel={`${widthInches}" wide`}
      lengthLabel={`${lengthInches}" long`}
    />
  );
}

function ContainerGrids({
  layout,
  plantColors,
  gardenConfig,
}: {
  layout: LayoutResult;
  plantColors: Record<string, { bg: string; border: string; text: string }>;
  gardenConfig: GardenConfig;
}) {
  if (!layout.containerLayouts) return null;

  return (
    <div className="space-y-6">
      {layout.containerLayouts.map((cl) => {
        const container = gardenConfig.containers?.[cl.containerIndex];

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
            <PlantZoneMap
              allocations={cl.plantAllocations}
              plantColors={plantColors}
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
