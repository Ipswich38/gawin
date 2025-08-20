import { NextRequest, NextResponse } from 'next/server';
import { VerificationStore } from '@/lib/verification-store';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const activeCodes = VerificationStore.getAllActive();
  
  return NextResponse.json({
    message: 'Active verification codes (development only)',
    codes: activeCodes.map(code => ({
      email: code.email,
      code: code.code,
      fullName: code.fullName,
      expiresAt: code.expiresAt,
      createdAt: code.createdAt,
    })),
    count: activeCodes.length,
  });
}