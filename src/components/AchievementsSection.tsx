import React, { useMemo, useState } from 'react';
import {
  Award,
  Calendar,
  ChevronRight,
  Dumbbell,
  Filter,
  Flame,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { PersonalRecord } from '../types';

interface AchievementsSectionProps {
  onOpenShareCard: (pr: PersonalRecord) => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ onOpenShareCard }) => {
  const { workouts, exercises, userProfile } = useWorkout();

  const [filterType, setFilterType] = useState<'all' | 'weight' | '1rm' | 'volume' | 'milestone'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all historical PRs
  const allAchievements = useMemo(() => {
    const list: PersonalRecord[] = [];
    workouts
      .filter((w) => w.isCompleted)
      .forEach((w) => {
        w.prsAchieved.forEach((pr) => {
          list.push(pr);
        });
      });

    // Sort by date descending
    return list.sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());
  }, [workouts]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return allAchievements.filter((pr) => {
      const matchesType = filterType === 'all' || pr.type === filterType;
      const matchesSearch =
        !searchQuery.trim() ||
        pr.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pr.milestoneTitle && pr.milestoneTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [allAchievements, filterType, searchQuery]);

  // Monthly Achievement Summary calculation from actual data
  const monthlySummary = useMemo(() => {
    const now = new Date();
    const currentMonthKey = now.toISOString().substring(0, 7); // e.g. "2026-09"
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const monthWorkouts = workouts.filter(
      (w) => w.isCompleted && w.date.startsWith(currentMonthKey)
    );

    const monthPRs = monthWorkouts.flatMap((w) => w.prsAchieved);
    const totalVolume = monthWorkouts.reduce((sum, w) => sum + w.volumeTotal, 0);
    const longestWorkoutSec = monthWorkouts.reduce((max, w) => Math.max(max, w.durationSeconds), 0);

    // Find strongest lifts this month
    const benchPressEx = exercises.find((e) => e.name.toLowerCase().includes('bench press'));
    const squatEx = exercises.find((e) => e.name.toLowerCase().includes('squat'));

    let strongestBench = 0;
    let strongestSquat = 0;

    monthWorkouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        const completedSets = ex.sets.filter((s) => s.isCompleted);
        const maxW = completedSets.reduce((m, s) => Math.max(m, s.weight), 0);
        if (benchPressEx && ex.exerciseId === benchPressEx.id) {
          strongestBench = Math.max(strongestBench, maxW);
        }
        if (squatEx && ex.exerciseId === squatEx.id) {
          strongestSquat = Math.max(strongestSquat, maxW);
        }
      });
    });

    return {
      monthName,
      workoutCount: monthWorkouts.length,
      prCount: monthPRs.length,
      totalVolume,
      longestDurationMin: Math.round(longestWorkoutSec / 60),
      strongestBench: strongestBench > 0 ? `${strongestBench} ${userProfile.unitPreference}` : undefined,
      strongestSquat: strongestSquat > 0 ? `${strongestSquat} ${userProfile.unitPreference}` : undefined,
    };
  }, [workouts, exercises, userProfile.unitPreference]);

  // Data-driven progress statements
  const progressInsights = useMemo(() => {
    const statements: string[] = [];

    if (monthlySummary.prCount > 0) {
      statements.push(`You achieved ${monthlySummary.prCount} personal record${monthlySummary.prCount > 1 ? 's' : ''} this month.`);
    }

    if (monthlySummary.workoutCount > 0) {
      statements.push(`You completed ${monthlySummary.workoutCount} training session${monthlySummary.workoutCount > 1 ? 's' : ''} in ${monthlySummary.monthName}.`);
    }

    if (monthlySummary.totalVolume > 0) {
      statements.push(`Total training volume reached ${monthlySummary.totalVolume.toLocaleString()} ${userProfile.unitPreference}.`);
    }

    if (monthlySummary.strongestBench) {
      statements.push(`Top bench press recorded at ${monthlySummary.strongestBench}.`);
    }

    if (statements.length === 0) {
      statements.push('Complete workouts to unlock personalized performance insights.');
    }

    return statements;
  }, [monthlySummary, userProfile.unitPreference]);

  return (
    <div className="space-y-4">
      {/* Monthly Achievement Banner */}
      <div className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Monthly Performance Summary ({monthlySummary.monthName})</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-subtle border border-subtle text-muted">
            Compound Progress
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle">
            <div className="text-[10px] text-muted font-medium">Workouts</div>
            <div className="text-xl font-black font-mono-numbers text-main mt-0.5">
              {monthlySummary.workoutCount}
            </div>
            <div className="text-[10px] text-muted">Completed</div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle">
            <div className="text-[10px] text-muted font-medium">PRs Broken</div>
            <div className="text-xl font-black font-mono-numbers text-emerald-500 mt-0.5">
              {monthlySummary.prCount}
            </div>
            <div className="text-[10px] text-muted">New Bests</div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle">
            <div className="text-[10px] text-muted font-medium">Monthly Volume</div>
            <div className="text-base font-black font-mono-numbers text-main mt-0.5 truncate">
              {monthlySummary.totalVolume.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted">{userProfile.unitPreference} Moved</div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle">
            <div className="text-[10px] text-muted font-medium">Longest Session</div>
            <div className="text-xl font-black font-mono-numbers text-main mt-0.5">
              {monthlySummary.longestDurationMin}m
            </div>
            <div className="text-[10px] text-muted">Duration</div>
          </div>
        </div>

        {/* Data-Driven Insights Pills */}
        <div className="p-3.5 rounded-2xl bg-surface-subtle border border-subtle space-y-1.5">
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-main" /> Training Insights
          </div>
          <div className="space-y-1">
            {progressInsights.map((insight, idx) => (
              <div key={idx} className="text-xs text-secondary flex items-start gap-1.5">
                <span className="text-main font-bold">·</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Milestones & PRs List */}
      <div className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
            <Award className="w-4 h-4 text-main" />
            <span>Milestones &amp; PR Records ({filteredAchievements.length})</span>
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-xl border border-subtle text-[11px] font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                filterType === 'all' ? 'bg-surface text-main shadow-xs' : 'text-muted hover:text-main'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('weight')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                filterType === 'weight' ? 'bg-surface text-main shadow-xs' : 'text-muted hover:text-main'
              }`}
            >
              Weight
            </button>
            <button
              onClick={() => setFilterType('1rm')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                filterType === '1rm' ? 'bg-surface text-main shadow-xs' : 'text-muted hover:text-main'
              }`}
            >
              1RM
            </button>
            <button
              onClick={() => setFilterType('milestone')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                filterType === 'milestone' ? 'bg-surface text-main shadow-xs' : 'text-muted hover:text-main'
              }`}
            >
              Milestones
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by exercise name (e.g. Bench, Squat)..."
            className="w-full bg-surface-subtle border border-subtle rounded-xl pl-8 pr-3 py-2 text-xs text-main placeholder-muted focus:outline-none"
          />
        </div>

        {/* PR List */}
        {filteredAchievements.length > 0 ? (
          <div className="space-y-2">
            {filteredAchievements.map((pr) => (
              <div
                key={pr.id}
                className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between gap-3 hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-subtle shadow-xs"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--accent-text)',
                    }}
                  >
                    {pr.type === 'milestone' ? <Award className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-main">{pr.exerciseName}</span>
                      <span className="text-[10px] uppercase font-bold font-mono px-1.5 py-0.2 rounded bg-surface border border-subtle text-muted">
                        {pr.type}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted mt-0.5 flex items-center gap-2">
                      <span>{pr.achievedAt}</span>
                      {pr.repsAtWeight && <span>· {pr.repsAtWeight} reps</span>}
                      {pr.improvement && (
                        <span className="text-emerald-500 font-bold font-mono-numbers">
                          +{pr.improvement} {pr.unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-display font-black text-sm sm:text-base text-main font-mono-numbers">
                      {pr.value} {pr.unit}
                    </div>
                    {pr.previousValue && (
                      <div className="text-[10px] text-muted font-mono-numbers">
                        prev: {pr.previousValue}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenShareCard(pr)}
                    className="p-2 rounded-xl bg-surface border border-subtle hover:bg-surface-elevated text-muted hover:text-main transition-colors shadow-xs"
                    title="Generate shareable achievement card"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted">
            <Trophy className="w-6 h-6 mx-auto mb-1 opacity-40" />
            <p className="font-semibold text-main">No milestones or PRs matched</p>
            <p className="text-[11px] text-muted mt-0.5">
              Complete workouts and progressively overload to automatically record personal records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
