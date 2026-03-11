"use client";

import { useState } from "react";
import { GardenConfig } from "@/lib/layout";

interface Props {
  onComplete: (config: GardenConfig) => void;
  onBack: () => void;
  initialConfig?: GardenConfig | null;
}

export default function Step2Garden({ onComplete, onBack, initialConfig }: Props) {
  const [gardenType, setGardenType] = useState<"inground" | "container">(
    initialConfig?.type || "inground"
  );
  const [widthFeet, setWidthFeet] = useState(initialConfig?.widthFeet?.toString() || "4");
  const [lengthFeet, setLengthFeet] = useState(initialConfig?.lengthFeet?.toString() || "8");
  const [containers, setContainers] = useState(
    initialConfig?.containers || [{ widthInches: 18, lengthInches: 18, depthInches: 12 }]
  );

  const handleSubmit = () => {
    if (gardenType === "inground") {
      const w = parseFloat(widthFeet);
      const l = parseFloat(lengthFeet);
      if (w > 0 && l > 0) {
        onComplete({ type: "inground", widthFeet: w, lengthFeet: l });
      }
    } else {
      const validContainers = containers.filter(
        (c) => c.widthInches > 0 && c.lengthInches > 0 && c.depthInches > 0
      );
      if (validContainers.length > 0) {
        onComplete({
          type: "container",
          widthFeet: 0,
          lengthFeet: 0,
          containers: validContainers,
        });
      }
    }
  };

  const addContainer = () => {
    setContainers([...containers, { widthInches: 18, lengthInches: 18, depthInches: 12 }]);
  };

  const removeContainer = (index: number) => {
    setContainers(containers.filter((_, i) => i !== index));
  };

  const updateContainer = (index: number, field: string, value: number) => {
    setContainers(
      containers.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Describe your garden</h2>
      <p className="text-gray-600 mb-6">
        Tell us about your growing space so we can plan the best layout.
      </p>

      {/* Garden type toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setGardenType("inground")}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
            gardenType === "inground"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          In-Ground Bed
        </button>
        <button
          onClick={() => setGardenType("container")}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
            gardenType === "container"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Containers / Pots
        </button>
      </div>

      {gardenType === "inground" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (feet)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={widthFeet}
                onChange={(e) => setWidthFeet(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (feet)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={lengthFeet}
                onChange={(e) => setLengthFeet(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            Tip: A 4x8 foot raised bed is a great size for beginners!
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {containers.map((container, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">
                  Container {index + 1}
                </span>
                {containers.length > 1 && (
                  <button
                    onClick={() => removeContainer(index)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Width (in)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="60"
                    value={container.widthInches}
                    onChange={(e) =>
                      updateContainer(index, "widthInches", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Length (in)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="60"
                    value={container.lengthInches}
                    onChange={(e) =>
                      updateContainer(index, "lengthInches", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Depth (in)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="36"
                    value={container.depthInches}
                    onChange={(e) =>
                      updateContainer(index, "depthInches", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addContainer}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors"
          >
            + Add another container
          </button>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="py-3 px-6 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
        >
          Next: Choose Plants
        </button>
      </div>
    </div>
  );
}
