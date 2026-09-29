import React from 'react';
import { Minus, Play, Plus, RotateCcw, Timer as TimerIcon, X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { formatTimerClock } from '../utils/calculations';

export const RestTimerOverlay: React.FC = () => {
  const { restTimer, stopRestTimer, addRestSeconds } = useWorkout();

  if (!restTimer.isActive) return null;

  const percentage = Math.max(
    0,
    Math.min(100, (restTimer.remainingSeconds / restTimer.totalSeconds) * 100)
  );

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-surface/95 text-main rounded-2xl border border-subtle shadow-2xl backdrop-blur-xl p-3.5 flex flex-col gap-2 transition-colors">
        {/* Progress bar line */}
        <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden border border-subtle">
          <div
            className="h-full transition-all duration-500 ease-linear rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: 'var(--accent)',
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-subtle"
              style={{ backgroundColor: 'var(--accent-subtle)' }}
            >
              <TimerIcon className="w-4 h-4 animate-pulse text-main" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Rest Timer {restTimer.exerciseName ? `· ${restTimer.exerciseName}` : ''}
              </div>
              <div className="text-xl font-bold font-mono-numbers text-main leading-tight">
                {formatTimerClock(restTimer.remainingSeconds)}
              </div>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addRestSeconds(-15)}
              className="px-2 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface active:scale-95 text-xs font-semibold text-main transition-colors flex items-center gap-0.5 border border-subtle"
              title="-15 seconds"
            >
              -15s
            </button>
            <button
              onClick={() => addRestSeconds(30)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface active:scale-95 text-xs font-semibold text-main transition-colors flex items-center gap-0.5 border border-subtle"
              title="+30 seconds"
            >
              <Plus className="w-3 h-3" /> 30s
            </button>
            <button
              onClick={stopRestTimer}
              className="p-1.5 rounded-lg bg-surface-subtle hover:bg-rose-500/10 hover:text-rose-500 active:scale-95 text-muted transition-colors border border-subtle"
              title="Skip Rest Timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
