import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_EXERCISES } from '../data/exerciseLibrary';
import {
  INITIAL_BODY_MEASUREMENTS,
  INITIAL_BODY_WEIGHTS,
  INITIAL_PROGRAMS,
  INITIAL_ROUTINES,
  INITIAL_USER_PROFILE,
  INITIAL_WORKOUTS,
} from '../data/initialData';
import { applyThemeToDocument, getThemeById, THEMES } from '../data/themes';
import {
  BodyMeasurementLog,
  BodyWeightLog,
  Exercise,
  PersonalRecord,
  Routine,
  SetType,
  SyncStatus,
  UserProfile,
  WorkoutExercise,
  WorkoutProgram,
  WorkoutSession,
  WorkoutSet,
} from '../types';
import {
  calculateEstimated1RM,
  calculateWorkoutTotalSets,
  calculateWorkoutVolume,
  detectPersonalRecords,
} from '../utils/calculations';

interface WorkoutContextType {
  // Data
  workouts: WorkoutSession[];
  activeWorkout: WorkoutSession | null;
  routines: Routine[];
  programs: WorkoutProgram[];
  exercises: Exercise[];
  customExercises: Exercise[];
  bodyWeights: BodyWeightLog[];
  bodyMeasurements: BodyMeasurementLog[];
  userProfile: UserProfile;
  syncStatus: SyncStatus;

