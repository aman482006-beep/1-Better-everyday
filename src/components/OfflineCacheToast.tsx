import React from 'react';
import { CheckCircle2, HardDrive, RefreshCw, Wifi, WifiOff, X } from 'lucide-react';
import { CacheNotification } from '../hooks/useServiceWorker';

interface OfflineCacheToastProps {
  notification: CacheNotification | null;
  onDismiss: () => void;
  onUpdateApp?: () => void;
  onOpenDetails?: () => void;
}

export const OfflineCacheToast: React.FC<OfflineCacheToastProps> = ({
  notification,
  onDismiss,
  onUpdateApp,
  onOpenDetails,
}) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'offline':
        return <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'online':
        return <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'update':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin shrink-0" />;
      case 'sw-ready':
        return <HardDrive className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'data-cached':
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
  };

  const getBadgeStyle = () => {
    switch (notification.type) {
      case 'offline':
        return 'border-amber-500/30 bg-surface shadow-amber-500/10';
      case 'update':
        return 'border-blue-500/30 bg-surface shadow-blue-500/10';
      default:
        return 'border-subtle bg-surface shadow-black/20';
    }
  };

  return (
    <aside
      aria-label="Offline caching notification"
      className="fixed top-14 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto"
    >
      <div
        className={`rounded-2xl border p-3 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-main transition-all ${getBadgeStyle()}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-surface-subtle border border-subtle">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-main truncate">
                {notification.title}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-subtle font-mono text-muted uppercase tracking-wider">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-secondary mt-0.5 line-clamp-2 leading-tight">
              {notification.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {notification.type === 'update' && onUpdateApp && (
            <button
              onClick={onUpdateApp}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Update
            </button>
          )}

          {onOpenDetails && notification.type !== 'update' && (
            <button
              onClick={onOpenDetails}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-muted hover:text-main bg-surface-subtle border border-subtle transition-colors"
              title="View Offline Storage Breakdown"
            >
              Details
            </button>
          )}

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-muted hover:text-main hover:bg-surface-subtle transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
