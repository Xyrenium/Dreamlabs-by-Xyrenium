/**
 * Midtrans Snap Payment API Route
 * Creates a Snap token for client-side payment popup
 */

import { NextResponse } from 'next/server';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY?.replace(/^["']|["']$/g, '');
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

const SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokens, amount, currency } = body;

    if (!tokens || !amount) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (currency !== 'IDR') {
      return NextResponse.json({ success: false, error: 'Midtrans only supports IDR' }, { status: 400 });
    }

    if (!MIDTRANS_SERVER_KEY) {
      return NextResponse.json({ success: false, error: 'Midtrans server key not configured' }, { status: 500 });
    }

    const orderId = 'DREAMLABS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const authString = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');

    const snapPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(amount),
      },
      item_details: [{
        id: 'tokens-' + tokens,
        price: Math.round(amount),
        quantity: 1,
        name: tokens + ' DreamLabs Tokens',
      }],
      callbacks: {
        finish: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/tokens?payment=success&tokens=' + tokens,
      },
    };

    const response = await fetch(SNAP_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + authString,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(snapPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Midtrans Snap API error:', data);
      return NextResponse.json({
        success: false,
        error: data.error_messages?.join(', ') || 'Failed to create payment',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      snapToken: data.token,
      redirectUrl: data.redirect_url,
      orderId,
    });

  } catch (error) {
    console.error('Midtrans payment error:', error);
    return NextResponse.json({ success: false, error: 'Payment processing failed' }, { status: 500 });
  }
}
