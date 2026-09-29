import React, { useState } from 'react';
import { Dumbbell, Plus, X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { Equipment, ExerciseType, MuscleGroup } from '../types';

interface CustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (exerciseId: string) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Biceps',
  'Triceps',
  'Legs',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core',
  'Cardio',
];

const EQUIPMENTS: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Resistance Band',
  'Smith Machine',
  'Cardio Equipment',
];

export const CustomExerciseModal: React.FC<CustomExerciseModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { addCustomExercise, userProfile } = useWorkout();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState<Equipment>('Barbell');
  const [exerciseType, setExerciseType] = useState<ExerciseType>('weight_reps');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an exercise name.');
      return;
    }

    const created = addCustomExercise({
      name: name.trim(),
      category,
      primaryMuscle: category,
      equipment,
      exerciseType,
      instructions: instructions.trim() || 'Custom exercise instructions.',
      defaultUnit: userProfile.unitPreference,
    });

    if (onCreated) {
      onCreated(created.id);
    }

    setName('');
    setInstructions('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-surface border border-subtle rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-main transition-colors">
        <div className="p-4 border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-subtle"
              style={{ backgroundColor: 'var(--accent-subtle)' }}
            >
              <Dumbbell className="w-4 h-4 text-main" />
            </div>
            <h2 className="text-base font-bold text-main font-display">New Custom Exercise</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-rose-500 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Exercise Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Pendlay Row, Nordic Curl..."
              className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Primary Muscle</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MuscleGroup)}
                className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main focus:outline-none"
              >
                {MUSCLE_GROUPS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Equipment</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value as Equipment)}
                className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main focus:outline-none"
              >
                {EQUIPMENTS.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Tracking Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExerciseType('weight_reps')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-colors ${
                  exerciseType === 'weight_reps'
                    ? 'border-main bg-surface-subtle text-main font-bold'
                    : 'border-subtle bg-surface text-muted hover:text-main'
                }`}
              >
                Weight &amp; Reps
              </button>
              <button
                type="button"
                onClick={() => setExerciseType('bodyweight_reps')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-colors ${
                  exerciseType === 'bodyweight_reps'
                    ? 'border-main bg-surface-subtle text-main font-bold'
                    : 'border-subtle bg-surface text-muted hover:text-main'
                }`}
              >
                Bodyweight Reps
              </button>
              <button
                type="button"
                onClick={() => setExerciseType('duration')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-colors ${
                  exerciseType === 'duration'
                    ? 'border-main bg-surface-subtle text-main font-bold'
                    : 'border-subtle bg-surface text-muted hover:text-main'
                }`}
              >
                Time / Duration
              </button>
              <button
                type="button"
                onClick={() => setExerciseType('distance_time')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-colors ${
                  exerciseType === 'distance_time'
                    ? 'border-main bg-surface-subtle text-main font-bold'
                    : 'border-subtle bg-surface text-muted hover:text-main'
                }`}
              >
                Distance &amp; Time
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">
              Instructions or Setup Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Set bench angle to 45 degrees, pause 1s at bottom..."
              className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main placeholder-muted focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-surface-subtle hover:bg-surface border border-subtle text-xs font-semibold text-main"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              Save Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
