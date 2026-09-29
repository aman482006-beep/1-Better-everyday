import React from 'react';
import { Award, Check, Clock, Dumbbell, Flame, HardDrive, Share2, ShieldCheck, Trophy, X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutSession } from '../types';
import { formatDuration } from '../utils/calculations';

interface WorkoutCompleteModalProps {
  workout: WorkoutSession | null;
  onClose: () => void;
  onOpenShare: (workout: WorkoutSession) => void;
}

export const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
  workout,
  onClose,
  onOpenShare,
}) => {
  const { userProfile, exercises } = useWorkout();

  if (!workout) return null;

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-subtle rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-main transition-colors">
        {/* Header Hero Banner */}
        <div className="p-6 text-center border-b border-subtle bg-surface-subtle relative">
          <div
            className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-3 shadow-md border border-subtle"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Trophy className="w-8 h-8" />
          </div>
          <div className="text-[11px] uppercase tracking-widest text-muted font-bold">
            Workout Completed
          </div>
          <h2 className="text-xl font-extrabold text-main font-display mt-0.5">
            {workout.name}
          </h2>
          <div className="text-xs text-muted mt-1">
            Logged on {workout.date} · Great session!
          </div>
        </div>

        {/* Core Stats Overview */}
        <div className="p-4 grid grid-cols-3 gap-2 bg-surface-subtle/50 border-b border-subtle text-center">
          <div className="p-2.5 rounded-2xl bg-surface border border-subtle">
            <div className="text-[10px] text-muted font-medium">Volume</div>
            <div className="text-base font-bold font-mono-numbers text-main mt-0.5">
              {workout.volumeTotal.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted">{userProfile.unitPreference}</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-surface border border-subtle">
            <div className="text-[10px] text-muted font-medium">Duration</div>
            <div className="text-base font-bold font-mono-numbers text-main mt-0.5">
              {formatDuration(workout.durationSeconds)}
            </div>
            <div className="text-[10px] text-muted">Time</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-surface border border-subtle">
            <div className="text-[10px] text-muted font-medium">Total Sets</div>
            <div className="text-base font-bold font-mono-numbers text-main mt-0.5">
              {workout.totalSets}
            </div>
            <div className="text-[10px] text-muted">{workout.exercises.length} Exercises</div>
          </div>
        </div>

        {/* PR Celebrations if any */}
        {workout.prsAchieved.length > 0 && (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 mb-2">
              <Award className="w-4 h-4 fill-current" />
              <span>
                {workout.prsAchieved.length} Personal Record
                {workout.prsAchieved.length > 1 ? 's' : ''} Broken!
              </span>
            </div>
            <div className="space-y-1.5">
              {workout.prsAchieved.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between text-xs bg-surface border border-amber-500/30 p-2.5 rounded-xl shadow-sm"
                >
                  <span className="font-semibold text-main">{pr.exerciseName}</span>
                  <span className="font-bold font-mono-numbers text-amber-500">
                    {pr.value} {pr.unit} {pr.type === '1rm' ? '(1RM)' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercises Scroll list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">
            Exercises Breakdown
          </div>
          {workout.exercises.map((ex) => {
            const def = exerciseMap.get(ex.exerciseId);
            const completedSets = ex.sets.filter((s) => s.isCompleted);
            return (
              <div
                key={ex.id}
                className="bg-surface-subtle border border-subtle rounded-xl p-2.5 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-main">{def?.name || 'Exercise'}</div>
                  <div className="text-[11px] text-muted mt-0.5 font-mono-numbers">
                    {completedSets.length} sets completed
                  </div>
                </div>
                <div className="text-right font-mono-numbers text-xs text-secondary font-medium">
                  {completedSets.map((s) => `${s.weight}×${s.reps}`).join(', ')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Offline Cache Assurance */}
        <div className="px-4 py-2 bg-surface-subtle/40 border-t border-subtle flex items-center justify-center gap-1.5 text-[11px] text-emerald-500 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Workout cached &amp; ready for offline gym tracking</span>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-subtle bg-surface flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenShare(workout);
            }}
            className="flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Share2 className="w-4 h-4" /> Share Workout
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-surface-subtle hover:bg-surface border border-subtle text-xs sm:text-sm font-semibold text-main transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
