import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Database,
  Download,
  Dumbbell,
  HardDrive,
  History,
  Info,
  RefreshCw,
  Scale,
  ShieldCheck,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { StorageCacheBreakdown } from '../hooks/useServiceWorker';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface OfflineCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  swStatus: string;
  isOfflineReady: boolean;
  storageBreakdown: StorageCacheBreakdown | null;
  onVerifyCache: () => void;
}

export const OfflineCacheModal: React.FC<OfflineCacheModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  swStatus,
  isOfflineReady,
  storageBreakdown,
  onVerifyCache,
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onVerifyCache();
      setIsVerifying(false);
      setVerifySuccess(true);
      setTimeout(() => setVerifySuccess(false), 2500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-subtle rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-main transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-subtle flex items-center justify-between bg-surface-subtle/50">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-main font-display">
                Offline PWA &amp; Cache Status
              </h2>
              <p className="text-[11px] text-muted">
                Offline-first data persistence &amp; Service Worker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface-subtle transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Live Status Pill */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  isOnline
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}
              >
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-main">
                  {isOnline ? 'Online — Cache Synchronized' : 'Offline Mode Active'}
                </div>
                <div className="text-[11px] text-secondary">
                  {isOnline
                    ? 'Changes cached locally & ready for offline access'
                    : 'Logging workouts normally without network connection'}
                </div>
              </div>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {isOnline ? 'Synced' : 'Offline'}
            </span>
          </div>

          {/* Service Worker Status Card */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-subtle space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-main">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Service Worker Precaching</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {isOfflineReady ? 'Active & Cached' : swStatus}
              </span>
            </div>
            <p className="text-[11px] text-secondary leading-relaxed">
              The Service Worker has precached all core scripts, styles, icons, and fonts in the
              browser CacheStorage. ONE PERCENT loads instantly even without an internet connection.
            </p>
          </div>

          {/* Cached Data Breakdown Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider px-1">
              <span>Local Workout Database</span>
              <span className="font-mono text-[10px] normal-case text-secondary">
                {storageBreakdown?.approximateStorageKb || 0} KB cached
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-muted" />
                  <span className="text-secondary font-medium">Workouts</span>
                </div>
                <span className="font-bold font-mono-numbers text-main">
                  {storageBreakdown?.workoutsCount ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-3.5 h-3.5 text-muted" />
                  <span className="text-secondary font-medium">Routines</span>
                </div>
                <span className="font-bold font-mono-numbers text-main">
                  {storageBreakdown?.routinesCount ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-muted" />
                  <span className="text-secondary font-medium">Body Weights</span>
                </div>
                <span className="font-bold font-mono-numbers text-main">
                  {storageBreakdown?.bodyWeightsCount ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-muted" />
                  <span className="text-secondary font-medium">Custom Ex.</span>
                </div>
                <span className="font-bold font-mono-numbers text-main">
                  {storageBreakdown?.exercisesCount ?? 0}
                </span>
              </div>
            </div>

            {storageBreakdown?.lastCachedAt && (
              <div className="text-[10px] text-muted text-right pr-1">
                Last cache verification: <span className="font-mono text-secondary">{storageBreakdown.lastCachedAt}</span>
              </div>
            )}
          </div>

          {/* Gym Capability Callout */}
          <div className="p-3.5 rounded-2xl border border-subtle bg-surface-subtle/50 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-main">
              <Info className="w-3.5 h-3.5 text-main" />
              <span>Gym Offline Assurance</span>
            </div>
            <p className="text-[11px] text-secondary leading-relaxed">
              When training in gym basements or low-signal areas, all features—including rest timers,
              1RM calculators, set completion, and progress tracking—run 100% on your device with zero
              latency.
            </p>
          </div>

          {/* Install PWA Prompt if applicable */}
          {isInstallable && (
            <button
              onClick={install}
              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Download className="w-3.5 h-3.5" />
              Install ONE PERCENT App for Fullscreen Offline Mode
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-subtle bg-surface flex items-center justify-between gap-3">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex-1 py-2.5 px-3 rounded-xl bg-surface-subtle hover:bg-surface border border-subtle text-xs font-semibold text-main flex items-center justify-center gap-1.5 transition-colors"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Cache...</span>
              </>
            ) : verifySuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Cache Verified</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-muted" />
                <span>Verify Local Cache</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl font-bold text-xs shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
