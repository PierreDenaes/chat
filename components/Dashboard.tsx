'use client';

import { motion } from 'framer-motion';
import { Plus, Target, TrendingUp, User, Utensils, Activity, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { GoalProgressCard } from './GoalProgressCard';
import { MealCard } from './MealCard';
import { PhysicalProgress } from './PhysicalProgress';

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
      <div className="max-w-md mx-auto space-y-8">
        
        {/* Main Dashboard Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        {/* Section 1: User Welcome & Protein Summary */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Welcome & Progress</h2>
          </div>
          
          {/* Welcome Message */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-700 mb-1">
              Hello, {user?.name}! 👋
            </h3>
            <p className="text-gray-600 text-sm">
              Let's check your protein progress today
            </p>
          </div>

          {/* Enhanced Goal Progress Card */}
          <GoalProgressCard 
            totalProteinToday={totalProteinToday}
            dailyProteinGoal={dailyProteinGoal}
          />
        </motion.section>

        {/* Section Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <Separator className="flex-1 bg-gradient-to-r from-purple-200 to-pink-200" />
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
          <Separator className="flex-1 bg-gradient-to-r from-pink-200 to-purple-200" />
        </motion.div>

        {/* Section 2: Nutrition Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <Utensils className="w-5 h-5 text-pink-600" />
            <h2 className="text-lg font-semibold text-gray-800">Nutrition Overview</h2>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Today's Meals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">
                Today's Meals
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentView('camera')}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Photo
                </Button>
                <Button
                  onClick={() => setCurrentView('add-meal')}
                  size="sm"
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Manual
                </Button>
              </div>
            </div>

            {todaysMeals.length === 0 ? (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No meals logged today</p>
                    <p className="text-sm">Start by adding your first meal!</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setCurrentView('camera')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      onClick={() => setCurrentView('add-meal')}
                      variant="outline"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Manual
                    </Button>
                  </div>
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
          </div>
        </motion.section>

        {/* Section Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-4"
        >
          <Separator className="flex-1 bg-gradient-to-r from-purple-200 to-pink-200" />
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
          <Separator className="flex-1 bg-gradient-to-r from-pink-200 to-purple-200" />
        </motion.div>

        {/* Section 3: Physical Progress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Physical Progress</h2>
          </div>

          {/* Physical Progress Component */}
          <PhysicalProgress />
        </motion.section>


      </div>
    </div>
  );
}