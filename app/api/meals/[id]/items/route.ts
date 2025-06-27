import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { validateInput, mealItemSchema } from '@/lib/validation';
import { findMealById, createMealItem } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// POST /api/meals/[id]/items - Add items to a meal
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate meal ID
    const mealId = params.id;
    if (!mealId || typeof mealId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid meal ID' },
        { status: 400 }
      );
    }

    if (!isValidUUID(mealId)) {
      return NextResponse.json(
        { error: 'Invalid meal ID format' },
        { status: 400 }
      );
    }
    
    // Check if meal exists and user owns it
    const meal = await findMealById(mealId, payload.userId);
    if (!meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    // Handle both single item and array of items
    const items = Array.isArray(body.items) ? body.items : [body];
    
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: 'Too many items (maximum 50 per request)' },
        { status: 400 }
      );
    }
    
    // Validate each item
    const validatedItems = items.map((item: any) => validateInput(mealItemSchema, item));
    
    // Create all meal items
    const createdItems = await Promise.all(
      validatedItems.map(item =>
        createMealItem(
          mealId,
          item.name,
          item.quantity,
          item.unit,
          item.protein,
          item.carbs,
          item.fat,
          item.calories
        )
      )
    );
    
    // Fetch updated meal with items and totals
    const updatedMeal = await findMealById(mealId, payload.userId);
    
    return NextResponse.json({
      message: `${createdItems.length} item(s) added to meal successfully`,
      items: createdItems,
      meal: updatedMeal
    }, { status: 201 });

  } catch (error) {
    console.error('Add meal items error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error && error.message.startsWith('Validation failed:')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}