import { Exercise, PersonalRecord, WorkoutExercise, WorkoutSession, WorkoutSet } from '../types';

/**
 * Calculates estimated 1 Rep Max based on selected formula.
 * Epley: weight * (1 + reps / 30)
 * Brzycki: weight * 36 / (37 - reps)
 */
export function calculateEstimated1RM(
  weight: number,
  reps: number,
  formula: 'epley' | 'brzycki' = 'epley'
): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;

  if (formula === 'brzycki') {
    if (reps >= 37) return Math.round(weight * 1.5);
    return Math.round(weight * (36 / (37 - reps)));
  }

  // Epley
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate volume for a single set
 */
export function calculateSetVolume(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * reps);
}

/**
 * Calculate volume for an exercise across its completed sets
 */
export function calculateExerciseVolume(sets: WorkoutSet[]): number {
  return sets
    .filter((s) => s.isCompleted)
    .reduce((sum, s) => sum + calculateSetVolume(s.weight, s.reps), 0);
}

/**
 * Calculate total volume for an entire workout
 */
export function calculateWorkoutVolume(exercises: WorkoutExercise[]): number {
  return exercises.reduce((sum, ex) => sum + calculateExerciseVolume(ex.sets), 0);
}

/**
 * Calculate total completed sets for an entire workout
 */
export function calculateWorkoutTotalSets(exercises: WorkoutExercise[]): number {
  return exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
}

/**
 * Calculate percentage progress between previous and current values
 */
export function calculateProgressPercentage(current: number, previous: number): number {
  if (!previous || previous <= 0) return 0;
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10;
}

/**
 * Unit conversions
 */
export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 10) / 10;
}

export function cmToIn(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

export function inToCm(inch: number): number {
  return Math.round(inch * 2.54 * 10) / 10;
}

// Standard configurable milestone weight boundaries in KG
export const STANDARD_MILESTONE_WEIGHTS = [
  40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220,
];

// Standard bodyweight multiplier targets
export const BODYWEIGHT_MULTIPLIERS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5];

/**
 * Detect personal records and milestones achieved in a workout session
 */
