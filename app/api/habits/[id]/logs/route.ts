import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { validateInput, createHabitLogSchema, habitLogQuerySchema } from '@/lib/validation';
import { createHabitLog, findHabitLogs } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// GET /api/habits/[id]/logs - Retrieve log history
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate habit ID
    const habitId = params.id;
    if (!habitId || typeof habitId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid habit ID' },
        { status: 400 }
      );
    }

    if (!isValidUUID(habitId)) {
      return NextResponse.json(
        { error: 'Invalid habit ID format' },
        { status: 400 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = validateInput(habitLogQuerySchema, queryParams);
    
    // Build options for database query
    const options: any = {};
    if (validatedQuery.start_date) options.startDate = validatedQuery.start_date;
    if (validatedQuery.end_date) options.endDate = validatedQuery.end_date;
    if (validatedQuery.limit) options.limit = validatedQuery.limit;
    if (validatedQuery.offset) options.offset = validatedQuery.offset;
    
    // Set default limit if not provided
    if (!options.limit) options.limit = 30;
    
    try {
      // Fetch habit logs from database
      const logs = await findHabitLogs(habitId, payload.userId, options);
      
      return NextResponse.json({
        logs,
        total: logs.length,
        pagination: {
          limit: options.limit,
          offset: options.offset || 0,
          has_more: logs.length === options.limit
        }
      }, { status: 200 });
      
    } catch (dbError) {
      if (dbError instanceof Error && dbError.message === 'Habit not found') {
        return NextResponse.json(
          { error: 'Habit not found' },
          { status: 404 }
        );
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Get habit logs error:', error);

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

// POST /api/habits/[id]/logs - Log a status for a given day
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate habit ID
    const habitId = params.id;
    if (!habitId || typeof habitId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid habit ID' },
        { status: 400 }
      );
    }

    if (!isValidUUID(habitId)) {
      return NextResponse.json(
        { error: 'Invalid habit ID format' },
        { status: 400 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateInput(createHabitLogSchema, body);
    
    try {
      // Create or update habit log (upsert behavior)
      const log = await createHabitLog(
        habitId,
        validatedData.log_date,
        validatedData.completed,
        payload.userId
      );
      
      return NextResponse.json({
        message: 'Habit log saved successfully',
        log
      }, { status: 201 });
      
    } catch (dbError) {
      if (dbError instanceof Error && dbError.message === 'Habit not found') {
        return NextResponse.json(
          { error: 'Habit not found' },
          { status: 404 }
        );
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Create habit log error:', error);

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
        { error: 'Invalid log data or date constraints' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}