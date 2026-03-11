"use client";

import { useState, useMemo } from "react";
import { cityZones, searchCities, ZoneData } from "@/data/zones";

interface Props {
  onComplete: (city: string, zoneData: ZoneData) => void;
  initialCity?: string | null;
}

export default function Step1Location({ onComplete, initialCity }: Props) {
  const [query, setQuery] = useState(initialCity || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity || null);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return searchCities(query).slice(0, 8);
  }, [query]);

  const handleSelect = (city: string) => {
    setSelectedCity(city);
    setQuery(city);
    setShowDropdown(false);
  };

  const zoneData = selectedCity ? cityZones[selectedCity] : null;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Where is your garden?</h2>
      <p className="text-gray-600 mb-6">
        Enter your city so we can determine your USDA hardiness zone and frost dates.
      </p>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedCity(null);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Start typing your city..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-lg"
        />

        {showDropdown && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {results.map((city) => (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                className="w-full text-left px-4 py-3 hover:bg-green-50 text-gray-800 border-b border-gray-100 last:border-b-0"
              >
                <span className="font-medium">{city}</span>
                <span className="text-sm text-gray-500 ml-2">
                  Zone {cityZones[city].zone}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {zoneData && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 text-lg">
            Zone {zoneData.zone}
          </h3>
          <div className="mt-2 text-sm text-green-700 space-y-1">
            <p>
              <span className="font-medium">Average last spring frost:</span>{" "}
              {formatFrostDate(zoneData.lastFrost)}
            </p>
            <p>
              <span className="font-medium">Average first fall frost:</span>{" "}
              {formatFrostDate(zoneData.firstFrost)}
            </p>
            <p className="text-green-600 mt-2">
              Your growing season is approximately{" "}
              {calculateGrowingDays(zoneData.lastFrost, zoneData.firstFrost)} days.
            </p>
          </div>
        </div>
      )}

      <button
        disabled={!zoneData}
        onClick={() => selectedCity && zoneData && onComplete(selectedCity, zoneData)}
        className="mt-6 w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Next: Garden Setup
      </button>

      <p className="mt-4 text-xs text-gray-400 text-center">
        Don&apos;t see your city? Pick the nearest major city to get approximate frost dates.
      </p>
    </div>
  );
}

function formatFrostDate(mmdd: string): string {
  const [month, day] = mmdd.split("-").map(Number);
  const date = new Date(2024, month - 1, day);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function calculateGrowingDays(lastFrost: string, firstFrost: string): number {
  const [lm, ld] = lastFrost.split("-").map(Number);
  const [fm, fd] = firstFrost.split("-").map(Number);
  const last = new Date(2024, lm - 1, ld);
  const first = new Date(2024, fm - 1, fd);
  return Math.round((first.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}
