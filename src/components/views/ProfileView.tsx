import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  HardDrive,
  Moon,
  Palette,
  RotateCcw,
  Scale,
  Settings,
  ShieldCheck,
  Sun,
  Timer,
  Upload,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { THEMES, ThemeDefinition } from '../../data/themes';
import { BodyMetricsSection } from '../BodyMetricsSection';
import { AboutModal } from '../AboutModal';
import { ExternalLink, Instagram, Linkedin, Youtube, Info, Sparkles } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    syncStatus,
    exportData,
    importData,
    resetAllData,
    workouts,
    routines,
    setAppTheme,
    openThemeModal,
    openOfflineModal,
  } = useWorkout();

  const { isInstallable, install } = usePWAInstall();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importNotice, setImportNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name);

  // Download export helper
  const handleExport = (format: 'json' | 'csv') => {
    const dataStr = exportData(format);
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `one-percent-backup-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upload file for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importData(content);
      if (res.success) {
        setImportNotice({ type: 'success', text: res.message });
      } else {
        setImportNotice({ type: 'error', text: res.message });
      }
      setTimeout(() => setImportNotice(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateUserProfile({ name: nameInput.trim() });
    }
    setEditingName(false);
  };

  const currentTheme = THEMES.find((t) => t.id === userProfile.activeThemeId) || THEMES[0];

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3 transition-colors">
      {/* View Title */}
      <h1 className="text-xl font-extrabold text-main font-display">Profile &amp; Settings</h1>

      {/* User Information Card */}
      <div className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm transition-colors">
        <div className="flex items-center gap-3.5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border border-subtle"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {userProfile.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-surface-subtle border border-subtle rounded-lg px-2 py-1 text-sm font-bold text-main focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-2 py-1 rounded text-xs font-bold shadow-sm"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-main truncate">
                  {userProfile.name}
                </h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-muted hover:text-main text-xs"
                >
                  ✎
                </button>
              </div>
            )}
            <div className="text-xs text-muted mt-0.5 capitalize flex items-center gap-1.5">
              <span>Goal: {userProfile.trainingGoal.replace('_', ' ')}</span>
              <span>·</span>
              <span>{userProfile.experienceLevel}</span>
            </div>
          </div>
        </div>

        {/* Quick summary numbers */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-subtle text-center">
          <div className="p-2.5 rounded-xl bg-surface-subtle border border-subtle">
            <div className="text-xs font-extrabold text-main font-mono-numbers">
              {workouts.filter((w) => w.isCompleted).length}
            </div>
            <div className="text-[10px] text-muted mt-0.5">Completed Sessions</div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-subtle border border-subtle">
            <div className="text-xs font-extrabold text-main font-mono-numbers">
              {routines.length}
            </div>
            <div className="text-[10px] text-muted mt-0.5">Custom Routines</div>
          </div>
        </div>
      </div>

      {/* Minimal Appearance & Theme Options */}
      <div className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
            <Palette className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span>Theme &amp; Appearance</span>
          </div>
          <button
            onClick={openThemeModal}
            className="text-[11px] font-bold text-main hover:opacity-80 flex items-center gap-1"
          >
            <span>Switcher</span>
            <span className="text-muted">→</span>
          </button>
        </div>

        {/* Theme Mode Toggle (Dark / Light / System) */}
        <div>
          <label className="block text-xs font-semibold text-main mb-2">Display Mode</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setAppTheme('mono-oled')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                userProfile.activeThemeId === 'mono-oled' || (userProfile.themePreference === 'dark' && !userProfile.activeThemeId)
                  ? 'border-main bg-surface-subtle text-main font-bold shadow-sm'
                  : 'border-subtle bg-surface text-muted hover:text-main'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark (OLED)
            </button>
            <button
              onClick={() => setAppTheme('mono-paper')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                userProfile.activeThemeId === 'mono-paper' || (userProfile.themePreference === 'light' && !userProfile.activeThemeId)
                  ? 'border-main bg-surface-subtle text-main font-bold shadow-sm'
                  : 'border-subtle bg-surface text-muted hover:text-main'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Light (Paper)
            </button>
            <button
              onClick={() => updateUserProfile({ themePreference: 'system' })}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                userProfile.themePreference === 'system'
                  ? 'border-main bg-surface-subtle text-main font-bold shadow-sm'
                  : 'border-subtle bg-surface text-muted hover:text-main'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> System
            </button>
          </div>
        </div>

        {/* Curated Theme Presets Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-main">
              Themes ({THEMES.length})
            </label>
            <span className="text-[10px] text-muted font-medium">
              Current: <strong className="text-main">{currentTheme.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((theme) => {
              const isSelected = userProfile.activeThemeId === theme.id;

              return (
                <button
                  key={theme.id}
                  onClick={() => setAppTheme(theme.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 active:scale-[0.98] ${
                    isSelected
                      ? 'border-main bg-surface-subtle shadow-md ring-1 ring-main'
                      : 'border-subtle bg-surface hover:bg-surface-subtle'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center"
                    style={{
                      backgroundColor: theme.palette.accent,
                      borderColor: theme.palette.borderStrong,
                    }}
                  >
                    {isSelected && (
                      <Check
                        className="w-3 h-3 stroke-[3]"
                        style={{
                          color: theme.palette.accentText,
                        }}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-main leading-tight truncate">
                      {theme.shortName}
                    </div>
                    <div className="text-[10px] text-muted leading-tight mt-0.5 line-clamp-1">
                      {theme.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Hex Color Option */}
          <div className="mt-3 p-3 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={userProfile.accentColor || '#ffffff'}
                onChange={(e) => {
                  updateUserProfile({
                    accentColor: e.target.value,
                    activeThemeId: 'custom',
                  });
                }}
                className="w-7 h-7 rounded-lg border border-subtle bg-transparent cursor-pointer"
              />
              <span className="font-semibold text-main">Custom Hex Accent</span>
            </div>
            <span className="font-mono text-muted uppercase font-bold">
              {userProfile.accentColor || '#ffffff'}
            </span>
          </div>
        </div>
      </div>

      {/* Body Weight & Body Fat Composition Trends Section */}
      <BodyMetricsSection />

      {/* Units & Formulas Preferences */}
      <div className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
          <Scale className="w-4 h-4 text-muted" />
          <span>Units &amp; Calculations</span>
        </div>

        {/* Units System Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-main">Weight Units</div>
            <div className="text-[11px] text-muted">Select Metric (kg) or Imperial (lb)</div>
          </div>
          <div className="flex items-center bg-surface-subtle p-1 rounded-xl border border-subtle">
            <button
              onClick={() => updateUserProfile({ unitPreference: 'kg' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                userProfile.unitPreference === 'kg'
                  ? 'bg-surface text-main shadow-sm border border-subtle'
                  : 'text-muted hover:text-main'
              }`}
            >
              kg
            </button>
            <button
              onClick={() => updateUserProfile({ unitPreference: 'lb' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                userProfile.unitPreference === 'lb'
                  ? 'bg-surface text-main shadow-sm border border-subtle'
                  : 'text-muted hover:text-main'
              }`}
            >
              lb
            </button>
          </div>
        </div>

        {/* 1RM Formula selector */}
        <div className="flex items-center justify-between pt-2 border-t border-subtle">
          <div>
            <div className="text-xs font-bold text-main">1RM Estimator Formula</div>
            <div className="text-[11px] text-muted">Epley vs Brzycki standard algorithms</div>
          </div>
          <select
            value={userProfile.rmFormula}
            onChange={(e) =>
              updateUserProfile({ rmFormula: e.target.value as 'epley' | 'brzycki' })
            }
            className="bg-surface-subtle border border-subtle rounded-lg px-2.5 py-1.5 text-xs text-main focus:outline-none"
          >
            <option value="epley">Epley</option>
            <option value="brzycki">Brzycki</option>
          </select>
        </div>

        {/* Rest Timer defaults */}
        <div className="flex items-center justify-between pt-2 border-t border-subtle">
          <div>
            <div className="text-xs font-bold text-main">Auto-Start Rest Timer</div>
            <div className="text-[11px] text-muted">Starts countdown upon completing a set</div>
          </div>
          <input
            type="checkbox"
            checked={userProfile.autoStartRestTimer}
            onChange={(e) => updateUserProfile({ autoStartRestTimer: e.target.checked })}
            className="w-5 h-5 rounded cursor-pointer"
            style={{ accentColor: 'var(--accent)' }}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-subtle">
          <div>
            <div className="text-xs font-bold text-main">Default Rest Duration</div>
            <div className="text-[11px] text-muted">Base rest seconds per set</div>
          </div>
          <select
            value={userProfile.defaultRestSeconds}
            onChange={(e) =>
              updateUserProfile({ defaultRestSeconds: parseInt(e.target.value, 10) })
            }
            className="bg-surface-subtle border border-subtle rounded-lg px-2.5 py-1.5 text-xs text-main focus:outline-none"
          >
            <option value={30}>30 sec</option>
            <option value={60}>60 sec</option>
            <option value={90}>90 sec (1.5m)</option>
            <option value={120}>120 sec (2m)</option>
            <option value={180}>180 sec (3m)</option>
            <option value={300}>300 sec (5m)</option>
          </select>
        </div>
      </div>

      {/* Data Management: Export & Import */}
      <div className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
          <Download className="w-4 h-4 text-muted" />
          <span>Data Backup &amp; Portability</span>
        </div>

        {importNotice && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              importNotice.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
            }`}
          >
            {importNotice.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{importNotice.text}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => handleExport('json')}
            className="py-2.5 px-3 rounded-2xl bg-surface-subtle border border-subtle hover:bg-surface text-xs font-semibold text-main flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-muted" /> Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="py-2.5 px-3 rounded-2xl bg-surface-subtle border border-subtle hover:bg-surface text-xs font-semibold text-main flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-muted" /> Export CSV
          </button>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-2xl bg-surface-subtle border border-subtle hover:bg-surface text-xs font-semibold text-main flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-muted" /> Restore Backup JSON File
          </button>
        </div>

        {/* Reset All Data Button */}
        <div className="pt-2 border-t border-subtle">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Starter Data
          </button>
        </div>
      </div>

      {/* PWA Offline Storage & Caching Details */}
      <div className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-main">
            <HardDrive className="w-4 h-4 text-emerald-500" />
            <span>PWA &amp; Offline Workout Storage</span>
          </div>
          <button
            onClick={openOfflineModal}
            className="text-xs font-bold text-main hover:underline flex items-center gap-1"
          >
            <span>Details</span>
            <span>→</span>
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-secondary font-medium">Service Worker Cache</span>
          </div>
          <span className="text-emerald-500 font-bold">Active &amp; Precached</span>
        </div>

        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-semibold text-secondary">Local Workout Database</span>
          <span className="text-muted font-mono">{workouts.length} workouts · {routines.length} routines</span>
        </div>

        <button
          onClick={openOfflineModal}
          className="w-full py-2.5 rounded-2xl bg-surface-subtle border border-subtle hover:bg-surface text-xs font-semibold text-main flex items-center justify-center gap-1.5 transition-colors"
        >
          <HardDrive className="w-3.5 h-3.5 text-muted" /> View Cache Breakdown &amp; Re-verify
        </button>

        {isInstallable && (
          <div className="pt-1">
            <button
              onClick={install}
              className="w-full py-2.5 rounded-xl font-bold text-xs shadow-md border border-subtle"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              Install ONE PERCENT App
            </button>
          </div>
        )}
      </div>

      {/* Creator & About ONE PERCENT Section */}
      <div className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
            <Info className="w-4 h-4 text-main" />
            <span>About ONE PERCENT</span>
          </div>
          <button
            onClick={() => setShowAboutModal(true)}
            className="text-xs font-bold text-main hover:underline flex items-center gap-1"
          >
            <span>Learn More</span>
            <span>→</span>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-subtle border border-subtle space-y-1">
          <div className="text-xs font-bold text-main">Built by Aman</div>
          <p className="text-[11px] text-secondary leading-relaxed">
            ONE PERCENT was built to make training progress simple, measurable, and consistent.
          </p>
        </div>

        {/* Creator Socials */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <a
            href="https://www.instagram.com/aman.ja1n/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-surface-subtle hover:bg-surface border border-subtle text-[11px] font-bold text-main transition-colors"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-500" />
            <span>Instagram</span>
          </a>
          <a
            href="https://www.youtube.com/channel/UCuE0oW8TukiUeWRwqyoRMLQ"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-surface-subtle hover:bg-surface border border-subtle text-[11px] font-bold text-main transition-colors"
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>YouTube</span>
          </a>
          <a
            href="https://www.linkedin.com/in/aman-malu-335769344"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-surface-subtle hover:bg-surface border border-subtle text-[11px] font-bold text-main transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5 text-blue-500" />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>

      {/* About Modal */}
      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface border border-subtle rounded-3xl w-full max-w-sm shadow-2xl p-5 overflow-hidden text-main">
            <h3 className="text-base font-bold text-rose-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Reset All Workout Data?
            </h3>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              This will erase all custom workouts, routines, and measurements, and restore the initial
              demo dataset. This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-subtle hover:bg-surface border border-subtle text-xs font-bold text-main"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-900/30"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
