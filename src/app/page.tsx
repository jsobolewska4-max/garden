"use client";

import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1Location from "@/components/Step1Location";
import Step2Garden from "@/components/Step2Garden";
import Step3Plants from "@/components/Step3Plants";
import ResultsPage from "@/components/ResultsPage";
import { PlantData } from "@/data/plants";
import { ZoneData } from "@/data/zones";
import { GardenConfig } from "@/lib/layout";

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [zoneData, setZoneData] = useState<ZoneData | null>(null);
  const [gardenConfig, setGardenConfig] = useState<GardenConfig | null>(null);
  const [selectedPlants, setSelectedPlants] = useState<PlantData[]>([]);

  const handleStep1Complete = (city: string, zone: ZoneData) => {
    setSelectedCity(city);
    setZoneData(zone);
    setStep(2);
  };

  const handleStep2Complete = (config: GardenConfig) => {
    setGardenConfig(config);
    setStep(3);
  };

  const handleStep3Complete = (plants: PlantData[]) => {
    setSelectedPlants(plants);
    setStep(4);
  };

  const handleStartOver = () => {
    setStep(1);
    setSelectedCity(null);
    setZoneData(null);
    setGardenConfig(null);
    setSelectedPlants([]);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="py-6 px-4 text-center">
        <div className="inline-flex items-center gap-3 mb-1">
          <span className="text-5xl sm:text-6xl animate-wiggle inline-block">&#127793;</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--duo-green-dark)" }}>
            Garden Planner
          </h1>
        </div>
        <p className="text-gray-500 mt-1 text-sm sm:text-base font-medium">
          Plan your dream garden in minutes!
        </p>
      </header>

      {/* Step indicator */}
      {step < 4 && (
        <div className="px-4">
          <StepIndicator currentStep={step} />
        </div>
      )}

      {/* Main content */}
      <main className="px-4 pb-12">
        {step === 1 && (
          <Step1Location
            onComplete={handleStep1Complete}
            initialCity={selectedCity}
          />
        )}
        {step === 2 && (
          <Step2Garden
            onComplete={handleStep2Complete}
            onBack={() => setStep(1)}
            initialConfig={gardenConfig}
          />
        )}
        {step === 3 && gardenConfig && (
          <Step3Plants
            onComplete={handleStep3Complete}
            onBack={() => setStep(2)}
            gardenConfig={gardenConfig}
            initialPlants={selectedPlants}
          />
        )}
        {step === 4 && selectedCity && zoneData && gardenConfig && (
          <ResultsPage
            city={selectedCity}
            zoneData={zoneData}
            gardenConfig={gardenConfig}
            selectedPlants={selectedPlants}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 font-medium">
        Garden Planner &middot; Dates are approximate &mdash; always check local conditions
      </footer>
    </div>
  );
}
