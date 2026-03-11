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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="py-6 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-green-800">
          <span className="text-4xl sm:text-5xl">&#127793;</span> Garden Planner
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Plan your vegetable garden in minutes
        </p>
      </header>

      {/* Step indicator */}
      <div className="px-4">
        <StepIndicator currentStep={step} />
      </div>

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
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        Garden Planner &middot; Dates are approximate &mdash; always check local conditions
      </footer>
    </div>
  );
}
