/**
 * FuturePath Story Generation API Route
 * 
 * Generates a fairy tale story about a child's journey to their dream profession
 * Uses Qwen for text and Wan for images
 */

import { NextResponse } from 'next/server';

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY?.replace(/^["']|["']$/g, '');
const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
const IMAGE_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/image-generation/generation';
const TASK_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/tasks';

const systemPrompts = {
  en: `You are an inspirational storyteller creating motivational journey stories for children.
       Write about a child's journey to becoming their dream profession.
       The story should be encouraging, realistic yet hopeful.
       IMPORTANT: Respond ONLY with valid JSON, no additional text.`,
  id: `Anda adalah pendongeng inspirasional yang membuat cerita perjalanan motivasional untuk anak-anak.
       Tulis tentang perjalanan anak menuju profesi impian mereka.
       Cerita harus menyemangati, realistis namun penuh harapan.
       PENTING: Jawab HANYA dengan JSON yang valid, tanpa teks tambahan.`,
  zh: `你是一位鼓舞人心的故事讲述者，为儿童创作励志旅程故事。
       讲述一个孩子通往梦想职业的旅程。
       故事应该是鼓励性的、现实但充满希望的。
       重要：仅以有效的JSON格式回复，不要添加额外文字。`,
};

async function generateStoryText(dreamProfession: string, locale: string) {
  const systemPrompt = systemPrompts[locale as keyof typeof systemPrompts] || systemPrompts.en;
  
  const langInstruction = locale === 'id' ? 'Indonesian' : locale === 'zh' ? 'Chinese' : 'English';
  
  const userPrompt = `Create a 6-slide inspirational story about a child's journey to becoming a ${dreamProfession}.
    
    Return a JSON object with format:
    {
      "title": "story title",
      "slides": [
        {"text": "inspirational story text (2-3 sentences)", "imagePrompt": "detailed prompt for fairy tale comic illustration in English"}
      ]
    }
    
    The 6 slides should cover:
    1) The child's dream and inspiration
    2) Starting the journey - learning basics
    3) Overcoming challenges
    4) Getting better through practice
    5) Achieving the dream
    6) Inspiring others and giving back
    
    Write the story text in ${langInstruction}. Make it emotional and inspiring.`;

  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Qwen API error:', errorText);
    throw new Error(`Qwen API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse story JSON from response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

async function generateImage(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wan2.6-t2i',
        input: {
          messages: [
            {
              role: 'user',
              content: [
                { text: `Fairy tale comic illustration, ${prompt}, colorful children's book art, warm inspiring atmosphere` }
              ]
            }
          ]
        },
        parameters: {
          size: '960*1696',
          n: 1,
          prompt_extend: true,
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const taskId = data.output?.task_id;
    if (!taskId) return null;

    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`${TASK_API_URL}/${taskId}`, {
        headers: { 'Authorization': `Bearer ${DASHSCOPE_API_KEY}` },
      });

      if (!statusResponse.ok) continue;

      const statusData = await statusResponse.json();
      if (statusData.output?.task_status === 'SUCCEEDED') {
        // wan2.6 uses choices[].message.content[].image format
        return statusData.output?.choices?.[0]?.message?.content?.[0]?.image || null;
      }
      if (statusData.output?.task_status === 'FAILED') return null;
    }

    return null;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dreamProfession, locale = 'en' } = body;

    if (!dreamProfession) {
      return NextResponse.json({ success: false, error: 'Dream profession is required' }, { status: 400 });
    }

    if (!DASHSCOPE_API_KEY) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    console.log('Generating FuturePath story for:', dreamProfession);

    // Generate story text
    const storyData = await generateStoryText(dreamProfession, locale);

    // Generate images sequentially
    const slidesWithImages = [];
    for (const slide of storyData.slides) {
      const imageUrl = await generateImage(slide.imagePrompt);
      slidesWithImages.push({ ...slide, imageUrl });
    }

    return NextResponse.json({
      success: true,
      story: {
        title: storyData.title,
        dreamProfession,
        slides: slidesWithImages,
      },
    });

  } catch (error) {
    console.error('FuturePath story generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Story generation failed' 
    }, { status: 500 });
  }
}
