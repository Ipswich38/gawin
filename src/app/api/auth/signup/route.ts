import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VerificationStore } from '@/lib/verification-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create user with Supabase Auth (with email confirmation disabled)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        // Don't send email confirmation - we handle this manually
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Generate and store 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code (in-memory for now, database later)
    VerificationStore.store({
      email: email,
      code: verificationCode,
      userId: data.user.id,
      fullName: fullName,
      expiresAt: expiresAt,
    });

    // Send verification email (you can integrate with your email service here)
    await sendVerificationEmail(email, verificationCode, fullName);

    return NextResponse.json({
      success: true,
      message: 'User created successfully. Please check your email for verification code.',
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed: data.user.email_confirmed_at !== null,
      },
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendVerificationEmail(email: string, code: string, fullName: string) {
  // For now, we'll log the code to console for development
  // In production, you would integrate with an email service like SendGrid, Resend, etc.
  
  console.log(`
===========================================
📧 EMAIL VERIFICATION CODE FOR ${email}
===========================================
Hi ${fullName},

Your KreativLoops AI verification code is:

    ${code}

This code will expire in 10 minutes.

Enter this code in the app to complete your signup.
===========================================
  `);

  // TODO: Integrate with email service
  // Example with Resend:
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'KreativLoops AI <noreply@kreativloops.com>',
    to: email,
    subject: 'Verify your KreativLoops AI account',
    html: `
      <h2>Welcome to KreativLoops AI!</h2>
      <p>Hi ${fullName},</p>
      <p>Your verification code is: <strong style="font-size: 24px; color: #3B82F6;">${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>Enter this code in the app to complete your signup.</p>
    `,
  });
  */
}