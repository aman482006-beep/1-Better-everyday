import React, { useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Layers,
  Play,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { Routine } from '../../types';

interface HomeViewProps {
  onStartEmpty: () => void;
  onNavigateToWorkouts: () => void;
  onNavigateToExercises: () => void;
  onNavigateToProgress: () => void;
  onOpenAddWeightModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartEmpty,
  onNavigateToWorkouts,
  onNavigateToExercises,
  onNavigateToProgress,
}) => {
  const {
    workouts,
    routines,
    userProfile,
    startWorkoutFromRoutine,
  } = useWorkout();

  // Weekly progress calculation (aiming for 4 workouts / week default)
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    // Monday of current week
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const completedThisWeek = workouts.filter(
      (w) => w.isCompleted && new Date(w.date) >= monday
    ).length;

    const weeklyGoal = 4;
    const progressPercent = Math.min(100, Math.round((completedThisWeek / weeklyGoal) * 100));

    // Days of the week (M, T, W, T, F, S, S)
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const currentDayIdx = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6

    return {
      completedCount: completedThisWeek,
      weeklyGoal,
      progressPercent,
      dayNames,
      currentDayIdx,
    };
  }, [workouts]);

  // Simplify routine name for gym clarity (e.g. "Push" -> "Chest Day", "Pull" -> "Back Day")
  const getFriendlyRoutineName = (routine: Routine) => {
    const lower = (routine.name + ' ' + (routine.category || '')).toLowerCase();
    if (lower.includes('push') || lower.includes('chest')) return 'Chest Day';
    if (lower.includes('pull') || lower.includes('back')) return 'Back & Biceps';
    if (lower.includes('leg')) return 'Leg Day';
    if (lower.includes('shoulder')) return 'Shoulders & Arms';
    return routine.name;
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-4 pt-3 transition-colors">
      {/* Minimal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-main font-display tracking-tight">
            Choose Workout
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Select a routine to start logging sets
          </p>
        </div>

        <button
          onClick={onStartEmpty}
          className="px-3.5 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Empty</span>
        </button>
      </div>

      {/* Routine Cards Stack */}
      <div className="space-y-2.5">
        {routines.map((routine) => {
          const friendlyTitle = getFriendlyRoutineName(routine);

          return (
            <div
              key={routine.id}
              onClick={() => startWorkoutFromRoutine(routine.id)}
              className="group bg-surface hover:bg-surface-subtle border border-subtle hover:border-main rounded-3xl p-4 sm:p-5 shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between"
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-main font-display truncate group-hover:text-main">
                    {friendlyTitle}
                  </h2>
                  {friendlyTitle !== routine.name && (
                    <span className="text-[10px] text-muted font-bold font-mono">
                      ({routine.name})
                    </span>
                  )}
                </div>

                <div className="text-xs text-muted mt-1 flex items-center gap-2 font-mono-numbers">
                  <span>{routine.exercises.length} exercises</span>
                  <span>·</span>
                  <span>~{routine.estimatedDurationMinutes} min</span>
                </div>
              </div>

              {/* Start Button Circle */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          );
        })}

        {/* Custom Quick Workout Card */}
        <div
          onClick={onStartEmpty}
          className="border-2 border-dashed border-subtle hover:border-main bg-surface-subtle/40 rounded-3xl p-4 sm:p-5 shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between"
        >
          <div>
            <h2 className="text-base font-black text-main font-display">
              Custom / Free Workout
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Pick any exercises on the fly and log
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-surface border border-subtle flex items-center justify-center text-main">
            <Plus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Clean Minimal Progress Bar Card */}
      <div
        onClick={onNavigateToProgress}
        className="bg-surface border border-subtle rounded-3xl p-4 sm:p-5 shadow-sm transition-colors cursor-pointer hover:border-main"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">
              Weekly Progress
            </div>
            <div className="text-base font-black text-main mt-0.5 font-display">
              {weeklyProgress.completedCount} of {weeklyProgress.weeklyGoal} workouts
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-muted hover:text-main">
            <span>Details</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2.5 bg-surface-subtle border border-subtle rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${weeklyProgress.progressPercent}%`,
              backgroundColor: 'var(--accent)',
            }}
          />
        </div>

        {/* Day-of-week indicators */}
        <div className="grid grid-cols-7 gap-1 mt-3.5 text-center">
          {weeklyProgress.dayNames.map((dName, idx) => {
            const isToday = idx === weeklyProgress.currentDayIdx;
            return (
              <div
                key={idx}
                className={`py-1 rounded-xl text-[11px] font-mono font-bold transition-colors ${
                  isToday
                    ? 'border border-main text-main font-black'
                    : 'text-muted'
                }`}
              >
                {dName}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
