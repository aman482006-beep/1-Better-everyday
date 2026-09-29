import React from 'react';
import {
  BarChart3,
  Dumbbell,
  Flame,
  Home,
  Layers,
  Play,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { formatTimerClock } from '../utils/calculations';

export type TabType = 'home' | 'workouts' | 'exercises' | 'progress' | 'profile';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenActiveWorkout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  onOpenActiveWorkout,
}) => {
  const { activeWorkout, syncStatus } = useWorkout();

  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workouts', label: 'Workouts', icon: Layers },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mini Active Workout Banner if workout is active and user is outside it */}
      {activeWorkout && (
        <div className="fixed bottom-16 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-2 duration-150">
          <button
            onClick={onOpenActiveWorkout}
            className="w-full rounded-2xl px-4 py-2.5 shadow-xl flex items-center justify-between transition-transform active:scale-[0.99] border border-subtle"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'currentColor' }}></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: 'currentColor' }}></span>
              </span>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight truncate max-w-[190px]">
                  {activeWorkout.name}
                </div>
                <div className="text-[10px] opacity-80 font-mono-numbers">
                  {formatTimerClock(activeWorkout.durationSeconds)} · {activeWorkout.exercises.length} Exercises
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-black/15 dark:bg-white/20">
              Resume <Play className="w-3 h-3 fill-current" />
            </div>
          </button>
        </div>
      )}

      {/* Fixed Bottom Tab Bar */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-subtle pb-safe transition-colors"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center justify-center min-h-[48px] w-full relative group transition-colors"
                style={{
                  color: isActive ? 'var(--accent)' : undefined,
                }}
              >
                <div
                  className={`p-1 rounded-xl transition-all duration-150 ${
                    isActive ? 'scale-110 font-bold' : 'text-muted group-hover:text-main'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap transition-colors ${
                    isActive ? 'font-bold' : 'font-medium text-muted group-hover:text-main'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-1 w-1 h-1 rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
