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
  { label: "All", filter: () => true },
  {
    label: "Vegetables",
    filter: (p: PlantData) =>
      !HERB_IDS.includes(p.id) && !FLOWER_IDS.includes(p.id) && !FRUIT_IDS.includes(p.id),
  },
  {
    label: "Herbs",
    filter: (p: PlantData) => HERB_IDS.includes(p.id),
  },
  {
    label: "Flowers",
    filter: (p: PlantData) => FLOWER_IDS.includes(p.id),
  },
  {
    label: "Fruits",
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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        What do you want to grow?
      </h2>
      <p className="text-gray-600 mb-6">
        Select the plants you&apos;d like in your garden. We&apos;ll figure out the layout for you.
      </p>

      {/* Category filter */}
      <div className="flex gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.label)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.label
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
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
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                notContainerFriendly
                  ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                  : isSelected
                  ? "border-green-500 bg-green-50 shadow-sm"
                  : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">{plant.emoji}</span>
                <div className="min-w-0">
                  <div className="font-medium text-gray-800 text-sm">
                    {plant.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {plant.spacingInches}&quot; spacing &middot; {plant.sun} sun
                  </div>
                  {notContainerFriendly && (
                    <div className="text-xs text-red-400 mt-0.5">
                      Not suited for containers
                    </div>
                  )}
                </div>
                {isSelected && (
                  <span className="ml-auto text-green-600 text-lg">&#10003;</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected summary */}
      {selectedPlants.length > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <div className="text-sm font-medium text-green-800">
            {selectedPlants.length} plant{selectedPlants.length !== 1 ? "s" : ""} selected:
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedPlants.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded text-xs text-green-700"
              >
                {p.emoji} {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="py-3 px-6 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          disabled={selectedPlants.length === 0}
          onClick={() => onComplete(selectedPlants)}
          className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Generate My Garden Plan
        </button>
      </div>
    </div>
  );
}
