'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, 
  ArrowRight, 
  Target, 
  Calendar,
  Bell,
  Palette,
  Check,
  Sparkles
} from 'lucide-react'

// Validation schemas for each step
const step1Schema = z.object({
  name: z.string().min(2, 'Habit name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['health', 'fitness', 'productivity', 'mindfulness', 'nutrition', 'custom'])
})

const step2Schema = z.object({
  frequency: z.enum(['daily', 'weekly', 'weekdays', 'weekends']),
  targetCount: z.number().min(1, 'Target count must be at least 1').max(50, 'Target count must be 50 or less'),
  icon: z.string().min(1, 'Please select an icon'),
  color: z.string().min(1, 'Please select a color')
})

const step3Schema = z.object({
  remindersEnabled: z.boolean(),
  reminderTimes: z.array(z.string()).optional()
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

const HABIT_ICONS = [
  '💪', '🏃‍♂️', '📚', '💧', '🧘‍♀️', '🥗', '☕', '💤', '🚶‍♂️', '🏋️‍♀️',
  '🎯', '📝', '🎨', '🎵', '🧠', '💊', '🍎', '🕯️', '📱', '🌅',
  '🌙', '🍃', '🏆', '⭐', '🔥', '💎', '🌟', '🎪', '🎭', '🎨'
]

const HABIT_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#C026D3', '#DB2777', '#E11D48', '#DC2626'
]

const CATEGORIES = [
  { value: 'health', label: 'Health & Wellness', icon: '🏥' },
  { value: 'fitness', label: 'Fitness & Exercise', icon: '💪' },
  { value: 'productivity', label: 'Productivity', icon: '⚡' },
  { value: 'mindfulness', label: 'Mindfulness', icon: '🧘‍♀️' },
  { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { value: 'custom', label: 'Custom', icon: '🎯' }
]

export function HabitCreationForm() {
  const { 
    habitCreationStep, 
    nextHabitStep, 
    prevHabitStep, 
    createHabit,
    setCurrentView 
  } = useAppStore()
  
  const [selectedIcon, setSelectedIcon] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [reminderTimes, setReminderTimes] = useState<string[]>([])
  const [remindersEnabled, setRemindersEnabled] = useState(false)

  // Forms for each step
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      description: '',
      category: 'health'
    }
  })

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      frequency: 'daily',
      targetCount: 1,
      icon: '',
      color: ''
    }
  })

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      remindersEnabled: false,
      reminderTimes: []
    }
  })

  const handleStep1Submit = (data: Step1Data) => {
    console.log('Step 1 data:', data)
    nextHabitStep()
  }

  const handleStep2Submit = (data: Step2Data) => {
    console.log('Step 2 data:', data)
    step2Form.setValue('icon', selectedIcon)
    step2Form.setValue('color', selectedColor)
    nextHabitStep()
  }

  const handleStep3Submit = (data: Step3Data) => {
    console.log('Step 3 data:', data)
    
    // Combine all form data and create habit
    const step1Data = step1Form.getValues()
    const step2Data = step2Form.getValues()
    
    const habitData = {
      name: step1Data.name,
      description: step1Data.description,
      category: step1Data.category,
      frequency: step2Data.frequency,
      targetCount: step2Data.targetCount,
      icon: selectedIcon,
      color: selectedColor,
      isActive: true,
      reminders: {
        enabled: remindersEnabled,
        times: reminderTimes
      }
    }
    
    createHabit(habitData)
  }

  const addReminderTime = () => {
    const newTime = '09:00'
    if (reminderTimes.length < 5) {
      setReminderTimes([...reminderTimes, newTime])
    }
  }

  const updateReminderTime = (index: number, time: string) => {
    const updated = [...reminderTimes]
    updated[index] = time
    setReminderTimes(updated)
  }

  const removeReminderTime = (index: number) => {
    setReminderTimes(reminderTimes.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('habits')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Habits
          </Button>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create New Habit
          </h1>
          <p className="text-gray-600 mt-2">Step {habitCreationStep} of 3</p>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step <= habitCreationStep ? 'bg-purple-500' : 'bg-gray-200'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: step * 0.1 }}
              />
            ))}
          </div>
        </motion.div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Information */}
              {habitCreationStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Target className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800">What's your habit?</h3>
                    <p className="text-sm text-gray-600">Give your habit a name and description</p>
                  </div>

                  <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Habit Name</Label>
                      <Input
                        {...step1Form.register('name')}
                        placeholder="e.g., Morning Workout"
                        className="border-purple-200 focus:border-purple-500"
                      />
                      {step1Form.formState.errors.name && (
                        <p className="text-sm text-red-500">{step1Form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        {...step1Form.register('description')}
                        placeholder="Describe what this habit involves..."
                        rows={3}
                        className="border-purple-200 focus:border-purple-500"
                      />
                      {step1Form.formState.errors.description && (
                        <p className="text-sm text-red-500">{step1Form.formState.errors.description.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={(value) => step1Form.setValue('category', value as any)}>
                        <SelectTrigger className="border-purple-200 focus:border-purple-500">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center space-x-2">
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {step1Form.formState.errors.category && (
                        <p className="text-sm text-red-500">{step1Form.formState.errors.category.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Frequency & Appearance */}
              {habitCreationStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800">Set frequency & style</h3>
                    <p className="text-sm text-gray-600">How often and how it looks</p>
                  </div>

                  <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select onValueChange={(value) => step2Form.setValue('frequency', value as any)}>
                          <SelectTrigger className="border-purple-200">
                            <SelectValue placeholder="Daily" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="weekdays">Weekdays</SelectItem>
                            <SelectItem value="weekends">Weekends</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="targetCount">Target Count</Label>
                        <Input
                          {...step2Form.register('targetCount', { valueAsNumber: true })}
                          type="number"
                          placeholder="1"
                          min="1"
                          max="50"
                          className="border-purple-200"
                        />
                      </div>
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-3">
                      <Label>Choose an Icon</Label>
                      <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                        {HABIT_ICONS.map((icon, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedIcon(icon)}
                            className={`p-2 text-xl rounded-lg border-2 transition-all ${
                              selectedIcon === icon
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      {!selectedIcon && (
                        <p className="text-sm text-red-500">Please select an icon</p>
                      )}
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-3">
                      <Label>Choose a Color</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {HABIT_COLORS.map((color, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              selectedColor === color
                                ? 'border-gray-800 scale-110'
                                : 'border-gray-200 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {selectedColor === color && (
                              <Check className="w-4 h-4 text-white mx-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                      {!selectedColor && (
                        <p className="text-sm text-red-500">Please select a color</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button type="button" variant="outline" onClick={prevHabitStep} className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={!selectedIcon || !selectedColor}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Reminders */}
              {habitCreationStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Bell className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800">Set up reminders</h3>
                    <p className="text-sm text-gray-600">Get notified to stay on track</p>
                  </div>

                  <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">Enable Reminders</h4>
                        <p className="text-sm text-gray-600">Get notifications for this habit</p>
                      </div>
                      <Switch
                        checked={remindersEnabled}
                        onCheckedChange={setRemindersEnabled}
                      />
                    </div>

                    {remindersEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <Label>Reminder Times</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addReminderTime}
                            disabled={reminderTimes.length >= 5}
                          >
                            Add Time
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {reminderTimes.map((time, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                type="time"
                                value={time}
                                onChange={(e) => updateReminderTime(index, e.target.value)}
                                className="flex-1 border-purple-200"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeReminderTime(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>

                        {reminderTimes.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No reminder times set. Click "Add Time" to add reminders.
                          </p>
                        )}
                      </motion.div>
                    )}

                    <div className="flex space-x-2">
                      <Button type="button" variant="outline" onClick={prevHabitStep} className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Habit
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}