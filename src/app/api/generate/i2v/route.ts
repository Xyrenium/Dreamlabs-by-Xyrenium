/**
 * Image-to-Video API Route - Wan2.6-I2V-Flash
 * 
 * Converts a still image to an animated video using Alibaba Cloud DashScope
 * Audio generation is disabled (TTS will be overlaid separately)
 */

import { NextResponse } from 'next/server';

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY?.replace(/^["']|["']$/g, '');
const I2V_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis';
const TASK_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/tasks';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, prompt = '' } = body;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'Missing imageUrl' }, { status: 400 });
    }

    if (!DASHSCOPE_API_KEY) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    console.log('I2V request:', { imageUrl: imageUrl.substring(0, 60), prompt: prompt.substring(0, 60) });

    // Submit async I2V task
    const response = await fetch(I2V_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wan2.6-i2v-flash',
        input: {
          prompt: prompt || 'gentle animation, subtle movement, fairy tale scene comes alive',
          img_url: imageUrl,
        },
        parameters: {
          resolution: '720P',
          duration: 5,
          audio: false, // Disable auto-generated audio; TTS will be used instead
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('I2V API error:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: `I2V API error: ${response.status}` 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('I2V API response:', JSON.stringify(data).substring(0, 200));

    const taskId = data.output?.task_id;
    if (!taskId) {
      console.error('No task ID in I2V response');
      return NextResponse.json({ success: false, error: 'No task ID returned' }, { status: 500 });
    }

    // Poll for result (I2V can take longer than image gen)
    for (let i = 0; i < 90; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const statusResponse = await fetch(`${TASK_API_URL}/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        console.log('I2V status check failed, retrying...');
        continue;
      }

      const statusData = await statusResponse.json();
      const taskStatus = statusData.output?.task_status;
      console.log('I2V task status:', taskStatus);

      if (taskStatus === 'SUCCEEDED') {
        const videoUrl = statusData.output?.video_url || 
                         statusData.output?.results?.[0]?.url ||
                         statusData.output?.choices?.[0]?.message?.content?.[0]?.video;
        
        console.log('Video generated:', videoUrl?.substring(0, 80));
        
        if (!videoUrl) {
          console.error('Video succeeded but no URL found:', JSON.stringify(statusData.output));
          return NextResponse.json({ success: false, error: 'Video URL not found' }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          videoUrl,
        });
      }

      if (taskStatus === 'FAILED') {
        console.error('I2V generation failed:', statusData);
        return NextResponse.json({ 
          success: false, 
          error: 'Video generation failed' 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: 'Video generation timeout' }, { status: 504 });

  } catch (error) {
    console.error('I2V generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'I2V generation failed' 
    }, { status: 500 });
  }
}
