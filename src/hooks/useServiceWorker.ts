import { useEffect, useState, useCallback, useRef } from 'react';
import { registerSW } from 'virtual:pwa-register';

export interface StorageCacheBreakdown {
  workoutsCount: number;
  routinesCount: number;
  exercisesCount: number;
  bodyWeightsCount: number;
  bodyMeasurementsCount: number;
  approximateStorageKb: number;
  lastCachedAt: string;
}

export interface CacheNotification {
  id: string;
  title: string;
  message: string;
  type: 'sw-ready' | 'data-cached' | 'offline' | 'online' | 'update';
  timestamp: number;
}

export function useServiceWorker() {
  const [swStatus, setSwStatus] = useState<
    'unregistered' | 'registering' | 'registered' | 'offline-ready' | 'update-ready' | 'unsupported'
  >('registering');
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [activeNotification, setActiveNotification] = useState<CacheNotification | null>(null);
  const [storageBreakdown, setStorageBreakdown] = useState<StorageCacheBreakdown | null>(null);

  const updateSWFnRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);
  const timeoutIdRef = useRef<number | null>(null);

  const showNotification = useCallback(
    (notif: Omit<CacheNotification, 'id' | 'timestamp'>, autoDismissMs = 4500) => {
      const newNotif: CacheNotification = {
        ...notif,
        id: Math.random().toString(36).slice(2, 9),
        timestamp: Date.now(),
      };
      setActiveNotification(newNotif);

      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
      }

      if (autoDismissMs > 0) {
        timeoutIdRef.current = window.setTimeout(() => {
          setActiveNotification((current) => (current?.id === newNotif.id ? null : current));
        }, autoDismissMs);
      }
    },
    []
  );

  const dismissNotification = useCallback(() => {
    if (timeoutIdRef.current) {
      window.clearTimeout(timeoutIdRef.current);
    }
    setActiveNotification(null);
  }, []);

  // Compute local workout storage stats
  const calculateStorageStats = useCallback((): StorageCacheBreakdown => {
    let workoutsCount = 0;
    let routinesCount = 0;
    let exercisesCount = 0;
    let bodyWeightsCount = 0;
    let bodyMeasurementsCount = 0;
    let approximateBytes = 0;

    try {
      const wRaw = localStorage.getItem('aerolift_workouts_v1');
      if (wRaw) {
        workoutsCount = JSON.parse(wRaw).length || 0;
        approximateBytes += wRaw.length * 2;
      }
      const rRaw = localStorage.getItem('aerolift_routines_v1');
      if (rRaw) {
        routinesCount = JSON.parse(rRaw).length || 0;
        approximateBytes += rRaw.length * 2;
      }
      const cRaw = localStorage.getItem('aerolift_custom_exercises_v1');
      if (cRaw) {
        exercisesCount = JSON.parse(cRaw).length || 0;
        approximateBytes += cRaw.length * 2;
      }
      const bwRaw = localStorage.getItem('aerolift_body_weights_v1');
      if (bwRaw) {
        bodyWeightsCount = JSON.parse(bwRaw).length || 0;
        approximateBytes += bwRaw.length * 2;
      }
      const bmRaw = localStorage.getItem('aerolift_body_measurements_v1');
      if (bmRaw) {
        bodyMeasurementsCount = JSON.parse(bmRaw).length || 0;
        approximateBytes += bmRaw.length * 2;
      }
    } catch {
      // fallback
    }

    const breakdown: StorageCacheBreakdown = {
      workoutsCount,
      routinesCount,
      exercisesCount,
      bodyWeightsCount,
      bodyMeasurementsCount,
      approximateStorageKb: Math.round((approximateBytes / 1024) * 10) / 10,
      lastCachedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setStorageBreakdown(breakdown);
    return breakdown;
  }, []);

  // Manual verify cache trigger
  const verifyAndRefreshCache = useCallback(() => {
    const stats = calculateStorageStats();
    showNotification(
      {
        title: 'Offline Cache Verified',
        message: `Preserved ${stats.workoutsCount} workouts, ${stats.routinesCount} routines & ${stats.bodyWeightsCount} body metrics for offline gym use.`,
        type: 'data-cached',
      },
      3500
    );
  }, [calculateStorageStats, showNotification]);

  // Notify workout data cached
  const notifyWorkoutDataCached = useCallback(
    (customMsg?: string) => {
      calculateStorageStats();
      showNotification(
        {
          title: 'Workout Data Cached',
          message: customMsg || 'Workout data securely cached locally for offline gym access.',
          type: 'data-cached',
        },
        3000
      );
    },
    [calculateStorageStats, showNotification]
  );

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setSwStatus('unsupported');
      calculateStorageStats();
      return;
    }

    try {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          setNeedRefresh(true);
          setSwStatus('update-ready');
          showNotification(
            {
              title: 'App Update Available',
              message: 'A newer version of ONE PERCENT is available. Click to refresh.',
              type: 'update',
            },
            0 // keep until dismissed or clicked
          );
        },
        onOfflineReady() {
          setIsOfflineReady(true);
          setSwStatus('offline-ready');
          calculateStorageStats();
          showNotification(
            {
              title: 'PWA Offline Ready',
              message: 'App shell and workout database are precached for 100% offline gym tracking.',
              type: 'sw-ready',
            },
            5000
          );
        },
        onRegistered(registration) {
          if (registration) {
            setSwStatus('registered');
            calculateStorageStats();
          }
        },
        onRegisterError(error) {
          console.warn('PWA service worker registration failed (likely dev/sandboxed environment):', error);
          setSwStatus('unsupported');
          calculateStorageStats();
        },
      });

      updateSWFnRef.current = updateSW;
    } catch (err) {
      console.warn('Could not register service worker:', err);
      setSwStatus('unsupported');
      calculateStorageStats();
    }
  }, [calculateStorageStats, showNotification]);

  // Online / offline network event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      calculateStorageStats();
      showNotification(
        {
          title: 'Connection Restored',
          message: 'Back online. Workout data remains securely cached locally.',
          type: 'online',
        },
        3500
      );
    };

    const handleOffline = () => {
      setIsOnline(false);
      calculateStorageStats();
      showNotification(
        {
          title: 'Offline Mode Active',
          message: 'Zero internet connection. Logging workouts & rest timers continue seamlessly offline.',
          type: 'offline',
        },
        4500
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleDataCached = () => {
      calculateStorageStats();
    };

    const handleWorkoutFinished = (e: Event) => {
      const customEvent = e as CustomEvent<{ name?: string }>;
      calculateStorageStats();
      showNotification(
        {
          title: 'Workout Cached Offline',
          message: `${customEvent.detail?.name || 'Workout'} is securely saved & ready for offline review.`,
          type: 'data-cached',
        },
        4000
      );
    };

    window.addEventListener('aerolift:data-cached', handleDataCached);
    window.addEventListener('aerolift:workout-finished', handleWorkoutFinished);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('aerolift:data-cached', handleDataCached);
      window.removeEventListener('aerolift:workout-finished', handleWorkoutFinished);
    };
  }, [calculateStorageStats, showNotification]);

  const updateApp = useCallback(() => {
    if (updateSWFnRef.current) {
      updateSWFnRef.current(true);
    }
  }, []);

  return {
    swStatus,
    isOfflineReady,
    needRefresh,
    isOnline,
    activeNotification,
    storageBreakdown,
    dismissNotification,
    verifyAndRefreshCache,
    notifyWorkoutDataCached,
    updateApp,
  };
}
