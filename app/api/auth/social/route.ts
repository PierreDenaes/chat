import { NextRequest, NextResponse } from 'next/server';
import { generateToken, checkRateLimit, AuthError } from '@/lib/auth';
import { validateInput, socialLoginSchema } from '@/lib/validation';
import { createUser, findUserByEmail } from '@/lib/db';

// Social provider verification functions
async function verifyGoogleToken(token: string) {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
    if (!response.ok) throw new Error('Invalid Google token');
    return await response.json();
  } catch (error) {
    throw new AuthError('Invalid Google token', 401);
  }
}

async function verifyAppleToken(token: string) {
  // Apple token verification would require more complex JWT verification
  // This is a simplified implementation - use apple-auth library in production
  try {
    // For demo purposes, we'll accept any token starting with 'apple_'
    if (!token.startsWith('apple_')) {
      throw new Error('Invalid Apple token format');
    }
    
    // In production, you would verify the JWT token from Apple
    // using Apple's public keys and validate the payload
    return {
      email: 'user@example.com', // This would come from the verified token
      name: 'Apple User'
    };
  } catch (error) {
    throw new AuthError('Invalid Apple token', 401);
  }
}

async function verifyFacebookToken(token: string) {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    
    if (!appId || !appSecret) {
      throw new Error('Facebook app credentials not configured');
    }

    const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,email,name`);
    if (!response.ok) throw new Error('Invalid Facebook token');
    
    return await response.json();
  } catch (error) {
    throw new AuthError('Invalid Facebook token', 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many social login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { provider, token, email: providedEmail, name: providedName } = validateInput(socialLoginSchema, body);

    let userInfo: { email: string; name: string };

    // Verify token with the respective provider
    switch (provider) {
      case 'google':
        const googleInfo = await verifyGoogleToken(token);
        userInfo = {
          email: googleInfo.email,
          name: providedName || googleInfo.name || 'Google User'
        };
        break;
      
      case 'apple':
        const appleInfo = await verifyAppleToken(token);
        userInfo = {
          email: providedEmail || appleInfo.email,
          name: providedName || appleInfo.name || 'Apple User'
        };
        break;
      
      case 'facebook':
        const facebookInfo = await verifyFacebookToken(token);
        userInfo = {
          email: facebookInfo.email,
          name: providedName || facebookInfo.name || 'Facebook User'
        };
        break;
      
      default:
        return NextResponse.json(
          { error: 'Unsupported auth provider' },
          { status: 400 }
        );
    }

    if (!userInfo.email) {
      return NextResponse.json(
        { error: 'Email not provided by social provider' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await findUserByEmail(userInfo.email.toLowerCase());
    
    if (user) {
      // User exists, update auth provider if needed
      if (user.auth_provider === 'local' && user.auth_provider !== provider) {
        // You might want to handle this case differently
        // For now, we'll allow the login but keep the original auth_provider
      }
    } else {
      // Create new user
      user = await createUser(
        userInfo.email.toLowerCase(),
        '', // No password hash for social logins
        userInfo.name,
        provider
      );
    }

    // Generate JWT token
    const jwtToken = generateToken({
      userId: user.id,
      email: user.email
    });

    // Return success response
    return NextResponse.json({
      message: 'Social login successful',
      token: jwtToken,
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
    console.error('Social login error:', error);

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
      { error: 'Social login failed' },
      { status: 500 }
    );
  }
}