export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Legs'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Core'
  | 'Full Body'
  | 'Cardio';

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Bodyweight'
  | 'Kettlebell'
  | 'Resistance Band'
  | 'Smith Machine'
  | 'Cardio Equipment'
  | 'Other';

export type MovementPattern =
  | 'Push'
  | 'Pull'
  | 'Squat'
  | 'Hinge'
  | 'Lunge'
  | 'Carry'
  | 'Rotation'
  | 'Isolation'
  | 'Cardio';

export type ExerciseType =
  | 'weight_reps'
  | 'bodyweight_reps'
  | 'duration'
  | 'distance_time';

export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  movementPattern?: MovementPattern;
  exerciseType: ExerciseType;
  instructions: string;
  tips?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  defaultUnit: 'kg' | 'lb' | 'sec' | 'km';
  isCustom?: boolean;
  createdBy?: string;
  isFavorite?: boolean;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number; // in user preferred unit
  reps: number;
  rpe?: number; // 1-10
  durationSeconds?: number;
  distanceKm?: number;
  isCompleted: boolean;
  notes?: string;
  previousWeight?: number;
  previousReps?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
  supersetId?: string; // e.g. "A", "B"
  restTimeSeconds?: number;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | '1rm' | 'volume' | 'reps' | 'milestone';
  value: number;
  previousValue?: number;
  improvement?: number;
  percentImprovement?: number;
  achievedAt: string;
  workoutId: string;
  repsAtWeight?: number;
  unit: string;
  milestoneTitle?: string;
  bodyweightMultiplier?: number;
  notes?: string;
}

export interface StrengthMilestone {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetWeightKg: number;
  targetReps?: number;
  title: string;
  bodyweightMultiplier?: number;
  category: 'strength' | 'reps' | 'bodyweight';
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string; // ISO string YYYY-MM-DD
  startTime: string; // ISO string
  endTime?: string;
  durationSeconds: number;
  exercises: WorkoutExercise[];
  notes?: string;
  routineId?: string;
  isTemplate?: boolean;
  volumeTotal: number;
  totalSets: number;
  prsAchieved: PersonalRecord[];
  isCompleted: boolean;
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string; // e.g. "8-12"
  targetRpe?: number;
  defaultRestSeconds: number;
  supersetId?: string;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  estimatedDurationMinutes: number;
  category: string; // e.g. "Push", "Upper", "Full Body"
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, etc.
  updatedAt: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  routineIds: string[];
  schedule: { dayName: string; routineId?: string; isRestDay: boolean }[];
}

export interface BodyWeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPercent?: number; // Body fat percentage e.g. 15.2
  notes?: string;
}

export interface BodyMeasurementLog {
  id: string;
  date: string;
  waistCm?: number;
  chestCm?: number;
  armsCm?: number;
  thighsCm?: number;
  calvesCm?: number;
  hipsCm?: number;
  neckCm?: number;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  trainingGoal: 'hypertrophy' | 'strength' | 'general_fitness' | 'endurance' | 'fat_loss';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  unitPreference: 'kg' | 'lb';
  themePreference: 'dark' | 'light' | 'system';
  accentColor: string; // Hex color code
  activeThemeId?: string;
  targetWeightKg?: number;
  targetBodyFatPercent?: number;
  defaultRestSeconds: number;
  autoStartRestTimer: boolean;
  rmFormula: 'epley' | 'brzycki';
  onboarded: boolean;
}

export interface SyncStatus {
  state: 'synced' | 'syncing' | 'offline';
  lastSyncedAt?: string;
  pendingCount: number;
}
