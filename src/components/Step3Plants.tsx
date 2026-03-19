"use client";

import { useState } from "react";
import { plants, PlantData } from "@/data/plants";
import { GardenConfig } from "@/lib/layout";

interface Props {
  onComplete: (selectedPlants: PlantData[]) => void;
  onBack: () => void;
  gardenConfig: GardenConfig;
  initialPlants?: PlantData[];
}

const HERB_IDS = ["basil", "parsley", "cilantro", "dill"];
const FLOWER_IDS = ["marigold"];
const FRUIT_IDS = ["strawberry"];

const categories = [
  { label: "All", emoji: "🌈", filter: () => true },
  {
    label: "Vegetables",
    emoji: "🥬",
    filter: (p: PlantData) =>
      !HERB_IDS.includes(p.id) && !FLOWER_IDS.includes(p.id) && !FRUIT_IDS.includes(p.id),
  },
  {
    label: "Herbs",
    emoji: "🌿",
    filter: (p: PlantData) => HERB_IDS.includes(p.id),
  },
  {
    label: "Flowers",
    emoji: "🌸",
    filter: (p: PlantData) => FLOWER_IDS.includes(p.id),
  },
  {
    label: "Fruits",
    emoji: "🍓",
    filter: (p: PlantData) => FRUIT_IDS.includes(p.id),
  },
];

export default function Step3Plants({
  onComplete,
  onBack,
  gardenConfig,
  initialPlants = [],
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialPlants.map((p) => p.id))
  );
  const [activeCategory, setActiveCategory] = useState("All");

  const togglePlant = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedPlants = plants.filter((p) => selectedIds.has(p.id));
  const isContainer = gardenConfig.type === "container";

  const activeFilter = categories.find((c) => c.label === activeCategory)?.filter || (() => true);
  const filteredPlants = plants.filter(activeFilter);

  return (
    <div className="max-w-2xl mx-auto animate-bounce-in">
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 inline-block">🌱</span>
        <h2 className="text-2xl font-extrabold text-[var(--foreground)] mb-1">
          What do you want to grow?
        </h2>
        <p className="text-gray-500 font-medium">
          Tap the plants you&apos;d like in your garden!
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 flex-wrap justify-center">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.label)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all border-2 ${
              activeCategory === cat.label
                ? "bg-[var(--duo-blue)] text-white border-[var(--duo-blue-dark)] border-b-4"
                : "bg-white text-gray-500 border-[#e5e5e5] hover:border-gray-300"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Plant grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {filteredPlants.map((plant) => {
          const isSelected = selectedIds.has(plant.id);
          const notContainerFriendly = isContainer && !plant.containerFriendly;

          return (
            <button
              key={plant.id}
              onClick={() => !notContainerFriendly && togglePlant(plant.id)}
              disabled={notContainerFriendly}
              className={`card-duo text-left transition-all ${
                notContainerFriendly
                  ? "opacity-40 cursor-not-allowed !border-[#e5e5e5]"
                  : isSelected
                  ? "card-duo-selected !border-b-4 !border-b-[var(--duo-green-dark)]"
                  : "hover:border-gray-300 active:scale-95"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-3xl">{plant.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[var(--foreground)] text-sm">
                    {plant.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 font-medium">
                    {plant.spacingInches}&quot; spacing &middot; {plant.sun} sun
                  </div>
                  {notContainerFriendly && (
                    <div className="text-xs font-bold mt-0.5" style={{ color: "var(--duo-red)" }}>
                      Not suited for containers
                    </div>
                  )}
                </div>
                {isSelected && (
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "var(--duo-green)" }}>
                    ✓
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected summary */}
      {selectedPlants.length > 0 && (
        <div className="card-duo card-duo-selected mb-4 animate-bounce-in">
          <div className="text-sm font-bold" style={{ color: "var(--duo-green-dark)" }}>
            🎉 {selectedPlants.length} plant{selectedPlants.length !== 1 ? "s" : ""} selected!
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedPlants.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold"
                style={{ background: "var(--duo-green)", color: "white" }}
              >
                {p.emoji} {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-duo btn-duo-white">
          Back
        </button>
        <button
          disabled={selectedPlants.length === 0}
          onClick={() => onComplete(selectedPlants)}
          className="btn-duo btn-duo-green flex-1 text-lg"
        >
          Generate My Plan
        </button>
      </div>
    </div>
  );
}
