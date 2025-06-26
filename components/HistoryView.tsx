'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { MealCard } from './MealCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function HistoryView() {
  const { historicalData, setCurrentView } = useAppStore();
  
  console.log('HistoryView render:', { historicalDataCount: historicalData.length });

  // Prepare chart data
  const chartData = historicalData
    .slice(-7) // Last 7 days
    .map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      protein: day.totalProtein,
      goal: 120, // Should come from user settings
    }))
    .reverse();

  const averageProtein = Math.round(
    historicalData.reduce((sum, day) => sum + day.totalProtein, 0) / historicalData.length
  );

  const goalsAchieved = historicalData.filter(day => day.goalAchieved).length;
  const totalDays = historicalData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">History</h1>
        </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="font-bold text-lg">{averageProtein}g</div>
            <div className="text-xs text-gray-500">Avg Daily</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 text-pink-600 mx-auto mb-2" />
            <div className="font-bold text-lg">{goalsAchieved}/{totalDays}</div>
            <div className="text-xs text-gray-500">Goals Met</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">7-Day Protein Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#64748B"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#64748B"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    stroke="#9333EA" 
                    strokeWidth={3}
                    dot={{ fill: '#9333EA', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#9333EA' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="goal" 
                    stroke="#94A3B8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Historical Days */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Days
        </h2>
        
        <div className="space-y-4">
          {historicalData.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={day.goalAchieved ? 'default' : 'secondary'}
                        className={day.goalAchieved ? 'bg-purple-600' : ''}
                      >
                        {day.totalProtein}g / 120g
                      </Badge>
                      {day.goalAchieved && (
                        <span className="text-lg">🎯</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {day.meals.map((meal) => (
                    <div key={meal.id} className="border-l-4 border-purple-600 pl-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{meal.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(meal.timestamp).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-purple-600">
                            {meal.protein}g
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
      </div>
    </div>
  );
}