  // Active workout actions
  startEmptyWorkout: (customName?: string) => void;
  startWorkoutFromRoutine: (routineId: string) => void;
  discardActiveWorkout: () => void;
  finishActiveWorkout: () => WorkoutSession | null;
  addExerciseToActiveWorkout: (exerciseId: string) => void;
  removeExerciseFromActiveWorkout: (workoutExerciseId: string) => void;
  reorderExercisesInActiveWorkout: (fromIndex: number, toIndex: number) => void;
  addSetToExercise: (workoutExerciseId: string, type?: SetType) => void;
  updateSet: (workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  removeSet: (workoutExerciseId: string, setId: string) => void;
  toggleSetCompleted: (workoutExerciseId: string, setId: string) => void;
  copyPreviousValuesToSet: (workoutExerciseId: string, setId: string) => void;
  updateActiveWorkoutNotes: (notes: string) => void;
  updateActiveWorkoutName: (name: string) => void;
  setExerciseSuperset: (workoutExerciseId: string, supersetId?: string) => void;
  setExerciseNotes: (workoutExerciseId: string, notes: string) => void;

  // Historical workouts
  deleteWorkout: (workoutId: string) => void;
  repeatWorkout: (workoutId: string) => void;

  // Routines & programs
  addRoutine: (routine: Omit<Routine, 'id' | 'updatedAt'>) => Routine;
  updateRoutine: (id: string, routine: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  duplicateRoutine: (id: string) => Routine;

  // Custom exercises
  addCustomExercise: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => Exercise;
  updateCustomExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteCustomExercise: (id: string) => void;
  toggleFavoriteExercise: (id: string) => void;

  // Body metrics
  addBodyWeight: (weightKg: number, notes?: string, date?: string, bodyFatPercent?: number) => void;
  updateBodyWeight: (id: string, updates: Partial<BodyWeightLog>) => void;
  deleteBodyWeight: (id: string) => void;
  addBodyMeasurement: (measurement: Omit<BodyMeasurementLog, 'id'>) => void;
  deleteBodyMeasurement: (id: string) => void;

  // Profile & preferences
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Rest Timer
  restTimer: {
    isActive: boolean;
    totalSeconds: number;
    remainingSeconds: number;
    exerciseName?: string;
  };
  startRestTimer: (seconds: number, exerciseName?: string) => void;
  stopRestTimer: () => void;
  addRestSeconds: (delta: number) => void;

  // Previous performance lookup
  getPreviousPerformance: (exerciseId: string) => {
    lastSets: { weight: number; reps: number; type: SetType }[];
    bestWeight: number;
    best1RM: number;
    totalSessions: number;
  } | null;

  // Summary & Share Modals
  completedWorkoutSummary: WorkoutSession | null;
  closeCompletedSummary: () => void;
  shareModalWorkout: WorkoutSession | null;
  openShareModal: (workout: WorkoutSession) => void;
  closeShareModal: () => void;

  // Theme Switcher Modal & Actions
  isThemeModalOpen: boolean;
  openThemeModal: () => void;
  closeThemeModal: () => void;
  setAppTheme: (themeId: string) => void;

  // Offline & PWA Cache Modal
  isOfflineModalOpen: boolean;
  openOfflineModal: () => void;
  closeOfflineModal: () => void;

  // Milestone Celebration & Share
  milestoneCelebration: PersonalRecord | null;
  triggerMilestoneCelebration: (pr: PersonalRecord) => void;
  closeMilestoneCelebration: () => void;
  milestoneSharePR: PersonalRecord | null;
  openMilestoneShare: (pr: PersonalRecord) => void;
  closeMilestoneShare: () => void;

  // Import / Export
  exportData: (format: 'json' | 'csv') => string;
  importData: (jsonData: string) => { success: boolean; message: string; count?: number };
  resetAllData: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WORKOUTS: 'aerolift_workouts_v1',
  ACTIVE_WORKOUT: 'aerolift_active_workout_v1',
  ROUTINES: 'aerolift_routines_v1',
  PROGRAMS: 'aerolift_programs_v1',
  CUSTOM_EXERCISES: 'aerolift_custom_exercises_v1',
  BODY_WEIGHTS: 'aerolift_body_weights_v1',
  BODY_MEASUREMENTS: 'aerolift_body_measurements_v1',
  USER_PROFILE: 'aerolift_user_profile_v1',
  FAVORITES: 'aerolift_favorites_v1',
};

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with localStorage fallback
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return stored ? JSON.parse(stored) : INITIAL_WORKOUTS;
    } catch {
      return INITIAL_WORKOUTS;
    }
  });

  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      return stored ? JSON.parse(stored) : INITIAL_ROUTINES;
    } catch {
      return INITIAL_ROUTINES;
    }
  });

  const [programs, setPrograms] = useState<WorkoutProgram[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
      return stored ? JSON.parse(stored) : INITIAL_PROGRAMS;
    } catch {
      return INITIAL_PROGRAMS;
    }
  });

  const [customExercises, setCustomExercises] = useState<Exercise[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : ['ex-chest-bench-press', 'ex-leg-barbell-squat', 'ex-back-deadlift'];
    } catch {
      return ['ex-chest-bench-press', 'ex-leg-barbell-squat', 'ex-back-deadlift'];
    }
  });

  const [bodyWeights, setBodyWeights] = useState<BodyWeightLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BODY_WEIGHTS);
      return stored ? JSON.parse(stored) : INITIAL_BODY_WEIGHTS;
    } catch {
      return INITIAL_BODY_WEIGHTS;
    }
  });

  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurementLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BODY_MEASUREMENTS);
      return stored ? JSON.parse(stored) : INITIAL_BODY_MEASUREMENTS;
    } catch {
      return INITIAL_BODY_MEASUREMENTS;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.activeThemeId) {
          parsed.activeThemeId = parsed.themePreference === 'light' ? 'mono-paper' : 'mono-oled';
        }
        return parsed;
      }
      return INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  // Offline / Sync status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced',
    pendingCount: 0,
    lastSyncedAt: new Date().toISOString(),
  });

  // Modals
  const [completedWorkoutSummary, setCompletedWorkoutSummary] = useState<WorkoutSession | null>(null);
  const [shareModalWorkout, setShareModalWorkout] = useState<WorkoutSession | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [milestoneCelebration, setMilestoneCelebration] = useState<PersonalRecord | null>(null);
  const [milestoneSharePR, setMilestoneSharePR] = useState<PersonalRecord | null>(null);

  const openThemeModal = () => setIsThemeModalOpen(true);
  const closeThemeModal = () => setIsThemeModalOpen(false);

  const openOfflineModal = () => setIsOfflineModalOpen(true);
  const closeOfflineModal = () => setIsOfflineModalOpen(false);

  const triggerMilestoneCelebration = (pr: PersonalRecord) => setMilestoneCelebration(pr);
  const closeMilestoneCelebration = () => setMilestoneCelebration(null);

  const openMilestoneShare = (pr: PersonalRecord) => setMilestoneSharePR(pr);
  const closeMilestoneShare = () => setMilestoneSharePR(null);

  const setAppTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    if (theme) {
      setUserProfile((prev) => ({
        ...prev,
        activeThemeId: theme.id,
        themePreference: theme.isDark ? 'dark' : 'light',
        accentColor: theme.palette.accent,
      }));
      applyThemeToDocument(theme);
    }
  };

  // Rest timer
  const [restTimer, setRestTimer] = useState<{
    isActive: boolean;
    totalSeconds: number;
    remainingSeconds: number;
    exerciseName?: string;
  }>({
    isActive: false,
    totalSeconds: 90,
    remainingSeconds: 90,
  });

  const restTimerEndTimestampRef = useRef<number | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aerolift:data-cached', { detail: { type: 'workouts' } }));
      }
    } catch (e) {
      console.error('Failed to persist workouts', e);
    }
  }, [workouts]);

  useEffect(() => {
    try {
      if (activeWorkout) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkout));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aerolift:data-cached', { detail: { type: 'activeWorkout' } }));
      }
    } catch (e) {
      console.error('Failed to persist active workout', e);
    }
  }, [activeWorkout]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aerolift:data-cached', { detail: { type: 'routines' } }));
      }
    } catch (e) {
      console.error('Failed to persist routines', e);
    }
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    } catch (e) {
      console.error('Failed to persist programs', e);
    }
  }, [programs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customExercises));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aerolift:data-cached', { detail: { type: 'customExercises' } }));
      }
    } catch (e) {
      console.error('Failed to persist custom exercises', e);
    }
  }, [customExercises]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteIds));
    } catch (e) {
      console.error('Failed to persist favorites', e);
    }
  }, [favoriteIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BODY_WEIGHTS, JSON.stringify(bodyWeights));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aerolift:data-cached', { detail: { type: 'bodyWeights' } }));
      }
    } catch (e) {
      console.error('Failed to persist body weights', e);
    }
  }, [bodyWeights]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BODY_MEASUREMENTS, JSON.stringify(bodyMeasurements));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aerolift:data-cached', { detail: { type: 'bodyMeasurements' } }));
      }
    } catch (e) {
      console.error('Failed to persist body measurements', e);
    }
  }, [bodyMeasurements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));

      // Resolve and apply registered theme if present
      const targetThemeId =
        userProfile.activeThemeId ||
        (userProfile.themePreference === 'light' ? 'mono-paper' : 'mono-oled');
      const registeredTheme = THEMES.find((t) => t.id === targetThemeId);

      if (registeredTheme && userProfile.activeThemeId !== 'custom') {
        applyThemeToDocument(registeredTheme);
      } else {
        const isDark =
          userProfile.themePreference === 'dark' ||
          (userProfile.themePreference === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        const { accent, text, isMono } = getEffectiveAccent(userProfile.accentColor || '#ffffff', isDark);
        document.documentElement.style.setProperty('--accent', accent);
        document.documentElement.style.setProperty('--accent-text', text);
        document.documentElement.style.setProperty(
          '--accent-hover',
          adjustColorLuminance(accent, isDark ? -0.15 : 0.15)
        );
        document.documentElement.style.setProperty(
          '--accent-subtle',
          isMono
            ? isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(9, 9, 11, 0.08)'
            : `${accent}25`
        );
        document.documentElement.style.setProperty(
          '--accent-ring',
          isMono
            ? isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(9, 9, 11, 0.2)'
            : `${accent}50`
        );
      }
    } catch (e) {
      console.error('Failed to persist user profile', e);
    }
  }, [userProfile]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus({
        state: 'syncing',
        pendingCount: 0,
        lastSyncedAt: new Date().toISOString(),
      });
      setTimeout(() => {
        setSyncStatus({
          state: 'synced',
          pendingCount: 0,
          lastSyncedAt: new Date().toISOString(),
        });
      }, 1000);
    };

    const handleOffline = () => {
      setSyncStatus((prev) => ({
        ...prev,
        state: 'offline',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Rest timer interval with timestamp delta for background tab accuracy
  useEffect(() => {
    if (!restTimer.isActive) return;

    const interval = setInterval(() => {
      if (!restTimerEndTimestampRef.current) return;
      const now = Date.now();
      const diffMs = restTimerEndTimestampRef.current - now;
      const remaining = Math.max(0, Math.ceil(diffMs / 1000));

      if (remaining <= 0) {
        setRestTimer((prev) => ({ ...prev, isActive: false, remainingSeconds: 0 }));
        restTimerEndTimestampRef.current = null;
        // Vibration and audio beep feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        playBeepSound();
      } else {
        setRestTimer((prev) => ({ ...prev, remainingSeconds: remaining }));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [restTimer.isActive]);

  // Active workout elapsed duration ticker
  useEffect(() => {
    if (!activeWorkout) return;

    const interval = setInterval(() => {
      setActiveWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          durationSeconds: prev.durationSeconds + 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout ? activeWorkout.id : null]);

  // Combined exercises
  const exercises = useMemo(() => {
    const customWithFlag = customExercises.map((e) => ({
      ...e,
      isCustom: true,
      isFavorite: favoriteIds.includes(e.id),
    }));
    const initialWithFav = INITIAL_EXERCISES.map((e) => ({
      ...e,
      isFavorite: favoriteIds.includes(e.id),
    }));
    return [...customWithFlag, ...initialWithFav];
  }, [customExercises, favoriteIds]);

  const exerciseMap = useMemo(() => {
    const map = new Map<string, Exercise>();
    exercises.forEach((ex) => map.set(ex.id, ex));
    return map;
  }, [exercises]);

  // Rest timer triggers
  const startRestTimer = (seconds: number, exerciseName?: string) => {
    const target = Date.now() + seconds * 1000;
    restTimerEndTimestampRef.current = target;
    setRestTimer({
      isActive: true,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      exerciseName,
    });
  };

  const stopRestTimer = () => {
    restTimerEndTimestampRef.current = null;
    setRestTimer((prev) => ({ ...prev, isActive: false }));
  };

  const addRestSeconds = (delta: number) => {
    if (!restTimerEndTimestampRef.current) return;
    const newTarget = restTimerEndTimestampRef.current + delta * 1000;
    restTimerEndTimestampRef.current = newTarget;
    setRestTimer((prev) => ({
      ...prev,
      totalSeconds: Math.max(10, prev.totalSeconds + delta),
      remainingSeconds: Math.max(0, prev.remainingSeconds + delta),
    }));
  };

  // Previous performance lookup helper
  const getPreviousPerformance = (exerciseId: string) => {
    const completedPastWorkouts = workouts.filter((w) => w.isCompleted);
    // Find all workouts containing this exercise, sorted newest first
    const sessionsWithExercise: WorkoutSession[] = [];
    for (const w of completedPastWorkouts) {
      if (w.exercises.some((e) => e.exerciseId === exerciseId)) {
        sessionsWithExercise.push(w);
      }
    }

    if (sessionsWithExercise.length === 0) return null;

    // Most recent session
    const latestWorkout = sessionsWithExercise[0];
    const latestExercise = latestWorkout.exercises.find((e) => e.exerciseId === exerciseId);
    if (!latestExercise) return null;

    const lastSets = latestExercise.sets
      .filter((s) => s.isCompleted)
      .map((s) => ({ weight: s.weight, reps: s.reps, type: s.type }));

    // Find best weight and best 1RM
    let bestWeight = 0;
    let best1RM = 0;

    sessionsWithExercise.forEach((w) => {
      w.exercises
        .filter((e) => e.exerciseId === exerciseId)
        .forEach((e) => {
          e.sets
            .filter((s) => s.isCompleted)
            .forEach((s) => {
              if (s.weight > bestWeight) bestWeight = s.weight;
              const rm = calculateEstimated1RM(s.weight, s.reps, userProfile.rmFormula);
              if (rm > best1RM) best1RM = rm;
            });
        });
    });

    return {
      lastSets,
      bestWeight,
      best1RM,
      totalSessions: sessionsWithExercise.length,
    };
  };

  // Workout Actions
  const startEmptyWorkout = (customName?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newWorkout: WorkoutSession = {
      id: `workout-${Date.now()}`,
      name: customName || 'Quick Workout',
      date: today,
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      exercises: [],
      volumeTotal: 0,
      totalSets: 0,
      prsAchieved: [],
      isCompleted: false,
    };
    setActiveWorkout(newWorkout);
  };

  const startWorkoutFromRoutine = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const today = new Date().toISOString().split('T')[0];
    const workoutExercises: WorkoutExercise[] = routine.exercises.map((re, index) => {
      const prev = getPreviousPerformance(re.exerciseId);
      const sets: WorkoutSet[] = [];

      for (let s = 1; s <= re.targetSets; s++) {
        const prevSet = prev?.lastSets[s - 1] || prev?.lastSets[0];
        sets.push({
          id: `set-${Date.now()}-${index}-${s}`,
          setNumber: s,
          type: 'normal',
          weight: prevSet?.weight || 0,
          reps: prevSet?.reps || parseInt(re.targetReps.split('-')[0], 10) || 10,
          isCompleted: false,
          previousWeight: prevSet?.weight,
          previousReps: prevSet?.reps,
          rpe: re.targetRpe,
        });
      }

      return {
        id: `we-${Date.now()}-${index}`,
        exerciseId: re.exerciseId,
        sets,
        supersetId: re.supersetId,
        notes: re.notes,
        restTimeSeconds: re.defaultRestSeconds,
      };
    });

    const newWorkout: WorkoutSession = {
      id: `workout-${Date.now()}`,
      name: routine.name,
      date: today,
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      exercises: workoutExercises,
      routineId: routine.id,
      volumeTotal: 0,
      totalSets: 0,
      prsAchieved: [],
      isCompleted: false,
    };

    setActiveWorkout(newWorkout);
  };

  const addExerciseToActiveWorkout = (exerciseId: string) => {
    if (!activeWorkout) return;
    const prev = getPreviousPerformance(exerciseId);
    const exerciseDef = exerciseMap.get(exerciseId);
    const defaultWeight = prev?.lastSets[0]?.weight || 0;
    const defaultReps = prev?.lastSets[0]?.reps || 10;

    const newExercise: WorkoutExercise = {
      id: `we-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseId,
      sets: [
        {
          id: `set-${Date.now()}-1`,
          setNumber: 1,
          type: 'normal',
          weight: defaultWeight,
          reps: defaultReps,
          isCompleted: false,
          previousWeight: defaultWeight,
          previousReps: defaultReps,
        },
      ],
      restTimeSeconds: userProfile.defaultRestSeconds,
    };

    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newExercise],
    });
  };

  const removeExerciseFromActiveWorkout = (workoutExerciseId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter((e) => e.id !== workoutExerciseId),
    });
  };

  const reorderExercisesInActiveWorkout = (fromIndex: number, toIndex: number) => {
    if (!activeWorkout) return;
    const updated = [...activeWorkout.exercises];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setActiveWorkout({ ...activeWorkout, exercises: updated });
  };

  const addSetToExercise = (workoutExerciseId: string, type: SetType = 'normal') => {
    if (!activeWorkout) return;
    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id !== workoutExerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSetNumber = ex.sets.length + 1;
      const newSet: WorkoutSet = {
        id: `set-${Date.now()}-${newSetNumber}`,
        setNumber: newSetNumber,
        type,
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 10,
        isCompleted: false,
        previousWeight: lastSet?.previousWeight,
        previousReps: lastSet?.previousReps,
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    });

    setActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  const updateSet = (
    workoutExerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ) => {
    if (!activeWorkout) return;
    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id !== workoutExerciseId) return ex;
      const updatedSets = ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s));
      return { ...ex, sets: updatedSets };
    });

    setActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  const removeSet = (workoutExerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id !== workoutExerciseId) return ex;
      const remainingSets = ex.sets
        .filter((s) => s.id !== setId)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return { ...ex, sets: remainingSets };
    });

    setActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  const toggleSetCompleted = (workoutExerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    let autoRestSeconds = userProfile.defaultRestSeconds;
    let exerciseName = '';

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id !== workoutExerciseId) return ex;
      const exerciseDef = exerciseMap.get(ex.exerciseId);
      exerciseName = exerciseDef?.name || 'Set';
      if (ex.restTimeSeconds) autoRestSeconds = ex.restTimeSeconds;

      const updatedSets = ex.sets.map((s) => {
        if (s.id === setId) {
          const nextState = !s.isCompleted;
          if (nextState) {
            if (userProfile.autoStartRestTimer) {
              startRestTimer(autoRestSeconds, exerciseName);
            }

            // Real-time PR / Milestone detection on set completion
            if (s.weight > 0 && s.reps > 0) {
              const prev = getPreviousPerformance(ex.exerciseId);
              if (prev && prev.bestWeight > 0 && s.weight > prev.bestWeight) {
                const diff = Math.round((s.weight - prev.bestWeight) * 10) / 10;
                const isLandmark = s.weight >= 100 || s.weight % 20 === 0 || diff >= 5;
                triggerMilestoneCelebration({
                  id: `pr-live-${Date.now()}`,
                  exerciseId: ex.exerciseId,
                  exerciseName,
                  type: isLandmark ? 'milestone' : 'weight',
                  value: s.weight,
                  previousValue: prev.bestWeight,
                  improvement: diff,
                  percentImprovement: Math.round((diff / prev.bestWeight) * 1000) / 10,
                  achievedAt: activeWorkout.date,
                  workoutId: activeWorkout.id,
                  repsAtWeight: s.reps,
                  unit: userProfile.unitPreference,
                  milestoneTitle: isLandmark
                    ? `${s.weight} ${userProfile.unitPreference} MILESTONE`
                    : `${s.weight} ${userProfile.unitPreference} PR`,
                });
              }
            }
          }
          return { ...s, isCompleted: nextState };
        }
        return s;
      });
      return { ...ex, sets: updatedSets };
    });

    setActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  const copyPreviousValuesToSet = (workoutExerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id !== workoutExerciseId) return ex;
      const updatedSets = ex.sets.map((s) => {
        if (s.id === setId && s.previousWeight !== undefined && s.previousReps !== undefined) {
          return {
            ...s,
            weight: s.previousWeight,
            reps: s.previousReps,
          };
        }
        return s;
      });
      return { ...ex, sets: updatedSets };
    });

    setActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  const updateActiveWorkoutNotes = (notes: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({ ...activeWorkout, notes });
  };

  const updateActiveWorkoutName = (name: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({ ...activeWorkout, name });
  };

  const setExerciseSuperset = (workoutExerciseId: string, supersetId?: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((ex) =>
        ex.id === workoutExerciseId ? { ...ex, supersetId } : ex
      ),
    });
  };

  const setExerciseNotes = (workoutExerciseId: string, notes: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((ex) =>
        ex.id === workoutExerciseId ? { ...ex, notes } : ex
      ),
    });
  };

  const discardActiveWorkout = () => {
    stopRestTimer();
    setActiveWorkout(null);
  };

  const finishActiveWorkout = (): WorkoutSession | null => {
    if (!activeWorkout) return null;

    stopRestTimer();

    // Clean up empty sets: only keep exercises with completed sets, or sets that have weight/reps
    const cleanedExercises = activeWorkout.exercises
      .map((ex) => ({
        ...ex,
        sets: ex.sets.filter((s) => s.isCompleted || (s.weight > 0 && s.reps > 0)),
      }))
      .filter((ex) => ex.sets.length > 0);

    const volumeTotal = calculateWorkoutVolume(cleanedExercises);
    const totalSets = calculateWorkoutTotalSets(cleanedExercises);

    const finalSession: WorkoutSession = {
      ...activeWorkout,
      endTime: new Date().toISOString(),
      exercises: cleanedExercises,
      volumeTotal,
      totalSets,
      isCompleted: true,
      prsAchieved: [],
    };

    const latestWeight =
      bodyWeights.length > 0
        ? [...bodyWeights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.weightKg
        : undefined;

    // Detect PRs & milestones
    const prs = detectPersonalRecords(
      finalSession,
      workouts,
      exerciseMap,
      userProfile.rmFormula,
      userProfile.unitPreference,
      latestWeight
    );
    finalSession.prsAchieved = prs;

    // Trigger celebratory confetti if PR achieved or good volume
    try {
      confetti({
        particleCount: prs.length > 0 ? 120 : 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: [userProfile.accentColor, '#38bdf8', '#34d399', '#fbbf24'],
      });
    } catch {
      // Ignore if in headless environment
    }

    // Prepend to workouts
    setWorkouts([finalSession, ...workouts]);
    setActiveWorkout(null);

    // Open summary dialog
    setCompletedWorkoutSummary(finalSession);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('aerolift:workout-finished', {
          detail: { name: finalSession.name },
        })
      );
    }

    return finalSession;
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkouts(workouts.filter((w) => w.id !== workoutId));
  };

  const repeatWorkout = (workoutId: string) => {
    const historical = workouts.find((w) => w.id === workoutId);
    if (!historical) return;

    const today = new Date().toISOString().split('T')[0];
    const repeatedExercises: WorkoutExercise[] = historical.exercises.map((ex, exIdx) => {
      const sets: WorkoutSet[] = ex.sets.map((s, sIdx) => ({
        id: `set-${Date.now()}-${exIdx}-${sIdx}`,
        setNumber: sIdx + 1,
        type: s.type,
        weight: s.weight,
        reps: s.reps,
        isCompleted: false,
        previousWeight: s.weight,
        previousReps: s.reps,
        rpe: s.rpe,
      }));

      return {
        id: `we-${Date.now()}-${exIdx}`,
        exerciseId: ex.exerciseId,
        sets,
        supersetId: ex.supersetId,
        notes: ex.notes,
        restTimeSeconds: ex.restTimeSeconds || userProfile.defaultRestSeconds,
      };
    });

    const newWorkout: WorkoutSession = {
      id: `workout-${Date.now()}`,
      name: historical.name,
      date: today,
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      exercises: repeatedExercises,
      routineId: historical.routineId,
      volumeTotal: 0,
      totalSets: 0,
      prsAchieved: [],
      isCompleted: false,
    };

    setActiveWorkout(newWorkout);
  };

  // Routine management
  const addRoutine = (routineData: Omit<Routine, 'id' | 'updatedAt'>): Routine => {
    const newRoutine: Routine = {
      ...routineData,
      id: `routine-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setRoutines([...routines, newRoutine]);
    return newRoutine;
  };

  const updateRoutine = (id: string, updates: Partial<Routine>) => {
    setRoutines(
      routines.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      )
    );
  };

  const deleteRoutine = (id: string) => {
    setRoutines(routines.filter((r) => r.id !== id));
  };

  const duplicateRoutine = (id: string): Routine => {
    const orig = routines.find((r) => r.id === id);
    if (!orig) throw new Error('Routine not found');
    const dup: Routine = {
      ...orig,
      id: `routine-${Date.now()}`,
      name: `${orig.name} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    setRoutines([...routines, dup]);
    return dup;
  };

  // Custom exercise management
  const addCustomExercise = (exData: Omit<Exercise, 'id' | 'isCustom'>): Exercise => {
    const newEx: Exercise = {
      ...exData,
      id: `cust-ex-${Date.now()}`,
      isCustom: true,
    };
    setCustomExercises([...customExercises, newEx]);
    return newEx;
  };

  const updateCustomExercise = (id: string, updates: Partial<Exercise>) => {
    setCustomExercises(customExercises.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteCustomExercise = (id: string) => {
    setCustomExercises(customExercises.filter((e) => e.id !== id));
  };

  const toggleFavoriteExercise = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Body metrics
  const addBodyWeight = (
    weightKg: number,
    notes?: string,
    date?: string,
    bodyFatPercent?: number
  ) => {
    const logDate = date || new Date().toISOString().split('T')[0];
    const newLog: BodyWeightLog = {
      id: `bw-${Date.now()}`,
      date: logDate,
      weightKg,
      notes,
      bodyFatPercent:
        bodyFatPercent !== undefined && !isNaN(bodyFatPercent) ? bodyFatPercent : undefined,
    };
    setBodyWeights([...bodyWeights, newLog]);
  };

  const updateBodyWeight = (id: string, updates: Partial<BodyWeightLog>) => {
    setBodyWeights(bodyWeights.map((bw) => (bw.id === id ? { ...bw, ...updates } : bw)));
  };

  const deleteBodyWeight = (id: string) => {
    setBodyWeights(bodyWeights.filter((bw) => bw.id !== id));
  };

  const addBodyMeasurement = (measData: Omit<BodyMeasurementLog, 'id'>) => {
    const newLog: BodyMeasurementLog = {
      ...measData,
      id: `bm-${Date.now()}`,
    };
    setBodyMeasurements([...bodyMeasurements, newLog]);
  };

  const deleteBodyMeasurement = (id: string) => {
    setBodyMeasurements(bodyMeasurements.filter((bm) => bm.id !== id));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  // Modals
  const closeCompletedSummary = () => setCompletedWorkoutSummary(null);
  const openShareModal = (workout: WorkoutSession) => setShareModalWorkout(workout);
  const closeShareModal = () => setShareModalWorkout(null);

  // Export / Import
  const exportData = (format: 'json' | 'csv'): string => {
    const exportBundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      userProfile,
      workouts,
      routines,
      customExercises,
      bodyWeights,
      bodyMeasurements,
    };

    if (format === 'json') {
      return JSON.stringify(exportBundle, null, 2);
    }

    // CSV format for workout logs
    const headers = [
      'WorkoutDate',
      'WorkoutName',
      'DurationMinutes',
      'ExerciseName',
      'SetNumber',
      'SetType',
      'WeightKg',
      'Reps',
      'RPE',
      'VolumeKg',
    ];
    const rows: string[] = [headers.join(',')];

    workouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        const exDef = exerciseMap.get(ex.exerciseId);
        const exName = (exDef?.name || 'Exercise').replace(/,/g, '');
        ex.sets.forEach((s) => {
          rows.push(
            [
              w.date,
              `"${w.name.replace(/"/g, '""')}"`,
              Math.round(w.durationSeconds / 60),
              `"${exName}"`,
              s.setNumber,
              s.type,
              s.weight,
              s.reps,
              s.rpe || '',
              s.weight * s.reps,
            ].join(',')
          );
        });
      });
    });

    return rows.join('\n');
  };

  const importData = (jsonData: string): { success: boolean; message: string; count?: number } => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid JSON format.' };
      }

      let count = 0;
      if (Array.isArray(parsed.workouts)) {
        setWorkouts(parsed.workouts);
        count += parsed.workouts.length;
      }
      if (Array.isArray(parsed.routines)) {
        setRoutines(parsed.routines);
        count += parsed.routines.length;
      }
      if (Array.isArray(parsed.customExercises)) {
        setCustomExercises(parsed.customExercises);
        count += parsed.customExercises.length;
      }
      if (Array.isArray(parsed.bodyWeights)) {
        setBodyWeights(parsed.bodyWeights);
        count += parsed.bodyWeights.length;
      }
      if (Array.isArray(parsed.bodyMeasurements)) {
        setBodyMeasurements(parsed.bodyMeasurements);
        count += parsed.bodyMeasurements.length;
      }
      if (parsed.userProfile && typeof parsed.userProfile === 'object') {
        setUserProfile(parsed.userProfile);
      }

      return {
        success: true,
        message: `Successfully restored ${count} total records.`,
        count,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown parse error';
      return { success: false, message: `Failed to import data: ${msg}` };
    }
  };

  const resetAllData = () => {
    localStorage.clear();
    setWorkouts(INITIAL_WORKOUTS);
    setActiveWorkout(null);
    setRoutines(INITIAL_ROUTINES);
    setPrograms(INITIAL_PROGRAMS);
    setCustomExercises([]);
    setBodyWeights(INITIAL_BODY_WEIGHTS);
    setBodyMeasurements(INITIAL_BODY_MEASUREMENTS);
    setUserProfile(INITIAL_USER_PROFILE);
    setFavoriteIds(['ex-chest-bench-press', 'ex-leg-barbell-squat', 'ex-back-deadlift']);
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        activeWorkout,
        routines,
        programs,
        exercises,
        customExercises,
        bodyWeights,
        bodyMeasurements,
        userProfile,
        syncStatus,

        startEmptyWorkout,
        startWorkoutFromRoutine,
        discardActiveWorkout,
        finishActiveWorkout,
        addExerciseToActiveWorkout,
        removeExerciseFromActiveWorkout,
        reorderExercisesInActiveWorkout,
        addSetToExercise,
        updateSet,
        removeSet,
        toggleSetCompleted,
        copyPreviousValuesToSet,
        updateActiveWorkoutNotes,
        updateActiveWorkoutName,
        setExerciseSuperset,
        setExerciseNotes,

        deleteWorkout,
        repeatWorkout,

        addRoutine,
        updateRoutine,
        deleteRoutine,
        duplicateRoutine,

        addCustomExercise,
        updateCustomExercise,
        deleteCustomExercise,
        toggleFavoriteExercise,

        addBodyWeight,
        updateBodyWeight,
        deleteBodyWeight,
        addBodyMeasurement,
        deleteBodyMeasurement,

        updateUserProfile,

        restTimer,
        startRestTimer,
        stopRestTimer,
        addRestSeconds,

        getPreviousPerformance,

        completedWorkoutSummary,
        closeCompletedSummary,
        shareModalWorkout,
        openShareModal,
        closeShareModal,

        isThemeModalOpen,
        openThemeModal,
        closeThemeModal,
        setAppTheme,

        isOfflineModalOpen,
        openOfflineModal,
        closeOfflineModal,

        milestoneCelebration,
        triggerMilestoneCelebration,
        closeMilestoneCelebration,
        milestoneSharePR,
        openMilestoneShare,
        closeMilestoneShare,

        exportData,
        importData,
        resetAllData,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

// Helper function to resolve monochrome & contrast for minimal design
function getEffectiveAccent(accent: string, isDark: boolean): { accent: string; text: string; isMono: boolean } {
  const norm = accent.toLowerCase().trim();
  const isMono = norm === '#ffffff' || norm === '#09090b' || norm === '#000000' || norm === '#18181b' || norm === '#f4f4f5' || norm === '#111827';

  if (isMono) {
    if (isDark) {
      return { accent: '#ffffff', text: '#09090b', isMono: true };
    } else {
      return { accent: '#09090b', text: '#ffffff', isMono: true };
    }
  }

  // Calculate luminance for custom/color accents
  const cleanHex = norm.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  const text = yiq >= 160 ? '#09090b' : '#ffffff';

  return { accent, text, isMono: false };
}

// Helper function to darken/lighten hex for hover states
function adjustColorLuminance(hex: string, lum: number): string {
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  let rgb = '#';
  for (let i = 0; i < 3; i++) {
    let c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255));
    const str = c.toString(16);
    rgb += ('00' + str).substr(str.length);
  }
  return rgb;
}

// Simple synthesizer beep for rest timer completion
function playBeepSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio might be blocked if user hasn't interacted
  }
}
