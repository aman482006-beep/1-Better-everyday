import React, { useRef, useState } from 'react';
import {
  Award,
  Check,
  Clock,
  Copy,
  Download,
  Dumbbell,
  Facebook,
  Flame,
  Instagram,
  Share2,
  Twitter,
  X,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutSession } from '../types';
import { formatDuration } from '../utils/calculations';

interface SocialShareModalProps {
  workout: WorkoutSession | null;
  onClose: () => void;
}

type CardFormat = 'story' | 'square' | 'wide';
type CardTheme = 'mono-dark' | 'mono-light' | 'carbon' | 'crimson' | 'emerald' | 'amber';

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ workout, onClose }) => {
  const { exercises, userProfile } = useWorkout();
  const cardRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<CardFormat>('story');
  const [theme, setTheme] = useState<CardTheme>(userProfile.themePreference === 'light' ? 'mono-light' : 'mono-dark');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!workout) return null;

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  // Compose text summary
  const topExercises = workout.exercises.slice(0, 4).map((ex) => {
    const def = exerciseMap.get(ex.exerciseId);
    const topSet = [...ex.sets].sort((a, b) => b.weight - a.weight)[0];
    return `${def?.name || 'Exercise'} (${topSet ? `${topSet.weight}${userProfile.unitPreference} × ${topSet.reps}` : ''})`;
  });

  const prsText =
    workout.prsAchieved.length > 0
      ? ` 🏆 ${workout.prsAchieved.length} new PR${workout.prsAchieved.length > 1 ? 's' : ''}!`
      : '';

  const shareSummaryText = `💪 Just crushed ${workout.name} on AeroLift!\n📊 Total Volume: ${workout.volumeTotal.toLocaleString()} ${userProfile.unitPreference} | ⏱️ Duration: ${formatDuration(workout.durationSeconds)}${prsText}\n🔥 Top lifts: ${topExercises.join(', ')}`;

  // Web Share API
  const handleNativeShare = async () => {
    try {
      if (cardRef.current && navigator.share) {
        setIsGenerating(true);
        const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `workout-${workout.date}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Workout Completed: ${workout.name}`,
            text: shareSummaryText,
            files: [file],
          });
          setIsGenerating(false);
          return;
        }
      }

      // Fallback text share
      if (navigator.share) {
        await navigator.share({
          title: `Workout Completed: ${workout.name}`,
          text: shareSummaryText,
        });
      } else {
        await navigator.clipboard.writeText(shareSummaryText);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      }
    } catch (err) {
      console.log('Share canceled or not supported', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download image directly
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `AeroLift-${workout.name.replace(/\s+/g, '-')}-${workout.date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Twitter / X share
  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareSummaryText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  // Facebook share
  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(shareSummaryText)}`, '_blank');
  };

  // Copy text to clipboard
  const handleCopyText = async () => {
    await navigator.clipboard.writeText(shareSummaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Visual card theme classes
  const themeStyles: Record<
    CardTheme,
    {
      bg: string;
      border: string;
      accentBadge: string;
      textHighlight: string;
      textColor: string;
      textMuted: string;
      cardBg: string;
      cardBorder: string;
      titleColor: string;
      pillColor: string;
    }
  > = {
    'mono-dark': {
      bg: 'bg-black',
      border: 'border-neutral-800',
      accentBadge: 'bg-white text-black',
      textHighlight: 'text-white',
      textColor: 'text-neutral-200',
      textMuted: 'text-neutral-400',
      cardBg: 'bg-neutral-900/90',
      cardBorder: 'border-neutral-800',
      titleColor: 'text-white',
      pillColor: '#000000',
    },
    'mono-light': {
      bg: 'bg-white',
      border: 'border-neutral-300',
      accentBadge: 'bg-black text-white',
      textHighlight: 'text-black font-black',
      textColor: 'text-neutral-800',
      textMuted: 'text-neutral-500',
      cardBg: 'bg-neutral-100',
      cardBorder: 'border-neutral-200',
      titleColor: 'text-neutral-950',
      pillColor: '#ffffff',
    },
    carbon: {
      bg: 'bg-gradient-to-b from-slate-900 via-slate-950 to-black',
      border: 'border-slate-800',
      accentBadge: 'bg-blue-600 text-white',
      textHighlight: 'text-blue-400',
      textColor: 'text-slate-100',
      textMuted: 'text-slate-400',
      cardBg: 'bg-slate-900/60',
      cardBorder: 'border-slate-800/80',
      titleColor: 'text-white',
      pillColor: '#1e293b',
    },
    crimson: {
      bg: 'bg-gradient-to-b from-stone-900 via-stone-950 to-black',
      border: 'border-stone-800',
      accentBadge: 'bg-red-600 text-white',
      textHighlight: 'text-red-400',
      textColor: 'text-stone-100',
      textMuted: 'text-stone-400',
      cardBg: 'bg-stone-900/60',
      cardBorder: 'border-stone-800/80',
      titleColor: 'text-white',
      pillColor: '#dc2626',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-black',
      border: 'border-emerald-800/60',
      accentBadge: 'bg-emerald-600 text-white',
      textHighlight: 'text-emerald-400',
      textColor: 'text-slate-100',
      textMuted: 'text-slate-400',
      cardBg: 'bg-slate-900/60',
      cardBorder: 'border-slate-800/80',
      titleColor: 'text-white',
      pillColor: '#059669',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-950 via-slate-900 to-black',
      border: 'border-amber-800/60',
      accentBadge: 'bg-amber-600 text-white',
      textHighlight: 'text-amber-400',
      textColor: 'text-slate-100',
      textMuted: 'text-slate-400',
      cardBg: 'bg-slate-900/60',
      cardBorder: 'border-slate-800/80',
      titleColor: 'text-white',
      pillColor: '#d97706',
    },
  };

  const selectedTheme = themeStyles[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col my-auto max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-display">Share Workout</h2>
              <div className="text-xs text-slate-400">Generate high-res social media card</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Options Selector */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-2">
          {/* Format selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setFormat('story')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                format === 'story' ? 'bg-slate-900 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Story 9:16
            </button>
            <button
              onClick={() => setFormat('square')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                format === 'square' ? 'bg-slate-900 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Post 1:1
            </button>
            <button
              onClick={() => setFormat('wide')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                format === 'wide' ? 'bg-slate-900 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wide 16:9
            </button>
          </div>

          {/* Theme selector */}
          <div className="flex items-center gap-1.5">
            {(['mono-dark', 'mono-light', 'carbon', 'crimson', 'emerald', 'amber'] as CardTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-6 h-6 rounded-full border-2 transition-transform shadow-xs ${
                  theme === t ? 'scale-110 border-white ring-1 ring-white/50' : 'border-neutral-700 opacity-70'
                }`}
                style={{
                  backgroundColor: themeStyles[t].pillColor,
                }}
                title={`Theme: ${t}`}
              />
            ))}
          </div>
        </div>

        {/* Card Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-slate-950/60">
          <div
            ref={cardRef}
            className={`${selectedTheme.bg} border ${selectedTheme.border} ${selectedTheme.textColor} rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all ${
              format === 'story'
                ? 'w-[290px] min-h-[500px]'
                : format === 'square'
                ? 'w-[320px] min-h-[320px]'
                : 'w-[360px] min-h-[220px]'
            }`}
          >
            {/* Top Brand Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${selectedTheme.accentBadge}`}
                >
                  ▲
                </div>
                <span className={`font-display font-black text-xs tracking-wider ${selectedTheme.textColor}`}>
                  AEROLIFT<span className={selectedTheme.textHighlight}>.PRO</span>
                </span>
              </div>
              <span className={`text-[11px] font-mono-numbers ${selectedTheme.textMuted}`}>
                {workout.date}
              </span>
            </div>

            {/* Workout Title & PR Banner */}
            <div className="my-4">
              <div className={`text-[10px] uppercase font-bold tracking-widest ${selectedTheme.textMuted}`}>
                Workout Session
              </div>
              <h1 className={`font-display font-extrabold text-xl ${selectedTheme.titleColor} mt-0.5 leading-tight`}>
                {workout.name}
              </h1>

              {workout.prsAchieved.length > 0 && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                  <Award className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {workout.prsAchieved.length} Personal Record
                    {workout.prsAchieved.length > 1 ? 's' : ''}!
                  </span>
                </div>
              )}
            </div>

            {/* Core Stats Row */}
            <div className={`grid grid-cols-3 gap-2 my-2 ${selectedTheme.cardBg} rounded-2xl p-3 border ${selectedTheme.cardBorder}`}>
              <div>
                <div className={`text-[10px] ${selectedTheme.textMuted} font-medium`}>Volume</div>
                <div className={`text-sm font-bold font-mono-numbers ${selectedTheme.titleColor} mt-0.5`}>
                  {workout.volumeTotal.toLocaleString()}
                  <span className={`text-[10px] font-normal ${selectedTheme.textMuted} ml-0.5`}>
                    {userProfile.unitPreference}
                  </span>
                </div>
              </div>
              <div>
                <div className={`text-[10px] ${selectedTheme.textMuted} font-medium`}>Duration</div>
                <div className={`text-sm font-bold font-mono-numbers ${selectedTheme.titleColor} mt-0.5`}>
                  {formatDuration(workout.durationSeconds)}
                </div>
              </div>
              <div>
                <div className={`text-[10px] ${selectedTheme.textMuted} font-medium`}>Total Sets</div>
                <div className={`text-sm font-bold font-mono-numbers ${selectedTheme.titleColor} mt-0.5`}>
                  {workout.totalSets}
                </div>
              </div>
            </div>

            {/* Exercises Highlights List */}
            {format !== 'wide' && (
              <div className="space-y-1.5 my-2 flex-1">
                <div className={`text-[10px] uppercase tracking-wider ${selectedTheme.textMuted} font-bold`}>
                  Completed Exercises
                </div>
                {workout.exercises.slice(0, 5).map((ex) => {
                  const def = exerciseMap.get(ex.exerciseId);
                  const topSet = [...ex.sets].sort((a, b) => b.weight - a.weight)[0];
                  return (
                    <div
                      key={ex.id}
                      className={`flex items-center justify-between text-xs py-1 border-b ${selectedTheme.cardBorder}`}
                    >
                      <span className={`${selectedTheme.textColor} font-medium truncate max-w-[170px]`}>
                        {def?.name || 'Exercise'}
                      </span>
                      {topSet && (
                        <span className={`${selectedTheme.textMuted} font-mono-numbers shrink-0`}>
                          {topSet.weight} {userProfile.unitPreference} × {topSet.reps}
                        </span>
                      )}
                    </div>
                  );
                })}
                {workout.exercises.length > 5 && (
                  <div className={`text-[10px] ${selectedTheme.textMuted} pt-0.5`}>
                    +{workout.exercises.length - 5} more exercises
                  </div>
                )}
              </div>
            )}

            {/* Bottom Footer watermark */}
            <div className={`pt-3 border-t ${selectedTheme.cardBorder} flex items-center justify-between text-[10px] ${selectedTheme.textMuted}`}>
              <span>Tracked with AeroLift Pro</span>
              <span className="font-mono">#ForgedInIron</span>
            </div>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-2.5">
          {/* Main Primary Share Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNativeShare}
              disabled={isGenerating}
              className="flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Share2 className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Share Workout Card'}</span>
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-colors border border-slate-700"
              title="Download PNG Image"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Social Platforms Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleTwitterShare}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Twitter className="w-3.5 h-3.5 text-sky-400" /> Twitter / X
            </button>
            <button
              onClick={handleFacebookShare}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Facebook className="w-3.5 h-3.5 text-blue-500" /> Facebook
            </button>
            <button
              onClick={handleCopyText}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Text
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
