import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';

interface WeightScrollWheelProps {
  value: number;
  unit: string;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const WeightScrollWheel: React.FC<WeightScrollWheelProps> = ({
  value,
  unit,
  onChange,
  min = 0,
  max = 300,
  step = 0.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Each 1 unit = 20px of width
  const PIXELS_PER_UNIT = 16;
  const totalUnits = max - min;

  // Sync scroll position when external value changes
  useEffect(() => {
    if (isUserScrollingRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    const targetScroll = (value - min) * PIXELS_PER_UNIT;
    if (Math.abs(el.scrollLeft - targetScroll) > 4) {
      el.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [value, min]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    isUserScrollingRef.current = true;
    const currentScroll = el.scrollLeft;
    const rawVal = min + currentScroll / PIXELS_PER_UNIT;
    const steppedVal = Math.round(rawVal / step) * step;
    const clampedVal = Math.max(min, Math.min(max, Math.round(steppedVal * 10) / 10));

    if (clampedVal !== value) {
      onChange(clampedVal);
    }

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  }, [min, max, step, value, onChange]);

  const adjustBy = (delta: number) => {
    const newVal = Math.max(min, Math.min(max, Math.round((value + delta) * 10) / 10));
    onChange(newVal);
  };

  // Generate tick marks
  const tickMarks = [];
  const tickInterval = 2.5; // Mark every 2.5 kg/lb
  for (let w = min; w <= max; w += tickInterval) {
    const isMajor = w % 10 === 0;
    const isMid = w % 5 === 0 && !isMajor;
    tickMarks.push({
      weight: w,
      isMajor,
      isMid,
    });
  }

  return (
    <div className="w-full flex flex-col items-center select-none py-1">
      {/* Big Digital Readout */}
      <div className="flex items-baseline justify-center gap-1.5 mb-2">
        <span className="text-3xl sm:text-4xl font-black font-mono-numbers text-main tracking-tight">
          {value}
        </span>
        <span className="text-sm sm:text-base font-bold text-muted uppercase font-mono">
          {unit}
        </span>
      </div>

      {/* Tactile Scroll Ruler Container */}
      <div className="relative w-full max-w-sm h-16 bg-surface-subtle border border-subtle rounded-2xl overflow-hidden shadow-inner flex items-center">
        {/* Center Indicator Pin */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 z-10 pointer-events-none shadow-sm"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full -translate-x-1 -translate-y-0.5 shadow-sm"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        </div>

        {/* Scrollable Ruler Track */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-x-auto no-scrollbar flex items-end px-[50%] scroll-smooth cursor-ew-resize"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div
            className="relative h-full flex items-end"
            style={{ width: `${totalUnits * PIXELS_PER_UNIT}px` }}
          >
            {tickMarks.map((tick) => {
              const leftPos = (tick.weight - min) * PIXELS_PER_UNIT;
              return (
                <div
                  key={tick.weight}
                  className="absolute bottom-0 flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${leftPos}px` }}
                >
                  {tick.isMajor && (
                    <span className="text-[10px] font-mono-numbers text-muted font-bold mb-1">
                      {tick.weight}
                    </span>
                  )}
                  <div
                    className={`w-0.5 rounded-full transition-colors ${
                      tick.isMajor
                        ? 'h-6 bg-main'
                        : tick.isMid
                        ? 'h-4 bg-muted'
                        : 'h-2.5 bg-subtle'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Tap Steppers */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5 w-full max-w-sm">
        <button
          type="button"
          onClick={() => adjustBy(-5)}
          className="flex-1 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-bold text-main hover:bg-surface-subtle active:scale-95 transition-all"
        >
          -5
        </button>
        <button
          type="button"
          onClick={() => adjustBy(-2.5)}
          className="flex-1 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-bold text-main hover:bg-surface-subtle active:scale-95 transition-all"
        >
          -2.5
        </button>
        <button
          type="button"
          onClick={() => adjustBy(-1)}
          className="flex-1 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-bold text-main hover:bg-surface-subtle active:scale-95 transition-all"
        >
          -1
        </button>
        <button
          type="button"
          onClick={() => adjustBy(1)}
          className="flex-1 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-bold text-main hover:bg-surface-subtle active:scale-95 transition-all"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => adjustBy(2.5)}
          className="flex-1 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-bold text-main hover:bg-surface-subtle active:scale-95 transition-all"
        >
          +2.5
        </button>
        <button
          type="button"
          onClick={() => adjustBy(5)}
          className="flex-1 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-bold text-main hover:bg-surface-subtle active:scale-95 transition-all"
        >
          +5
        </button>
      </div>
    </div>
  );
};
