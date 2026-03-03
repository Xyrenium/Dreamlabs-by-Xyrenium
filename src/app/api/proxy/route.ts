/**
 * Media Proxy API Route
 * 
 * Proxies external media URLs to avoid CORS issues when using FFmpeg WASM
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Validate URL to prevent SSRF attacks - only allow known domains
    const allowedDomains = [
      'dashscope.oss-cn-beijing.aliyuncs.com',
      'dashscope-result.oss-cn-beijing.aliyuncs.com',
      'dashscope-result-intl.oss-cn-beijing.aliyuncs.com',
      'dashscope-result-bj.oss-cn-beijing.aliyuncs.com',
    ];

    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some(domain => urlObj.hostname.includes(domain) || urlObj.hostname.endsWith('.aliyuncs.com'));

    if (!isAllowed) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}
