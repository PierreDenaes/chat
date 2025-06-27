import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { validateInput, updateHabitSchema } from '@/lib/validation';
import { findHabitById, updateHabit, deleteHabit } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// PATCH /api/habits/[id] - Update a habit
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const validatedData = validateInput(updateHabitSchema, body);
    
    // Check if there are any fields to update
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Check if the habit exists and user owns it
    const existingHabit = await findHabitById(habitId, payload.userId);
    if (!existingHabit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }
    
    // Update the habit
    const updatedHabit = await updateHabit(habitId, payload.userId, validatedData);
    
    if (!updatedHabit) {
      return NextResponse.json(
        { error: 'Failed to update habit' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Habit updated successfully',
      habit: updatedHabit
    }, { status: 200 });

  } catch (error) {
    console.error('Update habit error:', error);

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

// DELETE /api/habits/[id] - Delete a habit
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    
    // Check if the habit exists and user owns it
    const existingHabit = await findHabitById(habitId, payload.userId);
    if (!existingHabit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }
    
    // Delete the habit (this will cascade delete all associated logs)
    const deleted = await deleteHabit(habitId, payload.userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete habit' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Habit deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete habit error:', error);

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