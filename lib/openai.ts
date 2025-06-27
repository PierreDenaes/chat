import OpenAI from 'openai';
import { OpenAIImageAnalysis, FoodItem } from '@/types/openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MEAL_ANALYSIS_PROMPT = `You are a nutrition expert analyzing food images. Analyze this meal photo and provide detailed nutritional information.

Return a JSON response with this exact structure:
{
  "foodItems": [
    {
      "name": "food item name",
      "estimatedPortion": "description of portion size",
      "confidence": 0.85,
      "nutritionalInfo": {
        "protein": 25.5,
        "carbs": 45.2,
        "fat": 12.1,
        "calories": 380
      }
    }
  ],
  "totalNutrition": {
    "protein": 25.5,
    "carbs": 45.2,
    "fat": 12.1,
    "calories": 380
  },
  "confidence": 0.85,
  "detectedIngredients": ["chicken breast", "rice", "broccoli"]
}

Guidelines:
- Identify individual food items and estimate portions carefully
- Provide nutritional values per 100g when possible
- Be conservative with estimates when uncertain
- Include confidence scores (0.0-1.0) for reliability
- List main ingredients visible in the image
- Ensure all numbers are realistic and add up correctly
- If unable to analyze clearly, set confidence below 0.5`;

export async function analyzeMealImage(
  base64Image: string,
  imageFormat: string = 'jpeg'
): Promise<OpenAIImageAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: MEAL_ANALYSIS_PROMPT
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${imageFormat};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for consistent, factual responses
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Parse the JSON response
    let analysisData: OpenAIImageAnalysis;
    try {
      // Clean the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate and sanitize the response
    const validatedAnalysis = validateAnalysisResponse(analysisData);
    
    return validatedAnalysis;

  } catch (error) {
    console.error('OpenAI Vision API error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    if (error instanceof Error) {
      // Re-throw with more specific error messages based on OpenAI error types
      if (error.message.includes('rate_limit_exceeded')) {
        throw new Error('AI service rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message.includes('insufficient_quota')) {
        throw new Error('AI service quota exceeded. Please try again later.');
      } else if (error.message.includes('invalid_api_key')) {
        throw new Error('AI service configuration error. Please contact support.');
      } else if (error.message.includes('model_not_found')) {
        throw new Error('AI vision model unavailable. Please try again later.');
      } else {
        throw new Error(`AI analysis failed: ${error.message}`);
      }
    } else {
      throw new Error('AI analysis failed: Unknown error occurred');
    }
  }
}

function validateAnalysisResponse(data: any): OpenAIImageAnalysis {
  // Provide defaults for missing or invalid data
  const defaultResponse: OpenAIImageAnalysis = {
    foodItems: [],
    totalNutrition: { protein: 0, carbs: 0, fat: 0, calories: 0 },
    confidence: 0.3,
    detectedIngredients: []
  };

  if (!data || typeof data !== 'object') {
    return defaultResponse;
  }

  // Validate food items
  const foodItems: OpenAIImageAnalysis['foodItems'] = [];
  if (Array.isArray(data.foodItems)) {
    for (const item of data.foodItems) {
      if (item && typeof item === 'object' && item.name && item.nutritionalInfo) {
        foodItems.push({
          name: String(item.name).slice(0, 255), // Limit length
          estimatedPortion: String(item.estimatedPortion || 'unknown portion').slice(0, 100),
          confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.5)),
          nutritionalInfo: {
            protein: Math.max(0, Number(item.nutritionalInfo.protein) || 0),
            carbs: Math.max(0, Number(item.nutritionalInfo.carbs) || 0),
            fat: Math.max(0, Number(item.nutritionalInfo.fat) || 0),
            calories: Math.max(0, Number(item.nutritionalInfo.calories) || 0)
          }
        });
      }
    }
  }

  // Validate total nutrition
  const totalNutrition = {
    protein: Math.max(0, Number(data.totalNutrition?.protein) || 0),
    carbs: Math.max(0, Number(data.totalNutrition?.carbs) || 0),
    fat: Math.max(0, Number(data.totalNutrition?.fat) || 0),
    calories: Math.max(0, Number(data.totalNutrition?.calories) || 0)
  };

  // Validate other fields
  const confidence = Math.max(0, Math.min(1, Number(data.confidence) || 0.5));
  const detectedIngredients = Array.isArray(data.detectedIngredients) 
    ? data.detectedIngredients.map(ing => String(ing).slice(0, 100)).slice(0, 20)
    : [];

  return {
    foodItems,
    totalNutrition,
    confidence,
    detectedIngredients
  };
}

export function convertToMealItems(analysis: OpenAIImageAnalysis): FoodItem[] {
  return analysis.foodItems.map((item, index) => ({
    name: item.name,
    quantity: 1, // Default to 1 serving
    unit: 'serving',
    protein: Number(item.nutritionalInfo.protein.toFixed(1)),
    carbs: Number(item.nutritionalInfo.carbs.toFixed(1)),
    fat: Number(item.nutritionalInfo.fat.toFixed(1)),
    calories: Number(item.nutritionalInfo.calories.toFixed(0)),
    confidence: item.confidence
  }));
}

export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const response = await openai.models.list();
    return response.data.length > 0;
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
}