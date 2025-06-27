import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { validateInput, createHabitSchema, habitQuerySchema } from '@/lib/validation';
import { findHabitsByUserId, createHabit } from '@/lib/db';

// GET /api/habits - List all habits for the user
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = validateInput(habitQuerySchema, queryParams);
    
    // Build options for database query
    const options: any = {};
    if (validatedQuery.archived !== undefined) options.archived = validatedQuery.archived;
    if (validatedQuery.limit) options.limit = validatedQuery.limit;
    if (validatedQuery.offset) options.offset = validatedQuery.offset;
    
    // Set default limit if not provided
    if (!options.limit) options.limit = 20;
    
    // Fetch habits from database
    const habits = await findHabitsByUserId(payload.userId, options);
    
    return NextResponse.json({
      habits,
      total: habits.length,
      pagination: {
        limit: options.limit,
        offset: options.offset || 0,
        has_more: habits.length === options.limit
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get habits error:', error);

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

// POST /api/habits - Create a new habit
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateInput(createHabitSchema, body);
    
    // Create habit in database
    const habit = await createHabit(
      payload.userId,
      validatedData.title,
      validatedData.target_frequency
    );
    
    return NextResponse.json({
      message: 'Habit created successfully',
      habit: {
        ...habit,
        total_logs: 0,
        completed_logs: 0,
        completion_rate: 0,
        last_logged: null
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create habit error:', error);

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

    // Handle database constraint errors
    if (error instanceof Error && error.message.includes('constraint')) {
      return NextResponse.json(
        { error: 'Invalid habit data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}