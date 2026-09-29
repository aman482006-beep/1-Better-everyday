import React, { useMemo, useState } from 'react';
import { Check, Dumbbell, Plus, Search, Star, X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { Equipment, Exercise, MuscleGroup } from '../types';
import { CustomExerciseModal } from './CustomExerciseModal';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercises: (exerciseIds: string[]) => void;
  onOpenCreateCustom?: () => void;
}

type FilterTab = 'All' | 'Custom' | MuscleGroup;

const FILTER_TABS: FilterTab[] = [
  'All',
  'Custom',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
];

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onAddExercises,
  onOpenCreateCustom,
}) => {
  const { exercises, toggleFavoriteExercise, getPreviousPerformance, userProfile } = useWorkout();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [isInlineCustomOpen, setIsInlineCustomOpen] = useState(false);
  const [customPresetName, setCustomPresetName] = useState('');

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (showOnlyFavorites && !ex.isFavorite) return false;
      if (activeTab === 'Custom' && !ex.isCustom) return false;
      if (activeTab !== 'All' && activeTab !== 'Custom' && ex.category !== activeTab) return false;

      if (search.trim() !== '') {
        const query = search.toLowerCase();
        const matchName = ex.name.toLowerCase().includes(query);
        const matchMuscle = ex.primaryMuscle.toLowerCase().includes(query);
        const matchEquip = ex.equipment.toLowerCase().includes(query);
        if (!matchName && !matchMuscle && !matchEquip) return false;
      }
      return true;
    });
  }, [exercises, search, activeTab, showOnlyFavorites]);

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

  const handleOpenCustom = (preset = '') => {
    if (onOpenCreateCustom) {
      onOpenCreateCustom();
    } else {
      setCustomPresetName(preset);
      setIsInlineCustomOpen(true);
    }
  };

  const handleCustomCreated = (newId: string) => {
    onAddExercises([newId]);
    setIsInlineCustomOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
        <div className="bg-surface border-t sm:border border-subtle rounded-t-3xl sm:rounded-3xl w-full max-w-lg mx-auto max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-main transition-colors">
          {/* Modal Header */}
          <div className="p-4 border-b border-subtle flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-main font-display">
                Choose Exercises
              </h2>
              <div className="text-xs text-muted">
                {selectedExerciseIds.length > 0
                  ? `${selectedExerciseIds.length} selected`
                  : `${filteredExercises.length} available`}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenCustom()}
                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
          <div className="p-3 border-b border-subtle bg-surface-subtle space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exercise (e.g. Bench, Squat, Row)..."
                className="w-full bg-surface border border-subtle rounded-xl pl-9 pr-8 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-main shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {FILTER_TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors border ${
                      isActive
                        ? 'border-main shadow-sm'
                        : 'bg-surface border-subtle text-muted hover:text-main'
                    }`}
                    style={{
                      backgroundColor: isActive ? 'var(--accent)' : undefined,
                      color: isActive ? 'var(--accent-text)' : undefined,
                      borderColor: isActive ? 'var(--accent)' : undefined,
                    }}
                  >
                    {tab === 'Custom' ? '⭐ Custom' : tab}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors border ${
                  showOnlyFavorites
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                    : 'bg-surface border-subtle text-muted hover:text-main'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Favorites</span>
              </button>
            </div>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-subtle">
            {filteredExercises.length === 0 ? (
              <div className="py-10 text-center space-y-3 px-4">
                <Dumbbell className="w-8 h-8 text-muted mx-auto opacity-50" />
                <div>
                  <div className="text-sm font-bold text-main">
                    {search ? `No exercises found for "${search}"` : 'No exercises found'}
                  </div>
                  <p className="text-xs text-secondary mt-1">
                    You can create your own custom exercise right now.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCustom(search.trim())}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-2 active:scale-95 transition-transform"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create "{search.trim() || 'Custom Exercise'}"</span>
                </button>
              </div>
            ) : (
              filteredExercises.map((ex) => {
                const isSelected = selectedExerciseIds.includes(ex.id);
                const prev = getPreviousPerformance(ex.id);

                return (
                  <div
                    key={ex.id}
                    onClick={() => toggleSelect(ex.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-surface-subtle border border-main'
                        : 'hover:bg-surface-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                          isSelected
                            ? 'border-transparent'
                            : 'border-subtle bg-surface text-transparent'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--accent)' : undefined,
                          color: isSelected ? 'var(--accent-text)' : undefined,
                        }}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>

                      <div>
                        <div className="text-sm font-bold text-main flex items-center gap-2">
                          {ex.name}
                          {ex.isCustom && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5 font-medium">
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
                      className={`p-2 rounded-xl transition-colors ${
                        ex.isFavorite ? 'text-amber-500' : 'text-muted hover:text-main'
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
              className="flex-1 py-3 rounded-xl bg-surface-subtle border border-subtle hover:bg-surface text-xs font-bold text-main transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedExerciseIds.length === 0}
              className={`flex-1 py-3 rounded-xl text-xs font-extrabold shadow-md active:scale-[0.98] transition-all ${
                selectedExerciseIds.length === 0
                  ? 'opacity-40 cursor-not-allowed bg-surface-subtle text-muted'
                  : ''
              }`}
              style={{
                backgroundColor: selectedExerciseIds.length > 0 ? 'var(--accent)' : undefined,
                color: selectedExerciseIds.length > 0 ? 'var(--accent-text)' : undefined,
              }}
            >
              Add {selectedExerciseIds.length > 0 ? `(${selectedExerciseIds.length})` : ''} Selected
            </button>
          </div>
        </div>
      </div>

      {/* Inline Custom Exercise Modal fallback if needed */}
      <CustomExerciseModal
        isOpen={isInlineCustomOpen}
        initialName={customPresetName}
        onClose={() => setIsInlineCustomOpen(false)}
        onCreated={handleCustomCreated}
      />
    </>
  );
};
