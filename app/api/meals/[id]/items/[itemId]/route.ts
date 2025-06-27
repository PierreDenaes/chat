import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { validateInput, updateMealItemSchema } from '@/lib/validation';
import { findMealItemWithOwnership, updateMealItem, deleteMealItem, findMealById } from '@/lib/db';

interface RouteParams {
  params: { id: string; itemId: string };
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// PATCH /api/meals/[id]/items/[itemId] - Update a specific meal item
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate meal ID and item ID
    const { id: mealId, itemId } = params;
    
    if (!mealId || !itemId || typeof mealId !== 'string' || typeof itemId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid meal ID or item ID' },
        { status: 400 }
      );
    }

    if (!isValidUUID(mealId) || !isValidUUID(itemId)) {
      return NextResponse.json(
        { error: 'Invalid meal ID or item ID format' },
        { status: 400 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateInput(updateMealItemSchema, body);
    
    // Check if there are any fields to update
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Check if the meal item exists and user owns the meal
    const existingItem = await findMealItemWithOwnership(itemId, mealId, payload.userId);
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Meal item not found' },
        { status: 404 }
      );
    }
    
    // Update the meal item
    const updatedItem = await updateMealItem(itemId, mealId, payload.userId, validatedData);
    
    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Failed to update meal item' },
        { status: 500 }
      );
    }
    
    // Fetch updated meal with items and totals
    const updatedMeal = await findMealById(mealId, payload.userId);
    
    return NextResponse.json({
      message: 'Meal item updated successfully',
      item: updatedItem,
      meal: updatedMeal
    }, { status: 200 });

  } catch (error) {
    console.error('Update meal item error:', error);

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

// DELETE /api/meals/[id]/items/[itemId] - Delete a specific meal item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate meal ID and item ID
    const { id: mealId, itemId } = params;
    
    if (!mealId || !itemId || typeof mealId !== 'string' || typeof itemId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid meal ID or item ID' },
        { status: 400 }
      );
    }

    if (!isValidUUID(mealId) || !isValidUUID(itemId)) {
      return NextResponse.json(
        { error: 'Invalid meal ID or item ID format' },
        { status: 400 }
      );
    }
    
    // Check if the meal item exists and user owns the meal
    const existingItem = await findMealItemWithOwnership(itemId, mealId, payload.userId);
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Meal item not found' },
        { status: 404 }
      );
    }
    
    // Delete the meal item
    const deleted = await deleteMealItem(itemId, mealId, payload.userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete meal item' },
        { status: 500 }
      );
    }
    
    // Fetch updated meal with items and totals
    const updatedMeal = await findMealById(mealId, payload.userId);
    
    return NextResponse.json({
      message: 'Meal item deleted successfully',
      meal: updatedMeal
    }, { status: 200 });

  } catch (error) {
    console.error('Delete meal item error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}