import React, { useMemo, useState } from 'react';
import {
  Award,
  BarChart2,
  Calendar,
  ChevronDown,
  Dumbbell,
  Flame,
  Plus,
  Scale,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import {
  calculateEstimated1RM,
  calculateMovingAverage,
  calculateProgressPercentage,
} from '../../utils/calculations';

type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

export const ProgressView: React.FC = () => {
  const {
    workouts,
    exercises,
    bodyWeights,
    bodyMeasurements,
    userProfile,
    addBodyWeight,
    deleteBodyWeight,
    addBodyMeasurement,
    deleteBodyMeasurement,
  } = useWorkout();

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex-chest-bench-press');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);

  const [newWeightVal, setNewWeightVal] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWeightNotes, setNewWeightNotes] = useState('');

  const [measChest, setMeasChest] = useState('');
  const [measWaist, setMeasWaist] = useState('');
  const [measArms, setMeasArms] = useState('');
  const [measThighs, setMeasThighs] = useState('');

  const exerciseMap = useMemo(() => {
    return new Map(exercises.map((e) => [e.id, e]));
  }, [exercises]);

  const filteredWorkouts = useMemo(() => {
    const now = new Date().getTime();
    const daysMap: Record<TimeRange, number> = {
      '7d': 7,
      '30d': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
      all: 9999,
    };
    const maxAgeMs = daysMap[timeRange] * 24 * 60 * 60 * 1000;

    return workouts
      .filter((w) => w.isCompleted)
      .filter((w) => now - new Date(w.date).getTime() <= maxAgeMs)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, timeRange]);

  const muscleDistribution = useMemo(() => {
    const stats: Record<string, { sets: number; volume: number }> = {
      Chest: { sets: 0, volume: 0 },
      Back: { sets: 0, volume: 0 },
      Shoulders: { sets: 0, volume: 0 },
      Quads: { sets: 0, volume: 0 },
      Hamstrings: { sets: 0, volume: 0 },
      Biceps: { sets: 0, volume: 0 },
      Triceps: { sets: 0, volume: 0 },
      Core: { sets: 0, volume: 0 },
    };

    filteredWorkouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        const def = exerciseMap.get(ex.exerciseId);
        const muscle = def?.primaryMuscle || 'Other';
        const targetCategory =
          muscle === 'Quads' || muscle === 'Hamstrings' || muscle === 'Glutes' || muscle === 'Calves'
            ? 'Legs'
            : muscle;

        if (!stats[targetCategory]) {
          stats[targetCategory] = { sets: 0, volume: 0 };
        }

        const completed = ex.sets.filter((s) => s.isCompleted);
        stats[targetCategory].sets += completed.length;
        stats[targetCategory].volume += completed.reduce((sum, s) => sum + s.weight * s.reps, 0);
      });
    });

    const totalSets = Object.values(stats).reduce((sum, s) => sum + s.sets, 0) || 1;

    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        sets: data.sets,
        volume: data.volume,
        percentage: Math.round((data.sets / totalSets) * 100),
      }))
      .filter((m) => m.sets > 0)
      .sort((a, b) => b.sets - a.sets);
  }, [filteredWorkouts, exerciseMap]);

  const exercise1RMData = useMemo(() => {
    const points: { date: string; maxWeight: number; estimated1RM: number; workoutName: string }[] = [];

    filteredWorkouts.forEach((w) => {
      const found = w.exercises.find((e) => e.exerciseId === selectedExerciseId);
      if (found) {
        const completed = found.sets.filter((s) => s.isCompleted && s.weight > 0 && s.reps > 0);
        if (completed.length > 0) {
          const maxW = completed.reduce((m, s) => Math.max(m, s.weight), 0);
          const max1RM = completed.reduce(
            (m, s) => Math.max(m, calculateEstimated1RM(s.weight, s.reps, userProfile.rmFormula)),
            0
          );
          points.push({
            date: w.date,
            maxWeight: maxW,
            estimated1RM: max1RM,
            workoutName: w.name,
          });
        }
      }
    });

    return points;
  }, [filteredWorkouts, selectedExerciseId, userProfile.rmFormula]);

  const monthlyComparisons = useMemo(() => {
    const monthsMap = new Map<
      string,
      { totalVolume: number; totalWorkouts: number; totalSets: number }
    >();

    workouts
      .filter((w) => w.isCompleted)
      .forEach((w) => {
        const monthKey = w.date.substring(0, 7);
        const curr = monthsMap.get(monthKey) || { totalVolume: 0, totalWorkouts: 0, totalSets: 0 };
        curr.totalVolume += w.volumeTotal;
        curr.totalWorkouts += 1;
        curr.totalSets += w.totalSets;
        monthsMap.set(monthKey, curr);
      });

    const sortedMonths = Array.from(monthsMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    return sortedMonths.map(([monthKey, data], idx) => {
      const prev = idx > 0 ? sortedMonths[idx - 1][1] : null;
      const volChange = prev ? calculateProgressPercentage(data.totalVolume, prev.totalVolume) : 0;

      const dateObj = new Date(`${monthKey}-01T00:00:00`);
      const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      return {
        monthKey,
        monthLabel,
        totalVolume: data.totalVolume,
        totalWorkouts: data.totalWorkouts,
        totalSets: data.totalSets,
        volChange,
      };
    });
  }, [workouts]);

  const weightTrend = useMemo(() => {
    return calculateMovingAverage(bodyWeights, 7);
  }, [bodyWeights]);

  const allPRs = useMemo(() => {
    return workouts
      .filter((w) => w.isCompleted)
      .flatMap((w) => w.prsAchieved)
      .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());
  }, [workouts]);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeightVal);
    if (!isNaN(val) && val > 0) {
      addBodyWeight(val, newWeightNotes, newWeightDate);
      setNewWeightVal('');
      setNewWeightNotes('');
      setShowWeightModal(false);
    }
  };

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    addBodyMeasurement({
      date: new Date().toISOString().split('T')[0],
      chestCm: parseFloat(measChest) || undefined,
      waistCm: parseFloat(measWaist) || undefined,
      armsCm: parseFloat(measArms) || undefined,
      thighsCm: parseFloat(measThighs) || undefined,
    });
    setMeasChest('');
    setMeasWaist('');
    setMeasArms('');
    setMeasThighs('');
    setShowMeasurementModal(false);
  };

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3 transition-colors">
      {/* View Title & Time Range Filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-main font-display">Analytics &amp; Progress</h1>
      </div>

      {/* Time Range Pills */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-subtle rounded-2xl overflow-x-auto no-scrollbar shadow-sm">
        {(['7d', '30d', '3m', '6m', '1y', 'all'] as TimeRange[]).map((r) => (
          <button
            key={r}
            onClick={() => setTimeRange(r)}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-xl uppercase transition-all ${
              timeRange === r
                ? 'bg-surface-subtle text-main font-bold shadow-sm'
                : 'text-muted hover:text-main'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Monthly Progress Table & Overload Intelligence */}
      <div className="bg-surface border border-subtle rounded-3xl p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-main uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-main" />
            <span>Monthly Progression</span>
          </div>
          <span className="text-[11px] text-muted">Overload Engine</span>
        </div>

        {monthlyComparisons.length === 0 ? (
          <div className="text-xs text-muted py-4 text-center">No workout data for monthly comparison.</div>
        ) : (
          <div className="space-y-2">
            {monthlyComparisons.map((m) => (
              <div
                key={m.monthKey}
                className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-main">{m.monthLabel}</div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {m.totalWorkouts} Workouts · {m.totalSets} Sets
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold font-mono-numbers text-main">
                    {m.totalVolume.toLocaleString()} {userProfile.unitPreference}
                  </div>
                  {m.volChange !== 0 && (
                    <div
                      className={`text-[10px] font-bold font-mono-numbers mt-0.5 ${
                        m.volChange > 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {m.volChange > 0 ? `+${m.volChange}%` : `${m.volChange}%`} vs prev
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1RM Strength Progression Chart */}
      <div className="bg-surface border border-subtle rounded-3xl p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-main uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Estimated 1RM Progression</span>
          </div>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-surface-subtle border border-subtle rounded-lg px-2 py-1 text-xs text-main focus:outline-none max-w-[140px] truncate"
          >
            {exercises.slice(0, 10).map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        {exercise1RMData.length < 2 ? (
          <div className="py-8 text-center text-muted text-xs">
            Log at least 2 sessions with {exerciseMap.get(selectedExerciseId)?.name || 'this exercise'} to plot 1RM curve.
          </div>
        ) : (
          <div>
            <div className="h-36 w-full pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100">
                <line x1="0" y1="20" x2="320" y2="20" stroke="currentColor" className="text-muted/20" strokeDasharray="3 3" />
                <line x1="0" y1="55" x2="320" y2="55" stroke="currentColor" className="text-muted/20" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="320" y2="90" stroke="currentColor" className="text-muted/40" />

                {(() => {
                  const points = exercise1RMData;
                  const minVal = Math.min(...points.map((p) => p.estimated1RM)) * 0.9;
                  const maxVal = Math.max(...points.map((p) => p.estimated1RM)) * 1.1;
                  const range = Math.max(1, maxVal - minVal);

                  const coords = points.map((p, i) => {
                    const x = (i / Math.max(1, points.length - 1)) * 300 + 10;
                    const y = 88 - ((p.estimated1RM - minVal) / range) * 70;
                    return { x, y, val: p.estimated1RM, date: p.date };
                  });

                  const pathStr = coords.reduce(
                    (acc, c, idx) => (idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`),
                    ''
                  );

                  return (
                    <>
                      <path
                        d={pathStr}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {coords.map((c, i) => (
                        <g key={i}>
                          <circle cx={c.x} cy={c.y} r="4" className="fill-surface" stroke="var(--accent)" strokeWidth="2" />
                          <text
                            x={c.x}
                            y={c.y - 7}
                            textAnchor="middle"
                            className="fill-current text-main"
                            fontSize="9"
                            fontFamily="JetBrains Mono"
                          >
                            {c.val}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted mt-2 px-2 font-mono-numbers">
              <span>{exercise1RMData[0].date}</span>
              <span>{exercise1RMData[exercise1RMData.length - 1].date}</span>
            </div>
          </div>
        )}
      </div>

      {/* Muscle Group Volume Breakdown */}
      <div className="bg-surface border border-subtle rounded-3xl p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Muscle Volume Distribution
          </span>
          <span className="text-xs text-muted">Total Sets</span>
        </div>

        <div className="space-y-3">
          {muscleDistribution.length === 0 ? (
            <div className="text-xs text-muted py-4 text-center">No volume logged in this timeframe.</div>
          ) : (
            muscleDistribution.map((m) => (
              <div key={m.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-main">{m.name}</span>
                  <span className="text-muted font-mono-numbers">
                    {m.sets} sets · {m.volume.toLocaleString()} {userProfile.unitPreference} ({m.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-surface-subtle rounded-full h-2 overflow-hidden border border-subtle">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${m.percentage}%`,
                      backgroundColor: 'var(--accent)',
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Body Weight Tracker */}
      <div className="bg-surface border border-subtle rounded-3xl p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-main uppercase tracking-wider">
            <Scale className="w-4 h-4 text-emerald-500" />
            <span>Body Weight ({userProfile.unitPreference})</span>
          </div>
          <button
            onClick={() => setShowWeightModal(true)}
            className="text-xs font-bold text-main hover:opacity-80 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Log Weight
          </button>
        </div>

        {bodyWeights.length === 0 ? (
          <div className="text-xs text-muted py-4 text-center">No body weights logged yet.</div>
        ) : (
          <div className="space-y-3">
            {/* Weight Chart (SVG) */}
            <div className="h-28 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                {(() => {
                  const points = weightTrend;
                  if (points.length < 2) return null;
                  const minW = Math.min(...points.map((p) => p.weightKg)) * 0.98;
                  const maxW = Math.max(...points.map((p) => p.weightKg)) * 1.02;
                  const range = Math.max(0.5, maxW - minW);

                  const coords = points.map((p, i) => {
                    const x = (i / (points.length - 1)) * 280 + 10;
                    const y = 70 - ((p.weightKg - minW) / range) * 55;
                    return { x, y, weight: p.weightKg };
                  });

                  const pathStr = coords.reduce(
                    (acc, c, idx) => (idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`),
                    ''
                  );

                  return (
                    <>
                      <path
                        d={pathStr}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {coords.map((c, i) => (
                        <circle
                          key={i}
                          cx={c.x}
                          cy={c.y}
                          r="3"
                          className="fill-surface"
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Recent logs */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
              {[...bodyWeights]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 4)
                .map((bw) => (
                  <div
                    key={bw.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface-subtle border border-subtle text-xs"
                  >
                    <span className="font-mono-numbers text-muted">{bw.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-main font-mono-numbers">
                        {bw.weightKg} {userProfile.unitPreference}
                      </span>
                      <button
                        onClick={() => deleteBodyWeight(bw.id)}
                        className="text-muted hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Body Measurements Tracker */}
      <div className="bg-surface border border-subtle rounded-3xl p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Body Measurements (cm)
          </span>
          <button
            onClick={() => setShowMeasurementModal(true)}
            className="text-xs font-bold text-main hover:opacity-80 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Log
          </button>
        </div>

        {bodyMeasurements.length === 0 ? (
          <div className="text-xs text-muted py-4 text-center">No measurements recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {[...bodyMeasurements]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)
              .map((bm) => (
                <div
                  key={bm.id}
                  className="p-3 rounded-2xl bg-surface-subtle border border-subtle text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-muted font-mono-numbers text-[11px]">
                    <span>{bm.date}</span>
                    <button
                      onClick={() => deleteBodyMeasurement(bm.id)}
                      className="text-muted hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-1 font-mono-numbers text-center">
                    <div className="p-1.5 rounded-lg bg-surface border border-subtle">
                      <div className="text-[9px] text-muted">Chest</div>
                      <div className="font-bold text-main">{bm.chestCm || '--'}</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-surface border border-subtle">
                      <div className="text-[9px] text-muted">Waist</div>
                      <div className="font-bold text-main">{bm.waistCm || '--'}</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-surface border border-subtle">
                      <div className="text-[9px] text-muted">Arms</div>
                      <div className="font-bold text-main">{bm.armsCm || '--'}</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-surface border border-subtle">
                      <div className="text-[9px] text-muted">Thighs</div>
                      <div className="font-bold text-main">{bm.thighsCm || '--'}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Personal Records Trophy Gallery */}
      <div className="bg-surface border border-subtle rounded-3xl p-4 shadow-sm transition-colors">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">
          <Award className="w-4 h-4 fill-current" />
          <span>All Personal Records ({allPRs.length})</span>
        </div>

        {allPRs.length === 0 ? (
          <div className="text-xs text-muted py-4 text-center">No PRs recorded yet. Go crush a workout!</div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {allPRs.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs"
              >
                <div>
                  <div className="font-bold text-main">{pr.exerciseName}</div>
                  <div className="text-[10px] text-muted font-mono-numbers">
                    {pr.type === '1rm' ? 'Estimated 1RM' : 'Max Weight'} · {pr.achievedAt}
                  </div>
                </div>
                <div className="font-extrabold font-mono-numbers text-amber-500 text-sm">
                  {pr.value} {pr.unit}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Body Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface border border-subtle rounded-3xl w-full max-w-sm shadow-2xl p-5 overflow-hidden text-main">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="font-bold text-base text-main font-display">Log Body Weight</h3>
              <button onClick={() => setShowWeightModal(false)} className="p-1 text-muted hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Weight ({userProfile.unitPreference}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  autoFocus
                  value={newWeightVal}
                  onChange={(e) => setNewWeightVal(e.target.value)}
                  placeholder="e.g. 78.5"
                  className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-sm text-main font-mono-numbers focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Date</label>
                <input
                  type="date"
                  value={newWeightDate}
                  onChange={(e) => setNewWeightDate(e.target.value)}
                  className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={newWeightNotes}
                  onChange={(e) => setNewWeightNotes(e.target.value)}
                  placeholder="Morning weigh-in, post fasted"
                  className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs font-semibold text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                >
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Measurements Modal */}
      {showMeasurementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface border border-subtle rounded-3xl w-full max-w-sm shadow-2xl p-5 overflow-hidden text-main">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="font-bold text-base text-main font-display">Log Measurements</h3>
              <button
                onClick={() => setShowMeasurementModal(false)}
                className="p-1 text-muted hover:text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeasurement} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measChest}
                    onChange={(e) => setMeasChest(e.target.value)}
                    placeholder="104.5"
                    className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main font-mono-numbers focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measWaist}
                    onChange={(e) => setMeasWaist(e.target.value)}
                    placeholder="81.0"
                    className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main font-mono-numbers focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measArms}
                    onChange={(e) => setMeasArms(e.target.value)}
                    placeholder="38.5"
                    className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main font-mono-numbers focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Thighs (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measThighs}
                    onChange={(e) => setMeasThighs(e.target.value)}
                    placeholder="61.0"
                    className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main font-mono-numbers focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowMeasurementModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs font-semibold text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
