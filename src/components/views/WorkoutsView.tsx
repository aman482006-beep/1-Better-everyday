import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Dumbbell,
  Edit2,
  Filter,
  Layers,
  MoreVertical,
  Play,
  Plus,
  RotateCcw,
  Search,
  Share2,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { Routine, RoutineExercise, WorkoutSession } from '../../types';
import { formatDuration } from '../../utils/calculations';
import { AddExerciseModal } from '../AddExerciseModal';

interface WorkoutsViewProps {
  onStartEmpty: () => void;
}

type SubTab = 'routines' | 'programs' | 'history';

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({ onStartEmpty }) => {
  const {
    routines,
    programs,
    workouts,
    exercises,
    userProfile,
    startWorkoutFromRoutine,
    deleteWorkout,
    repeatWorkout,
    openShareModal,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    duplicateRoutine,
  } = useWorkout();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('routines');
  const [historySearch, setHistorySearch] = useState('');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  // Compare mode
  const [compareWorkoutIds, setCompareWorkoutIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Create / Edit Routine Modal
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState('');
  const [routineDesc, setRoutineDesc] = useState('');
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [isAddExerciseToRoutineOpen, setIsAddExerciseToRoutineOpen] = useState(false);

  const exerciseMap = useMemo(() => {
    return new Map(exercises.map((e) => [e.id, e]));
  }, [exercises]);

  // Filtered workout history
  const filteredHistory = useMemo(() => {
    return workouts
      .filter((w) => w.isCompleted)
      .filter((w) => {
        if (!historySearch.trim()) return true;
        const q = historySearch.toLowerCase();
        const matchName = w.name.toLowerCase().includes(q);
        const matchExercise = w.exercises.some((ex) => {
          const def = exerciseMap.get(ex.exerciseId);
          return def?.name.toLowerCase().includes(q) || def?.category.toLowerCase().includes(q);
        });
        return matchName || matchExercise;
      });
  }, [workouts, historySearch, exerciseMap]);

  const handleOpenEditRoutine = (routine: Routine) => {
    setEditingRoutineId(routine.id);
    setRoutineName(routine.name);
    setRoutineDesc(routine.description || '');
    setRoutineExercises([...routine.exercises]);
    setIsRoutineModalOpen(true);
  };

  const handleOpenCreateRoutine = () => {
    setEditingRoutineId(null);
    setRoutineName('');
    setRoutineDesc('');
    setRoutineExercises([]);
    setIsRoutineModalOpen(true);
  };

  const handleSaveRoutine = () => {
    if (!routineName.trim()) return;

    if (editingRoutineId) {
      updateRoutine(editingRoutineId, {
        name: routineName.trim(),
        description: routineDesc.trim(),
        exercises: routineExercises,
        estimatedDurationMinutes: Math.max(30, routineExercises.length * 12),
      });
    } else {
      addRoutine({
        name: routineName.trim(),
        description: routineDesc.trim(),
        category: 'Custom',
        estimatedDurationMinutes: Math.max(30, routineExercises.length * 12),
        exercises: routineExercises,
      });
    }

    setIsRoutineModalOpen(false);
  };

  const handleAddExercisesToRoutine = (ids: string[]) => {
    const newItems: RoutineExercise[] = ids.map((id) => ({
      exerciseId: id,
      targetSets: 3,
      targetReps: '8-12',
      targetRpe: 8,
      defaultRestSeconds: userProfile.defaultRestSeconds,
    }));
    setRoutineExercises([...routineExercises, ...newItems]);
  };

  const compareData = useMemo(() => {
    if (compareWorkoutIds.length !== 2) return null;
    const w1 = workouts.find((w) => w.id === compareWorkoutIds[0]);
    const w2 = workouts.find((w) => w.id === compareWorkoutIds[1]);
    if (!w1 || !w2) return null;

    const volDiff = w1.volumeTotal - w2.volumeTotal;
    const volPercent = w2.volumeTotal > 0 ? (volDiff / w2.volumeTotal) * 100 : 0;
    const durDiffMin = Math.round((w1.durationSeconds - w2.durationSeconds) / 60);

    return {
      workout1: w1,
      workout2: w2,
      volDiff,
      volPercent: Math.round(volPercent * 10) / 10,
      durDiffMin,
    };
  }, [compareWorkoutIds, workouts]);

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3 transition-colors">
      {/* Top Title & Sub-tabs */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-main font-display">Workouts</h1>
        <button
          onClick={onStartEmpty}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Empty
        </button>
      </div>

      {/* Segmented Control / Sub-tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-subtle rounded-2xl shadow-sm">
        <button
          onClick={() => setActiveSubTab('routines')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeSubTab === 'routines'
              ? 'bg-surface-subtle text-main font-bold shadow-sm'
              : 'text-muted hover:text-main'
          }`}
        >
          Routines ({routines.length})
        </button>
        <button
          onClick={() => setActiveSubTab('programs')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeSubTab === 'programs'
              ? 'bg-surface-subtle text-main font-bold shadow-sm'
              : 'text-muted hover:text-main'
          }`}
        >
          Programs
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeSubTab === 'history'
              ? 'bg-surface-subtle text-main font-bold shadow-sm'
              : 'text-muted hover:text-main'
          }`}
        >
          History ({filteredHistory.length})
        </button>
      </div>

      {/* SUBTAB 1: ROUTINES */}
      {activeSubTab === 'routines' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              Workout Templates
            </span>
            <button
              onClick={handleOpenCreateRoutine}
              className="text-xs font-bold text-main hover:opacity-80 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Routine
            </button>
          </div>

          <div className="space-y-3">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-surface border border-subtle rounded-3xl p-4 shadow-sm hover:border-strong transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-main">{routine.name}</h3>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">
                      {routine.description || `${routine.exercises.length} exercises`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateRoutine(routine.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface-subtle"
                      title="Duplicate Routine"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditRoutine(routine)}
                      className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface-subtle"
                      title="Edit Routine"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {routines.length > 1 && (
                      <button
                        onClick={() => deleteRoutine(routine.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10"
                        title="Delete Routine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Exercises Preview */}
                <div className="mt-3 space-y-1">
                  {routine.exercises.slice(0, 4).map((re, idx) => {
                    const def = exerciseMap.get(re.exerciseId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-secondary py-0.5"
                      >
                        <span className="truncate max-w-[200px]">{def?.name || 'Exercise'}</span>
                        <span className="text-muted font-mono-numbers">
                          {re.targetSets} sets × {re.targetReps}
                        </span>
                      </div>
                    );
                  })}
                  {routine.exercises.length > 4 && (
                    <div className="text-[11px] text-muted">
                      +{routine.exercises.length - 4} more exercises
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-subtle flex items-center justify-between">
                  <div className="text-xs text-muted flex items-center gap-1 font-mono-numbers">
                    <Clock className="w-3.5 h-3.5" /> ~{routine.estimatedDurationMinutes} mins
                  </div>
                  <button
                    onClick={() => startWorkoutFromRoutine(routine.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                  >
                    <Play className="w-3 h-3 fill-current" /> Start Routine
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: PROGRAMS */}
      {activeSubTab === 'programs' && (
        <div className="space-y-4">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Multi-Day Training Plans
          </div>

          {programs.map((program) => (
            <div
              key={program.id}
              className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-main">{program.name}</h3>
                  <div className="text-xs text-muted mt-0.5">
                    {program.daysPerWeek} Days Per Week
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-subtle border border-subtle text-main">
                  Active Plan
                </span>
              </div>

              <p className="text-xs text-secondary mt-2 leading-relaxed">{program.description}</p>

              {/* Program Schedule Day-by-Day */}
              <div className="mt-4 space-y-2">
                {program.schedule.map((day, idx) => {
                  const dayRoutine = routines.find((r) => r.id === day.routineId);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                        day.isRestDay
                          ? 'bg-surface-subtle border-subtle opacity-60 text-muted'
                          : 'bg-surface border-subtle text-main'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold w-20">{day.dayName}</span>
                        {day.isRestDay ? (
                          <span className="text-muted italic">Planned Rest &amp; Recovery</span>
                        ) : (
                          <span className="font-semibold text-main">
                            {dayRoutine?.name || 'Workout'}
                          </span>
                        )}
                      </div>

                      {!day.isRestDay && dayRoutine && (
                        <button
                          onClick={() => startWorkoutFromRoutine(dayRoutine.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors"
                          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                        >
                          Start
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-3">
          {/* History Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search past workouts by name or exercise..."
              className="w-full bg-surface border border-subtle rounded-xl pl-9 pr-4 py-2.5 text-xs text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-main"
            />
            {historySearch && (
              <button
                onClick={() => setHistorySearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Compare banner if workouts selected */}
          {compareWorkoutIds.length > 0 && (
            <div className="p-3 bg-surface-subtle border border-main rounded-2xl flex items-center justify-between text-xs">
              <span className="text-main font-semibold">
                {compareWorkoutIds.length} of 2 workouts selected to compare
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompareWorkoutIds([])}
                  className="text-muted hover:text-main"
                >
                  Clear
                </button>
                {compareWorkoutIds.length === 2 && (
                  <button
                    onClick={() => setShowCompareModal(true)}
                    className="px-2.5 py-1 rounded-lg font-bold text-xs shadow-sm"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                  >
                    Compare Now
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List of Historical Workouts */}
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-muted text-xs">
              No completed workouts found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((workout) => {
                const isExpanded = expandedWorkoutId === workout.id;
                const isSelectedForCompare = compareWorkoutIds.includes(workout.id);

                return (
                  <div
                    key={workout.id}
                    className={`bg-surface border rounded-3xl overflow-hidden transition-colors ${
                      isSelectedForCompare
                        ? 'border-main ring-1 ring-main'
                        : 'border-subtle'
                    }`}
                  >
                    {/* Workout Card Header */}
                    <div
                      onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                      className="p-4 cursor-pointer hover:bg-surface-subtle transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[11px] font-mono-numbers text-muted">
                            {workout.date}
                          </div>
                          <h3 className="text-base font-bold text-main mt-0.5">
                            {workout.name}
                          </h3>
                        </div>

                        {/* Top quick icons */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              if (isSelectedForCompare) {
                                setCompareWorkoutIds(compareWorkoutIds.filter((id) => id !== workout.id));
                              } else if (compareWorkoutIds.length < 2) {
                                const next = [...compareWorkoutIds, workout.id];
                                setCompareWorkoutIds(next);
                                if (next.length === 2) setShowCompareModal(true);
                              }
                            }}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              isSelectedForCompare
                                ? 'bg-surface-subtle text-main border border-main'
                                : 'text-muted hover:text-main hover:bg-surface-subtle'
                            }`}
                            title="Compare with another workout"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openShareModal(workout)}
                            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface-subtle"
                            title="Share workout"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => repeatWorkout(workout.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface-subtle"
                            title="Repeat workout"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteWorkout(workout.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10"
                            title="Delete workout"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Stats Bar */}
                      <div className="flex items-center gap-3 text-xs text-muted mt-2 font-mono-numbers">
                        <span>{formatDuration(workout.durationSeconds)}</span>
                        <span>·</span>
                        <span>
                          {workout.volumeTotal.toLocaleString()} {userProfile.unitPreference}
                        </span>
                        <span>·</span>
                        <span>{workout.exercises.length} Exercises</span>
                        <span>·</span>
                        <span>{workout.totalSets} Sets</span>
                      </div>

                      {/* PR tag if present */}
                      {workout.prsAchieved.length > 0 && (
                        <div className="mt-2 text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                          <span>🏆</span>
                          <span>
                            {workout.prsAchieved.length} PR
                            {workout.prsAchieved.length > 1 ? 's' : ''} (
                            {workout.prsAchieved.map((p) => p.exerciseName).join(', ')})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expandable Exercise Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-subtle bg-surface-subtle space-y-2">
                        <div className="text-[11px] font-bold text-muted uppercase tracking-wider pt-2">
                          Exercise Breakdown
                        </div>
                        {workout.exercises.map((ex) => {
                          const def = exerciseMap.get(ex.exerciseId);
                          return (
                            <div
                              key={ex.id}
                              className="p-2.5 rounded-xl bg-surface border border-subtle text-xs"
                            >
                              <div className="font-semibold text-main">
                                {def?.name || 'Exercise'}
                              </div>
                              <div className="mt-1 space-y-0.5">
                                {ex.sets.map((s) => (
                                  <div
                                    key={s.id}
                                    className="flex items-center justify-between text-muted font-mono-numbers text-[11px]"
                                  >
                                    <span>
                                      Set {s.setNumber}{' '}
                                      {s.type !== 'normal' ? `(${s.type})` : ''}
                                    </span>
                                    <span className="text-main font-semibold">
                                      {s.weight} {userProfile.unitPreference} × {s.reps} reps
                                      {s.rpe ? ` · RPE ${s.rpe}` : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Routine Creator / Editor Modal */}
      {isRoutineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface border border-subtle rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-main">
            <div className="p-4 border-b border-subtle flex items-center justify-between">
              <h2 className="text-base font-bold text-main font-display">
                {editingRoutineId ? 'Edit Routine' : 'Create Routine'}
              </h2>
              <button
                onClick={() => setIsRoutineModalOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Routine Name *
                </label>
                <input
                  type="text"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="e.g. Upper Body Power"
                  className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={routineDesc}
                  onChange={(e) => setRoutineDesc(e.target.value)}
                  placeholder="e.g. Heavy compound lifts followed by arm pump"
                  className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-secondary">Exercises</label>
                  <button
                    onClick={() => setIsAddExerciseToRoutineOpen(true)}
                    className="text-xs font-bold text-main flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {routineExercises.length === 0 ? (
                    <div className="p-4 text-center text-muted text-xs bg-surface-subtle rounded-xl border border-dashed border-subtle">
                      No exercises added to this routine yet.
                    </div>
                  ) : (
                    routineExercises.map((re, index) => {
                      const def = exerciseMap.get(re.exerciseId);
                      return (
                        <div
                          key={index}
                          className="p-2.5 rounded-xl bg-surface-subtle border border-subtle flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-main">
                              {def?.name || 'Exercise'}
                            </div>
                            <div className="text-[11px] text-muted mt-0.5 flex items-center gap-2">
                              <span>
                                {re.targetSets} sets × {re.targetReps} reps
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setRoutineExercises(routineExercises.filter((_, i) => i !== index))
                            }
                            className="p-1 rounded text-muted hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-subtle bg-surface flex items-center gap-3">
              <button
                onClick={() => setIsRoutineModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs font-semibold text-main"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoutine}
                disabled={!routineName.trim()}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-transform"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                Save Routine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Picker for Routine */}
      <AddExerciseModal
        isOpen={isAddExerciseToRoutineOpen}
        onClose={() => setIsAddExerciseToRoutineOpen(false)}
        onAddExercises={handleAddExercisesToRoutine}
        onOpenCreateCustom={() => {}}
      />

      {/* Workout Side-by-Side Comparison Modal */}
      {showCompareModal && compareData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-surface border border-subtle rounded-3xl w-full max-w-md shadow-2xl p-5 overflow-hidden text-main">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2 font-display font-bold text-base">
                <ArrowUpDown className="w-4 h-4 text-main" />
                <span>Workout Comparison</span>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1 text-muted hover:text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle">
                <div className="text-[10px] text-muted font-mono-numbers">
                  {compareData.workout1.date}
                </div>
                <div className="font-bold text-main mt-0.5 truncate">
                  {compareData.workout1.name}
                </div>
                <div className="mt-2 text-base font-extrabold font-mono-numbers text-main">
                  {compareData.workout1.volumeTotal.toLocaleString()} {userProfile.unitPreference}
                </div>
                <div className="text-[11px] text-muted">
                  {formatDuration(compareData.workout1.durationSeconds)} · {compareData.workout1.totalSets} sets
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle">
                <div className="text-[10px] text-muted font-mono-numbers">
                  {compareData.workout2.date}
                </div>
                <div className="font-bold text-main mt-0.5 truncate">
                  {compareData.workout2.name}
                </div>
                <div className="mt-2 text-base font-extrabold font-mono-numbers text-main">
                  {compareData.workout2.volumeTotal.toLocaleString()} {userProfile.unitPreference}
                </div>
                <div className="text-[11px] text-muted">
                  {formatDuration(compareData.workout2.durationSeconds)} · {compareData.workout2.totalSets} sets
                </div>
              </div>
            </div>

            {/* Calculated Progression Delta */}
            <div className="mt-4 p-3.5 rounded-2xl bg-surface-subtle border border-subtle space-y-2">
              <div className="text-xs font-bold text-muted uppercase tracking-wider">
                Progress Analysis
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">Volume Difference</span>
                <span
                  className={`font-mono-numbers font-bold ${
                    compareData.volDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {compareData.volDiff >= 0 ? '+' : ''}
                  {compareData.volDiff.toLocaleString()} {userProfile.unitPreference} ({compareData.volPercent}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">Duration Difference</span>
                <span className="font-mono-numbers text-main">
                  {compareData.durDiffMin >= 0 ? `+${compareData.durDiffMin} min` : `${compareData.durDiffMin} min`}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCompareModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs font-bold text-main hover:bg-surface"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
