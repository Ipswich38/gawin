import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create Supabase client if environment variables are available
const supabase = supabaseUrl && supabaseServiceKey && supabaseUrl.includes('supabase.co') 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if Supabase is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Authentication service not configured' },
        { status: 503 }
      );
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for recent verification attempts (rate limiting)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const { data: recentCodes } = await supabase
      .from('verification_codes')
      .select('created_at')
      .eq('email', email)
      .eq('type', 'email_verification')
      .gte('created_at', fiveMinutesAgo.toISOString());

    if (recentCodes && recentCodes.length > 0) {
      return NextResponse.json(
        { error: 'Please wait 5 minutes before requesting a new code' },
        { status: 429 }
      );
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store new verification code
    const { error: codeError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: userData.id,
        email: email,
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
        type: 'email_verification'
      });

    if (codeError) {
      console.error('Error storing verification code:', codeError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    // Send verification email
    const fullName = userData.raw_user_meta_data?.full_name || 'User';
    await sendVerificationEmail(email, verificationCode, fullName);

    return NextResponse.json({
      success: true,
      message: 'New verification code sent to your email.',
    });

  } catch (error: any) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendVerificationEmail(email: string, code: string, fullName: string) {
  // Log the verification code to console for development
  console.log(`
===========================================
🔄 RESENT EMAIL VERIFICATION CODE FOR ${email}
===========================================
Hi ${fullName},

Your new KreativLoops AI verification code is:

    ${code}

This code will expire in 10 minutes.

Enter this code in the app to complete your signup.
===========================================
  `);

  // TODO: Integrate with email service
}