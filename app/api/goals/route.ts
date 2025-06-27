import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { validateInput, createGoalSchema } from '@/lib/validation';
import { findActiveGoal, createGoal } from '@/lib/db';

// GET /api/goals - Return the current protein goal for the user
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Find the active goal for the user
    const activeGoal = await findActiveGoal(payload.userId);
    
    if (!activeGoal) {
      return NextResponse.json(
        { error: 'No active goal found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      goal: {
        id: activeGoal.id,
        target_protein: parseFloat(activeGoal.target_protein.toString()),
        start_date: activeGoal.start_date,
        end_date: activeGoal.end_date,
        created_at: activeGoal.created_at,
        updated_at: activeGoal.updated_at
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get active goal error:', error);

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

// POST /api/goals - Create or update a goal
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateInput(createGoalSchema, body);
    
    // Create the new goal (this will automatically close any existing active goals)
    const newGoal = await createGoal(
      payload.userId,
      validatedData.target_protein,
      validatedData.start_date,
      validatedData.end_date || null
    );
    
    return NextResponse.json({
      message: 'Goal created successfully',
      goal: {
        id: newGoal.id,
        target_protein: parseFloat(newGoal.target_protein.toString()),
        start_date: newGoal.start_date,
        end_date: newGoal.end_date,
        created_at: newGoal.created_at,
        updated_at: newGoal.updated_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create goal error:', error);

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
        { error: 'Invalid goal data or date constraints' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}