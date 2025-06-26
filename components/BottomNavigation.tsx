'use client';

import { motion } from 'framer-motion';
import { Home, Plus, Target, History, User, ScanLine } from 'lucide-react';
import { useAppStore } from '@/lib/store';

/**
 * Main bottom navigation for primary app sections
 * Ensures all key views are directly accessible with consistent UX
 */
export function BottomNavigation() {
  const { currentView, setCurrentView } = useAppStore();

  // Primary navigation items for main app sections
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'camera', icon: Plus, label: 'Add Meal' }, // Direct to camera for quick food logging
    { id: 'habits', icon: Target, label: 'Habits' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  console.log('BottomNavigation render:', { currentView });

  // Helper function to determine if a nav item should be active
  const isActiveView = (itemId: string) => {
    // Handle special cases for related views
    switch (itemId) {
      case 'dashboard':
        return currentView === 'dashboard' || currentView === 'add-meal' || 
               currentView === 'scan' || currentView === 'search' || 
               currentView === 'ai' || currentView === 'quick-add' || currentView === 'library';
      case 'camera':
        return currentView === 'camera';
      case 'habits':
        return currentView === 'habits' || currentView === 'habit-creation' || currentView === 'habit-onboarding';
      case 'history':
        return currentView === 'history';
      case 'profile':
        return currentView === 'profile';
      default:
        return currentView === itemId;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 flex items-center justify-around h-20 z-50 max-w-md mx-auto shadow-xl">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = isActiveView(item.id);
        
        return (
          <motion.button
            key={item.id}
            onClick={() => {
              console.log('Navigation clicked:', item.id);
              setCurrentView(item.id);
            }}
            className={`relative flex flex-col items-center justify-center flex-1 py-2 px-1 transition-all duration-300 ${
              isActive 
                ? 'text-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: isActive ? 1 : 1.05 }}
            aria-label={`Navigate to ${item.label}`}
          >
            {/* Background indicator for active state */}
            {isActive && (
              <motion.div
                layoutId="activeBackground"
                className="absolute inset-0 bg-gradient-to-t from-purple-100/80 to-purple-50/60 rounded-2xl"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            
            {/* Icon container */}
            <motion.div
              className="relative z-10"
              animate={{ 
                scale: isActive ? 1.15 : 1,
                y: isActive ? -2 : 0
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 20,
                duration: 0.3 
              }}
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-purple-600 shadow-lg shadow-purple-200' 
                  : 'bg-transparent'
              }`}>
                <Icon className={`w-5 h-5 transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
            </motion.div>
            
            {/* Label */}
            <motion.span 
              className={`text-xs mt-1 font-medium transition-all duration-300 ${
                isActive ? 'text-purple-600 font-semibold' : 'text-gray-500'
              }`}
              animate={{ 
                opacity: isActive ? 1 : 0.8,
                y: isActive ? -1 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
            </motion.span>
            
            {/* Top indicator dot */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
                initial={false}
                transition={{ 
                  type: "spring", 
                  stiffness: 600, 
                  damping: 25,
                  duration: 0.4
                }}
              />
            )}
            
            {/* Ripple effect on tap */}
            <motion.div
              className="absolute inset-0 bg-purple-200/30 rounded-2xl opacity-0"
              whileTap={{ 
                opacity: [0, 0.5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Special indicator for Add Meal (camera) button */}
            {item.id === 'camera' && !isActive && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-white text-xs font-bold">+</span>
              </motion.div>
            )}
          </motion.button>
        );
      })}
      
      {/* Quick Access Floating Button for Food Logging Tools */}
      <motion.div
        className="absolute -top-4 right-4"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => setCurrentView('scan')}
          className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Quick scan"
        >
          <ScanLine className="w-5 h-5 text-white" />
        </motion.button>
      </motion.div>
    </div>
  );
}