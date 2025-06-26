'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  X, 
  Zap, 
  ZapOff, 
  RotateCcw, 
  Image as ImageIcon,
  FileText,
  Check,
  Loader2,
  ArrowLeft,
  ChevronDown,
  Edit
} from 'lucide-react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { useFoodLogging } from '@/hooks/useFoodLogging';
import type { 
  CameraMode, 
  AnalysisState, 
  IngredientData, 
  AnalysisResult, 
  MacroTab,
  FoodLoggingComponentProps 
} from '@/types/food-logging';

/**
 * CameraInterface Component
 * Full-screen AI-powered food logging camera interface
 * Features photo capture, AI analysis, and nutritional breakdown
 */
export function CameraInterface({ onBack, onMealAdded, className }: FoodLoggingComponentProps) {
  const [mode, setMode] = useState<CameraMode>('photo');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false);
  const [macroTab, setMacroTab] = useState<MacroTab>('plate');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const webcamRef = useRef<Webcam>(null);
  const { setCurrentView, estimateProteinFromPhoto, addMeal } = useAppStore();
  const { toast } = useToast();
  const { addMealFromAnalysis, navigateBack } = useFoodLogging();

  console.log('CameraInterface render:', { mode, flashEnabled, isCapturing, capturedImage });

  const capture = useCallback(async () => {
    console.log('Starting photo capture');
    setIsCapturing(true);
    
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        console.log('Photo captured successfully');
        
        // Flash effect
        const flashElement = document.getElementById('camera-flash');
        if (flashElement) {
          flashElement.style.opacity = '1';
          setTimeout(() => {
            flashElement.style.opacity = '0';
          }, 150);
        }
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      toast({
        title: "Capture Failed",
        description: "Unable to capture photo. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsCapturing(false);
  }, [toast]);

  const retakePhoto = () => {
    console.log('Retaking photo');
    setCapturedImage(null);
    setAnalysisState('idle');
    setAnalysisResult(null);
  };

  const startAnalysis = async () => {
    if (!capturedImage) return;
    
    console.log('Starting AI analysis');
    setAnalysisState('analyzing');
    
    try {
      // Simulate AI analysis with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Estimate protein from photo using AI
      const estimatedProtein = await estimateProteinFromPhoto(capturedImage);
      
      // Mock AI ingredient detection with detailed data
      const mockIngredientData: IngredientData[] = [
        {
          name: 'Grilled chicken breast',
          status: 'found',
          icon: '🍗',
          macros: { protein: 31, carbs: 0, fat: 3.6 }
        },
        {
          name: 'Brown rice',
          status: 'found', 
          icon: '🍚',
          macros: { protein: 2.6, carbs: 23, fat: 0.9 }
        },
        {
          name: 'Mixed vegetables',
          status: 'searching',
          icon: '🥬',
          macros: { protein: 2, carbs: 8, fat: 0.2 }
        },
        {
          name: 'Olive oil',
          status: 'found',
          icon: '🫒',
          macros: { protein: 0, carbs: 0, fat: 14 }
        }
      ];
      
      const mockMealNames = [
        'Grilled Chicken Power Bowl',
        'Protein Paradise Plate', 
        'Healthy Chicken & Rice',
        'Balanced Macro Meal',
        'Fitness Fuel Bowl'
      ];

      const totalMacros = mockIngredientData.reduce(
        (acc, ingredient) => {
          if (ingredient.macros) {
            acc.protein += ingredient.macros.protein;
            acc.carbs += ingredient.macros.carbs;
            acc.fat += ingredient.macros.fat;
          }
          return acc;
        },
        { protein: 0, carbs: 0, fat: 0, calories: 0 }
      );

      // Calculate calories (4 cal/g protein, 4 cal/g carbs, 9 cal/g fat)
      totalMacros.calories = Math.round(
        totalMacros.protein * 4 + totalMacros.carbs * 4 + totalMacros.fat * 9
      );
      
      const result: AnalysisResult = {
        mealName: mockMealNames[Math.floor(Math.random() * mockMealNames.length)],
        ingredients: mockIngredientData,
        confidence: 85 + Math.floor(Math.random() * 10), // 85-95%
        estimatedProtein: Math.round(totalMacros.protein),
        totalMacros
      };
      
      setAnalysisResult(result);
      setAnalysisState('results');
      
      console.log('AI analysis completed:', result);
      
    } catch (error) {
      console.error('Failed to analyze photo:', error);
      setAnalysisState('idle');
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmMeal = () => {
    if (!analysisResult || !capturedImage) return;
    
    console.log('Confirming meal from analysis');
    
    // Create meal entry with AI analysis results
    addMeal({
      description: analysisResult.mealName,
      protein: analysisResult.estimatedProtein,
      photo: capturedImage,
      estimatedBy: 'ai',
      ingredients: analysisResult.ingredients.map(ing => ing.name)
    });
    
    toast({
      title: "Meal Added!",
      description: `Added ${analysisResult.mealName} with ${analysisResult.estimatedProtein}g protein.`,
      variant: "default",
    });
    
    console.log('Meal confirmed and added:', analysisResult);
    
    // Navigate back to dashboard
    setCurrentView('dashboard');
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
    console.log('Flash toggled:', !flashEnabled);
  };

  const switchCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
    console.log('Camera switched to:', facingMode === 'user' ? 'environment' : 'user');
  };

  const handleBack = () => {
    console.log('Navigating back from camera');
    if (onBack) {
      onBack();
    } else {
      navigateBack(true); // Clean up state
    }
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Camera Flash Effect */}
      <div 
        id="camera-flash"
        className="fixed inset-0 bg-white opacity-0 pointer-events-none z-50 transition-opacity duration-150"
      />
      
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-between p-4 pt-12">
          {/* Back Button */}
          <Button
            onClick={handleBack}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
              <CardContent className="p-1 flex">
                <Button
                  onClick={() => setMode('photo')}
                  size="sm"
                  variant={mode === 'photo' ? 'default' : 'ghost'}
                  className={`px-3 py-2 text-xs rounded-md transition-all ${
                    mode === 'photo' 
                      ? 'bg-white text-black' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Photo
                </Button>
                <Button
                  onClick={() => setMode('photo-text')}
                  size="sm"
                  variant={mode === 'photo-text' ? 'default' : 'ghost'}
                  className={`px-3 py-2 text-xs rounded-md transition-all ${
                    mode === 'photo-text' 
                      ? 'bg-white text-black' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Photo + Text
                </Button>
              </CardContent>
            </Card>
            
            {/* Beta Badge */}
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
              Beta
            </Badge>
          </div>

          {/* Flash Toggle */}
          <Button
            onClick={toggleFlash}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
          >
            {flashEnabled ? (
              <Zap className="w-5 h-5 text-yellow-400" />
            ) : (
              <ZapOff className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Camera/Photo Display */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          {capturedImage ? (
            // Captured Photo View
            <motion.div
              key="captured"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center bg-black"
            >
              <img
                src={capturedImage}
                alt="Captured food"
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          ) : (
            // Live Camera View
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <Webcam
                ref={webcamRef}
                audio={false}
                height="100%"
                width="100%"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
                screenshotFormat="image/jpeg"
                screenshotQuality={0.8}
              />
              
              {/* Camera Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Center Focus Frame */}
                <div className="absolute inset-4 border-2 border-white/30 rounded-2xl">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
                </div>
                
                {/* Center Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-white/50 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white/70 rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Analysis Overlay */}
        <AnimatePresence>
          {analysisState === 'analyzing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-6"
                >
                  <Loader2 className="w-16 h-16 text-white" />
                </motion.div>
                
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Analyzing...
                </motion.h3>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-sm"
                >
                  AI is identifying your meal
                </motion.p>
                
                {/* Animated dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center gap-1 mt-4"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      className="w-2 h-2 bg-white/60 rounded-full"
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Plate Results Screen */}
        <AnimatePresence>
          {analysisState === 'results' && analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-sm flex flex-col z-50"
            >
              {/* Background Image */}
              <div className="absolute inset-0 opacity-20">
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Analyzed food"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Header */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative pt-12 pb-4 px-6"
              >
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-white mb-2">AI Plate</h1>
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 text-sm">Analysis Complete</span>
                  </div>
                </div>
              </motion.div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 pb-32">
                {/* Meal Title Card */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-4 shadow-lg"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3"
                    >
                      <Check className="w-6 h-6 text-white" />
                    </motion.div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      {analysisResult.mealName}
                    </h2>
                    
                    {/* Confidence Badge */}
                    <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
                      <span className="text-sm font-medium text-purple-700">
                        {analysisResult.confidence}% confident
                      </span>
                    </div>

                    {/* Total Macros Summary */}
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {analysisResult.totalMacros.calories}
                        </div>
                        <div className="text-xs text-gray-500">Cal</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {analysisResult.totalMacros.protein}g
                        </div>
                        <div className="text-xs text-gray-500">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {analysisResult.totalMacros.carbs}g
                        </div>
                        <div className="text-xs text-gray-500">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">
                          {analysisResult.totalMacros.fat}g
                        </div>
                        <div className="text-xs text-gray-500">Fat</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Ingredients Card */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* Ingredients Header */}
                  <div 
                    className="p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setIsIngredientsExpanded(!isIngredientsExpanded)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">🧾</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Detected Ingredients
                          </h3>
                          <p className="text-sm text-gray-500">
                            {analysisResult.ingredients.length} items found
                          </p>
                        </div>
                      </div>
                      
                      <motion.div
                        animate={{ rotate: isIngredientsExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-400"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expandable Ingredients List */}
                  <AnimatePresence>
                    {isIngredientsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 space-y-4">
                          {analysisResult.ingredients.map((ingredient, index) => (
                            <motion.div
                              key={ingredient.name}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                              className="bg-gray-50 rounded-xl p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{ingredient.icon}</span>
                                  <div>
                                    <h4 className="font-medium text-gray-800">
                                      {ingredient.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      {ingredient.status === 'found' && (
                                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                          <Check className="w-3 h-3" />
                                          Found
                                        </span>
                                      )}
                                      {ingredient.status === 'searching' && (
                                        <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          Searching
                                        </span>
                                      )}
                                      {ingredient.status === 'editable' && (
                                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                          <Edit className="w-3 h-3" />
                                          Editable
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Macro Information */}
                              {ingredient.macros && (
                                <div className="grid grid-cols-3 gap-3 mt-3">
                                  <div className="text-center bg-white rounded-lg p-2">
                                    <div className="text-sm font-semibold text-purple-600">
                                      {ingredient.macros.protein}g
                                    </div>
                                    <div className="text-xs text-gray-500">Protein</div>
                                  </div>
                                  <div className="text-center bg-white rounded-lg p-2">
                                    <div className="text-sm font-semibold text-blue-600">
                                      {ingredient.macros.carbs}g
                                    </div>
                                    <div className="text-xs text-gray-500">Carbs</div>
                                  </div>
                                  <div className="text-center bg-white rounded-lg p-2">
                                    <div className="text-sm font-semibold text-yellow-600">
                                      {ingredient.macros.fat}g
                                    </div>
                                    <div className="text-xs text-gray-500">Fat</div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Calories & Macros Summary */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden mt-4"
                >
                  {/* Tab Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">🔥</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Calories & Macros
                          </h3>
                          <p className="text-sm text-gray-500">
                            Nutritional breakdown
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setMacroTab('plate')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          macroTab === 'plate'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        This Plate
                      </button>
                      <button
                        onClick={() => setMacroTab('day')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          macroTab === 'day'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Today Total
                      </button>
                    </div>
                  </div>

                  {/* Macro Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={macroTab}
                      initial={{ opacity: 0, x: macroTab === 'plate' ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: macroTab === 'plate' ? 20 : -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      {macroTab === 'plate' ? (
                        // Current Plate Macros
                        <div className="space-y-4">
                          {/* Calories Card */}
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                                <span className="font-semibold text-gray-800">Calories</span>
                              </div>
                              <span className="text-2xl font-bold text-orange-600">
                                {analysisResult.totalMacros.calories}
                              </span>
                            </div>
                            <div className="w-full bg-white/50 rounded-full h-3">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((analysisResult.totalMacros.calories / 2000) * 100, 100)}%` }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {Math.round((analysisResult.totalMacros.calories / 2000) * 100)}% of 2000 cal goal
                            </div>
                          </motion.div>

                          {/* Macros Grid */}
                          <div className="grid grid-cols-3 gap-3">
                            {/* Protein */}
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="bg-gradient-to-b from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
                            >
                              <div className="text-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">P</span>
                                </div>
                                <div className="text-xl font-bold text-purple-600 mb-1">
                                  {analysisResult.totalMacros.protein}g
                                </div>
                                <div className="text-xs text-gray-500 mb-2">Protein</div>
                                <div className="w-full bg-white/70 rounded-full h-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((analysisResult.totalMacros.protein / 120) * 100, 100)}%` }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                                  />
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {Math.round((analysisResult.totalMacros.protein / 120) * 100)}%
                                </div>
                              </div>
                            </motion.div>

                            {/* Carbs */}
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
                            >
                              <div className="text-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">C</span>
                                </div>
                                <div className="text-xl font-bold text-blue-600 mb-1">
                                  {analysisResult.totalMacros.carbs}g
                                </div>
                                <div className="text-xs text-gray-500 mb-2">Carbs</div>
                                <div className="w-full bg-white/70 rounded-full h-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((analysisResult.totalMacros.carbs / 200) * 100, 100)}%` }}
                                    transition={{ delay: 0.7, duration: 0.8 }}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                  />
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {Math.round((analysisResult.totalMacros.carbs / 200) * 100)}%
                                </div>
                              </div>
                            </motion.div>

                            {/* Fat */}
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200"
                            >
                              <div className="text-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">F</span>
                                </div>
                                <div className="text-xl font-bold text-yellow-600 mb-1">
                                  {analysisResult.totalMacros.fat}g
                                </div>
                                <div className="text-xs text-gray-500 mb-2">Fat</div>
                                <div className="w-full bg-white/70 rounded-full h-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((analysisResult.totalMacros.fat / 65) * 100, 100)}%` }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full"
                                  />
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {Math.round((analysisResult.totalMacros.fat / 65) * 100)}%
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      ) : (
                        // Daily Totals (Mock Data)
                        <div className="space-y-4">
                          {/* Daily Calories Card */}
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                                <span className="font-semibold text-gray-800">Daily Calories</span>
                              </div>
                              <span className="text-2xl font-bold text-orange-600">
                                {1450 + analysisResult.totalMacros.calories}
                              </span>
                            </div>
                            <div className="w-full bg-white/50 rounded-full h-3">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(((1450 + analysisResult.totalMacros.calories) / 2000) * 100, 100)}%` }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {Math.round(((1450 + analysisResult.totalMacros.calories) / 2000) * 100)}% of 2000 cal goal
                            </div>
                          </motion.div>

                          {/* Daily Macros Grid */}
                          <div className="grid grid-cols-3 gap-3">
                            {/* Daily Protein */}
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="bg-gradient-to-b from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
                            >
                              <div className="text-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">P</span>
                                </div>
                                <div className="text-xl font-bold text-purple-600 mb-1">
                                  {75 + analysisResult.totalMacros.protein}g
                                </div>
                                <div className="text-xs text-gray-500 mb-2">Protein</div>
                                <div className="w-full bg-white/70 rounded-full h-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(((75 + analysisResult.totalMacros.protein) / 120) * 100, 100)}%` }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                                  />
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {Math.round(((75 + analysisResult.totalMacros.protein) / 120) * 100)}%
                                </div>
                              </div>
                            </motion.div>

                            {/* Daily Carbs */}
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
                            >
                              <div className="text-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">C</span>
                                </div>
                                <div className="text-xl font-bold text-blue-600 mb-1">
                                  {120 + analysisResult.totalMacros.carbs}g
                                </div>
                                <div className="text-xs text-gray-500 mb-2">Carbs</div>
                                <div className="w-full bg-white/70 rounded-full h-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(((120 + analysisResult.totalMacros.carbs) / 200) * 100, 100)}%` }}
                                    transition={{ delay: 0.7, duration: 0.8 }}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                  />
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {Math.round(((120 + analysisResult.totalMacros.carbs) / 200) * 100)}%
                                </div>
                              </div>
                            </motion.div>

                            {/* Daily Fat */}
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200"
                            >
                              <div className="text-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">F</span>
                                </div>
                                <div className="text-xl font-bold text-yellow-600 mb-1">
                                  {42 + analysisResult.totalMacros.fat}g
                                </div>
                                <div className="text-xs text-gray-500 mb-2">Fat</div>
                                <div className="w-full bg-white/70 rounded-full h-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(((42 + analysisResult.totalMacros.fat) / 65) * 100, 100)}%` }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full"
                                  />
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {Math.round(((42 + analysisResult.totalMacros.fat) / 65) * 100)}%
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Log Foods Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="px-6 pb-6"
                  >
                    <Button
                      onClick={confirmMeal}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                    >
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Log This Meal
                      </motion.span>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-center pb-8 pt-4">
          <AnimatePresence mode="wait">
            {analysisState === 'results' && analysisResult ? (
              // Results Screen Controls
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-8"
              >
                <Button
                  onClick={retakePhoto}
                  size="lg"
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 rounded-full w-16 h-16 p-0"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                
                <Button
                  onClick={confirmMeal}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full w-20 h-20 p-0 shadow-lg"
                >
                  <Check className="w-8 h-8" />
                </Button>
                
                <div className="w-16 h-16" /> {/* Spacer for symmetry */}
              </motion.div>
            ) : capturedImage && analysisState === 'idle' ? (
              // Photo Review Controls
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-8"
              >
                <Button
                  onClick={retakePhoto}
                  size="lg"
                  variant="outline"
                  className="bg-black/40 border-white/30 text-white hover:bg-white/20 rounded-full w-16 h-16 p-0"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                
                <Button
                  onClick={startAnalysis}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full w-20 h-20 p-0 shadow-lg"
                >
                  <Check className="w-8 h-8" />
                </Button>
                
                <div className="w-16 h-16" /> {/* Spacer for symmetry */}
              </motion.div>
            ) : (
              // Capture Controls
              <motion.div
                key="capture"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-8"
              >
                <Button
                  onClick={switchCamera}
                  size="lg"
                  variant="outline"
                  className="bg-black/40 border-white/30 text-white hover:bg-white/20 rounded-full w-16 h-16 p-0"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                
                {/* Main Shutter Button */}
                <motion.button
                  onClick={capture}
                  disabled={isCapturing}
                  className="relative bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {isCapturing ? (
                        <motion.div
                          key="capturing"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="w-8 h-8 bg-red-500 rounded-full"
                        />
                      ) : (
                        <motion.div
                          key="ready"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                        >
                          <Camera className="w-8 h-8 text-black" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
                
                <div className="w-16 h-16" /> {/* Spacer for symmetry */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Mode Information */}
        <div className="text-center pb-4">
          <AnimatePresence mode="wait">
            {analysisState === 'results' ? (
              <motion.p
                key="results-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-white/70 text-sm"
              >
                Tap ✓ to confirm and add to your meals
              </motion.p>
            ) : capturedImage && analysisState === 'idle' ? (
              <motion.p
                key="review-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-white/70 text-sm"
              >
                Tap ✓ to analyze your meal with AI
              </motion.p>
            ) : (
              <motion.p
                key="camera-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-white/70 text-sm"
              >
                {mode === 'photo' 
                  ? 'Capture your meal for AI protein analysis' 
                  : 'Capture + add description for enhanced accuracy'
                }
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}