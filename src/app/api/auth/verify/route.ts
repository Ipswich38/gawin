import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VerificationStore } from '@/lib/verification-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create Supabase client if environment variables are available
const supabase = supabaseUrl && supabaseServiceKey && supabaseUrl.includes('supabase.co') 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    console.log(`🔍 Verification attempt: email=${email}, code=${code}`);

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
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

    // Verify the code using in-memory store
    const verificationResult = VerificationStore.verify(email, code);
    
    console.log(`🔍 Verification result:`, verificationResult);
    
    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      );
    }

    // Update user's email confirmation status
    const { error: userUpdateError } = await supabase.auth.admin.updateUserById(
      verificationResult.userId!,
      { email_confirm: true }
    );

    if (userUpdateError) {
      console.error('Error confirming user email:', userUpdateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    });

  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}