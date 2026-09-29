import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface RepsPickerProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

const COMMON_REPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 25];

export const RepsPicker: React.FC<RepsPickerProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
}) => {
  const adjustBy = (delta: number) => {
    const newVal = Math.max(min, Math.min(max, value + delta));
    onChange(newVal);
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-1">
      {/* Big Digital Readout with Quick Steppers */}
      <div className="flex items-center justify-center gap-4 mb-2.5">
        <button
          type="button"
          onClick={() => adjustBy(-1)}
          className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-main active:scale-95 hover:bg-surface-subtle transition-all"
          aria-label="Decrease reps by 1"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="flex items-baseline gap-1.5 min-w-[100px] justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black font-mono-numbers text-main tracking-tight">
            {value}
          </span>
          <span className="text-sm sm:text-base font-bold text-muted uppercase font-mono">
            reps
          </span>
        </div>

        <button
          type="button"
          onClick={() => adjustBy(1)}
          className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-main active:scale-95 hover:bg-surface-subtle transition-all"
          aria-label="Increase reps by 1"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Touch-Friendly Numbers Grid */}
      <div className="w-full max-w-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
        {COMMON_REPS.map((rep) => {
          const isSelected = value === rep;
          return (
            <button
              key={rep}
              type="button"
              onClick={() => onChange(rep)}
              className={`h-10 min-w-[38px] px-2.5 rounded-xl font-mono-numbers text-sm font-bold flex items-center justify-center shrink-0 transition-transform active:scale-90 border ${
                isSelected
                  ? 'border-main shadow-sm'
                  : 'bg-surface border-subtle text-secondary hover:text-main hover:bg-surface-subtle'
              }`}
              style={{
                backgroundColor: isSelected ? 'var(--accent)' : undefined,
                color: isSelected ? 'var(--accent-text)' : undefined,
                borderColor: isSelected ? 'var(--accent)' : undefined,
              }}
            >
              {rep}
            </button>
          );
        })}
      </div>
    </div>
  );
};
