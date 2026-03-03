/**
 * NutrifAI Growth Analysis API Route
 * 
 * Uses Alibaba Cloud Model Studio (DashScope) - Qwen for analysis
 * Using OpenAI-compatible API format with international endpoint
 */

import { NextResponse } from 'next/server';

// Strip quotes if present
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY?.replace(/^["']|["']$/g, '');

// Use OpenAI-compatible endpoint (works internationally)
const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';

// Language-specific system prompts (global audience)
const systemPrompts = {
  en: `You are a nutritional advisor for children worldwide. Provide helpful, accurate growth analysis based on WHO standards.
       Always include a disclaimer that this is informational guidance only.
       Give practical recommendations that are universally applicable.
       IMPORTANT: Respond ONLY with valid JSON, no additional text.`,
  id: `Anda adalah penasihat nutrisi untuk anak-anak di seluruh dunia. Berikan analisis pertumbuhan yang membantu dan akurat berdasarkan standar WHO.
       Selalu sertakan disclaimer bahwa ini hanya panduan informasi.
       Berikan rekomendasi praktis yang berlaku secara universal.
       PENTING: Jawab HANYA dengan JSON yang valid, tanpa teks tambahan.`,
  zh: `您是全球儿童营养顾问。根据世卫组织标准提供有帮助且准确的生长分析。
       始终包括免责声明，说明这仅供参考。
       提供适用于全球的实用建议。
       重要：仅以有效的JSON格式回复，不要添加额外文字。`,
};

async function analyzeWithQwen(birthWeight: number, currentAge: number, currentHeight: number, currentWeight: number, gender: string, locale: string) {
  const systemPrompt = systemPrompts[locale as keyof typeof systemPrompts] || systemPrompts.en;
  
  const langInstruction = locale === 'id' ? 'Indonesian' : locale === 'zh' ? 'Chinese' : 'English';
  
  const userPrompt = `Analyze child growth data:
    - Birth weight: ${birthWeight} kg
    - Current age: ${currentAge} months
    - Current height: ${currentHeight} cm
    - Current weight: ${currentWeight} kg
    - Gender: ${gender}
    
    Return a JSON object with:
    {
      "category": "one of: Normal, Underweight, Overweight, or Stunting Risk",
      "insights": ["array of 3 growth insights"],
      "projection": ["array of 3 three-month projections"],
      "recommendations": ["array of 5 practical recommendations"]
    }
    
    Base analysis on WHO growth standards for ${gender} children.
    Write all text in ${langInstruction}.`;

  console.log('Calling Qwen API for NutrifAI analysis...');
  
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
    throw new Error(`Qwen API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Qwen API response received');
  
  const content = data.choices?.[0]?.message?.content || '';
  
  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Failed to parse JSON from:', content);
    throw new Error('Failed to parse analysis JSON from response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { birthWeight, currentAge, currentHeight, currentWeight, gender, locale = 'en' } = body;

    // Validate request
    if (!birthWeight || !currentAge || !currentHeight || !currentWeight || !gender) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!DASHSCOPE_API_KEY) {
      // Fallback to simple calculation if no API key
      console.log('No API key, using fallback calculation');
      
      const heightM = currentHeight / 100;
      const bmi = currentWeight / (heightM * heightM);
      
      let category = 'Normal';
      if (bmi < 14) category = 'Underweight';
      else if (bmi > 18) category = 'Overweight';
      
      const expectedHeight = gender === 'male' ? 50 + (currentAge * 2.5) : 49 + (currentAge * 2.4);
      if (currentHeight < expectedHeight * 0.85) category = 'Stunting Risk';

      const results = {
        en: {
          category,
          insights: [
            `Your child's weight-for-age is ${category === 'Normal' ? 'within the normal range' : 'outside the normal range'}.`,
            `Height-for-age indicates ${category === 'Stunting Risk' ? 'potential stunting risk' : 'healthy linear growth'}.`,
            `BMI-for-age (${bmi.toFixed(1)}) suggests ${category === 'Normal' ? 'balanced nutrition' : 'nutritional attention needed'}.`,
          ],
          projection: [
            `Expected height in 3 months: approximately ${(currentHeight + 3).toFixed(0)}-${(currentHeight + 4).toFixed(0)} cm`,
            `Expected weight in 3 months: approximately ${(currentWeight + 0.5).toFixed(1)}-${(currentWeight + 0.8).toFixed(1)} kg`,
            'Continue monitoring growth monthly for best results.',
          ],
          recommendations: [
            'Ensure daily intake of protein-rich foods (eggs, fish, legumes)',
            'Include colorful vegetables and fruits for micronutrients',
            'Maintain regular meal schedule with 3 main meals and 2 snacks',
            'Ensure adequate calcium intake for bone growth (milk, yogurt)',
            'Encourage at least 60 minutes of active play daily',
          ],
        },
        id: {
          category,
          insights: [
            `Berat badan anak Anda untuk usia ${category === 'Normal' ? 'dalam rentang normal' : 'di luar rentang normal'}.`,
            `Tinggi badan untuk usia menunjukkan ${category === 'Stunting Risk' ? 'potensi risiko stunting' : 'pertumbuhan linear yang sehat'}.`,
            `BMI untuk usia (${bmi.toFixed(1)}) menunjukkan ${category === 'Normal' ? 'nutrisi seimbang' : 'perlu perhatian nutrisi'}.`,
          ],
          projection: [
            `Perkiraan tinggi dalam 3 bulan: sekitar ${(currentHeight + 3).toFixed(0)}-${(currentHeight + 4).toFixed(0)} cm`,
            `Perkiraan berat dalam 3 bulan: sekitar ${(currentWeight + 0.5).toFixed(1)}-${(currentWeight + 0.8).toFixed(1)} kg`,
            'Terus pantau pertumbuhan setiap bulan untuk hasil terbaik.',
          ],
          recommendations: [
            'Pastikan asupan harian makanan kaya protein (telur, ikan, kacang-kacangan)',
            'Sertakan sayuran dan buah berwarna-warni untuk mikronutrien',
            'Jaga jadwal makan teratur dengan 3 makanan utama dan 2 camilan',
            'Pastikan asupan kalsium yang cukup untuk pertumbuhan tulang (susu, yogurt)',
            'Dorong minimal 60 menit bermain aktif setiap hari',
          ],
        },
        zh: {
          category,
          insights: [
            `您孩子的体重年龄${category === 'Normal' ? '在正常范围内' : '超出正常范围'}。`,
            `身高年龄指标${category === 'Stunting Risk' ? '有潜在发育迟缓风险' : '线性生长健康'}。`,
            `BMI年龄（${bmi.toFixed(1)}）表明${category === 'Normal' ? '营养均衡' : '需要注意营养'}。`,
          ],
          projection: [
            `预计3个月后身高：约 ${(currentHeight + 3).toFixed(0)}-${(currentHeight + 4).toFixed(0)} 厘米`,
            `预计3个月后体重：约 ${(currentWeight + 0.5).toFixed(1)}-${(currentWeight + 0.8).toFixed(1)} 公斤`,
            '继续每月监测生长以获得最佳效果。',
          ],
          recommendations: [
            '确保每日摄入富含蛋白质的食物（鸡蛋、鱼、豆类）',
            '包括五颜六色的蔬菜和水果以获取微量营养素',
            '保持规律的饮食时间，每天3顿正餐和2顿点心',
            '确保足够的钙摄入以促进骨骼生长（牛奶、酸奶）',
            '鼓励每天至少60分钟的活动游戏',
          ],
        },
      };

      return NextResponse.json({
        success: true,
        result: results[locale as keyof typeof results] || results.en,
      });
    }

    console.log('NutrifAI analysis request:', { birthWeight, currentAge, currentHeight, currentWeight, gender, locale });

    // Use Qwen for analysis
    const result = await analyzeWithQwen(birthWeight, currentAge, currentHeight, currentWeight, gender, locale);

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('NutrifAI analysis error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Analysis failed' 
    }, { status: 500 });
  }
}
