/**
 * Fairy Tale Generation API Route
 * 
 * Uses Alibaba Cloud Model Studio (DashScope) - Qwen for text, Wan for images
 * Generates consistent characters across slides via character sheet system
 */

import { NextResponse } from 'next/server';

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY?.replace(/^["']|["']$/g, '');

const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
const IMAGE_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/image-generation/generation';
const TASK_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/tasks';

const systemPrompts: Record<string, string> = {
  en: `You are a creative children's story writer. Create engaging, age-appropriate fairy tales with vivid imagery.
Each slide should have 2-3 sentences of narration suitable for children aged 3-10.
The story should be positive, inspiring, and have a moral lesson.
IMPORTANT: You MUST also define a detailed character sheet for visual consistency.
Respond ONLY with valid JSON, no additional text.`,

  id: `Anda adalah penulis cerita anak yang kreatif. Buat dongeng yang menarik dan sesuai usia dengan imajinasi yang hidup.
Setiap slide harus memiliki 2-3 kalimat narasi yang cocok untuk anak usia 3-10 tahun.
Cerita harus positif, menginspirasi, dan memiliki pesan moral.
PENTING: Anda juga HARUS mendefinisikan lembar karakter yang detail untuk konsistensi visual.
Jawab HANYA dengan JSON yang valid, tanpa teks tambahan.`,

  zh: `你是一位富有创造力的儿童故事作家。创作引人入胜、适合年龄的童话故事，配有生动的图像。
每张幻灯片都应该有2-3句适合3-10岁儿童的叙述。
故事应该是积极的、鼓舞人心的，并有道德教训。
重要：你还必须定义详细的角色表以保持视觉一致性。
仅以有效的JSON格式回复，不要添加额外文字。`,
};

function buildUserPrompt(storyIdea: string, slideCount: number, locale: string): string {
  const jsonFormat = `{
  "title": "story title",
  "characters": [
    {
      "name": "character name",
      "role": "main/companion/villain",
      "visual": "DETAILED visual description: gender, age, hair color+style, eye color, skin tone, outfit colors+details, accessories, distinguishing features"
    }
  ],
  "slides": [
    {
      "text": "narration text for this slide (2-3 sentences, storytelling only, NO character appearance details)",
      "sceneDescription": "what is happening in this scene, the setting, actions, emotions, lighting, weather"
    }
  ]
}`;

  if (locale === 'id') {
    return `Buat dongeng ${slideCount} slide berdasarkan ide: "${storyIdea}"

ATURAN PENTING:
1. Definisikan SEMUA karakter di array "characters" dengan deskripsi visual yang SANGAT detail (warna rambut, gaya rambut, warna mata, warna kulit, warna pakaian, aksesoris)
2. "text" di slides HANYA berisi narasi cerita - JANGAN masukkan deskripsi penampilan karakter
3. "sceneDescription" menjelaskan apa yang terjadi di adegan (aksi, setting, suasana)
4. Semua "text" narasi harus dalam Bahasa Indonesia
5. Semua "sceneDescription" harus dalam Bahasa Inggris (untuk prompt gambar)

Format JSON:
${jsonFormat}

Cerita harus memiliki awal, tengah, dan akhir yang jelas.`;
  }
  
  if (locale === 'zh') {
    return `根据以下想法创建${slideCount}张幻灯片的童话故事："${storyIdea}"

重要规则：
1. 在"characters"数组中定义所有角色，提供非常详细的视觉描述（头发颜色、发型、眼睛颜色、肤色、服装颜色、配饰）
2. slides中的"text"只包含故事叙述 - 不要包含角色外貌描述
3. "sceneDescription"描述场景中发生的事情（动作、设置、气氛）
4. 所有"text"叙述必须使用中文
5. 所有"sceneDescription"必须使用英语（用于图像提示）

JSON格式：
${jsonFormat}

故事应该有清晰的开头、中间和结尾。`;
  }

  return `Create a ${slideCount}-slide fairy tale based on this idea: "${storyIdea}"

IMPORTANT RULES:
1. Define ALL characters in the "characters" array with VERY detailed visual descriptions (hair color+style, eye color, skin tone, outfit colors+details, accessories)
2. "text" in slides should ONLY contain story narration - DO NOT include character appearance details
3. "sceneDescription" describes what is happening in the scene (actions, setting, mood)
4. All "text" narration must be in English
5. All "sceneDescription" must be in English (for image prompts)

JSON format:
${jsonFormat}

The story should have a clear beginning, middle, and end.`;
}

function buildImagePrompt(characters: Array<{name: string; role: string; visual: string}>, sceneDescription: string): string {
  // Build character definitions string
  const charDefs = characters
    .map(c => `${c.name}: ${c.visual}`)
    .join('. ');
  
  return `Fairy tale comic illustration style, children's book art, warm magical atmosphere, whimsical cartoon style. Characters: ${charDefs}. Scene: ${sceneDescription}`;
}

async function generateStoryText(storyIdea: string, slideCount: number, locale: string) {
  const systemPrompt = systemPrompts[locale] || systemPrompts.en;
  const userPrompt = buildUserPrompt(storyIdea, slideCount, locale);

  console.log('Calling Qwen API for story with character sheet...');
  
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
    console.error('Qwen API error response:', errorText);
    throw new Error(`Qwen API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Qwen API response:', JSON.stringify(data).substring(0, 300));
  
  const content = data.choices?.[0]?.message?.content || '';
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Failed to parse JSON from:', content);
    throw new Error('Failed to parse story JSON from response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  // Validate structure
  if (!parsed.characters || !Array.isArray(parsed.characters) || parsed.characters.length === 0) {
    console.warn('No characters defined, adding fallback');
    parsed.characters = [{
      name: 'Main Character',
      role: 'main',
      visual: 'young child with brown hair, bright eyes, wearing colorful clothing'
    }];
  }
  
  if (!parsed.slides || !Array.isArray(parsed.slides)) {
    throw new Error('Invalid story structure: missing slides');
  }
  
  return parsed;
}

async function generateImage(prompt: string): Promise<string | null> {
  try {
    console.log('Generating image with prompt:', prompt.substring(0, 100) + '...');
    
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
                { text: prompt }
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

    if (!response.ok) {
      const errText = await response.text();
      console.error('Image API error:', errText);
      return null;
    }

    const data = await response.json();
    console.log('Image API response:', JSON.stringify(data).substring(0, 200));
    
    const taskId = data.output?.task_id;
    if (!taskId) {
      console.error('No task ID in response');
      return null;
    }

    // Poll for result
    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`${TASK_API_URL}/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        console.log('Status check failed, retrying...');
        continue;
      }

      const statusData = await statusResponse.json();
      console.log('Task status:', statusData.output?.task_status);
      
      if (statusData.output?.task_status === 'SUCCEEDED') {
        const imageUrl = statusData.output?.choices?.[0]?.message?.content?.[0]?.image;
        console.log('Image generated:', imageUrl?.substring(0, 80));
        return imageUrl || null;
      }
      if (statusData.output?.task_status === 'FAILED') {
        console.error('Image generation failed:', statusData);
        return null;
      }
    }

    console.error('Image generation timeout');
    return null;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyIdea, slideCount, locale = 'en' } = body;

    if (!storyIdea || !slideCount) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!DASHSCOPE_API_KEY) {
      console.error('DASHSCOPE_API_KEY not configured');
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    console.log('Generating fairy tale:', { storyIdea, slideCount, locale });

    // Generate story text with character sheet
    const storyData = await generateStoryText(storyIdea, slideCount, locale);
    const characters = storyData.characters;

    console.log('Characters defined:', characters.map((c: {name: string}) => c.name).join(', '));

    // Generate images for each slide with consistent character descriptions
    const slidesWithImages = [];
    for (let i = 0; i < storyData.slides.length; i++) {
      const slide = storyData.slides[i];
      console.log(`Generating image ${i + 1}/${storyData.slides.length}...`);
      
      // Build image prompt with character definitions + scene description
      const sceneDesc = slide.sceneDescription || slide.imagePrompt || slide.text;
      const fullImagePrompt = buildImagePrompt(characters, sceneDesc);
      
      const imageUrl = await generateImage(fullImagePrompt);
      slidesWithImages.push({
        text: slide.text,
        imageUrl,
      });
    }

    return NextResponse.json({
      success: true,
      story: {
        title: storyData.title,
        slides: slidesWithImages,
        characters: characters.map((c: {name: string; role: string; visual: string}) => ({
          name: c.name,
          role: c.role,
          visual: c.visual,
        })),
      },
    });

  } catch (error) {
    console.error('Fairy tale generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Story generation failed' 
    }, { status: 500 });
  }
}
