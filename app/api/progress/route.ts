import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { validateInput, createProgressSchema, progressQuerySchema } from '@/lib/validation';
import { findProgressByUserId, createProgressEntry } from '@/lib/db';

// GET /api/progress - Get all physical progress entries for the user
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = validateInput(progressQuerySchema, queryParams);
    
    // Build options for database query
    const options: any = {};
    if (validatedQuery.start_date) options.startDate = validatedQuery.start_date;
    if (validatedQuery.end_date) options.endDate = validatedQuery.end_date;
    if (validatedQuery.limit) options.limit = validatedQuery.limit;
    if (validatedQuery.offset) options.offset = validatedQuery.offset;
    
    // Set default limit if not provided
    if (!options.limit) options.limit = 30;
    
    // Fetch progress entries from database
    const progressEntries = await findProgressByUserId(payload.userId, options);
    
    return NextResponse.json({
      progress: progressEntries,
      total: progressEntries.length,
      pagination: {
        limit: options.limit,
        offset: options.offset || 0,
        has_more: progressEntries.length === options.limit
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get progress error:', error);

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

// POST /api/progress - Log a new physical progress entry
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateInput(createProgressSchema, body);
    
    // Create progress entry in database
    const progressEntry = await createProgressEntry(
      payload.userId,
      {
        weight_kg: validatedData.weight_kg,
        body_fat_pct: validatedData.body_fat_pct,
        height_cm: validatedData.height_cm
      }
    );
    
    return NextResponse.json({
      message: 'Progress entry logged successfully',
      progress: progressEntry
    }, { status: 201 });

  } catch (error) {
    console.error('Create progress error:', error);

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
        { error: 'Invalid progress data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}