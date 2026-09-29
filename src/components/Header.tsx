import React, { useState } from 'react';
import { Download, HardDrive, Moon, Palette, Plus, ShieldCheck, Sun, Wifi, WifiOff } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { THEMES } from '../data/themes';

interface HeaderProps {
  onStartEmptyWorkout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartEmptyWorkout }) => {
  const {
    syncStatus,
    activeWorkout,
    userProfile,
    openThemeModal,
    setAppTheme,
    openOfflineModal,
  } = useWorkout();
  const { isInstallable, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  const currentTheme = THEMES.find((t) => t.id === userProfile.activeThemeId) || THEMES[0];
  const isDark = userProfile.themePreference === 'dark' || (userProfile.themePreference !== 'light' && currentTheme.isDark);

  const handleToggleDarkLight = () => {
    if (isDark) {
      setAppTheme('mono-paper');
    } else {
      setAppTheme('mono-oled');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-subtle pt-safe px-4 py-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs font-mono tracking-tighter shadow-sm"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            1%
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black tracking-tight text-base sm:text-lg text-main leading-none">
              ONE PERCENT
            </span>
            <span className="text-[9px] font-medium text-muted tracking-tight mt-0.5 hidden xs:inline">
              1% better every day.
            </span>
          </div>
        </div>

        {/* Zone 2 & 3: Sync status & Quick actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Interactive Offline / PWA Cached badge */}
          <button
            onClick={openOfflineModal}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border transition-colors shadow-xs ${
              syncStatus.state === 'offline'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-surface-subtle hover:bg-surface text-secondary border-subtle'
            }`}
            title="PWA Offline Storage & Service Worker Cache Status (Click for details)"
            aria-label="PWA and offline cache status"
          >
            {syncStatus.state === 'offline' ? (
              <>
                <WifiOff className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="text-[11px] font-bold">Offline</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
                <span className="text-[11px] font-medium hidden xs:inline text-main">Cached</span>
              </>
            )}
          </button>

          {/* Quick 1-Tap Minimal Dark / Light Toggle */}
          <button
            onClick={handleToggleDarkLight}
            className="p-1.5 rounded-lg text-muted hover:text-main bg-surface-subtle hover:bg-surface border border-subtle transition-colors shadow-xs"
            title={isDark ? 'Switch to Light Mode (Clean Paper)' : 'Switch to Dark Mode (OLED Black)'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Theme Palette Modal Opener */}
          <button
            onClick={openThemeModal}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-surface-subtle hover:bg-surface text-main border border-subtle transition-colors shadow-xs"
            title="Themes & Appearance"
          >
            <Palette className="w-3.5 h-3.5" />
            <span
              className="w-2 h-2 rounded-full border border-subtle shrink-0"
              style={{ backgroundColor: currentTheme.palette.accent }}
            />
          </button>

          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-subtle hover:bg-surface text-main border border-subtle transition-colors"
              title="Install App to Home Screen"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* iOS Safari Guide Button */}
          {isIOS && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="px-2 py-1 rounded-lg text-xs text-muted hover:text-main border border-subtle transition-colors"
            >
              Install
            </button>
          )}

          {/* Quick Start Empty Workout if no workout is active */}
          {!activeWorkout && (
            <button
              onClick={onStartEmptyWorkout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Start</span>
            </button>
          )}
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-subtle p-5 shadow-2xl text-main">
            <h3 className="text-base font-bold text-main">Install AeroLift on iOS</h3>
            <p className="mt-2 text-xs text-secondary leading-relaxed">
              1. Tap the <strong className="text-main">Share</strong> icon at the bottom of Safari.<br />
              2. Scroll down and tap <strong className="text-main">Add to Home Screen</strong>.<br />
              3. Launch AeroLift for fullscreen offline gym tracking.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full rounded-xl bg-surface-subtle py-2.5 text-xs font-bold text-main hover:bg-surface border border-subtle"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
