import React, { useRef, useState } from 'react';
import {
  Award,
  Check,
  ChevronRight,
  Copy,
  Download,
  Share2,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { PersonalRecord } from '../types';
import { useWorkout } from '../context/WorkoutContext';

interface MilestoneCelebrationModalProps {
  pr: PersonalRecord | null;
  onClose: () => void;
  onOpenShareCard: (pr: PersonalRecord) => void;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  pr,
  onClose,
  onOpenShareCard,
}) => {
  if (!pr) return null;

  const isMilestone = pr.type === 'milestone';
  const improvementDisplay = pr.improvement && pr.improvement > 0 ? `+${pr.improvement} ${pr.unit}` : undefined;
  const percentDisplay = pr.percentImprovement ? `+${pr.percentImprovement}%` : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-subtle rounded-3xl w-full max-w-sm shadow-2xl p-6 overflow-hidden text-main text-center relative">
        {/* Subtle decorative glow */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: 'var(--accent)' }}
        />

        {/* Top badge */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-muted">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
            <span>{isMilestone ? 'Strength Milestone' : 'Personal Record'}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-muted hover:text-main">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Trophy Icon */}
        <div
          className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg border border-subtle relative mt-2"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          {isMilestone ? <Award className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
        </div>

        {/* Big PR Metric */}
        <div className="font-display font-black text-4xl sm:text-5xl text-main tracking-tight font-mono-numbers">
          {pr.value} <span className="text-2xl font-bold text-muted">{pr.unit}</span>
        </div>

        {/* Reps if applicable */}
        {pr.repsAtWeight && pr.repsAtWeight > 1 && (
          <div className="text-xs font-mono font-bold text-muted mt-1 uppercase tracking-wider">
            for {pr.repsAtWeight} reps
          </div>
        )}

        {/* Exercise Name */}
        <div className="font-display font-extrabold text-lg text-main uppercase tracking-wide mt-2">
          {pr.exerciseName}
        </div>

        <p className="text-xs text-secondary mt-1 max-w-[240px] mx-auto leading-relaxed">
          {isMilestone
            ? pr.milestoneTitle || "You've broken through a major strength milestone."
            : "You've established a new all-time personal best."}
        </p>

        {/* Comparison card */}
        {(pr.previousValue || pr.improvement) && (
          <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-2xl bg-surface-subtle border border-subtle text-left">
            <div>
              <div className="text-[10px] text-muted font-medium">Previous Best</div>
              <div className="text-xs font-bold font-mono-numbers text-main mt-0.5">
                {pr.previousValue ? `${pr.previousValue} ${pr.unit}` : 'Baseline'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-muted font-medium">Improvement</div>
              <div className="text-xs font-bold font-mono-numbers text-emerald-500 mt-0.5 flex items-center gap-1">
                <span>{improvementDisplay || `+${pr.value} ${pr.unit}`}</span>
                {percentDisplay && <span className="text-[10px] opacity-80 font-normal">({percentDisplay})</span>}
              </div>
            </div>
          </div>
        )}

        {/* ONE PERCENT Philosophy Tagline */}
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-4">
          ONE PERCENT · 1% better every day.
        </div>

        {/* Actions */}
        <div className="space-y-2 mt-5">
          <button
            onClick={() => onOpenShareCard(pr)}
            className="w-full py-3 rounded-2xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Share2 className="w-4 h-4" /> Share Achievement
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-surface-subtle hover:bg-surface border border-subtle text-xs font-bold text-main transition-colors"
          >
            Continue Training
          </button>
        </div>
      </div>
    </div>
  );
};
