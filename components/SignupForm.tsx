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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  Weight, 
  Activity,
  Shield,
  Github,
  Linkedin,
  Chrome,
  Check,
  Loader2
} from 'lucide-react'

// Validation schemas for each step
const step1Schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const step2Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(13, 'Must be at least 13 years old').max(120, 'Please enter a valid age').optional(),
  weight: z.number().min(30, 'Please enter a valid weight').max(300, 'Please enter a valid weight').optional(),
  height: z.number().min(100, 'Please enter height in cm').max(250, 'Please enter a valid height').optional()
})

const step3Schema = z.object({
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']),
  proteinGoal: z.number().min(50, 'Minimum 50g protein').max(300, 'Maximum 300g protein').optional()
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

export function SignupForm() {
  const { 
    signupStep, 
    signupData, 
    updateSignupData, 
    nextSignupStep, 
    prevSignupStep, 
    completeSignup,
    socialLogin,
    setCurrentView 
  } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  // Forms for each step
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      email: signupData.email || '',
      password: '',
      confirmPassword: ''
    }
  })

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      name: signupData.name || '',
      age: signupData.age,
      weight: signupData.weight,
      height: signupData.height
    }
  })

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      activityLevel: signupData.activityLevel,
      proteinGoal: signupData.proteinGoal
    }
  })

  const handleStep1Submit = (data: Step1Data) => {
    console.log('Step 1 data:', data)
    updateSignupData({ email: data.email, password: data.password })
    nextSignupStep()
  }

  const handleStep2Submit = (data: Step2Data) => {
    console.log('Step 2 data:', data)
    updateSignupData(data)
    
    // Calculate recommended protein goal based on weight and activity
    if (data.weight) {
      const baseProtein = data.weight * 0.8 // Base recommendation
      const activityMultiplier = signupData.activityLevel === 'very-active' ? 1.6 : 
                                signupData.activityLevel === 'active' ? 1.4 :
                                signupData.activityLevel === 'moderate' ? 1.2 : 1.0
      const recommendedProtein = Math.round(baseProtein * activityMultiplier)
      updateSignupData({ proteinGoal: recommendedProtein })
      step3Form.setValue('proteinGoal', recommendedProtein)
    }
    
    nextSignupStep()
  }

  const handleStep3Submit = (data: Step3Data) => {
    console.log('Step 3 data:', data)
    updateSignupData(data)
    nextSignupStep()
  }

  const handleFinalSubmit = async () => {
    if (!captchaVerified || !agreeToTerms) return
    
    setIsLoading(true)
    console.log('Completing signup...')
    
    // Mock delay for API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    completeSignup()
    setIsLoading(false)
  }

  const handleSocialLogin = (provider: 'google' | 'github' | 'linkedin') => {
    console.log('Social login:', provider)
    socialLogin(provider)
  }

  const mockCaptchaVerify = () => {
    console.log('CAPTCHA verification')
    setCaptchaVerified(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Join DynProt
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Step {signupStep} of 4 - Create your protein tracking account
              </CardDescription>
            </motion.div>
            
            {/* Progress indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <motion.div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    step <= signupStep ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: step * 0.1 }}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Email & Password */}
              {signupStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Account Credentials</h3>
                    <p className="text-sm text-gray-600">Set up your login information</p>
                  </div>

                  {/* Social Login Options */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('google')}
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Continue with Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('github')}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Continue with GitHub
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('linkedin')}
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      Continue with LinkedIn
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          {...step1Form.register('email')}
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                        />
                      </div>
                      {step1Form.formState.errors.email && (
                        <p className="text-sm text-red-500">{step1Form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          {...step1Form.register('password')}
                          type="password"
                          placeholder="Create a strong password"
                          className="pl-10"
                        />
                      </div>
                      {step1Form.formState.errors.password && (
                        <p className="text-sm text-red-500">{step1Form.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          {...step1Form.register('confirmPassword')}
                          type="password"
                          placeholder="Confirm your password"
                          className="pl-10"
                        />
                      </div>
                      {step1Form.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{step1Form.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Personal Information */}
              {signupStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                    <p className="text-sm text-gray-600">Help us personalize your experience</p>
                  </div>

                  <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          {...step2Form.register('name')}
                          placeholder="Enter your full name"
                          className="pl-10"
                        />
                      </div>
                      {step2Form.formState.errors.name && (
                        <p className="text-sm text-red-500">{step2Form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age (optional)</Label>
                        <Input
                          {...step2Form.register('age', { valueAsNumber: true })}
                          type="number"
                          placeholder="Age"
                          min="13"
                          max="120"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <div className="relative">
                          <Weight className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            {...step2Form.register('weight', { valueAsNumber: true })}
                            type="number"
                            placeholder="70"
                            className="pl-10"
                            min="30"
                            max="300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm, optional)</Label>
                      <Input
                        {...step2Form.register('height', { valueAsNumber: true })}
                        type="number"
                        placeholder="170"
                        min="100"
                        max="250"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button type="button" variant="outline" onClick={prevSignupStep} className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600">
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Activity & Goals */}
              {signupStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Activity & Goals</h3>
                    <p className="text-sm text-gray-600">Set your fitness preferences</p>
                  </div>

                  <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="activityLevel">Activity Level</Label>
                      <Select 
                        onValueChange={(value) => step3Form.setValue('activityLevel', value as any)}
                        defaultValue={signupData.activityLevel}
                      >
                        <SelectTrigger>
                          <div className="flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="Select your activity level" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (office job, no exercise)</SelectItem>
                          <SelectItem value="light">Light (1-3 days/week light exercise)</SelectItem>
                          <SelectItem value="moderate">Moderate (3-5 days/week exercise)</SelectItem>
                          <SelectItem value="active">Active (6-7 days/week exercise)</SelectItem>
                          <SelectItem value="very-active">Very Active (2x/day or intense exercise)</SelectItem>
                        </SelectContent>
                      </Select>
                      {step3Form.formState.errors.activityLevel && (
                        <p className="text-sm text-red-500">{step3Form.formState.errors.activityLevel.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proteinGoal">Daily Protein Goal (g)</Label>
                      <Input
                        {...step3Form.register('proteinGoal', { valueAsNumber: true })}
                        type="number"
                        placeholder="120"
                        min="50"
                        max="300"
                      />
                      <p className="text-xs text-gray-500">
                        {signupData.weight && `Recommended: ${Math.round(signupData.weight * 1.2)}g based on your weight`}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="button" variant="outline" onClick={prevSignupStep} className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600">
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 4: Verification & Terms */}
              {signupStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Almost Done!</h3>
                    <p className="text-sm text-gray-600">Verify your account and agree to terms</p>
                  </div>

                  {/* Mock CAPTCHA */}
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 border-2 rounded ${captchaVerified ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center`}>
                            {captchaVerified && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm">I'm not a robot</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">reCAPTCHA</span>
                        </div>
                      </div>
                      {!captchaVerified && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={mockCaptchaVerify}
                          className="mt-2 text-blue-600 hover:text-blue-700"
                        >
                          Click to verify
                        </Button>
                      )}
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed">
                        I agree to the{' '}
                        <button className="text-blue-600 hover:underline">Terms of Service</button>{' '}
                        and{' '}
                        <button className="text-blue-600 hover:underline">Privacy Policy</button>
                      </Label>
                    </div>

                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        A confirmation email will be sent to {signupData.email}
                      </AlertDescription>
                    </Alert>

                    <div className="flex space-x-2">
                      <Button type="button" variant="outline" onClick={prevSignupStep} className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        onClick={handleFinalSubmit}
                        disabled={!captchaVerified || !agreeToTerms || isLoading}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Create Account <Check className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to login link */}
            <div className="text-center pt-4 border-t">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Already have an account? Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}