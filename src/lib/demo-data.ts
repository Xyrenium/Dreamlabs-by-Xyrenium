export const demoFairyTale = {
  title: 'The Starlight Garden',
  characterName: 'Princess Luna',
  slides: [
    {
      text: 'Once upon a time, in a kingdom above the clouds, there lived a young princess named Luna. She had eyes that sparkled like the night sky and a heart full of curiosity.',
      imagePrompt: 'A beautiful young princess with sparkling eyes standing on a cloud kingdom, magical night sky, children book illustration style, warm colors',
      imageUrl: '/demo/fairy-tale/slide-1.jpg',
    },
    {
      text: 'Every night, Luna would gaze at the stars from her crystal tower. She noticed that one star shone brighter than all the others, and it seemed to be calling her name.',
      imagePrompt: 'Princess in crystal tower gazing at a bright glowing star, magical night scene, children illustration',
      imageUrl: '/demo/fairy-tale/slide-2.jpg',
    },
    {
      text: 'One magical evening, a beam of starlight created a shimmering path from her tower to a hidden garden floating among the clouds. Luna took a deep breath and stepped onto the starlight bridge.',
      imagePrompt: 'A glowing starlight bridge leading from a tower to a floating garden in the clouds, magical, children illustration',
      imageUrl: '/demo/fairy-tale/slide-3.jpg',
    },
    {
      text: 'The Starlight Garden was the most beautiful place Luna had ever seen. Flowers made of moonbeams swayed gently, and tiny fireflies danced between crystal trees that hummed soft melodies.',
      imagePrompt: 'A magical garden with moonbeam flowers, crystal trees, dancing fireflies, dreamy atmosphere, children book illustration',
      imageUrl: '/demo/fairy-tale/slide-4.jpg',
    },
    {
      text: 'In the heart of the garden, Luna found a small seedling that was struggling to grow. "Don\'t worry, little one," she whispered. "I\'ll help you reach the stars." She watered it with her kindness and sang it a lullaby.',
      imagePrompt: 'Princess kneeling beside a small glowing seedling in magical garden, gentle scene, children illustration, warm lighting',
      imageUrl: '/demo/fairy-tale/slide-5.jpg',
    },
    {
      text: 'As Luna sang, something magical happened. The seedling began to grow, its branches reaching up and up, blooming with flowers of every color. Each flower held a tiny dream inside — dreams of children from all around the world.',
      imagePrompt: 'A magnificent tree growing with colorful glowing flowers, each containing tiny dreams, magical scene, children book illustration',
      imageUrl: '/demo/fairy-tale/slide-6.jpg',
    },
    {
      text: 'From that night on, Princess Luna became the Guardian of Dreams. Every evening, she tends the Starlight Garden, making sure every child\'s dream has a chance to bloom. And if you look up at the sky tonight, that brightest star? That\'s Luna, watching over your dreams too.',
      imagePrompt: 'Princess Luna floating among stars tending to a cosmic garden of dreams, beautiful conclusion scene, children book illustration, warm and hopeful',
      imageUrl: '/demo/fairy-tale/slide-7.jpg',
    },
  ],
};

export const demoFuturePath = {
  childName: 'Adi',
  dreamProfession: 'Astronaut',
  adultImageUrl: '/demo/future-path/adult.jpg',
  slides: [
    {
      text: 'Meet Adi, a curious 7-year-old boy from Jakarta who loves watching the stars every night. His room is filled with drawings of rockets and planets.',
      imageUrl: '/demo/future-path/slide-1.jpg',
    },
    {
      text: 'In school, Adi works extra hard in science and math. His teacher says he asks the most questions in class — especially about space and the universe.',
      imageUrl: '/demo/future-path/slide-2.jpg',
    },
    {
      text: 'As a teenager, Adi joins the national science olympiad and wins a gold medal. His project about satellite communication earns him a scholarship to study aerospace engineering.',
      imageUrl: '/demo/future-path/slide-3.jpg',
    },
    {
      text: 'At university, Adi trains tirelessly — both his mind and body. He learns to fly jets, studies orbital mechanics, and never loses sight of his dream among the stars.',
      imageUrl: '/demo/future-path/slide-4.jpg',
    },
    {
      text: 'After years of dedication, the day finally arrives. Commander Adi boards the spacecraft as Indonesia\'s first astronaut. The whole nation watches with pride as the countdown begins.',
      imageUrl: '/demo/future-path/slide-5.jpg',
    },
    {
      text: 'Floating above Earth, Adi looks down at the beautiful blue planet — and somewhere below, a young boy in Jakarta is looking up at the same stars, dreaming the very same dream. Every great journey begins with a single dream.',
      imageUrl: '/demo/future-path/slide-6.jpg',
    },
  ],
};

