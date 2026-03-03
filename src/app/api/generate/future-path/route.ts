/**
 * FuturePath AI Generation API Route
 * 
 * - wan2.6-image (SYNC): takes child's photo as base64 reference, generates adult version
 * - wan2.6-t2i (ASYNC): fallback text-only generation if no photo
 */

import { NextResponse } from 'next/server';

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY?.replace(/^["']|["']$/g, '');

// wan2.6-image: synchronous endpoint (does NOT support async)
const IMG_EDIT_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
// wan2.6-t2i: async endpoint
const T2I_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/image-generation/generation';
const TASK_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/tasks';

async function pollForImage(taskId: string): Promise<string | null> {
  for (let i = 0; i < 90; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const statusResponse = await fetch(`${TASK_API_URL}/${taskId}`, {
      headers: { 'Authorization': `Bearer ${DASHSCOPE_API_KEY}` },
    });

    if (!statusResponse.ok) continue;

    const statusData = await statusResponse.json();
    console.log('Task status:', statusData.output?.task_status);
    
    if (statusData.output?.task_status === 'SUCCEEDED') {
      return statusData.output?.choices?.[0]?.message?.content?.[0]?.image || null;
    }
    if (statusData.output?.task_status === 'FAILED') {
      console.error('Task failed:', JSON.stringify(statusData));
      return null;
    }
  }
  return null;
}

/**
 * wan2.6-image: SYNCHRONOUS call with base64 image directly.
 * The API accepts base64 data URLs in the image field.
 */
async function generateWithPhoto(dreamProfession: string, photoBase64: string): Promise<string | null> {
  try {
    console.log('Generating with reference photo using wan2.6-image (SYNC)');

    const content: Array<{text?: string; image?: string}> = [
      { 
        text: `Analyze the child in the reference image carefully. Pay close attention to:
- Gender: Determine male or female based on facial features and overall appearance
- Hair: Length, style, and color. If visible, preserve and mature into adult version
- Head covering: If the child is wearing hijab, mukena, or any head covering, keep it in the adult version. If not, do not add any head covering
- Face shape: Eyes, nose, mouth, skin tone
- Clothing style: Traditional, modern, or religious attire

Create a realistic photograph of this SAME person as an adult (age 25-30) working as a ${dreamProfession}.

CRITICAL RULES:
1. Match gender based on facial features (not clothing alone)
2. Preserve hairstyle if no head covering is present
3. Only replicate hijab/mukena if it exists in the original photo
4. Mature facial features naturally to adult age
5. Use professional ${dreamProfession} attire consistent with gender and any existing religious clothing

Photorealistic professional portrait, natural lighting, high quality.`
      },
      { image: photoBase64 },
    ];

    // SYNCHRONOUS call - no X-DashScope-Async header
    const response = await fetch(IMG_EDIT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'wan2.6-image',
        input: {
          messages: [{ role: 'user', content }]
        },
        parameters: {
          size: '960*1696',
          n: 1,
          prompt_extend: false,
          watermark: false,
          enable_interleave: false,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Image edit API error:', errText);
      return null;
    }

    // Synchronous response contains the image directly
    const data = await response.json();
    console.log('Image edit SYNC response keys:', JSON.stringify(Object.keys(data)));
    console.log('Image edit SYNC response:', JSON.stringify(data).substring(0, 500));

    // Extract image URL from synchronous response
    const imageUrl = data.output?.choices?.[0]?.message?.content?.[0]?.image;
    if (imageUrl) {
      console.log('Image generated (sync):', imageUrl.substring(0, 80));
      return imageUrl;
    }

    console.error('No image in sync response');
    return null;
  } catch (error) {
    console.error('Image edit error:', error);
    return null;
  }
}

async function generateTextOnly(dreamProfession: string): Promise<string | null> {
  try {
    console.log('Generating text-only image using wan2.6-t2i');

    const prompt = `A realistic photographic portrait of a young adult ${dreamProfession} in their professional work environment. 
      Wearing proper ${dreamProfession} attire and equipment. 
      Confident pose, natural lighting, professional photography quality.
      Photorealistic, NOT cartoon or illustration. 9:16 portrait format.`;

    const response = await fetch(T2I_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wan2.6-t2i',
        input: {
          messages: [{ role: 'user', content: [{ text: prompt }] }]
        },
        parameters: {
          size: '960*1696',
          n: 1,
          prompt_extend: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('T2I API error:', errText);
      return null;
    }

    const data = await response.json();
    const taskId = data.output?.task_id;
    if (!taskId) return null;

    return await pollForImage(taskId);
  } catch (error) {
    console.error('T2I error:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dreamProfession, photoBase64 } = body;

    if (!dreamProfession) {
      return NextResponse.json({ success: false, error: 'Dream profession is required' }, { status: 400 });
    }

    if (!DASHSCOPE_API_KEY) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    console.log('Generating FuturePath for:', dreamProfession, 'hasPhoto:', !!photoBase64);

    let futureImageUrl: string | null = null;

    // If photo provided, use wan2.6-image (synchronous, base64 direct)
    if (photoBase64) {
      futureImageUrl = await generateWithPhoto(dreamProfession, photoBase64);
    }

    // Fallback to text-only generation
    if (!futureImageUrl) {
      futureImageUrl = await generateTextOnly(dreamProfession);
    }

    if (!futureImageUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to generate future vision image' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      result: { dreamProfession, futureImageUrl },
    });

  } catch (error) {
    console.error('FuturePath generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Generation failed' 
    }, { status: 500 });
  }
}
