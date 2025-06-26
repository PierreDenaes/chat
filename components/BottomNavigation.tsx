'use client';

import { motion } from 'framer-motion';
import { Home, Plus, BarChart3, User, Target } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function BottomNavigation() {
  const { currentView, setCurrentView } = useAppStore();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'add-meal', icon: Plus, label: 'Add Meal' },
    { id: 'habits', icon: Target, label: 'Habits' },
    { id: 'history', icon: BarChart3, label: 'History' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  console.log('BottomNavigation render:', { currentView });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-purple-100 flex items-center justify-around h-16 z-40 max-w-md mx-auto shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <motion.button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
              isActive 
                ? 'text-purple-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ 
                scale: isActive ? 1.1 : 1,
                color: isActive ? '#9333EA' : '#94A3B8'
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            
            <span className="text-xs mt-1 font-medium">
              {item.label}
            </span>
            
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}