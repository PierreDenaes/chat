import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { validateInput, createMealSchema, mealQuerySchema } from '@/lib/validation';
import { createMeal, findMealsByUserId } from '@/lib/db';

// GET /api/meals - List all meals for the current user
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = validateInput(mealQuerySchema, queryParams);
    
    // Build options for database query
    const options: any = {};
    if (validatedQuery.date) {
      options.date = validatedQuery.date;
    } else {
      if (validatedQuery.start_date) options.startDate = validatedQuery.start_date;
      if (validatedQuery.end_date) options.endDate = validatedQuery.end_date;
    }
    if (validatedQuery.limit) options.limit = validatedQuery.limit;
    if (validatedQuery.offset) options.offset = validatedQuery.offset;
    
    // Set default limit if not provided
    if (!options.limit) options.limit = 20;
    
    // Fetch meals from database
    const meals = await findMealsByUserId(payload.userId, options);
    
    return NextResponse.json({
      meals,
      total: meals.length,
      pagination: {
        limit: options.limit,
        offset: options.offset || 0,
        has_more: meals.length === options.limit
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get meals error:', error);

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

// POST /api/meals - Create a new meal
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateInput(createMealSchema, body);
    
    // Create meal in database
    const meal = await createMeal(
      payload.userId,
      validatedData.meal_date,
      validatedData.photo_url || null,
      validatedData.source,
      validatedData.notes || null
    );
    
    return NextResponse.json({
      message: 'Meal created successfully',
      meal: {
        ...meal,
        items: [],
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        total_calories: 0,
        item_count: 0
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create meal error:', error);

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