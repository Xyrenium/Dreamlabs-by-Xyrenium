import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      tokens: user.tokens,
      transactions: user.transactions,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
