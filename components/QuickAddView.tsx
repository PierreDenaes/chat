'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

export function QuickAddView() {
  const { setCurrentView, addMeal } = useAppStore();
  const [selectedQuickMeal, setSelectedQuickMeal] = useState<string | null>(null);

  const quickMeals = [
    { name: 'Protein Shake', protein: 25, calories: 150, time: '1 min' },
    { name: 'Greek Yogurt', protein: 20, calories: 130, time: '1 min' },
    { name: 'Chicken Breast', protein: 31, calories: 165, time: '2 min' },
    { name: 'Tuna Can', protein: 25, calories: 110, time: '1 min' },
    { name: 'Hard-Boiled Eggs', protein: 12, calories: 140, time: '1 min' },
    { name: 'Cottage Cheese', protein: 14, calories: 90, time: '1 min' }
  ];

  const handleQuickAdd = (meal: typeof quickMeals[0]) => {
    setSelectedQuickMeal(meal.name);
    
    // Simulate quick add
    setTimeout(() => {
      addMeal({
        description: meal.name,
        protein: meal.protein,
        estimatedBy: 'manual',
        ingredients: [`${meal.name} (1 serving)`]
      });
      setCurrentView('dashboard');
    }, 1000);
  };

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
        <h1 className="text-lg font-semibold text-gray-900">Quick Add</h1>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Lightning Fast Logging
          </h2>
          <p className="text-gray-600">
            Add common foods with one tap
          </p>
        </motion.div>

        {/* Quick Add Grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickMeals.map((meal, index) => (
            <motion.div
              key={meal.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`p-4 bg-white/70 backdrop-blur-sm border-purple-200 hover:border-purple-400 cursor-pointer transition-all ${
                  selectedQuickMeal === meal.name ? 'border-purple-500 bg-purple-50/50' : ''
                }`}
                onClick={() => handleQuickAdd(meal)}
              >
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{meal.name}</h3>
                  <div className="space-y-1">
                    <div className="text-xs text-purple-600 font-medium">
                      {meal.protein}g protein
                    </div>
                    <div className="text-xs text-gray-500">
                      {meal.calories} cal
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {meal.time}
                    </div>
                  </div>
                  
                  {selectedQuickMeal === meal.name ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Plus className="h-4 w-4 text-white" />
                    </motion.div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-purple-300 rounded-full flex items-center justify-center mx-auto">
                      <Plus className="h-4 w-4 text-purple-400" />
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Custom Quick Add */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <h3 className="font-medium text-gray-900">Custom Quick Add</h3>
          <div className="space-y-3">
            <Input 
              placeholder="Food name" 
              className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input 
                placeholder="Protein (g)" 
                type="number"
                className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
              />
              <Input 
                placeholder="Calories" 
                type="number"
                className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
              />
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Add Custom Food
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}