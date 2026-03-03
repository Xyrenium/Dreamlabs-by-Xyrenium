/**
 * PayPal Capture Route
 * Handles PayPal redirect after payment approval, captures the order, then redirects to tokens page
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paypalToken = searchParams.get('token'); // PayPal order ID
  const tokenAmount = searchParams.get('tokens') || '0';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!paypalToken) {
    return NextResponse.redirect(appUrl + '/tokens?payment=failed&reason=no_token');
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(PAYPAL_BASE + '/v2/checkout/orders/' + paypalToken + '/capture', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();

    if (captureData.status === 'COMPLETED') {
      return NextResponse.redirect(appUrl + '/tokens?payment=success&tokens=' + tokenAmount + '&orderId=' + paypalToken);
    } else {
      console.error('PayPal capture status:', captureData.status, captureData);
      return NextResponse.redirect(appUrl + '/tokens?payment=failed&reason=capture_' + (captureData.status || 'unknown'));
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.redirect(appUrl + '/tokens?payment=failed&reason=error');
  }
}
