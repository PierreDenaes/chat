/**
 * Custom hook for Food Logging functionality
 * Centralizes common food logging operations and state management
 */

'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import type { 
  AnalysisResult, 
  FoodItem, 
  QuickMeal, 
  CameraState,
  APIResponse,
  FoodAnalysisRequest
} from '@/types/food-logging';
import { DEFAULT_CAMERA_STATE } from '@/types/food-logging';

interface UseFoodLoggingOptions {
  autoNavigateOnSuccess?: boolean;
  showToastOnSuccess?: boolean;
  showToastOnError?: boolean;
}

export function useFoodLogging(options: UseFoodLoggingOptions = {}) {
  const {
    autoNavigateOnSuccess = true,
    showToastOnSuccess = true,
    showToastOnError = true,
  } = options;

  const { addMeal, setCurrentView, estimateProteinFromPhoto } = useAppStore();
  const { toast } = useToast();

  // Local state for complex operations
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraState, setCameraState] = useState<CameraState>(DEFAULT_CAMERA_STATE);

  /**
   * Add a meal from AI analysis result
   */
  const addMealFromAnalysis = useCallback(async (
    analysisResult: AnalysisResult,
    capturedImage?: string
  ) => {
    console.log('Adding meal from AI analysis:', analysisResult);
    setIsProcessing(true);

    try {
      addMeal({
        description: analysisResult.mealName,
        protein: analysisResult.estimatedProtein,
        photo: capturedImage,
        estimatedBy: 'ai',
        ingredients: analysisResult.ingredients.map(ing => ing.name)
      });

      if (showToastOnSuccess) {
        toast({
          title: "Meal Added!",
          description: `Added ${analysisResult.mealName} with ${analysisResult.estimatedProtein}g protein.`,
          variant: "default",
        });
      }

      if (autoNavigateOnSuccess) {
        setCurrentView('dashboard');
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to add meal from analysis:', error);
      
      if (showToastOnError) {
        toast({
          title: "Failed to Add Meal",
          description: "There was an error adding your meal. Please try again.",
          variant: "destructive",
        });
      }

      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  }, [addMeal, setCurrentView, toast, showToastOnSuccess, showToastOnError, autoNavigateOnSuccess]);

  /**
   * Add a quick meal
   */
  const addQuickMeal = useCallback(async (quickMeal: QuickMeal) => {
    console.log('Adding quick meal:', quickMeal);
    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

      addMeal({
        description: quickMeal.name,
        protein: quickMeal.protein,
        estimatedBy: 'manual',
        ingredients: [`${quickMeal.name} (1 serving)`]
      });

      if (showToastOnSuccess) {
        toast({
          title: "Quick Add Successful!",
          description: `Added ${quickMeal.name} with ${quickMeal.protein}g protein.`,
          variant: "default",
        });
      }

      if (autoNavigateOnSuccess) {
        setCurrentView('dashboard');
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to add quick meal:', error);
      
      if (showToastOnError) {
        toast({
          title: "Failed to Add Meal",
          description: "There was an error adding your quick meal. Please try again.",
          variant: "destructive",
        });
      }

      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  }, [addMeal, setCurrentView, toast, showToastOnSuccess, showToastOnError, autoNavigateOnSuccess]);

  /**
   * Add a food item from library
   */
  const addFoodItem = useCallback(async (foodItem: FoodItem) => {
    console.log('Adding food item from library:', foodItem);
    setIsProcessing(true);

    try {
      addMeal({
        description: foodItem.name,
        protein: foodItem.protein,
        estimatedBy: foodItem.source === 'ai' ? 'ai' : 'manual',
        ingredients: [`${foodItem.name} (1 serving)`]
      });

      if (showToastOnSuccess) {
        toast({
          title: "Food Added!",
          description: `Added ${foodItem.name} with ${foodItem.protein}g protein.`,
          variant: "default",
        });
      }

      if (autoNavigateOnSuccess) {
        setCurrentView('dashboard');
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to add food item:', error);
      
      if (showToastOnError) {
        toast({
          title: "Failed to Add Food",
          description: "There was an error adding your food item. Please try again.",
          variant: "destructive",
        });
      }

      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  }, [addMeal, setCurrentView, toast, showToastOnSuccess, showToastOnError, autoNavigateOnSuccess]);

  /**
   * Analyze photo with AI
   */
  const analyzePhoto = useCallback(async (imageData: string): Promise<AnalysisResult> => {
    console.log('Starting AI photo analysis');
    setIsProcessing(true);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use existing AI estimation
      const estimatedProtein = await estimateProteinFromPhoto(imageData);
      
      // Mock comprehensive analysis result
      const mockIngredients = [
        {
          name: 'Grilled chicken breast',
          status: 'found' as const,
          icon: '🍗',
          macros: { protein: 31, carbs: 0, fat: 3.6 },
          confidence: 92
        },
        {
          name: 'Brown rice',
          status: 'found' as const,
          icon: '🍚',
          macros: { protein: 2.6, carbs: 23, fat: 0.9 },
          confidence: 88
        },
        {
          name: 'Mixed vegetables',
          status: 'searching' as const,
          icon: '🥬',
          macros: { protein: 2, carbs: 8, fat: 0.2 },
          confidence: 75
        }
      ];

      const totalMacros = mockIngredients.reduce(
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

      const mockMealNames = [
        'Grilled Chicken Power Bowl',
        'Protein Paradise Plate', 
        'Healthy Chicken & Rice',
        'Balanced Macro Meal',
        'Fitness Fuel Bowl'
      ];

      const result: AnalysisResult = {
        mealName: mockMealNames[Math.floor(Math.random() * mockMealNames.length)],
        ingredients: mockIngredients,
        confidence: 85 + Math.floor(Math.random() * 10), // 85-95%
        estimatedProtein: Math.round(totalMacros.protein),
        totalMacros,
        analysisId: `analysis_${Date.now()}`,
        timestamp: new Date()
      };

      console.log('AI analysis completed:', result);
      return result;
    } catch (error) {
      console.error('Failed to analyze photo:', error);
      throw new Error('Photo analysis failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [estimateProteinFromPhoto]);

  /**
   * Update camera state
   */
  const updateCameraState = useCallback((updates: Partial<CameraState>) => {
    setCameraState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Reset camera state
   */
  const resetCameraState = useCallback(() => {
    setCameraState(DEFAULT_CAMERA_STATE);
  }, []);

  /**
   * Navigate back with optional cleanup
   */
  const navigateBack = useCallback((cleanup = true) => {
    console.log('Navigating back from food logging');
    
    if (cleanup) {
      resetCameraState();
      setIsProcessing(false);
    }
    
    setCurrentView('dashboard');
  }, [setCurrentView, resetCameraState]);

  return {
    // State
    isProcessing,
    cameraState,
    
    // Actions
    addMealFromAnalysis,
    addQuickMeal,
    addFoodItem,
    analyzePhoto,
    updateCameraState,
    resetCameraState,
    navigateBack,
    
    // Utilities
    toast: showToastOnSuccess || showToastOnError ? toast : undefined,
  };
}

// Re-export types for convenience
export type { AnalysisResult, FoodItem, QuickMeal, CameraState } from '@/types/food-logging';