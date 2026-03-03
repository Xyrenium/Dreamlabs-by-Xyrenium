/**
 * NutrifAI Meal Plan Generation API Route
 * 
 * Uses Alibaba Cloud Model Studio (DashScope) - Qwen for meal plan generation
 * Includes age-appropriate food safety guidelines
 */

import { NextResponse } from 'next/server';

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY?.replace(/^["']|["']$/g, '');
const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';

const systemPrompts = {
  en: `You are a certified pediatric nutritionist creating safe, age-appropriate meal plans for children.
       You must strictly follow food safety guidelines based on the child's age.
       Create practical, affordable meals using commonly available ingredients.
       NEVER recommend foods that are unsafe for the child's age group.
       Respond ONLY with valid JSON.`,
  id: `Anda adalah ahli gizi anak bersertifikat yang membuat rencana makan yang aman dan sesuai usia untuk anak-anak.
       Anda harus secara ketat mengikuti pedoman keamanan makanan berdasarkan usia anak.
       Buat makanan praktis dan terjangkau menggunakan bahan-bahan yang mudah didapat.
       JANGAN PERNAH merekomendasikan makanan yang tidak aman untuk kelompok usia anak.
       Jawab HANYA dengan JSON yang valid.`,
  zh: `您是一位认证的儿童营养师，为儿童制定安全、适龄的膳食计划。
       您必须严格遵循基于儿童年龄的食品安全指南。
       使用常见食材制作实用、经济实惠的餐点。
       绝对不要推荐对该年龄段儿童不安全的食物。
       仅以有效的JSON格式回复。`,
};

function getAgeSafetyGuidelines(ageMonths: number): string {
  if (ageMonths < 6) {
    return `CRITICAL SAFETY - Under 6 months:
- ONLY breast milk or formula. No solid foods whatsoever.
- No water, juice, or any other liquids besides milk/formula.
- Create a feeding schedule with breast milk/formula only.`;
  }

  if (ageMonths < 12) {
    return `CRITICAL SAFETY - 6-12 months:
- Soft, pureed, or mashed foods ONLY. No chunks that could cause choking.
- NO honey (risk of botulism), NO whole nuts, NO whole grapes, NO popcorn.
- NO cow's milk as main drink (breast milk or formula only).
- NO added salt, sugar, or artificial sweeteners.
- NO spicy foods, chili, pepper, or hot sauces.
- NO acidic condiments like vinegar, lime juice, or soy sauce.
- NO raw or undercooked eggs, meat, or fish.
- NO caffeinated drinks or chocolate.
- Suitable foods: pureed vegetables, fruits, rice cereal, mashed banana, soft cooked carrots.
- All food must be very soft and easily dissolvable in the mouth.`;
  }

  if (ageMonths < 24) {
    return `CRITICAL SAFETY - 12-24 months:
- Small, bite-sized pieces only. Cut food into small pieces to prevent choking.
- NO whole nuts, whole grapes, hard candies, or popcorn (choking hazard).
- NO spicy foods, chili, hot sauce, or excessive pepper.
- NO vinegar-based sauces or condiments (too acidic for young stomachs).
- NO pempek with cuka/vinegar, NO sambal, NO foods with strong sour/spicy condiments.
- NO raw or undercooked eggs, meat, or fish.
- NO added salt in excess, minimal sugar.
- NO caffeinated drinks, soda, or excessive fruit juice.
- Suitable foods: soft rice, steamed vegetables, minced meat, tofu, eggs (well-cooked), banana, soft fruits.
- All foods should be tender, moist, and easy to chew with few teeth.`;
  }

  if (ageMonths < 36) {
    return `SAFETY - 2-3 years:
- Cut all foods into small pieces. Avoid hard, round, or sticky foods that could cause choking.
- NO whole nuts (use nut butter thinly spread instead), NO whole grapes (cut in quarters), NO popcorn.
- AVOID spicy foods, chili, sambal, hot sauces - children's stomachs are still sensitive.
- AVOID vinegar-heavy dishes, overly sour or acidic condiments.
- AVOID pempek with cuka/vinegar sauce, heavily seasoned foods.
- NO raw fish (sushi/sashimi), NO undercooked meat or eggs.
- Limit salt and sugar. No caffeinated drinks.
- Suitable foods: rice, noodles (cut short), well-cooked meat/fish, vegetables, fruits, dairy.
- Foods should be soft enough to chew easily but can have more texture than toddler foods.`;
  }

  if (ageMonths < 60) {
    return `SAFETY - 3-5 years:
- Still cut round foods (grapes, cherry tomatoes, hot dogs) into small pieces.
- AVOID very spicy foods, strong chili, excessive sambal.
- AVOID heavily acidic or vinegar-based condiments for main dishes.
- NO raw fish or undercooked meat.
- Limit sugary snacks and drinks. No caffeinated beverages.
- Suitable foods: varied diet with age-appropriate portions, well-cooked proteins, vegetables, fruits, whole grains.
- Can introduce more varied flavors but keep spice levels mild.`;
  }

  return `SAFETY - School-age children (5+ years):
- Can eat most foods but still avoid excessive spice, raw fish/meat for younger school-age children.
- Encourage balanced meals with vegetables, protein, and whole grains.
- Limit processed foods, excessive sugar, and caffeinated drinks.
- Portions should be age-appropriate (smaller than adult portions).`;
}

function getNutritionalGuidance(category: string, ageMonths: number): string {
  const ageYears = ageMonths / 12;
  let guidance = '';

  if (category.toLowerCase().includes('underweight') || category.toLowerCase().includes('kurang') || category.toLowerCase().includes('wasting')) {
    guidance = `This child is UNDERWEIGHT. Focus on:
- Calorie-dense, nutrient-rich foods to promote weight gain.
- Extra protein sources (eggs, fish, chicken, tofu, tempeh, beans).
- Healthy fats (avocado, coconut milk in cooking, olive oil).
- Frequent small meals (5-6 times per day).
- Avoid filling up on water or low-calorie foods before meals.`;
  } else if (category.toLowerCase().includes('overweight') || category.toLowerCase().includes('obese') || category.toLowerCase().includes('lebih')) {
    guidance = `This child is OVERWEIGHT. Focus on:
- Balanced portions, not restrictive dieting (children need nutrition to grow).
- More vegetables, lean proteins, and fiber.
- Reduce sugary drinks, fried foods, and processed snacks.
- Encourage physical activity alongside proper nutrition.`;
  } else if (category.toLowerCase().includes('stunting') || category.toLowerCase().includes('pendek')) {
    guidance = `This child shows signs of STUNTING. Focus on:
- Protein-rich foods for growth (eggs, fish, dairy, legumes).
- Calcium and vitamin D for bone growth (milk, yogurt, fortified foods).
- Iron-rich foods (lean meat, spinach, beans) with vitamin C for absorption.
- Zinc-rich foods (meat, seeds, nuts if age-appropriate).`;
  } else {
    guidance = `This child has NORMAL nutritional status. Focus on:
- Maintaining a balanced, varied diet.
- Adequate protein, carbohydrates, healthy fats, vitamins, and minerals.
- Regular meal schedule with healthy snacks.`;
  }

  return guidance;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, age, gender, locale = 'en' } = body;

    const langInstruction = locale === 'id' ? 'Indonesian' : locale === 'zh' ? 'Chinese' : 'English';
    const systemPrompt = systemPrompts[locale as keyof typeof systemPrompts] || systemPrompts.en;

    if (!DASHSCOPE_API_KEY) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    const ageMonths = parseInt(age, 10);
    const safetyGuidelines = getAgeSafetyGuidelines(ageMonths);
    const nutritionalGuidance = getNutritionalGuidance(category, ageMonths);

    console.log('NutrifAI meal plan request:', { category, age, gender, locale });

    const userPrompt = `Create a safe, age-appropriate daily meal plan for a ${ageMonths}-month-old ${gender} child with nutritional status: ${category}.

=== MANDATORY FOOD SAFETY RULES (MUST FOLLOW) ===
${safetyGuidelines}

=== NUTRITIONAL GUIDANCE ===
${nutritionalGuidance}

=== IMPORTANT RULES ===
- NEVER include foods that violate the safety guidelines above.
- NEVER recommend pempek, foods with vinegar/cuka sauce, sambal, or spicy condiments for children under 5 years.
- NEVER recommend raw or undercooked foods for any child.
- All recommended foods MUST be safe, gentle on the stomach, and appropriate for a ${ageMonths}-month-old child.
- Textures must match the child's developmental stage.
- If the child is under 6 months, ONLY recommend breast milk or formula feeding schedules.

Return a JSON object with exactly this structure:
{
  "breakfast": {"name": "dish name", "description": "brief description with ingredients", "nutrition": "calories, protein, carbs summary", "steps": ["step1", "step2", "step3", "step4"]},
  "lunch": {"name": "dish name", "description": "brief description with ingredients", "nutrition": "calories, protein, carbs summary", "steps": ["step1", "step2", "step3", "step4"]},
  "dinner": {"name": "dish name", "description": "brief description with ingredients", "nutrition": "calories, protein, carbs summary", "steps": ["step1", "step2", "step3", "step4"]},
  "snack": {"name": "dish name", "description": "brief description with ingredients", "nutrition": "calories, protein, carbs summary", "steps": ["step1", "step2", "step3", "step4"]}
}

Write all text in ${langInstruction}.`;

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
      throw new Error('Failed to parse meal plan JSON');
    }

    const mealPlan = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      mealPlan,
    });

  } catch (error) {
    console.error('Meal plan generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate meal plan' 
    }, { status: 500 });
  }
}
