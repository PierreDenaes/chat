import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError } from '@/lib/auth';
import { findUserById } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request and get user payload
    const payload = await authenticateRequest(request);
    
    // Fetch user details from database
    const user = await findUserById(payload.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user information (excluding sensitive data)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        auth_provider: user.auth_provider,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Auth me error:', error);

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

// Optional: Allow users to update their profile
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Parse request body
    const body = await request.json();
    const { name } = body;

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid name is required' },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { error: 'Name too long' },
        { status: 400 }
      );
    }

    // Update user name in database
    const query = `
      UPDATE users 
      SET name = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, email, name, auth_provider, created_at, updated_at
    `;
    
    const { db } = await import('@/lib/db');
    const result = await db.query(query, [name.trim(), payload.userId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = result.rows[0];

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        auth_provider: updatedUser.auth_provider,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);

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