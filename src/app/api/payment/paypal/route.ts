/**
 * PayPal Payment API Route
 * Creates a PayPal order for redirect-based checkout
 */

import { NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID?.replace(/^["']|["']$/g, '');
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET?.replace(/^["']|["']$/g, '');
const PAYPAL_MODE = process.env.PAYPAL_MODE?.replace(/^["']|["']$/g, '') || 'sandbox';

const PAYPAL_BASE = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_CLIENT_SECRET).toString('base64');
  const res = await fetch(PAYPAL_BASE + '/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error('PayPal auth failed: ' + JSON.stringify(data));
  }
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokens, amount, currency } = body;

    if (!tokens || !amount) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return NextResponse.json({ success: false, error: 'PayPal credentials not configured' }, { status: 500 });
    }

    const accessToken = await getPayPalAccessToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: 'tokens-' + tokens,
        description: tokens + ' DreamLabs Tokens',
        amount: {
          currency_code: currency || 'USD',
          value: Number(amount).toFixed(2),
        },
      }],
      application_context: {
        brand_name: 'DreamLabs by Xyrenium',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
        return_url: appUrl + '/api/payment/paypal/capture?tokens=' + tokens,
        cancel_url: appUrl + '/tokens?payment=cancelled',
      },
    };

    const res = await fetch(PAYPAL_BASE + '/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const order = await res.json();

    if (!res.ok) {
      console.error('PayPal create order error:', order);
      return NextResponse.json({
        success: false,
        error: order.message || 'Failed to create PayPal order',
      }, { status: 500 });
    }

    const approvalLink = order.links?.find((l: { rel: string; href: string }) => l.rel === 'approve');

    if (!approvalLink) {
      return NextResponse.json({ success: false, error: 'No approval URL returned' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalUrl: approvalLink.href,
    });

  } catch (error) {
    console.error('PayPal payment error:', error);
    return NextResponse.json({ success: false, error: 'Payment processing failed' }, { status: 500 });
  }
}
