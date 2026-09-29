import React, { useMemo, useState } from 'react';
import { Check, Dumbbell, Filter, Plus, Search, Star, X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { Equipment, Exercise, MuscleGroup } from '../types';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercises: (exerciseIds: string[]) => void;
  onOpenCreateCustom: () => void;
}

const MUSCLE_TABS: (MuscleGroup | 'All')[] = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Legs',
  'Arms',
  'Core',
  'Cardio',
];

const EQUIPMENT_OPTIONS: (Equipment | 'All')[] = [
  'All',
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Smith Machine',
];

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onAddExercises,
  onOpenCreateCustom,
}) => {
  const { exercises, toggleFavoriteExercise, getPreviousPerformance, userProfile } = useWorkout();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'All'>('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (showOnlyFavorites && !ex.isFavorite) return false;
      if (selectedMuscle !== 'All' && ex.category !== selectedMuscle) return false;
      if (selectedEquipment !== 'All' && ex.equipment !== selectedEquipment) return false;
      if (search.trim() !== '') {
        const query = search.toLowerCase();
        const matchName = ex.name.toLowerCase().includes(query);
        const matchMuscle = ex.primaryMuscle.toLowerCase().includes(query);
        const matchEquip = ex.equipment.toLowerCase().includes(query);
        if (!matchName && !matchMuscle && !matchEquip) return false;
      }
      return true;
    });
  }, [exercises, search, selectedMuscle, selectedEquipment, showOnlyFavorites]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (selectedExerciseIds.length > 0) {
      onAddExercises(selectedExerciseIds);
      setSelectedExerciseIds([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border-t sm:border border-subtle rounded-t-3xl sm:rounded-3xl w-full max-w-lg mx-auto max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-main transition-colors">
        {/* Modal Header */}
        <div className="p-4 border-b border-subtle flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-main font-display">Add Exercises</h2>
            <div className="text-xs text-muted">
              {filteredExercises.length} available · {selectedExerciseIds.length} selected
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateCustom}
              className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface text-xs font-semibold text-main flex items-center gap-1 border border-subtle transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-subtle bg-surface-subtle">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise, muscle, equipment..."
              className="w-full bg-surface border border-subtle rounded-xl pl-9 pr-4 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-main shadow-sm"
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

          {/* Muscle tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 mt-1">
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 transition-colors ${
                showOnlyFavorites
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                  : 'bg-surface border border-subtle text-muted hover:text-main'
              }`}
            >
              <Star className="w-3 h-3 fill-current" /> Favorites
            </button>
            {MUSCLE_TABS.map((muscle) => (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  selectedMuscle === muscle
                    ? 'shadow-sm font-bold'
                    : 'bg-surface border border-subtle text-muted hover:text-main'
                }`}
                style={{
                  backgroundColor: selectedMuscle === muscle ? 'var(--accent)' : undefined,
                  color: selectedMuscle === muscle ? 'var(--accent-text)' : undefined,
                }}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Scroll List */}
        <div className="flex-1 overflow-y-auto divide-y divide-subtle p-2">
          {filteredExercises.length === 0 ? (
            <div className="py-12 text-center text-muted text-sm">
              No exercises match your criteria.
              <div className="mt-3">
                <button
                  onClick={onOpenCreateCustom}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Create &quot;{search}&quot;
                </button>
              </div>
            </div>
          ) : (
            filteredExercises.map((ex) => {
              const isSelected = selectedExerciseIds.includes(ex.id);
              const prev = getPreviousPerformance(ex.id);

              return (
                <div
                  key={ex.id}
                  onClick={() => toggleSelect(ex.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-surface-subtle border border-main'
                      : 'hover:bg-surface-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                        isSelected
                          ? 'border-transparent'
                          : 'border-subtle bg-surface text-transparent'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--accent)' : undefined,
                        color: isSelected ? 'var(--accent-text)' : undefined,
                      }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-main flex items-center gap-1.5">
                        {ex.name}
                        {ex.isCustom && (
                          <span className="text-[10px] bg-surface-subtle text-amber-500 border border-subtle px-1.5 py-0.5 rounded font-mono">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                        <span>{ex.primaryMuscle}</span>
                        <span>·</span>
                        <span>{ex.equipment}</span>
                        {prev && prev.bestWeight > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-secondary font-mono-numbers">
                              PR: {prev.bestWeight} {userProfile.unitPreference}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteExercise(ex.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      ex.isFavorite
                        ? 'text-amber-500'
                        : 'text-muted hover:text-main'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${ex.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom CTA */}
        <div className="p-4 border-t border-subtle bg-surface flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-surface-subtle border border-subtle hover:bg-surface text-sm font-semibold text-main transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedExerciseIds.length === 0}
            className={`flex-1 py-3 rounded-xl text-sm font-bold shadow-lg active:scale-[0.98] transition-all ${
              selectedExerciseIds.length === 0
                ? 'opacity-40 cursor-not-allowed bg-surface-subtle text-muted'
                : ''
            }`}
            style={{
              backgroundColor: selectedExerciseIds.length > 0 ? 'var(--accent)' : undefined,
              color: selectedExerciseIds.length > 0 ? 'var(--accent-text)' : undefined,
            }}
          >
            Add {selectedExerciseIds.length > 0 ? `(${selectedExerciseIds.length})` : ''} Exercises
          </button>
        </div>
      </div>
    </div>
  );
};
