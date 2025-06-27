import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { validateInput, updateMealSchema, uuidSchema } from '@/lib/validation';
import { findMealById, updateMeal, deleteMeal } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

// Helper function to validate UUID format
function validateMealId(mealId: string): void {
  validateInput(uuidSchema, mealId);
}

// GET /api/meals/[id] - Get detailed meal information
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate meal ID format
    validateMealId(params.id);
    
    // Fetch meal with items and nutritional totals
    const meal = await findMealById(params.id, payload.userId);
    
    if (!meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      meal
    }, { status: 200 });

  } catch (error) {
    console.error('Get meal by ID error:', error);

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

// PATCH /api/meals/[id] - Update meal fields (notes or date)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate meal ID format
    validateMealId(params.id);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateInput(updateMealSchema, body);
    
    // Check if meal exists and user has ownership
    const existingMeal = await findMealById(params.id, payload.userId);
    if (!existingMeal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }
    
    // Update meal in database
    const updatedMeal = await updateMeal(
      params.id,
      payload.userId,
      {
        meal_date: validatedData.meal_date,
        notes: validatedData.notes
      }
    );
    
    if (!updatedMeal) {
      return NextResponse.json(
        { error: 'No updates provided or meal not found' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: 'Meal updated successfully',
      meal: updatedMeal
    }, { status: 200 });

  } catch (error) {
    console.error('Update meal error:', error);

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

// DELETE /api/meals/[id] - Delete a meal
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate meal ID format
    validateMealId(params.id);
    
    // Check if meal exists and user has ownership
    const existingMeal = await findMealById(params.id, payload.userId);
    if (!existingMeal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }
    
    // Delete meal from database
    const deleted = await deleteMeal(params.id, payload.userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete meal' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Meal deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete meal error:', error);

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