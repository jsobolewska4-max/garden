"use client";

const steps = [
  { num: 1, label: "Location" },
  { num: 2, label: "Garden Setup" },
  { num: 3, label: "Plants" },
  { num: 4, label: "Your Plan" },
];

export default function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                currentStep >= step.num
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > step.num ? "✓" : step.num}
            </div>
            <span
              className={`text-xs mt-1 ${
                currentStep >= step.num ? "text-green-700 font-semibold" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-1 mx-1 mt-[-12px] rounded ${
                currentStep > step.num ? "bg-green-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
