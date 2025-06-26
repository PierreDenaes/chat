'use client';

import { motion } from 'framer-motion';
import { Plus, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { ProteinProgressRing } from './ProteinProgressRing';
import { MealCard } from './MealCard';

export function Dashboard() {
  const { 
    user, 
    todaysMeals, 
    totalProteinToday, 
    dailyProteinGoal, 
    deleteMeal, 
    setCurrentView 
  } = useAppStore();

  const progressPercentage = Math.round((totalProteinToday / dailyProteinGoal) * 100);
  const remainingProtein = Math.max(0, dailyProteinGoal - totalProteinToday);

  console.log('Dashboard render:', { 
    totalProteinToday, 
    dailyProteinGoal, 
    mealsCount: todaysMeals.length 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

      {/* Protein Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <ProteinProgressRing 
              current={totalProteinToday} 
              goal={dailyProteinGoal} 
            />
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-purple-600 font-bold text-lg">
                  {progressPercentage}%
                </div>
                <div className="text-gray-500">Goal Progress</div>
              </div>
              <div>
                <div className="text-pink-600 font-bold text-lg">
                  {remainingProtein}g
                </div>
                <div className="text-gray-500">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="font-bold text-lg">{dailyProteinGoal}g</div>
            <div className="text-xs text-gray-500">Daily Goal</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-pink-600 mx-auto mb-2" />
            <div className="font-bold text-lg">{todaysMeals.length}</div>
            <div className="text-xs text-gray-500">Meals Today</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Meals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Today's Meals
          </h2>
          <Button
            onClick={() => setCurrentView('add-meal')}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Meal
          </Button>
        </div>

        {todaysMeals.length === 0 ? (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No meals logged today</p>
                <p className="text-sm">Start by adding your first meal!</p>
              </div>
              <Button
                onClick={() => setCurrentView('add-meal')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Add Your First Meal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {todaysMeals.map((meal, index) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <MealCard meal={meal} onDelete={deleteMeal} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setCurrentView('add-meal')}
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Add meal"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
      </div>
    </div>
  );
}