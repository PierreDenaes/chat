'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

/**
 * Navigation Audit Component
 * Monitors navigation state and ensures proper connectivity
 * Hidden utility component for debugging and state validation
 */
export function NavigationAudit() {
  const { currentView, previousView, isAuthenticated } = useAppStore();

  useEffect(() => {
    // Log navigation changes for debugging
    console.log('🧭 Navigation Audit:', {
      currentView,
      previousView,
      isAuthenticated,
      timestamp: new Date().toISOString()
    });

    // Validate view accessibility
    const allowedViews = [
      'dashboard', 'add-meal', 'history', 'profile', 'habits', 
      'habit-creation', 'habit-onboarding', 'camera', 'scan', 
      'search', 'ai', 'quick-add', 'library'
    ];

    const authRequiredViews = allowedViews;
    const publicViews = ['signup', 'onboarding'];

    // Check if user is trying to access authenticated views while not logged in
    if (!isAuthenticated && authRequiredViews.includes(currentView)) {
      console.warn('⚠️ Navigation Warning: Attempting to access authenticated view while not logged in:', currentView);
    }

    // Check if view is valid
    if (!allowedViews.includes(currentView) && !publicViews.includes(currentView)) {
      console.warn('⚠️ Navigation Warning: Invalid view accessed:', currentView);
    }

    // Performance monitoring
    const navigationStart = performance.now();
    requestAnimationFrame(() => {
      const navigationEnd = performance.now();
      const duration = navigationEnd - navigationStart;
      if (duration > 16) { // More than one frame
        console.warn('⚠️ Performance Warning: Navigation took longer than expected:', duration + 'ms');
      }
    });

  }, [currentView, previousView, isAuthenticated]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Navigation State Validator
 * Ensures state consistency and provides debugging info
 */
export function validateNavigationState() {
  const state = useAppStore.getState();
  
  const validation = {
    hasValidCurrentView: !!state.currentView,
    isAuthenticated: state.isAuthenticated,
    hasUser: !!state.user,
    totalMeals: state.todaysMeals.length,
    activeHabits: state.habits.filter(h => h.isActive).length,
    historicalDays: state.historicalData.length,
  };

  console.log('🔍 Navigation State Validation:', validation);
  return validation;
}

/**
 * Navigation Performance Monitor
 * Tracks view transition performance
 */
export class NavigationPerformanceMonitor {
  private static transitions: Array<{
    from: string;
    to: string;
    timestamp: number;
    duration?: number;
  }> = [];

  static recordTransition(from: string, to: string) {
    const timestamp = performance.now();
    this.transitions.push({ from, to, timestamp });
    
    // Keep only last 50 transitions
    if (this.transitions.length > 50) {
      this.transitions = this.transitions.slice(-50);
    }
  }

  static getStats() {
    const recent = this.transitions.slice(-10);
    const avgDuration = recent.reduce((sum, t) => sum + (t.duration || 0), 0) / recent.length;
    
    return {
      totalTransitions: this.transitions.length,
      recentTransitions: recent,
      averageTransitionTime: avgDuration,
      mostCommonTransitions: this.getMostCommonTransitions()
    };
  }

  private static getMostCommonTransitions() {
    const counts: Record<string, number> = {};
    this.transitions.forEach(t => {
      const key = `${t.from} → ${t.to}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([transition, count]) => ({ transition, count }));
  }
}