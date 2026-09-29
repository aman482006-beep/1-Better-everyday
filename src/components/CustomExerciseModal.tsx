import React, { useState } from 'react';
import { Dumbbell, Plus, X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { Equipment, MuscleGroup } from '../types';

interface CustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (exerciseId: string) => void;
  initialName?: string;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
];

const EQUIPMENTS: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Smith Machine',
];

export const CustomExerciseModal: React.FC<CustomExerciseModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  initialName = '',
}) => {
  const { addCustomExercise, userProfile } = useWorkout();
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState<Equipment>('Barbell');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an exercise name.');
      return;
    }

    const created = addCustomExercise({
      name: name.trim(),
      category,
      primaryMuscle: category,
      equipment,
      exerciseType: 'weight_reps',
      instructions: `${name.trim()} - Custom exercise`,
      defaultUnit: userProfile.unitPreference,
    });

    if (onCreated) {
      onCreated(created.id);
    }

    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-surface border border-subtle rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col text-main transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-subtle shadow-xs"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Dumbbell className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-main font-display">New Exercise</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-rose-500 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
              Exercise Name
            </label>
            <input
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Incline Smith Press, Pendlay Row..."
              className="w-full bg-surface-subtle border border-subtle rounded-xl px-3.5 py-2.5 text-base font-semibold text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-main shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
              Muscle Target
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {MUSCLE_GROUPS.map((m) => {
                const isSelected = category === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCategory(m)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'border-main shadow-sm'
                        : 'bg-surface-subtle border-subtle text-muted hover:text-main'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--accent)' : undefined,
                      color: isSelected ? 'var(--accent-text)' : undefined,
                      borderColor: isSelected ? 'var(--accent)' : undefined,
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
              Equipment
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {EQUIPMENTS.map((eq) => {
                const isSelected = equipment === eq;
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => setEquipment(eq)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'border-main shadow-sm'
                        : 'bg-surface-subtle border-subtle text-muted hover:text-main'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--accent)' : undefined,
                      color: isSelected ? 'var(--accent-text)' : undefined,
                      borderColor: isSelected ? 'var(--accent)' : undefined,
                    }}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-surface-subtle hover:bg-surface border border-subtle text-xs font-bold text-main"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl text-xs font-extrabold shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Exercise</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
