'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp, 
  Fire, 
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Bell,
  Trophy,
  Zap,
  BarChart3
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export function HabitTracker() {
  const { 
    habits, 
    habitLogs, 
    habitStats, 
    startHabitCreation,
    logHabit,
    deleteHabit,
    shareHabitProgress,
    calculateHabitStats,
    setCurrentView
  } = useAppStore()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showStats, setShowStats] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLogs = habitLogs.filter(log => log.date === today)

  // Calculate stats for all habits
  useEffect(() => {
    habits.forEach(habit => {
      if (habit.isActive) {
        calculateHabitStats(habit.id)
      }
    })
  }, [habits, habitLogs, calculateHabitStats])

  const handleHabitToggle = (habitId: string, currentStatus: boolean) => {
    console.log('Toggling habit:', habitId, !currentStatus)
    logHabit(habitId, !currentStatus)
  }

  const handleHabitCount = (habitId: string, count: number) => {
    console.log('Updating habit count:', habitId, count)
    const existingLog = todayLogs.find(log => log.habitId === habitId)
    logHabit(habitId, count > 0, count)
  }

  const getHabitProgress = (habitId: string) => {
    const log = todayLogs.find(log => log.habitId === habitId)
    const habit = habits.find(h => h.id === habitId)
    if (!habit || !log) return 0
    return Math.min((log.count / habit.targetCount) * 100, 100)
  }

  const getHabitStatus = (habitId: string) => {
    const log = todayLogs.find(log => log.habitId === habitId)
    return log?.completed || false
  }

  const getCompletedHabitsCount = () => {
    return todayLogs.filter(log => log.completed).length
  }

  const getWeeklyProgress = () => {
    const weekStart = startOfWeek(new Date())
    const weekEnd = endOfWeek(new Date())
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    return weekDays.map(day => {
      const dayString = format(day, 'yyyy-MM-dd')
      const dayLogs = habitLogs.filter(log => log.date === dayString)
      const completedCount = dayLogs.filter(log => log.completed).length
      const totalHabits = habits.filter(h => h.isActive).length
      
      return {
        date: day,
        completion: totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0,
        completed: completedCount,
        total: totalHabits
      }
    })
  }

  const weeklyData = getWeeklyProgress()
  const completedToday = getCompletedHabitsCount()
  const totalActiveHabits = habits.filter(h => h.isActive).length
  const overallProgress = totalActiveHabits > 0 ? (completedToday / totalActiveHabits) * 100 : 0

  if (habits.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Start Your Habit Journey
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Create your first habit and begin building a better you, one day at a time.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={startHabitCreation}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Habit
                  </Button>
                </motion.div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    💡 Pro tip: Start with small, achievable habits for better success rates
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Habit Tracker
          </h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Today's Progress</h3>
                  <p className="text-sm text-gray-600">
                    {completedToday} of {totalActiveHabits} habits completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(overallProgress)}%
                  </div>
                  <div className="flex items-center space-x-1">
                    <Fire className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">
                      {Math.max(...Object.values(habitStats).map(stat => stat.streak.currentStreak), 0)} day streak
                    </span>
                  </div>
                </div>
              </div>
              
              <Progress value={overallProgress} className="h-3 mb-4" />
              
              {/* Weekly Calendar */}
              <div className="grid grid-cols-7 gap-1">
                {weeklyData.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">
                      {format(day.date, 'EEE')}
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        isToday(day.date)
                          ? 'bg-purple-500 text-white'
                          : day.completion === 100
                          ? 'bg-green-500 text-white'
                          : day.completion > 0
                          ? 'bg-yellow-400 text-gray-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {format(day.date, 'd')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Habits List */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Your Habits ({habits.filter(h => h.isActive).length})
            </h2>
            <Button
              onClick={() => setShowStats(!showStats)}
              variant="outline"
              size="sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showStats ? 'Hide' : 'Show'} Stats
            </Button>
          </div>

          <AnimatePresence>
            {habits.filter(h => h.isActive).map((habit, index) => {
              const isCompleted = getHabitStatus(habit.id)
              const progress = getHabitProgress(habit.id)
              const stats = habitStats[habit.id]
              const todayLog = todayLogs.find(log => log.habitId === habit.id)

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: habit.color + '20' }}
                          >
                            {habit.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-800 truncate">
                                {habit.name}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {habit.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {habit.description}
                            </p>
                            
                            {/* Progress for multi-count habits */}
                            {habit.targetCount > 1 && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{todayLog?.count || 0} / {habit.targetCount}</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            )}
                            
                            {/* Stats */}
                            {showStats && stats && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-gray-100"
                              >
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-800">
                                      {stats.streak.currentStreak}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Current Streak
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-800">
                                      {Math.round(stats.completionRate)}%
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Success Rate
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-800">
                                      {stats.totalCompletions}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Total Done
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Complete Button */}
                          <Button
                            variant={isCompleted ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleHabitToggle(habit.id, isCompleted)}
                            className={isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </Button>

                          {/* Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => shareHabitProgress(habit.id, 'twitter')}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteHabit(habit.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Habit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Achievements */}
        {Object.values(habitStats).some(stat => stat.streak.currentStreak >= 7) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                🎉 Congratulations! You have a 7+ day streak! Keep up the great work!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Add New Habit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={startHabitCreation}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Habit
          </Button>
        </motion.div>
      </div>
    </div>
  )
}