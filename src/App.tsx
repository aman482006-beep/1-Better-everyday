/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveWorkoutScreen } from './components/ActiveWorkoutScreen';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { RestTimerOverlay } from './components/RestTimerOverlay';
import { SocialShareModal } from './components/SocialShareModal';
import { ExercisesView } from './components/views/ExercisesView';
import { HomeView } from './components/views/HomeView';
import { ProfileView } from './components/views/ProfileView';
import { ProgressView } from './components/views/ProgressView';
import { WorkoutsView } from './components/views/WorkoutsView';
import { WorkoutCompleteModal } from './components/WorkoutCompleteModal';
import { ThemeModal } from './components/ThemeModal';
import { OfflineCacheToast } from './components/OfflineCacheToast';
import { OfflineCacheModal } from './components/OfflineCacheModal';
import { useServiceWorker } from './hooks/useServiceWorker';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';

const MainApp: React.FC = () => {
  const {
    activeWorkout,
    startEmptyWorkout,
    completedWorkoutSummary,
    closeCompletedSummary,
    shareModalWorkout,
    closeShareModal,
    openShareModal,
    isThemeModalOpen,
    closeThemeModal,
    isOfflineModalOpen,
    openOfflineModal,
    closeOfflineModal,
  } = useWorkout();

  const {
    swStatus,
    isOfflineReady,
    isOnline,
    activeNotification,
    storageBreakdown,
    dismissNotification,
    verifyAndRefreshCache,
    updateApp,
  } = useServiceWorker();

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isWorkoutScreenMinimized, setIsWorkoutScreenMinimized] = useState(false);

  // If user starts workout or there's an active workout and it's not minimized, show active workout screen
  const showActiveWorkoutModal = activeWorkout !== null && !isWorkoutScreenMinimized;

  return (
    <div className="min-h-screen bg-app text-main flex flex-col font-sans transition-colors duration-150">
      {/* Top Header */}
      <Header onStartEmptyWorkout={() => {
        startEmptyWorkout();
        setIsWorkoutScreenMinimized(false);
      }} />

      {/* Main View Scroll Area */}
      <main className="flex-1 w-full max-w-lg mx-auto">
        {currentTab === 'home' && (
          <HomeView
            onStartEmpty={() => {
              startEmptyWorkout();
              setIsWorkoutScreenMinimized(false);
            }}
            onNavigateToWorkouts={() => setCurrentTab('workouts')}
            onNavigateToExercises={() => setCurrentTab('exercises')}
            onNavigateToProgress={() => setCurrentTab('progress')}
            onOpenAddWeightModal={() => setCurrentTab('progress')}
          />
        )}

        {currentTab === 'workouts' && (
          <WorkoutsView
            onStartEmpty={() => {
              startEmptyWorkout();
              setIsWorkoutScreenMinimized(false);
            }}
          />
        )}

        {currentTab === 'exercises' && <ExercisesView />}

        {currentTab === 'progress' && <ProgressView />}

        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Persistent Bottom Navigation & Mini Workout Bar */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenActiveWorkout={() => setIsWorkoutScreenMinimized(false)}
      />

      {/* Floating Rest Timer countdown banner */}
      <RestTimerOverlay />

      {/* Fullscreen Active Workout Takeover */}
      {showActiveWorkoutModal && (
        <ActiveWorkoutScreen onMinimize={() => setIsWorkoutScreenMinimized(true)} />
      )}

      {/* Workout Completion Summary Celebratory Modal */}
      <WorkoutCompleteModal
        workout={completedWorkoutSummary}
        onClose={closeCompletedSummary}
        onOpenShare={(w) => {
          closeCompletedSummary();
          openShareModal(w);
        }}
      />

      {/* Social Media Share Card Generator Modal */}
      <SocialShareModal
        workout={shareModalWorkout}
        onClose={closeShareModal}
      />

      {/* Theme & Palette Switcher Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={closeThemeModal}
      />

      {/* PWA Service Worker & Offline Cache Toast Notification */}
      <OfflineCacheToast
        notification={activeNotification}
        onDismiss={dismissNotification}
        onUpdateApp={updateApp}
        onOpenDetails={openOfflineModal}
      />

      {/* PWA Service Worker & Offline Cache Details Modal */}
      <OfflineCacheModal
        isOpen={isOfflineModalOpen}
        onClose={closeOfflineModal}
        isOnline={isOnline}
        swStatus={swStatus}
        isOfflineReady={isOfflineReady}
        storageBreakdown={storageBreakdown}
        onVerifyCache={verifyAndRefreshCache}
      />
    </div>
  );
};

export default function App() {
  return (
    <WorkoutProvider>
      <MainApp />
    </WorkoutProvider>
  );
}
