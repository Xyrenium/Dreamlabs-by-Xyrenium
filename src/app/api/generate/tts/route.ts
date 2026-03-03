/**
 * TTS API Route - Qwen3-TTS-Flash
 * 
 * Generates speech audio from text using Alibaba Cloud DashScope
 * Supports multiple languages: EN, ID, ZH
 */

import { NextResponse } from 'next/server';

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY?.replace(/^["']|["']$/g, '');
const TTS_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

// Map locale to qwen3-tts-flash language_type
// Use 'Auto' to let the model detect the language from the text itself
const languageMap: Record<string, string> = {
  en: 'Auto',
  id: 'Auto',
  zh: 'Auto',
};

// Voice options per locale
const voiceMap: Record<string, string> = {
  en: 'Cherry',
  id: 'Cherry',
  zh: 'Cherry',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, locale = 'en' } = body;

    if (!text) {
      return NextResponse.json({ success: false, error: 'Missing text' }, { status: 400 });
    }

    if (!DASHSCOPE_API_KEY) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    const languageType = languageMap[locale] || 'Auto';
    const voice = voiceMap[locale] || 'Cherry';

    console.log('TTS request:', { textLength: text.length, locale, languageType, voice });

    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3-tts-flash',
        input: {
          text: text,
          voice: voice,
          language_type: languageType,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API error:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: `TTS API error: ${response.status}` 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('TTS API response:', JSON.stringify(data).substring(0, 200));

    const audioUrl = data.output?.audio?.url;
    
    if (!audioUrl) {
      console.error('No audio URL in TTS response:', data);
      return NextResponse.json({ 
        success: false, 
        error: 'No audio generated' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      audioUrl,
    });

  } catch (error) {
    console.error('TTS generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'TTS generation failed' 
    }, { status: 500 });
  }
}