export function detectPersonalRecords(
  currentWorkout: WorkoutSession,
  historicalWorkouts: WorkoutSession[],
  exerciseMap: Map<string, Exercise>,
  formula: 'epley' | 'brzycki' = 'epley',
  preferredUnit: string = 'kg',
  userBodyweightKg?: number
): PersonalRecord[] {
  const prs: PersonalRecord[] = [];
  const pastCompleted = historicalWorkouts.filter(
    (w) => w.isCompleted && w.id !== currentWorkout.id
  );

  // 1. Check Volume PR for whole workout
  const highestPastVolume = pastCompleted.reduce((max, w) => Math.max(max, w.volumeTotal), 0);
  if (currentWorkout.volumeTotal > highestPastVolume && highestPastVolume > 0) {
    const diff = currentWorkout.volumeTotal - highestPastVolume;
    prs.push({
      id: `pr-vol-${currentWorkout.id}-${Date.now()}`,
      exerciseId: 'all-volume',
      exerciseName: 'Total Workout Volume',
      type: 'volume',
      value: currentWorkout.volumeTotal,
      previousValue: highestPastVolume,
      improvement: diff,
      percentImprovement: Math.round((diff / highestPastVolume) * 1000) / 10,
      achievedAt: currentWorkout.date,
      workoutId: currentWorkout.id,
      unit: preferredUnit,
      milestoneTitle: `NEW VOLUME PR: ${currentWorkout.volumeTotal.toLocaleString()} ${preferredUnit}`,
    });
  }

  // 2. Exercise-level PRs and milestones
  for (const ex of currentWorkout.exercises) {
    const exerciseDef = exerciseMap.get(ex.exerciseId);
    const exerciseName = exerciseDef?.name || 'Exercise';

    // Find all historical sets for this exercise
    const pastSets: WorkoutSet[] = [];
    pastCompleted.forEach((w) => {
      w.exercises
        .filter((e) => e.exerciseId === ex.exerciseId)
        .forEach((e) => {
          e.sets.filter((s) => s.isCompleted).forEach((s) => pastSets.push(s));
        });
    });

    const highestPastWeight = pastSets.reduce((max, s) => Math.max(max, s.weight), 0);
    const highestPast1RM = pastSets.reduce(
      (max, s) => Math.max(max, calculateEstimated1RM(s.weight, s.reps, formula)),
      0
    );

    // Check completed sets in current session
    const completedSets = ex.sets.filter((s) => s.isCompleted && s.weight > 0 && s.reps > 0);
    let exerciseWeightPRAdded = false;
    let exercise1RMPRAdded = false;

    for (const set of completedSets) {
      const current1RM = calculateEstimated1RM(set.weight, set.reps, formula);

      // A. Absolute Weight PR
      if (!exerciseWeightPRAdded && set.weight > highestPastWeight && highestPastWeight > 0) {
        const diff = Math.round((set.weight - highestPastWeight) * 10) / 10;
        prs.push({
          id: `pr-weight-${ex.exerciseId}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          exerciseId: ex.exerciseId,
          exerciseName,
          type: 'weight',
          value: set.weight,
          previousValue: highestPastWeight,
          improvement: diff,
          percentImprovement: Math.round((diff / highestPastWeight) * 1000) / 10,
          achievedAt: currentWorkout.date,
          workoutId: currentWorkout.id,
          repsAtWeight: set.reps,
          unit: preferredUnit,
          milestoneTitle: `${set.weight} ${preferredUnit} ${exerciseName}`,
        });
        exerciseWeightPRAdded = true;
      }

      // B. Estimated 1RM PR
      if (!exercise1RMPRAdded && current1RM > highestPast1RM && highestPast1RM > 0) {
        const diff = Math.round((current1RM - highestPast1RM) * 10) / 10;
        prs.push({
          id: `pr-1rm-${ex.exerciseId}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          exerciseId: ex.exerciseId,
          exerciseName,
          type: '1rm',
          value: current1RM,
          previousValue: highestPast1RM,
          improvement: diff,
          percentImprovement: Math.round((diff / highestPast1RM) * 1000) / 10,
          achievedAt: currentWorkout.date,
          workoutId: currentWorkout.id,
          unit: preferredUnit,
          milestoneTitle: `${current1RM} ${preferredUnit} 1RM`,
        });
        exercise1RMPRAdded = true;
      }

      // C. Landmark Milestone Detection (e.g. crossing 100 KG milestone)
      for (const targetKg of STANDARD_MILESTONE_WEIGHTS) {
        if (set.weight >= targetKg && highestPastWeight < targetKg && highestPastWeight > 0) {
          prs.push({
            id: `milestone-${ex.exerciseId}-${targetKg}-${Date.now()}`,
            exerciseId: ex.exerciseId,
            exerciseName,
            type: 'milestone',
            value: set.weight,
            previousValue: highestPastWeight,
            improvement: Math.round((set.weight - highestPastWeight) * 10) / 10,
            achievedAt: currentWorkout.date,
            workoutId: currentWorkout.id,
            repsAtWeight: set.reps,
            unit: preferredUnit,
            milestoneTitle: `${targetKg} ${preferredUnit} MILESTONE`,
          });
          break;
        }
      }

      // D. Bodyweight Multiplier Milestones (e.g. 1.0x, 1.5x, 2.0x bodyweight)
      if (userBodyweightKg && userBodyweightKg > 30) {
        for (const mult of BODYWEIGHT_MULTIPLIERS) {
          const targetWeight = userBodyweightKg * mult;
          const pastMaxMult = highestPastWeight / userBodyweightKg;
          if (set.weight >= targetWeight && pastMaxMult < mult && highestPastWeight > 0) {
            prs.push({
              id: `bw-mult-${ex.exerciseId}-${mult}x-${Date.now()}`,
              exerciseId: ex.exerciseId,
              exerciseName,
              type: 'milestone',
              value: set.weight,
              previousValue: highestPastWeight,
              improvement: Math.round((set.weight - highestPastWeight) * 10) / 10,
              bodyweightMultiplier: mult,
              achievedAt: currentWorkout.date,
              workoutId: currentWorkout.id,
              repsAtWeight: set.reps,
              unit: preferredUnit,
              milestoneTitle: `${mult}× BODYWEIGHT MILESTONE`,
            });
            break;
          }
        }
      }
    }
  }

  return prs;
}

/**
 * Format duration in seconds to "HH:MM:SS" or "MM:SS" or "Xh Ym"
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export function formatTimerClock(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate 7-day rolling weight average
 */
export function calculateMovingAverage(data: { date: string; weightKg: number }[], windowDays = 7) {
  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return sorted.map((item, idx) => {
    const windowStart = Math.max(0, idx - windowDays + 1);
    const slice = sorted.slice(windowStart, idx + 1);
    const sum = slice.reduce((acc, curr) => acc + curr.weightKg, 0);
    return {
      date: item.date,
      weightKg: item.weightKg,
      movingAvg: Math.round((sum / slice.length) * 10) / 10,
    };
  });
}
