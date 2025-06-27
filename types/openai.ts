export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  confidence: number;
}

export interface NutritionalAnalysis {
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCalories: number;
  confidence: number;
}

export interface OpenAIVisionResponse {
  success: boolean;
  analysis?: {
    foodItems: FoodItem[];
    nutritionalSummary: NutritionalAnalysis;
    detectedItems: string[];
    overallConfidence: number;
    processingTime: number;
  };
  error?: string;
  rawResponse?: any;
}

export interface MealAnalysisRequest {
  imageData: string; // base64 encoded image
  imageFormat: string; // 'jpeg' | 'png' | 'webp'
  userId: string;
  mealDate?: string;
}

export interface OpenAIImageAnalysis {
  foodItems: Array<{
    name: string;
    estimatedPortion: string;
    confidence: number;
    nutritionalInfo: {
      protein: number;
      carbs: number;
      fat: number;
      calories: number;
    };
  }>;
  totalNutrition: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  confidence: number;
  detectedIngredients: string[];
}

export interface ProcessedImageData {
  base64Data: string;
  format: string;
  size: number;
  width: number;
  height: number;
}