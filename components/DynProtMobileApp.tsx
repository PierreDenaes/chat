'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Toaster } from '@/components/ui/sonner';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { OnboardingFlow } from './OnboardingFlow';
import { HabitTracker } from './HabitTracker';
import { HabitCreationForm } from './HabitCreationForm';
import { HabitOnboarding } from './HabitOnboarding';
import { Dashboard } from './Dashboard';
import { AddMealForm } from './AddMealForm';
import { HistoryView } from './HistoryView';
import { ProfileView } from './ProfileView';
import { BottomNavigation } from './BottomNavigation';

export function DynProtMobileApp() {
  const { isAuthenticated, currentView, loadHistoricalData, setCurrentView } = useAppStore();

  console.log('DynProtMobileApp render:', { isAuthenticated, currentView });

  useEffect(() => {
    if (isAuthenticated) {
      loadHistoricalData();
      
      // Handle PWA shortcuts
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      if (action === 'add-meal') {
        setCurrentView('add-meal');
      }
      
      // Mock notification registration
      if ('serviceWorker' in navigator) {
        console.log('Service Worker support detected - PWA features available');
        
        // Register for push notifications (mock)
        if ('Notification' in window && Notification.permission === 'default') {
          console.log('Notification permission available');
        }
      }
    }
  }, [isAuthenticated, loadHistoricalData, setCurrentView]);

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.3
  };

  // Authentication flow
  if (!isAuthenticated) {
    if (currentView === 'signup') {
      return (
        <>
          <SignupForm />
          <Toaster position="top-center" />
        </>
      );
    }
    return (
      <>
        <LoginForm />
        <Toaster position="top-center" />
      </>
    );
  }

  // Onboarding flow
  if (currentView === 'onboarding') {
    return (
      <>
        <OnboardingFlow />
        <Toaster position="top-center" />
      </>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-meal':
        return <AddMealForm />;
      case 'habits':
        return <HabitTracker />;
      case 'habit-creation':
        return <HabitCreationForm />;
      case 'habit-onboarding':
        return <HabitOnboarding />;
      case 'history':
        return <HistoryView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-health-bg">
      {/* Main Content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentView}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}