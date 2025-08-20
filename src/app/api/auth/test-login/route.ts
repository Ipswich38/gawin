import { NextRequest, NextResponse } from 'next/server';

// Test account credentials
const TEST_ACCOUNTS = [
  {
    email: 'admin@kreativloops.com',
    password: 'admin123',
    user: {
      id: 'test-admin-001',
      email: 'admin@kreativloops.com',
      full_name: 'Admin User',
      email_verified: true,
    }
  },
  {
    email: 'user@kreativloops.com', 
    password: 'user123',
    user: {
      id: 'test-user-001',
      email: 'user@kreativloops.com',
      full_name: 'Test User',
      email_verified: true,
    }
  },
  {
    email: 'demo@kreativloops.com',
    password: 'demo123',
    user: {
      id: 'test-demo-001',
      email: 'demo@kreativloops.com',
      full_name: 'Demo User',
      email_verified: true,
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find matching test account
    const testAccount = TEST_ACCOUNTS.find(
      account => account.email === email && account.password === password
    );

    if (!testAccount) {
      return NextResponse.json(
        { error: 'Invalid test credentials' },
        { status: 401 }
      );
    }

    // Generate a mock session
    const mockSession = {
      access_token: `test_token_${Date.now()}`,
      refresh_token: `test_refresh_${Date.now()}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };

    console.log(`✅ Test login successful for ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Test login successful',
      user: testAccount.user,
      session: mockSession,
    });

  } catch (error: any) {
    console.error('Test login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'KreativLoops AI Test Login API',
    available_accounts: TEST_ACCOUNTS.map(account => ({
      email: account.email,
      password: account.password,
      note: 'Test account for development'
    }))
  });
}