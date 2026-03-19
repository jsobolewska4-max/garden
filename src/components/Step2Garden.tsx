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
  const [containers, setContainers] = useState<
    { widthInches: string; lengthInches: string; depthInches: string }[]
  >(
    initialConfig?.containers?.map((c) => ({
      widthInches: c.widthInches.toString(),
      lengthInches: c.lengthInches.toString(),
      depthInches: c.depthInches.toString(),
    })) || [{ widthInches: "18", lengthInches: "18", depthInches: "12" }]
  );

  const handleSubmit = () => {
    if (gardenType === "inground") {
      const w = parseFloat(widthFeet);
      const l = parseFloat(lengthFeet);
      if (w > 0 && l > 0) {
        onComplete({ type: "inground", widthFeet: w, lengthFeet: l });
      }
    } else {
      const parsed = containers
        .map((c) => ({
          widthInches: parseInt(c.widthInches) || 0,
          lengthInches: parseInt(c.lengthInches) || 0,
          depthInches: parseInt(c.depthInches) || 0,
        }))
        .filter((c) => c.widthInches > 0 && c.lengthInches > 0 && c.depthInches > 0);
      if (parsed.length > 0) {
        onComplete({
          type: "container",
          widthFeet: 0,
          lengthFeet: 0,
          containers: parsed,
        });
      }
    }
  };

  const addContainer = () => {
    setContainers([...containers, { widthInches: "18", lengthInches: "18", depthInches: "12" }]);
  };

  const removeContainer = (index: number) => {
    setContainers(containers.filter((_, i) => i !== index));
  };

  const updateContainer = (index: number, field: string, value: string) => {
    setContainers(
      containers.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  return (
    <div className="max-w-lg mx-auto animate-bounce-in">
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 inline-block">🏡</span>
        <h2 className="text-2xl font-extrabold text-[var(--foreground)] mb-1">
          Describe your garden
        </h2>
        <p className="text-gray-500 font-medium">
          Tell us about your growing space!
        </p>
      </div>

      {/* Garden type toggle */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setGardenType("inground")}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all border-2 ${
            gardenType === "inground"
              ? "bg-[var(--duo-green)] text-white border-[var(--duo-green-dark)] border-b-4"
              : "bg-white text-gray-500 border-[#e5e5e5] hover:border-gray-300"
          }`}
        >
          🌿 In-Ground Bed
        </button>
        <button
          onClick={() => setGardenType("container")}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all border-2 ${
            gardenType === "container"
              ? "bg-[var(--duo-green)] text-white border-[var(--duo-green-dark)] border-b-4"
              : "bg-white text-gray-500 border-[#e5e5e5] hover:border-gray-300"
          }`}
        >
          🪴 Containers / Pots
        </button>
      </div>

      {gardenType === "inground" ? (
        <div className="space-y-4">
          <div className="card-duo">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Width (feet)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={widthFeet}
                  onChange={(e) => setWidthFeet(e.target.value)}
                  className="input-duo"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Length (feet)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={lengthFeet}
                  onChange={(e) => setLengthFeet(e.target.value)}
                  className="input-duo"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "var(--duo-green-light)" }}>
            <span className="text-2xl">💡</span>
            <p className="text-sm font-bold" style={{ color: "var(--duo-green-dark)" }}>
              A 4x8 foot raised bed is a great size for beginners!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {containers.map((container, index) => (
            <div key={index} className="card-duo">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[var(--foreground)]">
                  🪴 Container {index + 1}
                </span>
                {containers.length > 1 && (
                  <button
                    onClick={() => removeContainer(index)}
                    className="text-[var(--duo-red)] text-sm font-bold hover:opacity-70 transition-opacity"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Width (in)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="120"
                    value={container.widthInches}
                    onChange={(e) =>
                      updateContainer(index, "widthInches", e.target.value)
                    }
                    className="input-duo text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Length (in)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="120"
                    value={container.lengthInches}
                    onChange={(e) =>
                      updateContainer(index, "lengthInches", e.target.value)
                    }
                    className="input-duo text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Depth (in)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="36"
                    value={container.depthInches}
                    onChange={(e) =>
                      updateContainer(index, "depthInches", e.target.value)
                    }
                    className="input-duo text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addContainer}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-bold hover:border-[var(--duo-green)] hover:text-[var(--duo-green)] transition-colors"
          >
            + Add another container
          </button>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="btn-duo btn-duo-white">
          Back
        </button>
        <button onClick={handleSubmit} className="btn-duo btn-duo-green flex-1 text-lg">
          Continue
        </button>
      </div>
    </div>
  );
}
