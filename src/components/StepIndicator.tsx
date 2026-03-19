"use client";

const steps = [
  { num: 1, label: "Location", emoji: "📍" },
  { num: 2, label: "Garden", emoji: "🏡" },
  { num: 3, label: "Plants", emoji: "🌱" },
  { num: 4, label: "Plan", emoji: "✨" },
];

export default function StepIndicator({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="max-w-lg mx-auto mb-8">
      {/* Progress bar */}
      <div className="progress-bar-duo mb-4">
        <div
          className="progress-bar-duo-fill"
          style={{ width: `${Math.max(8, progress)}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <div key={step.num} className="flex flex-col items-center gap-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                currentStep >= step.num
                  ? "bg-[var(--duo-green)] text-white shadow-md"
                  : "bg-[#e5e5e5] text-gray-400"
              } ${currentStep === step.num ? "ring-4 ring-[var(--duo-green-light)] scale-110" : ""}`}
              style={currentStep >= step.num ? { borderBottom: "3px solid var(--duo-green-dark)" } : {}}
            >
              {currentStep > step.num ? "✓" : step.emoji}
            </div>
            <span
              className={`text-xs font-bold ${
                currentStep >= step.num ? "text-[var(--duo-green-dark)]" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