export const demoNutrifai = {
  input: {
    birthWeight: 3.2,
    currentAge: 24,
    currentHeight: 84,
    currentWeight: 11.5,
    gender: 'male' as const,
  },
  result: {
    category: 'Normal',
    categoryColor: 'green',
    insights: [
      'Your child\'s weight-for-age is within the normal range (between -2 SD and +2 SD on WHO growth charts).',
      'Height-for-age is also within normal range, indicating healthy linear growth.',
      'BMI-for-age falls within the healthy range, suggesting balanced nutrition.',
    ],
    projection: [
      'Expected height in 3 months: approximately 86-87 cm',
      'Expected weight in 3 months: approximately 12.0-12.3 kg',
      'Continue maintaining the current balanced diet and activity level.',
    ],
    recommendations: [
      'Ensure daily intake of protein-rich foods (eggs, fish, tofu, tempeh)',
      'Include colorful vegetables and fruits for micronutrients',
      'Maintain regular meal schedule with 3 main meals and 2 snacks',
      'Ensure adequate calcium intake for bone growth (milk, yogurt, cheese)',
      'Keep up with regular physical activity — at least 60 minutes of active play daily',
    ],
  },
  mealPlan: {
    breakfast: {
      name: 'Nasi Tim Ayam Sayur',
      description: 'Steamed rice with shredded chicken, carrots, and spinach',
      nutrition: 'Protein: 12g | Carbs: 30g | Fat: 5g | Fiber: 3g',
      steps: [
        'Cook rice until soft and fluffy',
        'Boil chicken breast and shred finely',
        'Steam diced carrots and spinach until tender',
        'Mix all ingredients together, add a pinch of salt',
        'Serve warm with a side of fruit',
      ],
    },
    lunch: {
      name: 'Sup Ikan Tahu',
      description: 'Fish and tofu soup with vegetables',
      nutrition: 'Protein: 15g | Carbs: 20g | Fat: 6g | Fiber: 4g',
      steps: [
        'Prepare fish fillet (tilapia or snapper), cut into small pieces',
        'Dice tofu into cubes',
        'Boil water with garlic and ginger',
        'Add fish, tofu, chopped bok choy, and corn',
        'Season lightly and cook until fish is done',
      ],
    },
    dinner: {
      name: 'Bubur Ayam Tempe',
      description: 'Chicken and tempeh porridge with green vegetables',
      nutrition: 'Protein: 14g | Carbs: 35g | Fat: 7g | Fiber: 3g',
      steps: [
        'Cook rice porridge until creamy',
        'Dice tempeh and pan-fry until golden',
        'Shred boiled chicken',
        'Steam broccoli florets until tender',
        'Top porridge with chicken, tempeh, and broccoli. Add a drizzle of sesame oil.',
      ],
    },
    snack: {
      name: 'Pisang Oat Pancake',
      description: 'Banana oat pancakes — naturally sweet and nutritious',
      nutrition: 'Protein: 5g | Carbs: 25g | Fat: 3g | Fiber: 3g',
      steps: [
        'Mash one ripe banana',
        'Mix with 3 tablespoons of oats and 1 egg',
        'Cook small pancakes on a non-stick pan',
        'Serve with a drizzle of honey or fresh fruit slices',
      ],
    },
  },
};

export const tokenPackages = [
  { id: 'starter', tokens: 50, priceIDR: 5000, priceUSD: 0.50, label: 'Starter' },
  { id: 'popular', tokens: 200, priceIDR: 18000, priceUSD: 1.80, label: 'Explorer', popular: true },
  { id: 'family', tokens: 500, priceIDR: 40000, priceUSD: 4.00, label: 'Family' },
  { id: 'premium', tokens: 1500, priceIDR: 100000, priceUSD: 10.00, label: 'Premium' },
];
