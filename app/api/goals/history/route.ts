import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { validateInput, goalHistorySchema } from '@/lib/validation';
import { findGoalHistory } from '@/lib/db';

// GET /api/goals/history - Return previous goals by date range
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = validateInput(goalHistorySchema, queryParams);
    
    // Build options for database query
    const options: any = {};
    if (validatedQuery.start_date) options.startDate = validatedQuery.start_date;
    if (validatedQuery.end_date) options.endDate = validatedQuery.end_date;
    if (validatedQuery.limit) options.limit = validatedQuery.limit;
    if (validatedQuery.offset) options.offset = validatedQuery.offset;
    
    // Set default limit if not provided
    if (!options.limit) options.limit = 20;
    
    // Fetch goal history from database
    const goals = await findGoalHistory(payload.userId, options);
    
    // Format the response
    const formattedGoals = goals.map(goal => ({
      id: goal.id,
      target_protein: parseFloat(goal.target_protein.toString()),
      start_date: goal.start_date,
      end_date: goal.end_date,
      created_at: goal.created_at,
      updated_at: goal.updated_at,
      is_active: goal.end_date === null || new Date(goal.end_date) >= new Date()
    }));
    
    return NextResponse.json({
      goals: formattedGoals,
      total: formattedGoals.length,
      pagination: {
        limit: options.limit,
        offset: options.offset || 0,
        has_more: formattedGoals.length === options.limit
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get goal history error:', error);

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