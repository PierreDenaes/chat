/**
 * Type definitions for AI Food Logging workflow
 * Centralized types for better maintainability and consistency
 */

// Core Food Logging Types
export type CameraMode = 'photo' | 'photo-text';
export type AnalysisState = 'idle' | 'analyzing' | 'results';
export type IngredientStatus = 'searching' | 'found' | 'editable';
export type MacroTab = 'plate' | 'day';

// Nutrition Data Interfaces
export interface MacroData {
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionalInfo extends MacroData {
  calories: number;
}

export interface IngredientData {
  name: string;
  status: IngredientStatus;
  icon: string;
  macros?: MacroData;
  quantity?: string;
  confidence?: number;
}

// AI Analysis Interfaces
export interface AnalysisResult {
  mealName: string;
  ingredients: IngredientData[];
  confidence: number;
  estimatedProtein: number;
  totalMacros: NutritionalInfo;
  analysisId?: string;
  timestamp?: Date;
}

export interface CameraState {
  mode: CameraMode;
  flashEnabled: boolean;
  isCapturing: boolean;
  capturedImage: string | null;
  analysisState: AnalysisState;
  analysisResult: AnalysisResult | null;
  facingMode: 'user' | 'environment';
}

// Search and Library Types
export interface FoodItem {
  id: string;
  name: string;
  protein: number;
  calories: number;
  macros?: MacroData;
  source: 'database' | 'user' | 'ai';
  lastUsed?: string;
  favorite?: boolean;
  barcode?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: IngredientData[];
  servings: number;
  totalMacros: NutritionalInfo;
  instructions?: string[];
  prepTime?: number;
  favorite?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface MealPlan {
  id: string;
  name: string;
  totalProtein: number;
  days: number;
  active: boolean;
  meals: Array<{
    day: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recipe?: Recipe;
    foodItem?: FoodItem;
  }>;
}

// Quick Add Types
export interface QuickMeal {
  name: string;
  protein: number;
  calories: number;
  time: string;
  macros?: MacroData;
  icon?: string;
}

// API Integration Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FoodAnalysisRequest {
  image: string;
  mode: CameraMode;
  textDescription?: string;
  userId?: string;
}

export interface BarcodeSearchRequest {
  barcode: string;
  source?: 'upc' | 'ean' | 'qr';
}

export interface FoodSearchRequest {
  query: string;
  limit?: number;
  offset?: number;
  filters?: {
    source?: string[];
    minProtein?: number;
    maxCalories?: number;
  };
}

// Component Props Interfaces
export interface FoodLoggingComponentProps {
  onMealAdded?: (meal: any) => void;
  onBack?: () => void;
  className?: string;
}

export interface AIAnalysisProps extends FoodLoggingComponentProps {
  capturedImage: string;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onRetake: () => void;
}

export interface IngredientListProps {
  ingredients: IngredientData[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onIngredientEdit?: (ingredient: IngredientData) => void;
}

export interface MacroSummaryProps {
  activeTab: MacroTab;
  onTabChange: (tab: MacroTab) => void;
  plateMacros: NutritionalInfo;
  dailyMacros?: NutritionalInfo;
  dailyGoals?: NutritionalInfo;
}

// Validation Schemas (for future zod integration)
export interface ValidationRules {
  mealName: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  protein: {
    min: number;
    max: number;
    required: boolean;
  };
  confidence: {
    min: number;
    max: number;
  };
}

// Constants
export const FOOD_LOGGING_CONSTANTS = {
  MAX_MEAL_NAME_LENGTH: 100,
  MIN_PROTEIN_VALUE: 0,
  MAX_PROTEIN_VALUE: 200,
  MIN_CONFIDENCE_SCORE: 0,
  MAX_CONFIDENCE_SCORE: 100,
  DEFAULT_SERVING_SIZE: '1 serving',
  ANALYSIS_TIMEOUT: 30000, // 30 seconds
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_QUALITY: 0.8,
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Default Values
export const DEFAULT_NUTRITIONAL_GOALS: NutritionalInfo = {
  calories: 2000,
  protein: 120,
  carbs: 200,
  fat: 65,
};

export const DEFAULT_CAMERA_STATE: CameraState = {
  mode: 'photo',
  flashEnabled: false,
  isCapturing: false,
  capturedImage: null,
  analysisState: 'idle',
  analysisResult: null,
  facingMode: 'environment',
};