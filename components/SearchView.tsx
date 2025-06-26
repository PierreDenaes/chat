'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';

export function SearchView() {
  const { setCurrentView } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const recentSearches = ['Chicken breast', 'Greek yogurt', 'Avocado', 'Oatmeal'];
  const popularFoods = ['Salmon', 'Quinoa', 'Sweet potato', 'Spinach', 'Almonds'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Search Foods</h1>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-6">
        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 rounded-xl"
          />
        </motion.div>

        {/* Recent Searches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Recent Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item, index) => (
              <motion.button
                key={item}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => setSearchQuery(item)}
                className="px-3 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm text-gray-700 border border-purple-200 hover:border-purple-400 hover:bg-white/90 transition-all"
              >
                {item}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Popular Foods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-gray-700">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Popular Foods</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popularFoods.map((item, index) => (
              <motion.button
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => setSearchQuery(item)}
                className="p-4 bg-white/70 backdrop-blur-sm rounded-xl text-left border border-purple-200 hover:border-purple-400 hover:bg-white/90 transition-all"
              >
                <span className="font-medium text-gray-900">{item}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Empty State */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Search results coming soon!
            </h3>
            <p className="text-gray-600">
              Food database integration is in development
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}