import React, { useMemo, useState } from 'react';
import {
  Award,
  ChevronRight,
  Dumbbell,
  Filter,
  Plus,
  Search,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { Equipment, Exercise, MuscleGroup } from '../../types';
import { calculateEstimated1RM, formatDuration } from '../../utils/calculations';
import { CustomExerciseModal } from '../CustomExerciseModal';

type ExerciseCategory = 'All' | 'Custom' | MuscleGroup;

const CATEGORIES: ExerciseCategory[] = [
  'All',
  'Custom',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
];

const EQUIPMENTS: (Equipment | 'All')[] = [
  'All',
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Smith Machine',
];

export const ExercisesView: React.FC = () => {
  const { exercises, toggleFavoriteExercise, getPreviousPerformance, workouts, userProfile } =
    useWorkout();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'All'>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<Exercise | null>(null);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (onlyFavorites && !ex.isFavorite) return false;
      if (selectedCategory === 'Custom' && !ex.isCustom) return false;
      if (selectedCategory !== 'All' && selectedCategory !== 'Custom' && ex.category !== selectedCategory) return false;
      if (selectedEquipment !== 'All' && ex.equipment !== selectedEquipment) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          ex.name.toLowerCase().includes(q) ||
          ex.primaryMuscle.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [exercises, search, selectedCategory, selectedEquipment, onlyFavorites]);

  // Exercise Detail History
  const exerciseDetailStats = useMemo(() => {
    if (!selectedExerciseForDetail) return null;
    const exId = selectedExerciseForDetail.id;

    const sessionsWithExercise: {
      date: string;
      workoutName: string;
      workoutId: string;
      sets: { weight: number; reps: number; rpe?: number }[];
      maxWeight: number;
      max1RM: number;
      volume: number;
    }[] = [];

    workouts
      .filter((w) => w.isCompleted)
      .forEach((w) => {
        const found = w.exercises.find((e) => e.exerciseId === exId);
        if (found) {
          const completed = found.sets.filter((s) => s.isCompleted);
          if (completed.length > 0) {
            const maxW = completed.reduce((m, s) => Math.max(m, s.weight), 0);
            const max1 = completed.reduce(
              (m, s) =>
                Math.max(m, calculateEstimated1RM(s.weight, s.reps, userProfile.rmFormula)),
              0
            );
            const vol = completed.reduce((sum, s) => sum + s.weight * s.reps, 0);

            sessionsWithExercise.push({
              date: w.date,
              workoutName: w.name,
              workoutId: w.id,
              sets: completed.map((s) => ({ weight: s.weight, reps: s.reps, rpe: s.rpe })),
              maxWeight: maxW,
              max1RM: max1,
              volume: vol,
            });
          }
        }
      });

    sessionsWithExercise.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const lifetimeMaxWeight = sessionsWithExercise.reduce((m, s) => Math.max(m, s.maxWeight), 0);
    const lifetimeMax1RM = sessionsWithExercise.reduce((m, s) => Math.max(m, s.max1RM), 0);
    const lifetimeVolume = sessionsWithExercise.reduce((sum, s) => sum + s.volume, 0);

    return {
      sessions: sessionsWithExercise,
      lifetimeMaxWeight,
      lifetimeMax1RM,
      lifetimeVolume,
      totalSessions: sessionsWithExercise.length,
    };
  }, [selectedExerciseForDetail, workouts, userProfile.rmFormula]);

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-main font-display">Exercise Library</h1>
        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Custom
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by exercise, muscle, equipment..."
          className="w-full bg-surface border border-subtle rounded-xl pl-9 pr-4 py-2.5 text-xs text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-main shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters: Category and Equipment */}
      <div className="space-y-2">
        {/* Muscle group horizontal pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition-colors ${
              onlyFavorites
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                : 'bg-surface border border-subtle text-muted hover:text-main'
            }`}
          >
            <Star className="w-3 h-3 fill-current" /> Favorites
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'shadow-sm'
                  : 'bg-surface border border-subtle text-muted hover:text-main'
              }`}
              style={{
                backgroundColor: selectedCategory === cat ? 'var(--accent)' : undefined,
                color: selectedCategory === cat ? 'var(--accent-text)' : undefined,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Equipment dropdown */}
        <div className="flex items-center justify-between text-xs text-muted px-1">
          <span>Equipment:</span>
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value as Equipment | 'All')}
            className="bg-surface border border-subtle rounded-lg px-2.5 py-1 text-xs text-main focus:outline-none"
          >
            {EQUIPMENTS.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">
          {filteredExercises.length} Exercises Available
        </div>

        {filteredExercises.length === 0 ? (
          <div className="py-12 text-center text-muted text-xs space-y-3">
            <p>No exercises match your search criteria.</p>
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5 active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Custom Exercise</span>
            </button>
          </div>
        ) : (
          filteredExercises.map((ex) => {
            const prev = getPreviousPerformance(ex.id);

            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExerciseForDetail(ex)}
                className="bg-surface border border-subtle hover:border-strong rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-subtle"
                    style={{ backgroundColor: 'var(--accent-subtle)' }}
                  >
                    <Dumbbell className="w-5 h-5 text-main" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-main flex items-center gap-1.5">
                      <span>{ex.name}</span>
                      {ex.isCustom && (
                        <span className="text-[9px] bg-surface-subtle text-amber-500 border border-subtle px-1 py-0.5 rounded font-mono">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted flex items-center gap-1.5 mt-0.5 font-mono-numbers">
                      <span>{ex.primaryMuscle}</span>
                      <span>·</span>
                      <span>{ex.equipment}</span>
                      {prev && prev.bestWeight > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-secondary font-semibold">
                            PR: {prev.bestWeight} {userProfile.unitPreference}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteExercise(ex.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      ex.isFavorite ? 'text-amber-500' : 'text-muted hover:text-main'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${ex.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Exercise Detail Profile Modal */}
      {selectedExerciseForDetail && exerciseDetailStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-surface border border-subtle rounded-3xl w-full max-w-md shadow-2xl p-5 overflow-hidden flex flex-col max-h-[90vh] text-main">
            <div className="flex items-start justify-between pb-3 border-b border-subtle">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
                  Exercise Profile
                </span>
                <h2 className="text-base font-extrabold text-main font-display mt-0.5">
                  {selectedExerciseForDetail.name}
                </h2>
                <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                  <span>{selectedExerciseForDetail.primaryMuscle}</span>
                  <span>·</span>
                  <span>{selectedExerciseForDetail.equipment}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedExerciseForDetail(null)}
                className="p-1 text-muted hover:text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 py-3 flex-1">
              {/* Lifetime Stats Card */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-surface-subtle border border-subtle">
                  <div className="text-[10px] text-muted">Best Weight</div>
                  <div className="text-sm font-bold font-mono-numbers text-main mt-0.5">
                    {exerciseDetailStats.lifetimeMaxWeight}{' '}
                    <span className="text-[10px] text-muted">
                      {userProfile.unitPreference}
                    </span>
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-surface-subtle border border-subtle">
                  <div className="text-[10px] text-muted">Est. 1RM</div>
                  <div className="text-sm font-bold font-mono-numbers text-main mt-0.5">
                    {exerciseDetailStats.lifetimeMax1RM}{' '}
                    <span className="text-[10px] text-muted">
                      {userProfile.unitPreference}
                    </span>
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-surface-subtle border border-subtle">
                  <div className="text-[10px] text-muted">Total Sessions</div>
                  <div className="text-sm font-bold font-mono-numbers text-main mt-0.5">
                    {exerciseDetailStats.totalSessions}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle text-xs text-secondary leading-relaxed">
                <div className="font-bold text-main mb-1">Form &amp; Instructions</div>
                <p>{selectedExerciseForDetail.instructions}</p>
                {selectedExerciseForDetail.tips && (
                  <p className="mt-1.5 text-muted italic">
                    💡 Tip: {selectedExerciseForDetail.tips}
                  </p>
                )}
              </div>

              {/* Progression Curve Chart (SVG) */}
              {exerciseDetailStats.sessions.length >= 2 && (
                <div className="p-3.5 rounded-2xl bg-surface-subtle border border-subtle">
                  <div className="flex items-center justify-between text-xs font-bold text-main mb-2">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Progression History
                    </span>
                    <span className="text-[10px] font-normal text-muted">
                      Max weight per session
                    </span>
                  </div>

                  <div className="h-32 w-full pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" className="text-muted/30" strokeDasharray="3 3" />
                      <line x1="0" y1="60" x2="300" y2="60" stroke="currentColor" className="text-muted/30" strokeDasharray="3 3" />
                      <line x1="0" y1="95" x2="300" y2="95" stroke="currentColor" className="text-muted/50" />

                      {/* Render line */}
                      {(() => {
                        const points = exerciseDetailStats.sessions;
                        const minW = Math.min(...points.map((p) => p.maxWeight)) * 0.9;
                        const maxW = Math.max(...points.map((p) => p.maxWeight)) * 1.1;
                        const range = Math.max(1, maxW - minW);

                        const coords = points.map((p, i) => {
                          const x = (i / Math.max(1, points.length - 1)) * 280 + 10;
                          const y = 90 - ((p.maxWeight - minW) / range) * 75;
                          return { x, y, weight: p.maxWeight, date: p.date };
                        });

                        const pathData = coords.reduce(
                          (acc, curr, idx) =>
                            idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`,
                          ''
                        );

                        return (
                          <>
                            <path
                              d={pathData}
                              fill="none"
                              stroke="var(--accent)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {coords.map((c, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={c.x}
                                  cy={c.y}
                                  r="4"
                                  className="fill-surface"
                                  stroke="var(--accent)"
                                  strokeWidth="2"
                                />
                                <text
                                  x={c.x}
                                  y={c.y - 7}
                                  textAnchor="middle"
                                  className="fill-current text-main"
                                  fontSize="9"
                                  fontFamily="JetBrains Mono"
                                >
                                  {c.weight}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              )}

              {/* Historical Logs List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted uppercase tracking-wider">
                  Past Performance
                </div>
                {exerciseDetailStats.sessions.length === 0 ? (
                  <div className="text-xs text-muted py-3 text-center">
                    No recorded logs for this exercise yet.
                  </div>
                ) : (
                  [...exerciseDetailStats.sessions].reverse().map((session, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono-numbers text-[10px] text-muted">
                          {session.date} · {session.workoutName}
                        </div>
                        <div className="text-main font-mono-numbers mt-0.5">
                          {session.sets.map((s) => `${s.weight}×${s.reps}`).join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-main font-mono-numbers">
                          {session.maxWeight} {userProfile.unitPreference}
                        </div>
                        <div className="text-[10px] text-muted font-mono-numbers">
                          {session.volume.toLocaleString()} vol
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedExerciseForDetail(null)}
              className="mt-3 w-full py-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs font-bold text-main hover:bg-surface"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Custom Exercise Modal */}
      <CustomExerciseModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </div>
  );
};
