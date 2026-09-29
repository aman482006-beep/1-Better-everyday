import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Dumbbell,
  FileText,
  Flame,
  Layers,
  MoreVertical,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { Exercise, SetType, WorkoutSet } from '../types';
import { formatTimerClock } from '../utils/calculations';
import { AddExerciseModal } from './AddExerciseModal';
import { CustomExerciseModal } from './CustomExerciseModal';
import { WeightScrollWheel } from './WeightScrollWheel';
import { RepsPicker } from './RepsPicker';

interface ActiveWorkoutScreenProps {
  onMinimize: () => void;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({ onMinimize }) => {
  const {
    activeWorkout,
    exercises,
    userProfile,
    finishActiveWorkout,
    discardActiveWorkout,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    reorderExercisesInActiveWorkout,
    addSetToExercise,
    updateSet,
    removeSet,
    toggleSetCompleted,
    updateActiveWorkoutName,
    updateActiveWorkoutNotes,
    setExerciseSuperset,
    setExerciseNotes,
    getPreviousPerformance,
    startRestTimer,
  } = useWorkout();

  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isCreateCustomOpen, setIsCreateCustomOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [activeMenuExerciseId, setActiveMenuExerciseId] = useState<string | null>(null);

  // Active selected set for tactile controller
  const [selectedSetLocation, setSelectedSetLocation] = useState<{
    workoutExerciseId: string;
    setId: string;
  } | null>(null);

  const exerciseMap = useMemo(() => {
    const map = new Map<string, Exercise>();
    exercises.forEach((ex) => map.set(ex.id, ex));
    return map;
  }, [exercises]);

  // Auto-select first uncompleted set on load
  useEffect(() => {
    if (!activeWorkout || selectedSetLocation) return;
    for (const ex of activeWorkout.exercises) {
      const uncompleted = ex.sets.find((s) => !s.isCompleted);
      if (uncompleted) {
        setSelectedSetLocation({ workoutExerciseId: ex.id, setId: uncompleted.id });
        return;
      }
    }
    // If all completed or none, select first set
    if (activeWorkout.exercises.length > 0 && activeWorkout.exercises[0].sets.length > 0) {
      setSelectedSetLocation({
        workoutExerciseId: activeWorkout.exercises[0].id,
        setId: activeWorkout.exercises[0].sets[0].id,
      });
    }
  }, [activeWorkout, selectedSetLocation]);

  if (!activeWorkout) return null;

  // Find currently selected set details
  const activeWorkoutExercise = activeWorkout.exercises.find(
    (e) => e.id === selectedSetLocation?.workoutExerciseId
  );
  const activeSet = activeWorkoutExercise?.sets.find(
    (s) => s.id === selectedSetLocation?.setId
  );
  const activeExerciseDef = activeWorkoutExercise
    ? exerciseMap.get(activeWorkoutExercise.exerciseId)
    : undefined;

  const handleFinish = () => {
    finishActiveWorkout();
  };

  const handleConfirmDiscard = () => {
    discardActiveWorkout();
    setShowDiscardConfirm(false);
  };

  // Log Set action (Enter key or button)
  const handleLogCurrentSet = () => {
    if (!activeWorkoutExercise || !activeSet) return;

    // 1. Mark current set completed
    if (!activeSet.isCompleted) {
      toggleSetCompleted(activeWorkoutExercise.id, activeSet.id);
    }

    // 2. Start rest timer if enabled
    if (userProfile.autoStartRestTimer) {
      startRestTimer(
        activeWorkoutExercise.restTimeSeconds || userProfile.defaultRestSeconds,
        activeExerciseDef?.name
      );
    }

    // 3. Find next set or create next set with same weight/reps
    const currentIdx = activeWorkoutExercise.sets.findIndex((s) => s.id === activeSet.id);
    if (currentIdx < activeWorkoutExercise.sets.length - 1) {
      // Advance to next existing set
      const nextSet = activeWorkoutExercise.sets[currentIdx + 1];
      // Pre-fill weight and reps if next set is 0
      if (nextSet.weight === 0 && nextSet.reps === 0) {
        updateSet(activeWorkoutExercise.id, nextSet.id, {
          weight: activeSet.weight,
          reps: activeSet.reps,
        });
      }
      setSelectedSetLocation({
        workoutExerciseId: activeWorkoutExercise.id,
        setId: nextSet.id,
      });
    } else {
      // Last set of this exercise: Auto-add next set or advance to next exercise
      const exIdx = activeWorkout.exercises.findIndex((e) => e.id === activeWorkoutExercise.id);
      if (exIdx < activeWorkout.exercises.length - 1) {
        // Move to next exercise's first set
        const nextEx = activeWorkout.exercises[exIdx + 1];
        if (nextEx.sets.length > 0) {
          setSelectedSetLocation({
            workoutExerciseId: nextEx.id,
            setId: nextEx.sets[0].id,
          });
        }
      }
    }
  };

  // Keyboard shortcut: Pressing Enter logs the set
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !editingTitle && !(e.target instanceof HTMLInputElement && e.target.type === 'text')) {
        e.preventDefault();
        handleLogCurrentSet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="fixed inset-0 z-50 bg-app text-main flex flex-col overflow-hidden animate-in fade-in duration-150 transition-colors">
      {/* Top App Bar */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-subtle px-4 py-3 pt-safe transition-colors">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={onMinimize}
            className="p-2 -ml-2 rounded-xl text-muted hover:text-main hover:bg-surface-subtle transition-colors"
            title="Minimize workout"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          <div className="text-center flex-1 px-2">
            {editingTitle ? (
              <input
                type="text"
                autoFocus
                value={activeWorkout.name}
                onChange={(e) => updateActiveWorkoutName(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                className="bg-surface-subtle border border-subtle text-center font-black text-base text-main rounded-xl px-2 py-1 w-full max-w-[220px]"
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="font-display font-extrabold text-base text-main truncate hover:opacity-80 transition-opacity"
              >
                {activeWorkout.name}
              </button>
            )}
            <div className="flex items-center justify-center gap-2 text-xs text-muted font-mono-numbers">
              <Clock className="w-3.5 h-3.5 text-muted" />
              <span>{formatTimerClock(activeWorkout.durationSeconds)}</span>
              <span>·</span>
              <span>{activeWorkout.exercises.length} Exercises</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDiscardConfirm(true)}
              className="p-2 rounded-xl text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Discard Workout"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-xl font-black text-xs shadow-md active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              Finish
            </button>
          </div>
        </div>
      </header>

      {/* Main Exercises List */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 pb-80 max-w-xl w-full mx-auto space-y-4">
        {activeWorkout.exercises.length === 0 ? (
          <div className="py-16 text-center text-muted bg-surface border border-subtle rounded-3xl p-6 transition-colors space-y-3">
            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-sm"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Dumbbell className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-main">Workout is empty</h3>
            <p className="text-xs text-secondary max-w-xs mx-auto">
              Add your first exercise to begin logging weight and reps.
            </p>
            <button
              onClick={() => setIsAddExerciseOpen(true)}
              className="mt-2 px-5 py-3 rounded-2xl text-xs font-extrabold shadow-md inline-flex items-center gap-2 active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Choose Exercise</span>
            </button>
          </div>
        ) : (
          activeWorkout.exercises.map((workoutExercise, exIdx) => {
            const exerciseDef = exerciseMap.get(workoutExercise.exerciseId);
            const prevPerf = getPreviousPerformance(workoutExercise.exerciseId);
            const isMenuOpen = activeMenuExerciseId === workoutExercise.id;

            return (
              <div
                key={workoutExercise.id}
                className="bg-surface border border-subtle rounded-3xl overflow-hidden shadow-sm transition-colors"
              >
                {/* Exercise Header */}
                <div className="p-4 border-b border-subtle flex items-start justify-between bg-surface-subtle/40">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      {workoutExercise.supersetId && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                          Superset {workoutExercise.supersetId}
                        </span>
                      )}
                      <h2 className="text-base sm:text-lg font-black text-main truncate">
                        {exerciseDef?.name || 'Exercise'}
                      </h2>
                    </div>

                    <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                      <span className="font-semibold">{exerciseDef?.primaryMuscle}</span>
                      <span>·</span>
                      <span>{exerciseDef?.equipment}</span>
                      {prevPerf && prevPerf.lastSets.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-secondary font-bold font-mono-numbers">
                            Prev: {prevPerf.lastSets[0].weight} {userProfile.unitPreference} × {prevPerf.lastSets[0].reps}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Options Menu Trigger */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuExerciseId(isMenuOpen ? null : workoutExercise.id)
                      }
                      className="p-2 rounded-xl text-muted hover:text-main hover:bg-surface-subtle transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-9 z-30 w-44 rounded-2xl bg-surface border border-subtle shadow-2xl py-1 text-xs font-semibold text-main animate-in fade-in duration-100">
                        {exIdx > 0 && (
                          <button
                            onClick={() => {
                              reorderExercisesInActiveWorkout(exIdx, exIdx - 1);
                              setActiveMenuExerciseId(null);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-surface-subtle flex items-center gap-2"
                          >
                            <ArrowUp className="w-3.5 h-3.5" /> Move Up
                          </button>
                        )}
                        {exIdx < activeWorkout.exercises.length - 1 && (
                          <button
                            onClick={() => {
                              reorderExercisesInActiveWorkout(exIdx, exIdx + 1);
                              setActiveMenuExerciseId(null);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-surface-subtle flex items-center gap-2"
                          >
                            <ArrowDown className="w-3.5 h-3.5" /> Move Down
                          </button>
                        )}
                        <div className="border-t border-subtle my-1" />
                        <button
                          onClick={() => {
                            removeExerciseFromActiveWorkout(workoutExercise.id);
                            setActiveMenuExerciseId(null);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-rose-500/10 text-rose-500 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Exercise
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sets List */}
                <div className="p-3 sm:p-4 space-y-2">
                  {workoutExercise.sets.map((set, setIndex) => {
                    const isSelected =
                      selectedSetLocation?.workoutExerciseId === workoutExercise.id &&
                      selectedSetLocation?.setId === set.id;

                    const isDropSet = set.type === 'drop';
                    const isWarmup = set.type === 'warmup';

                    return (
                      <div
                        key={set.id}
                        onClick={() =>
                          setSelectedSetLocation({
                            workoutExerciseId: workoutExercise.id,
                            setId: set.id,
                          })
                        }
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-main shadow-sm bg-surface-subtle/80 ring-1 ring-main'
                            : set.isCompleted
                            ? 'bg-surface-subtle/40 border-subtle opacity-90'
                            : 'bg-surface border-subtle hover:border-main'
                        }`}
                      >
                        {/* Set badge & label */}
                        <div className="flex items-center gap-2.5 min-w-[70px]">
                          <span
                            className={`w-7 h-7 rounded-xl font-mono text-xs font-black flex items-center justify-center border transition-colors ${
                              isDropSet
                                ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                                : isWarmup
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                : 'bg-surface-subtle text-main border-subtle'
                            }`}
                          >
                            {isDropSet ? 'D' : isWarmup ? 'W' : set.setNumber}
                          </span>
                          <span className="text-xs font-extrabold text-main">
                            Set {set.setNumber}
                          </span>
                        </div>

                        {/* Weight and Reps Display */}
                        <div className="flex items-baseline gap-2 text-center flex-1 justify-center">
                          <span className="text-base sm:text-lg font-black font-mono-numbers text-main">
                            {set.weight > 0 ? set.weight : '—'}
                          </span>
                          <span className="text-xs font-bold text-muted font-mono">
                            {userProfile.unitPreference}
                          </span>
                          <span className="text-xs text-muted font-bold">×</span>
                          <span className="text-base sm:text-lg font-black font-mono-numbers text-main">
                            {set.reps > 0 ? set.reps : '—'}
                          </span>
                          <span className="text-xs font-bold text-muted">reps</span>
                        </div>

                        {/* Completed Checkmark Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSetCompleted(workoutExercise.id, set.id);
                          }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
                            set.isCompleted
                              ? 'shadow-sm'
                              : 'bg-surface-subtle text-muted hover:text-main border-subtle'
                          }`}
                          style={{
                            backgroundColor: set.isCompleted ? 'var(--accent)' : undefined,
                            color: set.isCompleted ? 'var(--accent-text)' : undefined,
                            borderColor: set.isCompleted ? 'var(--accent)' : undefined,
                          }}
                        >
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Add Set Button */}
                  <button
                    type="button"
                    onClick={() => {
                      addSetToExercise(workoutExercise.id);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-surface-subtle hover:bg-surface border border-subtle text-xs font-bold text-main flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Set</span>
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Add Another Exercise Button */}
        {activeWorkout.exercises.length > 0 && (
          <button
            onClick={() => setIsAddExerciseOpen(true)}
            className="w-full py-3.5 rounded-2xl border border-dashed border-subtle hover:border-main bg-surface-subtle/50 text-xs font-extrabold text-main flex items-center justify-center gap-2 transition-colors active:scale-98 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Exercise</span>
          </button>
        )}
      </main>

      {/* Floating Bottom Tactile Set Controller Drawer */}
      {activeSet && activeWorkoutExercise && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/98 backdrop-blur-xl border-t border-subtle p-3 sm:p-4 pb-safe shadow-2xl animate-in slide-in-from-bottom-4 duration-150">
          <div className="max-w-md mx-auto space-y-3">
            {/* Controller Header: Current Exercise & Set info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-muted uppercase tracking-wider font-mono">
                  Set {activeSet.setNumber}
                </span>
                <span className="text-xs font-extrabold text-main truncate max-w-[170px]">
                  {activeExerciseDef?.name}
                </span>
              </div>

              {/* Set Preferences / Types: Normal, Drop Set, Warmup */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    updateSet(activeWorkoutExercise.id, activeSet.id, {
                      type: activeSet.type === 'drop' ? 'normal' : 'drop',
                    })
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    activeSet.type === 'drop'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-surface-subtle text-muted hover:text-main border-subtle'
                  }`}
                >
                  Drop Set
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSet(activeWorkoutExercise.id, activeSet.id, {
                      type: activeSet.type === 'warmup' ? 'normal' : 'warmup',
                    })
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    activeSet.type === 'warmup'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                      : 'bg-surface-subtle text-muted hover:text-main border-subtle'
                  }`}
                >
                  Warmup
                </button>
                <button
                  type="button"
                  onClick={() => removeSet(activeWorkoutExercise.id, activeSet.id)}
                  className="p-1 rounded-lg text-muted hover:text-rose-500 transition-colors ml-1"
                  title="Delete Set"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tactile Weight Scroll Wheel */}
            <WeightScrollWheel
              value={activeSet.weight}
              unit={userProfile.unitPreference}
              onChange={(val) => {
                updateSet(activeWorkoutExercise.id, activeSet.id, { weight: val });
              }}
            />

            {/* Tactile Reps Number Selector */}
            <RepsPicker
              value={activeSet.reps || 10}
              onChange={(val) => {
                updateSet(activeWorkoutExercise.id, activeSet.id, { reps: val });
              }}
            />

            {/* Main Log Set CTA (Big touch target) */}
            <button
              type="button"
              onClick={handleLogCurrentSet}
              className="w-full py-3.5 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{activeSet.isCompleted ? 'Update Set (Enter)' : 'Log Set (Enter)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-surface border border-subtle rounded-3xl w-full max-w-sm shadow-2xl p-5 text-main">
            <h3 className="text-base font-extrabold text-main font-display">
              Discard Workout?
            </h3>
            <p className="mt-2 text-xs text-secondary">
              This workout session will not be saved. All logged sets will be discarded.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-subtle border border-subtle hover:bg-surface text-xs font-bold text-main"
              >
                Keep Workout
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md"
              >
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        onAddExercises={(ids) => {
          ids.forEach((id) => addExerciseToActiveWorkout(id));
        }}
        onOpenCreateCustom={() => {
          setIsAddExerciseOpen(false);
          setIsCreateCustomOpen(true);
        }}
      />

      {/* Create Custom Exercise Modal */}
      <CustomExerciseModal
        isOpen={isCreateCustomOpen}
        onClose={() => setIsCreateCustomOpen(false)}
        onCreated={(id) => {
          addExerciseToActiveWorkout(id);
        }}
      />
    </div>
  );
};
