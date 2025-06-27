import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { findHabitLogById, deleteHabitLog } from '@/lib/db';

interface RouteParams {
  params: { id: string; logId: string };
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// DELETE /api/habits/[id]/logs/[logId] - Remove a log entry
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate habit ID and log ID
    const { id: habitId, logId } = params;
    
    if (!habitId || !logId || typeof habitId !== 'string' || typeof logId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid habit ID or log ID' },
        { status: 400 }
      );
    }

    if (!isValidUUID(habitId) || !isValidUUID(logId)) {
      return NextResponse.json(
        { error: 'Invalid habit ID or log ID format' },
        { status: 400 }
      );
    }
    
    // Check if the habit log exists and user owns the habit
    const existingLog = await findHabitLogById(logId, habitId, payload.userId);
    if (!existingLog) {
      return NextResponse.json(
        { error: 'Habit log not found' },
        { status: 404 }
      );
    }
    
    // Delete the habit log
    const deleted = await deleteHabitLog(logId, habitId, payload.userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete habit log' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Habit log deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete habit log error:', error);

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