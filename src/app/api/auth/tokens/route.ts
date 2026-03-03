import { NextResponse } from 'next/server';
import { findUserById, updateUserTokens, addTransaction } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    const user = findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tokens: user.tokens,
      transactions: user.transactions,
    });
  } catch (error) {
    console.error('Get tokens error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, tokens, transaction } = await request.json();

    if (!userId || tokens === undefined) {
      return NextResponse.json({ success: false, error: 'userId and tokens required' }, { status: 400 });
    }

    const user = findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    updateUserTokens(userId, tokens);

    if (transaction) {
      addTransaction(userId, transaction);
    }

    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error('Update tokens error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
