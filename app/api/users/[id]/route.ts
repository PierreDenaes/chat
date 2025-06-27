import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthError, verifyPassword } from '@/lib/auth';
import { validateInput, updateUserSchema, deleteUserSchema, uuidSchema } from '@/lib/validation';
import { 
  getUserProfile, 
  updateUserProfile, 
  deleteUserAccount, 
  verifyUserOwnership,
  getUserForPasswordVerification
} from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

// Helper function to validate UUID and ownership
async function validateUserAccess(userId: string, requestUserId: string): Promise<void> {
  // Validate UUID format
  validateInput(uuidSchema, userId);
  
  // Check ownership
  if (!verifyUserOwnership(userId, requestUserId)) {
    throw new AuthError('Access denied: You can only access your own profile', 403);
  }
}

// GET /api/users/[id] - Get user profile
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate user access
    await validateUserAccess(params.id, payload.userId);
    
    // Fetch user profile with height information
    const userProfile = await getUserProfile(params.id);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile (excluding sensitive data)
    return NextResponse.json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        auth_provider: userProfile.auth_provider,
        height_cm: userProfile.height_cm,
        last_height_logged: userProfile.last_height_logged,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get user profile error:', error);

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

// PATCH /api/users/[id] - Update user profile
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate user access
    await validateUserAccess(params.id, payload.userId);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateInput(updateUserSchema, body);
    
    // If email is being updated, verify current password
    if (validatedData.email && validatedData.current_password) {
      const userAuth = await getUserForPasswordVerification(params.id);
      if (!userAuth) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Check if user has a password (not social login only)
      if (userAuth.auth_provider !== 'local' && !userAuth.password_hash) {
        return NextResponse.json(
          { error: 'Password verification not available for social login accounts' },
          { status: 400 }
        );
      }

      // Verify current password
      const isValidPassword = await verifyPassword(validatedData.current_password, userAuth.password_hash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }
    }
    
    // Update user profile
    const updatedUser = await updateUserProfile(params.id, {
      name: validatedData.name,
      email: validatedData.email
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'No updates provided or user not found' },
        { status: 400 }
      );
    }
    
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
    console.error('Update user profile error:', error);

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

    if (error instanceof Error && error.message.includes('Email already exists')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user account
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate the request
    const payload = await authenticateRequest(request);
    
    // Validate user access
    await validateUserAccess(params.id, payload.userId);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateInput(deleteUserSchema, body);
    
    // Get user for password verification
    const userAuth = await getUserForPasswordVerification(params.id);
    if (!userAuth) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a password (not social login only)
    if (userAuth.auth_provider !== 'local' && !userAuth.password_hash) {
      return NextResponse.json(
        { error: 'Password verification not available for social login accounts. Contact support to delete your account.' },
        { status: 400 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, userAuth.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
    
    // Delete user account
    const deleted = await deleteUserAccount(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete user account' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'User account deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete user account error:', error);

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