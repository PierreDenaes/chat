'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Bell, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Trophy,
  Zap,
  CheckCircle,
  Clock,
  Share2
} from 'lucide-react'

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to Habit Tracking!",
    description: "Build lasting habits with smart tracking",
    icon: Target,
    content: "Transform your daily routines into powerful habits that stick. Track progress, build streaks, and celebrate your wins!"
  },
  {
    id: 2,
    title: "Create Your Habits",
    description: "Personalized habit creation",
    icon: Calendar,
    content: "Set up habits that match your lifestyle. Choose frequency, set targets, and customize with icons and colors."
  },
  {
    id: 3,
    title: "Track Daily Progress",
    description: "Simple daily logging",
    icon: CheckCircle,
    content: "Mark habits as complete, track counts, and add notes. See your progress at a glance with visual indicators."
  },
  {
    id: 4,
    title: "Build Streaks & Stats",
    description: "Visual progress tracking",
    icon: TrendingUp,
    content: "Watch your streaks grow and analyze your patterns. Get insights into your success rates and consistency."
  },
  {
    id: 5,
    title: "Smart Reminders",
    description: "Never miss a habit",
    icon: Bell,
    content: "Set up personalized reminders to keep you on track. Get gentle nudges at the perfect times."
  },
  {
    id: 6,
    title: "Share Your Success",
    description: "Celebrate achievements",
    icon: Share2,
    content: "Share your milestone achievements and inspire others. Celebrate your wins and stay motivated!"
  }
]

export function HabitOnboarding() {
  const { setCurrentView } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding and go to habit creation
      setCurrentView('habit-creation')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setCurrentView('habits')
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === 'granted')
      console.log('Notification permission:', permission)
    }
  }

  const currentStepData = onboardingSteps[currentStep - 1]
  const IconComponent = currentStepData.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Progress Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-sm font-medium">Habit Tracker Setup</h2>
                <p className="text-xs opacity-90">Step {currentStep} of {onboardingSteps.length}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkip}
                className="text-white hover:bg-white/20"
              >
                Skip
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-white h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / onboardingSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentStepData.title}
                  </h3>
                  <p className="text-purple-600 font-medium mb-4">
                    {currentStepData.description}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {currentStepData.content}
                  </p>
                </div>

                {/* Special content for specific steps */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-4 mt-6"
                  >
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Set Goals</p>
                      <p className="text-xs text-gray-600">Define targets</p>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <Calendar className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Choose Frequency</p>
                      <p className="text-xs text-gray-600">Daily, weekly, etc.</p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-3 mt-6"
                  >
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                      <p className="text-xs font-medium">Complete</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                      <p className="text-xs font-medium">Track Time</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs font-medium">Count Progress</p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200"
                  >
                    <div className="flex items-center justify-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">7</div>
                        <div className="text-xs text-gray-600">Day Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600">85%</div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">24</div>
                        <div className="text-xs text-gray-600">Total Done</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bell className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-amber-800">Enable Habit Reminders</span>
                      </div>
                      <p className="text-sm text-amber-700 mb-4">
                        Get gentle reminders to complete your habits at the perfect times!
                      </p>
                      <Button
                        onClick={requestNotificationPermission}
                        disabled={notificationsEnabled}
                        className="w-full"
                        variant={notificationsEnabled ? "outline" : "default"}
                      >
                        {notificationsEnabled ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Notifications Enabled
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 mr-2" />
                            Enable Notifications
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 6 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <span className="font-medium text-gray-800">Share Your Achievements</span>
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        Celebrate milestones and inspire others with your habit success stories!
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center"
              >
                {currentStep === onboardingSteps.length ? (
                  <>
                    Create First Habit
                    <Zap className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}