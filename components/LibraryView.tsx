'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, Star, Clock, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';

export function LibraryView() {
  const { setCurrentView } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const savedFoods = [
    { name: 'Grilled Salmon', protein: 35, calories: 280, lastUsed: '2 days ago', favorite: true },
    { name: 'Quinoa Bowl', protein: 18, calories: 320, lastUsed: '3 days ago', favorite: false },
    { name: 'Protein Smoothie', protein: 28, calories: 240, lastUsed: '1 day ago', favorite: true },
    { name: 'Greek Chicken', protein: 42, calories: 320, lastUsed: '1 week ago', favorite: false }
  ];

  const recipes = [
    { name: 'High-Protein Pancakes', protein: 25, calories: 280, servings: 2, favorite: true },
    { name: 'Lean Beef Stir Fry', protein: 38, calories: 420, servings: 3, favorite: false },
    { name: 'Protein Power Bowl', protein: 32, calories: 380, servings: 1, favorite: true }
  ];

  const mealPlans = [
    { name: 'Muscle Building Week', totalProtein: 840, days: 7, active: true },
    { name: 'Lean Gains Plan', totalProtein: 700, days: 5, active: false }
  ];

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
        <h1 className="text-lg font-semibold text-gray-900">Food Library</h1>
        <div className="w-8" />
      </div>

      <div className="p-4">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 rounded-xl"
          />
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="foods" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm border border-purple-200">
            <TabsTrigger value="foods">Saved Foods</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="plans">Meal Plans</TabsTrigger>
          </TabsList>

          {/* Saved Foods Tab */}
          <TabsContent value="foods" className="space-y-3">
            {savedFoods.map((food, index) => (
              <motion.div
                key={food.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white/70 backdrop-blur-sm border-purple-200 hover:border-purple-400 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{food.name}</h3>
                        {food.favorite && (
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="text-purple-600 font-medium">{food.protein}g protein</span>
                        <span>{food.calories} cal</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {food.lastUsed}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-purple-200 hover:border-purple-400">
                      Add
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-3">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white/70 backdrop-blur-sm border-purple-200 hover:border-purple-400 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                        {recipe.favorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="text-purple-600 font-medium">{recipe.protein}g protein</span>
                        <span>{recipe.calories} cal</span>
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-purple-200 hover:border-purple-400">
                      Cook
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Meal Plans Tab */}
          <TabsContent value="plans" className="space-y-3">
            {mealPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white/70 backdrop-blur-sm border-purple-200 hover:border-purple-400 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        {plan.active && (
                          <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            Active
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="text-purple-600 font-medium">{plan.totalProtein}g total protein</span>
                        <span>{plan.days} days</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-purple-200 hover:border-purple-400">
                      {plan.active ? 'View' : 'Start'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}