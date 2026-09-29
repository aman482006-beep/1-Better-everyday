import React, { useRef, useState } from 'react';
import {
  Award,
  Check,
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
import { THEMES } from '../data/themes';

interface MilestoneShareModalProps {
  pr: PersonalRecord | null;
  onClose: () => void;
}

type TemplateType = 'minimal' | 'performance' | 'progress' | 'milestone';

export const MilestoneShareModal: React.FC<MilestoneShareModalProps> = ({ pr, onClose }) => {
  const { userProfile, bodyWeights } = useWorkout();
  const cardRef = useRef<HTMLDivElement>(null);

  const [template, setTemplate] = useState<TemplateType>('performance');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    userProfile.activeThemeId || 'mono-oled'
  );
  const [showBodyweight, setShowBodyweight] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [showPrevious, setShowPrevious] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!pr) return null;

  const currentTheme = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];

  // Latest bodyweight for optional display
  const latestBw =
    bodyWeights.length > 0
      ? [...bodyWeights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.weightKg
      : null;

  const shareSummaryText = `🏆 NEW MILESTONE: ${pr.value} ${pr.unit} ${pr.exerciseName}${
    pr.repsAtWeight ? ` for ${pr.repsAtWeight} reps` : ''
  }! ${pr.improvement ? `(+${pr.improvement} ${pr.unit})` : ''}\nTracked with ONE PERCENT · 1% better every day.`;

  // Native share handler
  const handleNativeShare = async () => {
    try {
      if (cardRef.current && navigator.share) {
        setIsGenerating(true);
        const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `ONE-PERCENT-${pr.exerciseName.replace(/\s+/g, '-')}-${pr.value}${pr.unit}.png`, {
          type: 'image/png',
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `ONE PERCENT: ${pr.exerciseName} ${pr.value} ${pr.unit}`,
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
          title: `ONE PERCENT: ${pr.exerciseName} ${pr.value} ${pr.unit}`,
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

  // Download image handler
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `ONE-PERCENT-${pr.exerciseName.replace(/\s+/g, '-')}-${pr.value}${pr.unit}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image export failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-surface border border-subtle rounded-3xl w-full max-w-lg shadow-2xl flex flex-col my-auto max-h-[95vh] overflow-hidden text-main transition-colors">
        {/* Modal Header */}
        <div className="p-4 border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-black shadow-sm"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              1%
            </div>
            <div>
              <h2 className="text-base font-extrabold text-main font-display">Share Achievement</h2>
              <div className="text-xs text-muted">Generate high-res milestone card</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-muted hover:text-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Controls */}
        <div className="p-3 sm:p-4 border-b border-subtle bg-surface-subtle/50 space-y-3">
          {/* Template Style Selector */}
          <div>
            <div className="text-[10px] uppercase font-bold text-muted tracking-wider mb-1.5">
              Card Style
            </div>
            <div className="grid grid-cols-4 gap-1 bg-surface p-1 rounded-xl border border-subtle">
              {(['minimal', 'performance', 'progress', 'milestone'] as TemplateType[]).map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => setTemplate(tmpl)}
                  className={`py-1.5 px-2 rounded-lg text-xs capitalize font-bold transition-all ${
                    template === tmpl
                      ? 'bg-surface-subtle text-main shadow-xs'
                      : 'text-muted hover:text-main'
                  }`}
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Palette Swatches */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Palette</span>
            <div className="flex items-center gap-1.5">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform shadow-xs ${
                    selectedThemeId === theme.id ? 'scale-110 border-main ring-1 ring-main' : 'border-subtle opacity-70'
                  }`}
                  style={{ backgroundColor: theme.palette.bgApp }}
                  title={theme.name}
                />
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showDate}
                onChange={(e) => setShowDate(e.target.checked)}
                className="rounded accent-main cursor-pointer"
              />
              <span className="text-secondary">Show Date</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrevious}
                onChange={(e) => setShowPrevious(e.target.checked)}
                className="rounded accent-main cursor-pointer"
              />
              <span className="text-secondary">Show Previous</span>
            </label>

            {latestBw && (
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBodyweight}
                  onChange={(e) => setShowBodyweight(e.target.checked)}
                  className="rounded accent-main cursor-pointer"
                />
                <span className="text-secondary">Body Weight</span>
              </label>
            )}
          </div>
        </div>

        {/* Card Canvas Container */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-black/20">
          <div
            ref={cardRef}
            className="w-[320px] min-h-[420px] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all border"
            style={{
              backgroundColor: currentTheme.palette.bgApp,
              borderColor: currentTheme.palette.borderStrong,
              color: currentTheme.palette.textMain,
            }}
          >
            {/* Top Brand Mark */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black shadow-xs"
                  style={{
                    backgroundColor: currentTheme.palette.accent,
                    color: currentTheme.palette.accentText,
                  }}
                >
                  1%
                </div>
                <span className="font-display font-black text-xs tracking-wider">
                  ONE PERCENT
                </span>
              </div>
              {showDate && (
                <span
                  className="text-[11px] font-mono-numbers opacity-60"
                  style={{ color: currentTheme.palette.textMuted }}
                >
                  {pr.achievedAt}
                </span>
              )}
            </div>

            {/* Template Variant 1: Minimal */}
            {template === 'minimal' && (
              <div className="my-auto text-center space-y-2 py-4">
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                  {pr.type === 'milestone' ? 'Milestone' : 'Personal Record'}
                </div>
                <div className="font-display font-black text-6xl tracking-tight font-mono-numbers">
                  {pr.value}
                  <span className="text-2xl font-bold ml-1 opacity-70">{pr.unit}</span>
                </div>
                <div className="font-display font-extrabold text-xl uppercase tracking-wide">
                  {pr.exerciseName}
                </div>
                {pr.repsAtWeight && pr.repsAtWeight > 1 && (
                  <div className="text-xs font-mono opacity-80">{pr.repsAtWeight} reps</div>
                )}
              </div>
            )}

            {/* Template Variant 2: Performance */}
            {template === 'performance' && (
              <div className="my-auto space-y-3 py-4 text-left">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: currentTheme.palette.accentSubtle,
                    color: currentTheme.palette.accent,
                  }}
                >
                  <Award className="w-3 h-3" />
                  <span>New Personal Record</span>
                </div>

                <div className="font-display font-black text-5xl tracking-tight font-mono-numbers">
                  {pr.value} <span className="text-2xl font-bold opacity-70">{pr.unit}</span>
                  {pr.repsAtWeight && pr.repsAtWeight > 1 && (
                    <span className="text-2xl font-normal opacity-60 ml-1">× {pr.repsAtWeight}</span>
                  )}
                </div>

                <div className="font-display font-black text-xl uppercase tracking-wide">
                  {pr.exerciseName}
                </div>

                {showPrevious && (pr.previousValue || pr.improvement) && (
                  <div
                    className="p-3 rounded-2xl border text-xs space-y-1"
                    style={{
                      backgroundColor: currentTheme.palette.bgSurface,
                      borderColor: currentTheme.palette.borderSubtle,
                    }}
                  >
                    <div className="flex justify-between">
                      <span className="opacity-60 text-[10px] uppercase">Previous Best</span>
                      <span className="font-mono-numbers font-bold">
                        {pr.previousValue ? `${pr.previousValue} ${pr.unit}` : 'Baseline'}
                      </span>
                    </div>
                    {pr.improvement && pr.improvement > 0 && (
                      <div className="flex justify-between font-bold text-emerald-500">
                        <span className="text-[10px] uppercase">Net Gain</span>
                        <span className="font-mono-numbers">+{pr.improvement} {pr.unit}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Template Variant 3: Progress */}
            {template === 'progress' && (
              <div className="my-auto space-y-4 py-4 text-center">
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                  {pr.exerciseName}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <div className="text-[10px] opacity-60">BEFORE</div>
                    <div className="font-display font-bold text-2xl font-mono-numbers opacity-60">
                      {pr.previousValue || (pr.value - (pr.improvement || 5))}
                    </div>
                  </div>

                  <span className="text-2xl font-bold opacity-50">→</span>

                  <div className="text-center">
                    <div className="text-[10px] opacity-80 font-bold">AFTER</div>
                    <div className="font-display font-black text-4xl font-mono-numbers">
                      {pr.value} <span className="text-sm">{pr.unit}</span>
                    </div>
                  </div>
                </div>

                {pr.percentImprovement && (
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    +{pr.percentImprovement}% Progress
                  </div>
                )}
              </div>
            )}

            {/* Template Variant 4: Milestone */}
            {template === 'milestone' && (
              <div className="my-auto text-center space-y-3 py-4">
                <div
                  className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-1"
                  style={{
                    backgroundColor: currentTheme.palette.accent,
                    color: currentTheme.palette.accentText,
                  }}
                >
                  <Trophy className="w-6 h-6" />
                </div>

                <div className="font-display font-black text-5xl tracking-tight font-mono-numbers">
                  {pr.value} {pr.unit}
                </div>

                <div className="font-display font-extrabold text-lg uppercase tracking-wider">
                  {pr.exerciseName}
                </div>

                <div className="text-[11px] font-mono uppercase tracking-widest opacity-80">
                  MILESTONE ACHIEVED
                </div>
              </div>
            )}

            {/* Bottom Footer Info */}
            <div
              className="pt-3 border-t flex items-center justify-between text-[10px]"
              style={{
                borderColor: currentTheme.palette.borderSubtle,
                color: currentTheme.palette.textMuted,
              }}
            >
              <span>1% better every day.</span>
              {showBodyweight && latestBw && (
                <span className="font-mono-numbers">
                  BW: {latestBw}kg
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-subtle bg-surface-subtle/50 flex items-center gap-2">
          <button
            onClick={handleNativeShare}
            disabled={isGenerating}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Share2 className="w-4 h-4" />
            <span>{isGenerating ? 'Exporting...' : 'Share Card'}</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-surface border border-subtle hover:bg-surface-elevated text-main flex items-center gap-1.5 transition-colors"
            title="Download PNG image"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={async () => {
              await navigator.clipboard.writeText(shareSummaryText);
              setCopiedText(true);
              setTimeout(() => setCopiedText(false), 2000);
            }}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-surface border border-subtle hover:bg-surface-elevated text-main flex items-center gap-1.5 transition-colors"
            title="Copy Text Summary"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
