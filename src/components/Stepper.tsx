import React from 'react';
import { Check } from 'lucide-react';

export type StepNumber = 1 | 2 | 3;

interface StepperProps {
  currentStep: StepNumber;
  maxAccessibleStep: StepNumber;
  onSelectStep: (step: StepNumber) => void;
}

const STEPS = [
  { step: 1 as StepNumber, label: 'Chọn game', shortLabel: 'Game' },
  { step: 2 as StepNumber, label: 'Nạp game & Thanh toán', shortLabel: 'Nạp game' },
  { step: 3 as StepNumber, label: 'Kết quả giao dịch', shortLabel: 'Kết quả' },
];

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  maxAccessibleStep,
  onSelectStep,
}) => {
  return (
    <div className="w-full bg-[#18181b]/90 backdrop-blur-md border-b border-zinc-800/80 shadow-md">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between relative max-w-[800px] mx-auto">
          {/* Connector Line behind steps */}
          <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 bg-zinc-800 -z-0" />

          {/* Active progress track */}
          <div
            className="absolute left-6 top-4 -translate-y-1/2 h-0.5 bg-[#fb5503] transition-all duration-300 -z-0"
            style={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 92}%`,
            }}
          />

          {STEPS.map((item) => {
            const isCompleted = item.step < currentStep;
            const isCurrent = item.step === currentStep;
            const isClickable = item.step <= maxAccessibleStep;

            return (
              <div key={item.step} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (isClickable) {
                      onSelectStep(item.step);
                    }
                  }}
                  disabled={!isClickable}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold text-xs sm:text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fb5503] ${
                    isCurrent
                      ? 'bg-[#fb5503] text-white ring-4 ring-[#fb5503]/25 shadow-[0_0_16px_rgba(251,85,3,0.5)]'
                      : isCompleted
                      ? 'bg-zinc-800 text-[#fb5503] border border-[#fb5503]/60 hover:bg-zinc-700 cursor-pointer shadow-sm'
                      : isClickable
                      ? 'bg-[#121214] border-2 border-zinc-700 text-zinc-300 hover:border-[#fb5503] cursor-pointer'
                      : 'bg-[#121214] border-2 border-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                  title={`${item.label} ${isCompleted ? '(Đã hoàn thành)' : isCurrent ? '(Hiện tại)' : ''}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{item.step}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isClickable) {
                      onSelectStep(item.step);
                    }
                  }}
                  disabled={!isClickable}
                  className={`mt-2 text-xs sm:text-sm font-semibold transition-colors text-center ${
                    isCurrent
                      ? 'text-[#fb5503] font-bold'
                      : isCompleted
                      ? 'text-zinc-200 hover:text-[#fb5503] cursor-pointer'
                      : isClickable
                      ? 'text-zinc-400 hover:text-zinc-200 cursor-pointer'
                      : 'text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
