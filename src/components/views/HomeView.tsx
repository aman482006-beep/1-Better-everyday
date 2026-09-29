import React, { useMemo } from 'react';
import {
  Award,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Layers,
  Play,
  Plus,
  RotateCcw,
  Scale,
  Share2,
  TrendingUp,
} from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { formatDuration } from '../../utils/calculations';

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
  onOpenAddWeightModal,
}) => {
  const {
    workouts,
    routines,
    bodyWeights,
    userProfile,
    startWorkoutFromRoutine,
    repeatWorkout,
    openShareModal,
  } = useWorkout();

  // Determine today's scheduled workout
  const todayDayIndex = new Date().getDay(); // 0=Sun, 1=Mon, etc.
  const todayRoutine = useMemo(() => {
    return routines.find((r) => r.daysOfWeek?.includes(todayDayIndex)) || routines[0];
  }, [routines, todayDayIndex]);

  // Recent completed workout
  const recentWorkout = useMemo(() => {
    return workouts.find((w) => w.isCompleted) || null;
  }, [workouts]);

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekWorkouts = workouts.filter(
      (w) => w.isCompleted && new Date(w.date) >= oneWeekAgo
    );
    const totalVolume = thisWeekWorkouts.reduce((sum, w) => sum + w.volumeTotal, 0);

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentPRsCount = workouts
      .filter((w) => w.isCompleted && new Date(w.date) >= thirtyDaysAgo)
      .reduce((sum, w) => sum + w.prsAchieved.length, 0);

    return {
      workoutsCount: thisWeekWorkouts.length,
      volume: totalVolume,
      streak: Math.min(thisWeekWorkouts.length, 5),
      prsCount: recentPRsCount,
    };
  }, [workouts]);

  // Recent PRs list
  const recentPRs = useMemo(() => {
    const allPrs = workouts
      .filter((w) => w.isCompleted)
      .flatMap((w) => w.prsAchieved);
    return allPrs.slice(0, 3);
  }, [workouts]);

  // Latest body weight
  const latestWeight = useMemo(() => {
    if (bodyWeights.length === 0) return null;
    const sorted = [...bodyWeights].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0];
  }, [bodyWeights]);

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3 transition-colors">
      {/* Welcome greeting */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            Daily Dashboard
          </div>
          <h1 className="text-xl font-extrabold text-main font-display">
            {userProfile.name}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-subtle text-xs font-bold text-main shadow-sm">
          <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
          <span>{weeklyStats.streak} day streak</span>
        </div>
      </div>

      {/* Today's Scheduled Routine Hero Card */}
      {todayRoutine && (
        <div className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-muted">
              Scheduled Workout
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted font-mono-numbers">
              <Clock className="w-3.5 h-3.5" /> ~{todayRoutine.estimatedDurationMinutes}m
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-main font-display leading-tight">
            {todayRoutine.name}
          </h2>
          <p className="text-xs text-secondary mt-1 line-clamp-1">
            {todayRoutine.description || `${todayRoutine.exercises.length} planned exercises`}
          </p>

          <div className="flex items-center gap-2 mt-3 text-[11px] text-muted">
            <span className="font-bold text-main font-mono-numbers">
              {todayRoutine.exercises.length} Exercises
            </span>
            <span>·</span>
            <span>Target RPE 8-9</span>
          </div>

          <div className="mt-4 pt-3 border-t border-subtle flex items-center justify-between gap-3">
            <button
              onClick={() => startWorkoutFromRoutine(todayRoutine.id)}
              className="flex-1 py-3 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Start Routine
            </button>
            <button
              onClick={onStartEmpty}
              className="px-4 py-3 rounded-2xl bg-surface-subtle hover:bg-surface text-xs font-bold text-main border border-subtle transition-colors"
            >
              Empty
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Hub */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onStartEmpty}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-subtle hover:bg-surface-subtle transition-all active:scale-95 text-center group shadow-sm"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 shadow-sm transition-transform group-hover:scale-105"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-main">
            Workout
          </span>
        </button>

        <button
          onClick={onNavigateToWorkouts}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-subtle hover:bg-surface-subtle transition-all active:scale-95 text-center group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-subtle text-main flex items-center justify-center mb-1 transition-transform group-hover:scale-105">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-main">
            Routines
          </span>
        </button>

        <button
          onClick={onOpenAddWeightModal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-subtle hover:bg-surface-subtle transition-all active:scale-95 text-center group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-subtle text-main flex items-center justify-center mb-1 transition-transform group-hover:scale-105">
            <Scale className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-main">
            Weight
          </span>
        </button>

        <button
          onClick={onNavigateToProgress}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-subtle hover:bg-surface-subtle transition-all active:scale-95 text-center group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-subtle text-main flex items-center justify-center mb-1 transition-transform group-hover:scale-105">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-main">
            Progress
          </span>
        </button>
      </div>

      {/* Weekly Progress Summary Grid */}
      <div className="bg-surface border border-subtle rounded-3xl p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Weekly Performance
          </span>
          <button
            onClick={onNavigateToProgress}
            className="text-xs font-semibold text-main hover:opacity-80 flex items-center gap-0.5"
          >
            Insights <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle">
            <div className="text-[10px] text-muted font-medium">Workouts</div>
            <div className="text-lg font-extrabold font-mono-numbers text-main mt-0.5">
              {weeklyStats.workoutsCount}
            </div>
            <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">This week</div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle">
            <div className="text-[10px] text-muted font-medium">Volume</div>
            <div className="text-lg font-extrabold font-mono-numbers text-main mt-0.5">
              {weeklyStats.volume > 0 ? (weeklyStats.volume / 1000).toFixed(1) + 'k' : '0'}
            </div>
            <div className="text-[10px] text-muted mt-0.5">{userProfile.unitPreference}</div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle">
            <div className="text-[10px] text-muted font-medium">Weight</div>
            <div className="text-lg font-extrabold font-mono-numbers text-main mt-0.5">
              {latestWeight ? latestWeight.weightKg : '--'}
            </div>
            <div className="text-[10px] text-muted mt-0.5">{userProfile.unitPreference}</div>
          </div>
        </div>
      </div>

      {/* Recent Workout Session */}
      {recentWorkout && (
        <div className="bg-surface border border-subtle rounded-3xl p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              Recent Workout
            </span>
            <span className="text-xs text-muted font-mono-numbers">
              {recentWorkout.date}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-main">{recentWorkout.name}</h3>
              <div className="text-xs text-muted flex items-center gap-2 mt-1 font-mono-numbers">
                <span>{formatDuration(recentWorkout.durationSeconds)}</span>
                <span>·</span>
                <span>
                  {recentWorkout.volumeTotal.toLocaleString()} {userProfile.unitPreference}
                </span>
                <span>·</span>
                <span>{recentWorkout.totalSets} sets</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openShareModal(recentWorkout)}
                className="p-2 rounded-xl bg-surface-subtle hover:bg-surface text-main border border-subtle transition-colors"
                title="Share workout card"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => repeatWorkout(recentWorkout.id)}
                className="px-3 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                title="Repeat this workout"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Repeat
              </button>
            </div>
          </div>

          {recentWorkout.prsAchieved.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-subtle flex items-center gap-2 text-xs font-medium text-amber-500">
              <Award className="w-4 h-4 fill-current shrink-0" />
              <span>
                PR:{' '}
                {recentWorkout.prsAchieved
                  .map((p) => `${p.exerciseName} (${p.value}${p.unit})`)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recent Personal Records Showcase */}
      {recentPRs.length > 0 && (
        <div className="bg-surface border border-subtle rounded-3xl p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider">
              <Award className="w-4 h-4 fill-current" />
              <span>Recent Records</span>
            </div>
            <button
              onClick={onNavigateToProgress}
              className="text-xs font-semibold text-muted hover:text-main"
            >
              All Records
            </button>
          </div>

          <div className="space-y-2">
            {recentPRs.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs"
              >
                <div>
                  <div className="text-xs font-bold text-main">{pr.exerciseName}</div>
                  <div className="text-[10px] text-muted mt-0.5 font-mono-numbers">
                    {pr.type === '1rm' ? 'Estimated 1RM' : 'Max Weight'} · {pr.achievedAt}
                  </div>
                </div>
                <div className="text-sm font-extrabold font-mono-numbers text-amber-500">
                  {pr.value} {pr.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
