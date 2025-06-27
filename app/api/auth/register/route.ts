import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, checkRateLimit, generateToken, resetRateLimit, AuthError } from '@/lib/auth';
import { validateInput, signupSchema } from '@/lib/validation';
import { createUser, findUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { email, password, name } = validateInput(signupSchema, body);

    // Check if user already exists
    const existingUser = await findUserByEmail(email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser(email.toLowerCase(), passwordHash, name);

    // Reset rate limit on successful registration
    resetRateLimit(clientIP);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    // Return success response with token
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);

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

    // Database constraint errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}