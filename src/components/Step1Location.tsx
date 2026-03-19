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
    <div className="max-w-lg mx-auto animate-bounce-in">
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 inline-block">🌍</span>
        <h2 className="text-2xl font-extrabold text-[var(--foreground)] mb-1">
          Where is your garden?
        </h2>
        <p className="text-gray-500 font-medium">
          We&apos;ll find your growing zone and frost dates!
        </p>
      </div>

      <div className="card-duo mb-4">
        <div className="relative">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Your City
          </label>
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
            className="input-duo"
          />

          {showDropdown && results.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-[#e5e5e5] rounded-2xl shadow-xl max-h-64 overflow-y-auto">
              {results.map((city) => (
                <button
                  key={city}
                  onClick={() => handleSelect(city)}
                  className="w-full text-left px-5 py-3.5 hover:bg-[var(--duo-green-light)] text-gray-700 border-b border-gray-100 last:border-b-0 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <span className="font-bold">{city}</span>
                  <span className="text-sm text-gray-400 ml-2 font-medium">
                    Zone {cityZones[city].zone}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {zoneData && (
        <div className="card-duo card-duo-selected animate-bounce-in mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h3 className="font-extrabold text-lg" style={{ color: "var(--duo-green-dark)" }}>
                Zone {zoneData.zone}
              </h3>
              <p className="text-sm font-medium text-gray-500">Perfect! Here are your frost dates:</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#e5e5e5]">
              <span className="text-lg">🌸</span>
              <div className="text-sm">
                <span className="text-gray-500 font-medium">Last spring frost:</span>{" "}
                <span className="font-bold text-[var(--foreground)]">{formatFrostDate(zoneData.lastFrost)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#e5e5e5]">
              <span className="text-lg">🍂</span>
              <div className="text-sm">
                <span className="text-gray-500 font-medium">First fall frost:</span>{" "}
                <span className="font-bold text-[var(--foreground)]">{formatFrostDate(zoneData.firstFrost)}</span>
              </div>
            </div>
            <div className="text-center pt-1">
              <span className="badge-duo" style={{ background: "var(--duo-green-light)", color: "var(--duo-green-dark)" }}>
                🌞 {calculateGrowingDays(zoneData.lastFrost, zoneData.firstFrost)} day growing season
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        disabled={!zoneData}
        onClick={() => selectedCity && zoneData && onComplete(selectedCity, zoneData)}
        className="btn-duo btn-duo-green w-full text-lg"
      >
        Continue
      </button>

      <p className="mt-4 text-xs text-gray-400 text-center font-medium">
        Don&apos;t see your city? Pick the nearest major city for approximate frost dates.
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
