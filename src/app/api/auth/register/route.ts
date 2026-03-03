import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const user = createUser(email, password, name);

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
    console.error('Register error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
