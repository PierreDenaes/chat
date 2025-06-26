'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  Target,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';

// Mock data for demonstration - this would come from your store in production
const mockWeightData = [
  { day: 'Mon', weight: 75.2 },   
  { day: 'Tue', weight: 75.0 },   
  { day: 'Wed', weight: 74.8 },   
  { day: 'Thu', weight: 74.9 },   
  { day: 'Fri', weight: 74.6 },   
  { day: 'Sat', weight: 74.5 },   
  { day: 'Sun', weight: 74.3 },   
];

interface PhysicalMetrics {
  currentWeight: number;
  previousWeight: number;
  height: number; // in cm
  bodyFat: number; // percentage
  weightUnit: 'kg' | 'lbs';
}

export function PhysicalProgress() {
  const { user } = useAppStore();
  
  // Mock user physical metrics - this would come from your store
  const [metrics, setMetrics] = useState<PhysicalMetrics>({
    currentWeight: 74.3,
    previousWeight: 75.2,
    height: 175,
    bodyFat: 18.5,
    weightUnit: 'kg'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    weight: metrics.currentWeight.toString(),
    bodyFat: metrics.bodyFat.toString(),
    height: metrics.height.toString()
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate BMI and get category
  const calculateBMI = (weight: number, height: number) => {
    const heightInM = height / 100;
    return weight / (heightInM * heightInM);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const bmi = calculateBMI(metrics.currentWeight, metrics.height);
  const bmiCategory = getBMICategory(bmi);
  
  // Calculate weight trend
  const weightDelta = metrics.currentWeight - metrics.previousWeight;
  const isWeightIncreasing = weightDelta > 0;
  const isWeightStable = Math.abs(weightDelta) < 0.1;

  // Validation
  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    
    const weight = parseFloat(editValues.weight);
    const bodyFat = parseFloat(editValues.bodyFat);
    const height = parseFloat(editValues.height);

    if (isNaN(weight) || weight <= 0 || weight > 300) {
      newErrors.weight = 'Please enter a valid weight';
    }
    
    if (isNaN(bodyFat) || bodyFat < 0 || bodyFat > 50) {
      newErrors.bodyFat = 'Body fat should be between 0-50%';
    }
    
    if (isNaN(height) || height < 100 || height > 250) {
      newErrors.height = 'Height should be between 100-250cm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    console.log('Attempting to save physical metrics:', editValues);
    
    if (validateInputs()) {
      const newWeight = parseFloat(editValues.weight);
      setMetrics(prev => ({
        ...prev,
        previousWeight: prev.currentWeight,
        currentWeight: newWeight,
        bodyFat: parseFloat(editValues.bodyFat),
        height: parseFloat(editValues.height)
      }));
      setIsEditing(false);
      console.log('Physical metrics saved successfully');
    } else {
      console.log('Validation failed:', errors);
    }
  };

  const handleCancel = () => {
    setEditValues({
      weight: metrics.currentWeight.toString(),
      bodyFat: metrics.bodyFat.toString(),
      height: metrics.height.toString()
    });
    setErrors({});
    setIsEditing(false);
    console.log('Edit cancelled');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => setIsEditing(!isEditing)}
          size="sm"
          variant="ghost"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Weight & BMI Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-600" />
              Weight & BMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight" className="text-sm text-gray-600">
                        Weight ({metrics.weightUnit})
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        value={editValues.weight}
                        onChange={(e) => setEditValues(prev => ({ ...prev, weight: e.target.value }))}
                        className={`mt-1 ${errors.weight ? 'border-red-500' : ''}`}
                        placeholder="Enter weight"
                      />
                      {errors.weight && (
                        <p className="text-xs text-red-500 mt-1">{errors.weight}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="height" className="text-sm text-gray-600">
                        Height (cm)
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        value={editValues.height}
                        onChange={(e) => setEditValues(prev => ({ ...prev, height: e.target.value }))}
                        className={`mt-1 ${errors.height ? 'border-red-500' : ''}`}
                        placeholder="Enter height"
                      />
                      {errors.height && (
                        <p className="text-xs text-red-500 mt-1">{errors.height}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.currentWeight}{metrics.weightUnit}
                    </div>
                    <div className="text-xs text-gray-500">Current</div>
                    <div className="flex items-center justify-center mt-1">
                      {isWeightStable ? (
                        <div className="text-xs text-gray-400">Stable</div>
                      ) : (
                        <>
                          {isWeightIncreasing ? (
                            <TrendingUp className="w-3 h-3 text-red-500 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
                          )}
                          <span className={`text-xs ${isWeightIncreasing ? 'text-red-500' : 'text-green-500'}`}>
                            {Math.abs(weightDelta).toFixed(1)}{metrics.weightUnit}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">
                      {bmi.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">BMI</div>
                    <div className={`text-xs font-medium mt-1 ${bmiCategory.color}`}>
                      {bmiCategory.label}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {metrics.height}cm
                    </div>
                    <div className="text-xs text-gray-500">Height</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Body Fat & 7-Day Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Body Fat Card */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-pink-600" />
                Body Fat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Label htmlFor="bodyFat" className="text-sm text-gray-600">
                      Body Fat Percentage
                    </Label>
                    <Input
                      id="bodyFat"
                      type="number"
                      value={editValues.bodyFat}
                      onChange={(e) => setEditValues(prev => ({ ...prev, bodyFat: e.target.value }))}
                      className={`mt-1 ${errors.bodyFat ? 'border-red-500' : ''}`}
                      placeholder="Enter body fat %"
                    />
                    {errors.bodyFat && (
                      <p className="text-xs text-red-500 mt-1">{errors.bodyFat}</p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-3 relative">
                      <div 
                        className="w-full h-full rounded-full border-4 border-gray-200 relative overflow-hidden"
                        style={{
                          background: `conic-gradient(from 0deg, #ec4899 0%, #ec4899 ${metrics.bodyFat * 3.6}deg, #e5e7eb ${metrics.bodyFat * 3.6}deg)`
                        }}
                      >
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-pink-600">
                            {metrics.bodyFat}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Body Fat</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* 7-Day Weight Trend */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                7-Day Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockWeightData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <YAxis hide />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="url(#gradient)"
                      strokeWidth={2} 
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 4, fill: '#ec4899' }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                <span className="text-xs text-gray-500">
                  Weekly Average: {(mockWeightData.reduce((sum, d) => sum + d.weight, 0) / mockWeightData.length).toFixed(1)}kg
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}