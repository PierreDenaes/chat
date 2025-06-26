'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Target, 
  Camera, 
  BarChart3, 
  Bell, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Trophy,
  Utensils,
  Zap
} from 'lucide-react'

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to DynProt!",
    description: "Your personal protein tracking companion",
    icon: Trophy,
    content: "Track your daily protein intake with ease using AI-powered meal recognition and smart logging features."
  },
  {
    id: 2,
    title: "Set Your Goals",
    description: "Personalized protein targets",
    icon: Target,
    content: "We've calculated your optimal protein intake based on your profile. You can always adjust this later in settings."
  },
  {
    id: 3,
    title: "Log Your Meals",
    description: "Multiple ways to track",
    icon: Utensils,
    content: "Add meals by description, take photos, or use our quick-add feature. Our AI will estimate protein content automatically."
  },
  {
    id: 4,
    title: "Track Progress",
    description: "Visual insights & analytics",
    icon: BarChart3,
    content: "Monitor your daily progress with beautiful charts and get insights into your protein intake patterns."
  },
  {
    id: 5,
    title: "Stay Motivated",
    description: "Notifications & reminders",
    icon: Bell,
    content: "Get gentle reminders to log meals and celebrate when you hit your daily protein goals!"
  }
]

export function OnboardingFlow() {
  const { setCurrentView, user, dailyProteinGoal } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding and show habit onboarding
      setCurrentView('habit-onboarding')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setCurrentView('dashboard')
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Progress Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-sm font-medium">Welcome, {user?.name}!</h2>
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
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentStepData.title}
                  </h3>
                  <p className="text-emerald-600 font-medium mb-4">
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
                    className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 border border-emerald-200"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Target className="w-5 h-5 text-emerald-600" />
                      <span className="text-lg font-semibold text-gray-800">
                        Your daily goal: {dailyProteinGoal}g protein
                      </span>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-4 mt-6"
                  >
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Utensils className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Text Description</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Camera className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Photo Recognition</p>
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
                        <span className="font-medium text-amber-800">Enable Notifications</span>
                      </div>
                      <p className="text-sm text-amber-700 mb-4">
                        Get helpful reminders to log your meals and celebrate your achievements!
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
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 flex items-center"
              >
                {currentStep === onboardingSteps.length ? (
                  <>
                    Get Started
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