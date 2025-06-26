'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ScanLine, Search, Sparkles, Plus, Library, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

/**
 * Enhanced Floating Action Button with expandable menu
 * Main FAB always shows camera icon, expands to show food logging tools
 */
export function SecondaryNavigation() {
  const { currentView, setCurrentView } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const actionItems = [
    { id: 'camera', icon: Camera, label: 'Take Photo', color: 'from-purple-500 to-pink-500', isPrimary: true },
    { id: 'scan', icon: ScanLine, label: 'Scan Barcode', color: 'from-blue-500 to-blue-600' },
    { id: 'search', icon: Search, label: 'Search Food', color: 'from-green-500 to-green-600' },
    { id: 'ai', icon: Sparkles, label: 'AI Assistant', color: 'from-purple-500 to-purple-600' },
    { id: 'quick-add', icon: Plus, label: 'Quick Add', color: 'from-orange-500 to-orange-600' },
    { id: 'library', icon: Library, label: 'My Library', color: 'from-pink-500 to-pink-600' },
  ] as const;

  // Only show on dashboard and related views
  const shouldShow = ['dashboard', 'add-meal', 'scan', 'search', 'ai', 'quick-add', 'library', 'camera'].includes(currentView);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isExpanded]);

  const handleMainAction = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      // Primary action: go to camera
      setCurrentView('camera');
    }
  };

  const handleSecondaryAction = (itemId: string) => {
    console.log('FAB action selected:', itemId);
    setCurrentView(itemId as any);
    setIsExpanded(false);
  };

  if (!shouldShow) return null;

  return (
    <>
      {/* Background Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div 
        ref={menuRef}
        className="fixed bottom-32 right-6 z-50"
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ 
                duration: 0.3, 
                type: "spring", 
                stiffness: 400, 
                damping: 25 
              }}
              className="absolute bottom-20 right-0 flex flex-col items-end space-y-3"
            >
              {/* Action Menu Items */}
              {actionItems.slice(1).map((item, index) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{ 
                      delay: index * 0.05,
                      duration: 0.2,
                      type: "spring",
                      stiffness: 300
                    }}
                    className="flex items-center space-x-3"
                  >
                    {/* Label */}
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.05) + 0.1 }}
                      className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-gray-200/50"
                    >
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        {item.label}
                      </span>
                    </motion.div>
                    
                    {/* Action Button */}
                    <motion.button
                      onClick={() => handleSecondaryAction(item.id)}
                      className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-white border-2 border-purple-400' 
                          : 'bg-gradient-to-r ' + item.color + ' hover:shadow-xl'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={item.label}
                    >
                      <Icon className={`w-5 h-5 ${
                        isActive ? 'text-purple-600' : 'text-white'
                      }`} />
                    </motion.button>
                  </motion.div>
                );
              })}
              
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.3 }}
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-full bg-gray-600/90 backdrop-blur-sm flex items-center justify-center text-white shadow-lg mt-4"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(75, 85, 99, 1)' }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.div className="relative">
          {/* Main Action Button */}
          <motion.button
            onClick={handleMainAction}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-xl flex items-center justify-center text-white relative"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              rotate: isExpanded ? 45 : 0,
              backgroundColor: isExpanded ? '#6B7280' : undefined
            }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            aria-label={isExpanded ? "Close menu" : "Take photo"}
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="x"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-7 h-7" />
                </motion.div>
              ) : (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Camera className="w-7 h-7" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Expand Indicator */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              opacity: isExpanded ? 0 : 1,
              scale: isExpanded ? 0 : 1
            }}
            transition={{ duration: 0.2 }}
            aria-label="Expand menu"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Plus className="w-3 h-3 text-purple-600" />
            </motion.div>
          </motion.button>

          {/* Pulse Animation for Attention */}
          {!isExpanded && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      </div>
    </>
  );
}