import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Dumbbell,
  FileText,
  Link,
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
    copyPreviousValuesToSet,
    updateActiveWorkoutName,
    updateActiveWorkoutNotes,
    setExerciseSuperset,
    setExerciseNotes,
    getPreviousPerformance,
  } = useWorkout();

  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isCreateCustomOpen, setIsCreateCustomOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [activeMenuExerciseId, setActiveMenuExerciseId] = useState<string | null>(null);
  const [openNotesExerciseId, setOpenNotesExerciseId] = useState<string | null>(null);

  const exerciseMap = useMemo(() => {
    const map = new Map<string, Exercise>();
    exercises.forEach((ex) => map.set(ex.id, ex));
    return map;
  }, [exercises]);

  if (!activeWorkout) return null;

  const handleFinish = () => {
    finishActiveWorkout();
  };

  const handleConfirmDiscard = () => {
    discardActiveWorkout();
    setShowDiscardConfirm(false);
  };

  const setTypeLabels: Record<SetType, { label: string; bg: string; text: string }> = {
    normal: { label: '', bg: 'bg-surface-subtle text-main border border-subtle', text: '' },
    warmup: { label: 'W', bg: 'bg-amber-500/10 text-amber-500 font-bold border border-amber-500/30', text: 'Warmup' },
    drop: { label: 'D', bg: 'bg-purple-500/10 text-purple-500 font-bold border border-purple-500/30', text: 'Drop' },
    failure: { label: 'F', bg: 'bg-rose-500/10 text-rose-500 font-bold border border-rose-500/30', text: 'Failure' },
  };

  const cycleSetType = (workoutExerciseId: string, set: WorkoutSet) => {
    const types: SetType[] = ['normal', 'warmup', 'drop', 'failure'];
    const nextIdx = (types.indexOf(set.type) + 1) % types.length;
    updateSet(workoutExerciseId, set.id, { type: types[nextIdx] });
  };

  return (
    <div className="fixed inset-0 z-50 bg-app text-main flex flex-col overflow-hidden animate-in fade-in duration-200 transition-colors">
      {/* Top App Bar */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-subtle px-4 py-3 pt-safe transition-colors">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={onMinimize}
            className="p-2 -ml-2 rounded-xl text-muted hover:text-main hover:bg-surface-subtle transition-colors"
            title="Minimize workout view"
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
                className="bg-surface-subtle border border-subtle text-center font-bold text-sm text-main rounded-lg px-2 py-1 w-full max-w-[200px]"
              />
            ) : (
              <div
                onClick={() => setEditingTitle(true)}
                className="font-display font-bold text-sm text-main truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center gap-1.5"
              >
                <span>{activeWorkout.name}</span>
                <span className="text-[10px] text-muted">✎</span>
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted mt-0.5 font-mono-numbers">
              <Clock className="w-3 h-3 text-muted" />
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
              className="px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              Finish
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 pb-28 max-w-xl w-full mx-auto space-y-4">
        {/* Workout Notes */}
        <div className="bg-surface border border-subtle rounded-2xl p-3 shadow-sm transition-colors">
          <input
            type="text"
            value={activeWorkout.notes || ''}
            onChange={(e) => updateActiveWorkoutNotes(e.target.value)}
            placeholder="Add general workout notes..."
            className="w-full bg-transparent text-xs text-main placeholder-muted focus:outline-none"
          />
        </div>

        {/* Exercises List */}
        {activeWorkout.exercises.length === 0 ? (
          <div className="py-16 text-center text-muted bg-surface border border-dashed border-subtle rounded-3xl p-6 transition-colors">
            <div
              className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 border border-subtle"
              style={{ backgroundColor: 'var(--accent-subtle)' }}
            >
              <Dumbbell className="w-6 h-6 text-main" />
            </div>
            <h3 className="text-base font-bold text-main">No exercises added yet</h3>
            <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
              Start your workout by adding your first exercise from the library.
            </p>
            <button
              onClick={() => setIsAddExerciseOpen(true)}
              className="mt-4 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-1.5 active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Plus className="w-4 h-4" /> Add Exercise
            </button>
          </div>
        ) : (
          activeWorkout.exercises.map((workoutExercise, exIdx) => {
            const exerciseDef = exerciseMap.get(workoutExercise.exerciseId);
            const prevPerf = getPreviousPerformance(workoutExercise.exerciseId);
            const isMenuOpen = activeMenuExerciseId === workoutExercise.id;
            const hasNotesOpen = openNotesExerciseId === workoutExercise.id;

            return (
              <div
                key={workoutExercise.id}
                className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-sm transition-colors"
              >
                {/* Exercise Header */}
                <div className="p-3.5 border-b border-subtle flex items-start justify-between bg-surface-subtle/50">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      {workoutExercise.supersetId && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                          Superset {workoutExercise.supersetId}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-main truncate">
                        {exerciseDef?.name || 'Exercise'}
                      </h3>
                    </div>
                    <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5 font-mono-numbers">
                      <span>{exerciseDef?.primaryMuscle}</span>
                      <span>·</span>
                      <span>{exerciseDef?.equipment}</span>
                      {prevPerf && prevPerf.lastSets.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-secondary font-semibold">
                            Prev: {prevPerf.lastSets[0].weight} {userProfile.unitPreference} × {prevPerf.lastSets[0].reps}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions dropdown / controls */}
                  <div className="relative flex items-center gap-1">
                    <button
                      onClick={() =>
                        setOpenNotesExerciseId(hasNotesOpen ? null : workoutExercise.id)
                      }
                      className={`p-1.5 rounded-lg transition-colors ${
                        workoutExercise.notes
                          ? 'text-main bg-surface-subtle border border-subtle'
                          : 'text-muted hover:text-main'
                      }`}
                      title="Exercise notes"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setActiveMenuExerciseId(isMenuOpen ? null : workoutExercise.id)
                      }
                      className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface-subtle transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Context menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-surface border border-subtle shadow-2xl py-1 text-xs text-main animate-in fade-in duration-100">
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
                        <button
                          onClick={() => {
                            const newSuperset = workoutExercise.supersetId ? undefined : 'A';
                            setExerciseSuperset(workoutExercise.id, newSuperset);
                            setActiveMenuExerciseId(null);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-surface-subtle flex items-center gap-2"
                        >
                          <Link className="w-3.5 h-3.5" />{' '}
                          {workoutExercise.supersetId ? 'Remove Superset' : 'Group Superset A'}
                        </button>
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

                {/* Optional Exercise Notes input */}
                {hasNotesOpen && (
                  <div className="px-3.5 py-2 bg-surface-subtle border-b border-subtle">
                    <input
                      type="text"
                      value={workoutExercise.notes || ''}
                      onChange={(e) => setExerciseNotes(workoutExercise.id, e.target.value)}
                      placeholder="Seat height 4, wide grip, slow tempo..."
                      className="w-full bg-transparent text-xs text-main placeholder-muted focus:outline-none"
                    />
                  </div>
                )}

                {/* Sets Table */}
                <div className="p-2 sm:p-3">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-1 text-[11px] font-bold text-muted px-1 pb-1 uppercase tracking-wider text-center">
                    <span className="col-span-2 text-left pl-1">Set</span>
                    <span className="col-span-3">Previous</span>
                    <span className="col-span-3">{userProfile.unitPreference}</span>
                    <span className="col-span-2">Reps</span>
                    <span className="col-span-2">✓</span>
                  </div>

                  {/* Set Rows */}
                  <div className="space-y-1.5 mt-1">
                    {workoutExercise.sets.map((set, setIndex) => {
                      const prevSet = prevPerf?.lastSets[setIndex] || prevPerf?.lastSets[0];
                      const setConfig = setTypeLabels[set.type];

                      return (
                        <div
                          key={set.id}
                          className={`grid grid-cols-12 gap-1 items-center p-1 rounded-xl transition-colors ${
                            set.isCompleted
                              ? 'bg-surface-subtle border border-main'
                              : 'bg-surface border border-subtle hover:border-strong'
                          }`}
                        >
                          {/* Set number & type button */}
                          <div className="col-span-2 flex items-center gap-1 pl-1">
                            <button
                              type="button"
                              onClick={() => cycleSetType(workoutExercise.id, set)}
                              className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-transform active:scale-95 ${
                                setConfig.bg
                              }`}
                              title="Click to toggle Normal, Warmup, Drop, Failure"
                            >
                              {setConfig.label || set.setNumber}
                            </button>
                          </div>

                          {/* Previous value display & one-tap copy button */}
                          <div className="col-span-3 text-center">
                            {prevSet ? (
                              <button
                                type="button"
                                onClick={() => copyPreviousValuesToSet(workoutExercise.id, set.id)}
                                className="text-[11px] font-mono-numbers text-muted hover:text-main flex items-center justify-center gap-1 mx-auto transition-colors"
                                title="Click to copy previous set weight & reps"
                              >
                                <span>
                                  {prevSet.weight} × {prevSet.reps}
                                </span>
                                <Copy className="w-2.5 h-2.5 opacity-60" />
                              </button>
                            ) : (
                              <span className="text-[11px] text-muted">-</span>
                            )}
                          </div>

                          {/* Weight input */}
                          <div className="col-span-3">
                            <input
                              type="number"
                              step="0.5"
                              value={set.weight === 0 ? '' : set.weight}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                updateSet(workoutExercise.id, set.id, { weight: val });
                              }}
                              placeholder="0"
                              className="w-full bg-surface-subtle border border-subtle rounded-lg py-1.5 text-center text-xs font-bold font-mono-numbers text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-main"
                            />
                          </div>

                          {/* Reps input */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={set.reps === 0 ? '' : set.reps}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                updateSet(workoutExercise.id, set.id, { reps: val });
                              }}
                              placeholder="0"
                              className="w-full bg-surface-subtle border border-subtle rounded-lg py-1.5 text-center text-xs font-bold font-mono-numbers text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-main"
                            />
                          </div>

                          {/* Checkbox button */}
                          <div className="col-span-2 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => toggleSetCompleted(workoutExercise.id, set.id)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 border border-subtle ${
                                set.isCompleted
                                  ? 'shadow-sm'
                                  : 'bg-surface-subtle text-muted hover:text-main'
                              }`}
                              style={{
                                backgroundColor: set.isCompleted ? 'var(--accent)' : undefined,
                                color: set.isCompleted ? 'var(--accent-text)' : undefined,
                                borderColor: set.isCompleted ? 'var(--accent)' : undefined,
                              }}
                              title="Mark set complete (triggers rest timer)"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add set / Delete set actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-subtle">
                    <button
                      onClick={() => addSetToExercise(workoutExercise.id, 'normal')}
                      className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface border border-subtle active:scale-95 text-xs font-bold text-main transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Set
                    </button>

                    {workoutExercise.sets.length > 1 && (
                      <button
                        onClick={() => {
                          const lastSet = workoutExercise.sets[workoutExercise.sets.length - 1];
                          removeSet(workoutExercise.id, lastSet.id);
                        }}
                        className="px-2 py-1 text-[11px] text-muted hover:text-rose-500 transition-colors"
                      >
                        Remove Last Set
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Big Add Exercise Button */}
        {activeWorkout.exercises.length > 0 && (
          <button
            onClick={() => setIsAddExerciseOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-surface hover:bg-surface-subtle border border-subtle text-sm font-bold text-main flex items-center justify-center gap-2 transition-colors active:scale-[0.99] shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Add Exercise
          </button>
        )}
      </main>

      {/* Discard Confirmation Dialog */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-subtle p-5 shadow-2xl text-main">
            <h3 className="text-base font-bold text-main">Discard Workout?</h3>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Are you sure you want to discard this workout? All logged sets for this session will be
              permanently lost.
            </p>
            <div className="mt-5 flex items-center gap-3">
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
