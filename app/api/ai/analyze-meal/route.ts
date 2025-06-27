import { NextRequest, NextResponse } from 'next/server';
import { analyzeMealImage, convertToMealItems } from '@/lib/openai';
import { validateInput } from '@/lib/validation';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { z } from 'zod';
import { MealAnalysisRequest, OpenAIVisionResponse } from '@/types/openai';

const analyzeRequestSchema = z.object({
  imageData: z.string().min(1, 'Image data is required'),
  imageFormat: z.enum(['jpeg', 'jpg', 'png', 'webp']).default('jpeg'),
  mealDate: z.string().optional()
});

const RATE_LIMIT_PER_MINUTE = 10; // Limit AI requests per user per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset rate limit window
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + 60000 // 1 minute from now
    });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_PER_MINUTE) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    const body = await request.json();
    const validatedData = validateInput(analyzeRequestSchema, body);
    
    // Check rate limiting using authenticated user ID
    if (!checkRateLimit(payload.userId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please wait before making another analysis request.' 
        },
        { status: 429 }
      );
    }

    // Validate image data size (base64 encoded)
    const imageSizeBytes = Math.ceil(validatedData.imageData.length * 0.75);
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (imageSizeBytes > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Image is too large. Please compress the image and try again.' 
        },
        { status: 413 }
      );
    }

    console.log(`Starting AI analysis for user ${payload.userId}, image size: ${imageSizeBytes} bytes`);
    
    const startTime = Date.now();
    
    // Call OpenAI Vision API
    const analysis = await analyzeMealImage(
      validatedData.imageData,
      validatedData.imageFormat
    );
    
    const processingTime = Date.now() - startTime;
    
    // Convert to meal items format for frontend
    const foodItems = convertToMealItems(analysis);
    
    // Calculate nutritional summary
    const nutritionalSummary = {
      totalProtein: analysis.totalNutrition.protein,
      totalCarbs: analysis.totalNutrition.carbs,
      totalFat: analysis.totalNutrition.fat,
      totalCalories: analysis.totalNutrition.calories,
      confidence: analysis.confidence
    };

    const response: OpenAIVisionResponse = {
      success: true,
      analysis: {
        foodItems,
        nutritionalSummary,
        detectedItems: analysis.detectedIngredients,
        overallConfidence: analysis.confidence,
        processingTime
      }
    };

    console.log(`AI analysis completed in ${processingTime}ms, confidence: ${analysis.confidence}`);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('AI meal analysis error:', error);
    
    // Handle authentication errors
    if (error instanceof AuthError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: error.statusCode }
      );
    }
    
    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'AI service is currently busy. Please try again in a few moments.' 
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('Validation failed')) {
        return NextResponse.json(
          { 
            success: false, 
            error: error.message 
          },
          { status: 400 }
        );
      }
    }
    
    // Generic error response (don't expose internal details)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze meal image. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({ 
    status: 'AI meal analysis service is running',
    timestamp: new Date().toISOString()
  });
}