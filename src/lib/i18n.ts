export type Locale = 'id' | 'en' | 'zh';

export interface Translations {
  nav: {
    home: string;
    fairyTale: string;
    futurePath: string;
    nutrifai: string;
    tokens: string;
  };
  hero: {
    tagline: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    cta: string;
    ctaSecondary: string;
  };
  features: {
    title: string;
    subtitle: string;
    fairyTale: {
      title: string;
      description: string;
      cta: string;
    };
    futurePath: {
      title: string;
      description: string;
      cta: string;
    };
    nutrifai: {
      title: string;
      description: string;
      cta: string;
    };
  };
  fairyTale: {
    title: string;
    subtitle: string;
    characterName: string;
    characterNamePlaceholder: string;
    storyIdea: string;
    storyIdeaPlaceholder: string;
    tone: string;
    tones: { funny: string; emotional: string; adventurous: string };
    slides: string;
    estimatedTokens: string;
    generate: string;
    generating: string;
    confirmTokens: string;
    export: string;
    slideOf: string;
    narrator: string;
    narratorLoading: string;
    animateImages: string;
    animateDesc: string;
    animating: string;
    exportingVideo: string;
    fullscreen: string;
    exitFullscreen: string;
    animateTokenCost: string;
    generatingNarration: string;
  };
  futurePath: {
    title: string;
    subtitle: string;
    uploadPhoto: string;
    childName: string;
    childNamePlaceholder: string;
    dreamProfession: string;
    dreamProfessionPlaceholder: string;
    personality: string;
    personalityPlaceholder: string;
    generate: string;
    generating: string;
    estimatedTokens: string;
    result: string;
    export: string;
  };
  nutrifai: {
    title: string;
    subtitle: string;
    disclaimer: string;
    birthWeight: string;
    currentAge: string;
    currentHeight: string;
    currentWeight: string;
    gender: string;
    male: string;
    female: string;
    analyze: string;
    analyzing: string;
    result: string;
    category: string;
    insights: string;
    projection: string;
    recommendations: string;
    mealPlan: string;
    generateMealPlan: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
    estimatedTokens: string;
  };
  tokens: {
    title: string;
    subtitle: string;
    balance: string;
    history: string;
    buyTokens: string;
    packages: string;
    perToken: string;
    popular: string;
    payment: string;
    noHistory: string;
    selectCurrency: string;
    processingPayment: string;
    paymentSuccess: string;
    paymentFailed: string;
    tokenAmount: string;
    minTokens: string;
    totalPrice: string;
    redirecting: string;
    paymentCancelled: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    login: string;
    register: string;
    loggingIn: string;
    creating: string;
    createAccount: string;
    noAccount: string;
    hasAccount: string;
    bonusTitle: string;
    bonusText: string;
    loginRequired: string;
    loginToAccess: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    back: string;
    next: string;
    save: string;
    close: string;
    tokens: string;
  };
  footer: {
    tagline: string;
    rights: string;
    madeWith: string;
  };
}

const translations: Record<Locale, Translations> = {
  en: {
    nav: {
      home: 'Home',
      fairyTale: 'Fairy Tale',
      futurePath: 'FuturePath',
      nutrifai: 'NutrifAI',
      tokens: 'Tokens',
    },
    hero: {
      tagline: 'AI-Powered Dreams for Every Child',
      title: 'Every Child Has a Dream.',
      titleHighlight: "Let's Grow It Together.",
      subtitle: 'Create magical fairy tales, visualize future dreams, and nurture healthy growth — all powered by AI, designed for families worldwide.',
      cta: 'Start Dreaming',
      ctaSecondary: 'Learn More',
    },
    features: {
      title: 'Magical Features',
      subtitle: 'Three powerful AI tools designed to inspire, motivate, and nurture your child.',
      fairyTale: {
        title: 'Fairy Tale Generator',
        description: 'Create custom illustrated fairy tales with narration, animation, and beautiful visuals. Export as video to share with your family.',
        cta: 'Create a Story',
      },
      futurePath: {
        title: 'FuturePath AI',
        description: "Help your child visualize their dreams. Upload a photo, choose a dream profession, and watch AI create their future self.",
        cta: 'Explore Futures',
      },
      nutrifai: {
        title: 'NutrifAI',
        description: "Track your child's growth, get nutritional insights, and receive personalized meal plans to support healthy development.",
        cta: 'Check Growth',
      },
    },
    fairyTale: {
      title: 'Fairy Tale Generator',
      subtitle: 'Create a magical story for your little one',
      characterName: 'Character Name',
      characterNamePlaceholder: 'e.g., Princess Luna',
      storyIdea: 'Story Idea',
      storyIdeaPlaceholder: 'e.g., A brave princess who discovers a magical garden...',
      tone: 'Story Tone',
      tones: { funny: 'Funny', emotional: 'Emotional', adventurous: 'Adventurous' },
      slides: 'Number of Slides',
      estimatedTokens: 'Estimated Cost',
      generate: 'Generate Story',
      generating: 'Creating your magical story...',
      confirmTokens: 'This will use {tokens} tokens. Continue?',
      export: 'Export as Video',
      slideOf: 'Slide {current} of {total}',
      narrator: 'AI Narrator',
      narratorLoading: 'Loading narrator...',
      animateImages: 'Animate Images',
      animateDesc: '30 tokens per image',
      animating: 'Animating images...',
      exportingVideo: 'Exporting video...',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit Fullscreen',
      animateTokenCost: 'Animation will use {tokens} tokens. Continue?',
      generatingNarration: 'Generating narration...',
    },
    futurePath: {
      title: 'FuturePath AI',
      subtitle: "Visualize your child's dream future",
      uploadPhoto: 'Upload Child Photo',
      childName: 'Child Name',
      childNamePlaceholder: "Enter your child's name",
      dreamProfession: 'Dream Profession',
      dreamProfessionPlaceholder: 'e.g., Astronaut, Doctor, Artist',
      personality: 'Personality (Optional)',
      personalityPlaceholder: 'e.g., Creative, curious, loves animals',
      generate: 'Generate Future Vision',
      generating: 'Creating future vision...',
      estimatedTokens: 'Estimated Cost',
      result: 'Future Vision',
      export: 'Export as Video',
    },
    nutrifai: {
      title: 'NutrifAI',
      subtitle: 'Growth & Nutrition Assistant',
      disclaimer: 'This AI provides informational guidance only and does not replace professional medical advice.',
      birthWeight: 'Birth Weight (kg)',
      currentAge: 'Current Age (months)',
      currentHeight: 'Current Height (cm)',
      currentWeight: 'Current Weight (kg)',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      analyze: 'Analyze Growth',
      analyzing: 'Analyzing growth data...',
      result: 'Analysis Result',
      category: 'Nutritional Category',
      insights: 'Growth Insights',
      projection: '3-Month Projection',
      recommendations: 'Recommendations',
      mealPlan: 'Daily Meal Plan',
      generateMealPlan: 'Generate Meal Plan',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
      estimatedTokens: 'Estimated Cost',
    },
    tokens: {
      title: 'Token Balance',
      subtitle: 'Purchase tokens to unlock AI-powered features',
      balance: 'Current Balance',
      history: 'Transaction History',
      buyTokens: 'Buy Tokens',
      packages: 'Token Packages',
      perToken: 'per token',
      popular: 'Most Popular',
      payment: 'Payment',
      noHistory: 'No transactions yet',
      selectCurrency: 'Select Currency',
      processingPayment: 'Processing payment...',
      paymentSuccess: 'Payment successful! Tokens added.',
      paymentFailed: 'Payment failed. Please try again.',
      tokenAmount: 'Token Amount',
      minTokens: 'Minimum 100 tokens',
      totalPrice: 'Total Price',
      redirecting: 'Redirecting to payment...',
      paymentCancelled: 'Payment was cancelled.',
    },
    auth: {
      loginTitle: 'Welcome Back',
      loginSubtitle: 'Sign in to continue your journey',
      registerTitle: 'Create Account',
      registerSubtitle: 'Start your magical journey today',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Full Name',
      login: 'Sign In',
      register: 'Register',
      loggingIn: 'Signing in...',
      creating: 'Creating account...',
      createAccount: 'Create Account',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      bonusTitle: 'Welcome Bonus!',
      bonusText: 'Get 300 free tokens when you register',
      loginRequired: 'Login Required',
      loginToAccess: 'Please login to access this feature',
    },
    common: {
      loading: 'Loading...',
      error: 'Something went wrong',
      success: 'Success!',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      save: 'Save',
      close: 'Close',
      tokens: 'tokens',
    },
    footer: {
      tagline: 'Empowering every child\'s dream through AI',
      rights: 'All rights reserved.',
      madeWith: 'Made with love for families everywhere',
    },
  },
  id: {
    nav: {
      home: 'Beranda',
      fairyTale: 'Dongeng',
      futurePath: 'FuturePath',
      nutrifai: 'NutrifAI',
      tokens: 'Token',
    },
    hero: {
      tagline: 'Mimpi Bertenaga AI untuk Setiap Anak',
      title: 'Setiap Anak Punya Mimpi.',
      titleHighlight: 'Mari Kita Wujudkan Bersama.',
      subtitle: 'Ciptakan dongeng ajaib, visualisasikan mimpi masa depan, dan dukung pertumbuhan sehat — semua didukung AI, dirancang untuk keluarga di seluruh dunia.',
      cta: 'Mulai Bermimpi',
      ctaSecondary: 'Pelajari Lebih',
    },
    features: {
      title: 'Fitur Ajaib',
      subtitle: 'Tiga alat AI canggih yang dirancang untuk menginspirasi, memotivasi, dan memelihara anak Anda.',
      fairyTale: {
        title: 'Generator Dongeng',
        description: 'Buat dongeng bergambar dengan narasi, animasi, dan visual yang indah. Ekspor sebagai video untuk dibagikan dengan keluarga.',
        cta: 'Buat Cerita',
      },
      futurePath: {
        title: 'FuturePath AI',
        description: 'Bantu anak Anda memvisualisasikan mimpi mereka. Unggah foto, pilih profesi impian, dan lihat AI menciptakan diri masa depan mereka.',
        cta: 'Jelajahi Masa Depan',
      },
      nutrifai: {
        title: 'NutrifAI',
        description: 'Pantau pertumbuhan anak, dapatkan wawasan nutrisi, dan terima rencana makan yang dipersonalisasi untuk mendukung perkembangan sehat.',
        cta: 'Cek Pertumbuhan',
      },
    },
    fairyTale: {
      title: 'Generator Dongeng',
      subtitle: 'Ciptakan cerita ajaib untuk si kecil',
      characterName: 'Nama Karakter',
      characterNamePlaceholder: 'contoh: Putri Luna',
      storyIdea: 'Ide Cerita',
      storyIdeaPlaceholder: 'contoh: Seorang putri pemberani yang menemukan taman ajaib...',
      tone: 'Nada Cerita',
      tones: { funny: 'Lucu', emotional: 'Emosional', adventurous: 'Petualangan' },
      slides: 'Jumlah Slide',
      estimatedTokens: 'Estimasi Biaya',
      generate: 'Buat Cerita',
      generating: 'Membuat cerita ajaib Anda...',
      confirmTokens: 'Ini akan menggunakan {tokens} token. Lanjutkan?',
      export: 'Ekspor sebagai Video',
      slideOf: 'Slide {current} dari {total}',
      narrator: 'Narator AI',
      narratorLoading: 'Memuat narator...',
      animateImages: 'Animasikan Gambar',
      animateDesc: '30 token per gambar',
      animating: 'Menganimasikan gambar...',
      exportingVideo: 'Mengekspor video...',
      fullscreen: 'Layar Penuh',
      exitFullscreen: 'Keluar Layar Penuh',
      animateTokenCost: 'Animasi akan menggunakan {tokens} token. Lanjutkan?',
      generatingNarration: 'Membuat narasi...',
    },
    futurePath: {
      title: 'FuturePath AI',
      subtitle: 'Visualisasikan masa depan impian anak Anda',
      uploadPhoto: 'Unggah Foto Anak',
      childName: 'Nama Anak',
      childNamePlaceholder: 'Masukkan nama anak Anda',
      dreamProfession: 'Profesi Impian',
      dreamProfessionPlaceholder: 'contoh: Astronot, Dokter, Seniman',
      personality: 'Kepribadian (Opsional)',
      personalityPlaceholder: 'contoh: Kreatif, penasaran, suka hewan',
      generate: 'Buat Visi Masa Depan',
      generating: 'Membuat visi masa depan...',
      estimatedTokens: 'Estimasi Biaya',
      result: 'Visi Masa Depan',
      export: 'Ekspor sebagai Video',
    },
    nutrifai: {
      title: 'NutrifAI',
      subtitle: 'Asisten Pertumbuhan & Nutrisi',
      disclaimer: 'AI ini hanya memberikan panduan informasi dan tidak menggantikan nasihat medis profesional.',
      birthWeight: 'Berat Lahir (kg)',
      currentAge: 'Usia Saat Ini (bulan)',
      currentHeight: 'Tinggi Saat Ini (cm)',
      currentWeight: 'Berat Saat Ini (kg)',
      gender: 'Jenis Kelamin',
      male: 'Laki-laki',
      female: 'Perempuan',
      analyze: 'Analisis Pertumbuhan',
      analyzing: 'Menganalisis data pertumbuhan...',
      result: 'Hasil Analisis',
      category: 'Kategori Nutrisi',
      insights: 'Wawasan Pertumbuhan',
      projection: 'Proyeksi 3 Bulan',
      recommendations: 'Rekomendasi',
      mealPlan: 'Rencana Makan Harian',
      generateMealPlan: 'Buat Rencana Makan',
      breakfast: 'Sarapan',
      lunch: 'Makan Siang',
      dinner: 'Makan Malam',
      snack: 'Camilan',
      estimatedTokens: 'Estimasi Biaya',
    },
    tokens: {
      title: 'Saldo Token',
      subtitle: 'Beli token untuk membuka fitur bertenaga AI',
      balance: 'Saldo Saat Ini',
      history: 'Riwayat Transaksi',
      buyTokens: 'Beli Token',
      packages: 'Paket Token',
      perToken: 'per token',
      popular: 'Terpopuler',
      payment: 'Pembayaran',
      noHistory: 'Belum ada transaksi',
      selectCurrency: 'Pilih Mata Uang',
      processingPayment: 'Memproses pembayaran...',
      paymentSuccess: 'Pembayaran berhasil! Token ditambahkan.',
      paymentFailed: 'Pembayaran gagal. Silakan coba lagi.',
      tokenAmount: 'Jumlah Token',
      minTokens: 'Minimal 100 token',
      totalPrice: 'Total Harga',
      redirecting: 'Mengarahkan ke pembayaran...',
      paymentCancelled: 'Pembayaran dibatalkan.',
    },
    auth: {
      loginTitle: 'Selamat Datang Kembali',
      loginSubtitle: 'Masuk untuk melanjutkan perjalanan Anda',
      registerTitle: 'Buat Akun',
      registerSubtitle: 'Mulai perjalanan ajaib Anda hari ini',
      email: 'Email',
      password: 'Kata Sandi',
      confirmPassword: 'Konfirmasi Kata Sandi',
      name: 'Nama Lengkap',
      login: 'Masuk',
      register: 'Daftar',
      loggingIn: 'Sedang masuk...',
      creating: 'Membuat akun...',
      createAccount: 'Buat Akun',
      noAccount: 'Belum punya akun?',
      hasAccount: 'Sudah punya akun?',
      bonusTitle: 'Bonus Selamat Datang!',
      bonusText: 'Dapatkan 300 token gratis saat mendaftar',
      loginRequired: 'Perlu Masuk',
      loginToAccess: 'Silakan masuk untuk mengakses fitur ini',
    },
    common: {
      loading: 'Memuat...',
      error: 'Terjadi kesalahan',
      success: 'Berhasil!',
      cancel: 'Batal',
      confirm: 'Konfirmasi',
      back: 'Kembali',
      next: 'Selanjutnya',
      save: 'Simpan',
      close: 'Tutup',
      tokens: 'token',
    },
    footer: {
      tagline: 'Memberdayakan mimpi setiap anak melalui AI',
      rights: 'Hak cipta dilindungi.',
      madeWith: 'Dibuat dengan cinta untuk keluarga di mana saja',
    },
  },
  zh: {
    nav: {
      home: '首页',
      fairyTale: '童话',
      futurePath: '未来之路',
      nutrifai: '营养AI',
      tokens: '代币',
    },
    hero: {
      tagline: 'AI驱动的儿童梦想',
      title: '每个孩子都有梦想。',
      titleHighlight: '让我们一起实现。',
      subtitle: '创造神奇的童话故事，展望未来的梦想，培养健康成长——一切由AI驱动，专为全球家庭设计。',
      cta: '开始追梦',
      ctaSecondary: '了解更多',
    },
    features: {
      title: '神奇功能',
      subtitle: '三个强大的AI工具，旨在激励、激发和培养您的孩子。',
      fairyTale: {
        title: '童话生成器',
        description: '创建带有叙述、动画和精美视觉效果的自定义插图童话。导出为视频与家人分享。',
        cta: '创作故事',
      },
      futurePath: {
        title: '未来之路AI',
        description: '帮助您的孩子展望他们的梦想。上传照片，选择梦想职业，观看AI创造他们的未来形象。',
        cta: '探索未来',
      },
      nutrifai: {
        title: '营养AI',
        description: '追踪孩子的成长，获取营养见解，接收个性化的膳食计划以支持健康发展。',
        cta: '检查成长',
      },
    },
    fairyTale: {
      title: '童话生成器',
      subtitle: '为您的小宝贝创造一个神奇的故事',
      characterName: '角色名称',
      characterNamePlaceholder: '例如：月亮公主',
      storyIdea: '故事创意',
      storyIdeaPlaceholder: '例如：一位勇敢的公主发现了一个神奇的花园...',
      tone: '故事基调',
      tones: { funny: '搞笑', emotional: '感人', adventurous: '冒险' },
      slides: '幻灯片数量',
      estimatedTokens: '预估费用',
      generate: '生成故事',
      generating: '正在创建您的神奇故事...',
      confirmTokens: '这将使用 {tokens} 个代币。继续吗？',
      export: '导出为视频',
      slideOf: '第 {current} 页，共 {total} 页',
      narrator: 'AI叙述者',
      narratorLoading: '加载叙述者...',
      animateImages: '动画化图片',
      animateDesc: '每张图片30代币',
      animating: '正在动画化图片...',
      exportingVideo: '正在导出视频...',
      fullscreen: '全屏',
      exitFullscreen: '退出全屏',
      animateTokenCost: '动画将使用 {tokens} 个代币。继续吗？',
      generatingNarration: '正在生成旁白...',
    },
    futurePath: {
      title: '未来之路AI',
      subtitle: '展望孩子的梦想未来',
      uploadPhoto: '上传孩子照片',
      childName: '孩子姓名',
      childNamePlaceholder: '输入孩子的名字',
      dreamProfession: '梦想职业',
      dreamProfessionPlaceholder: '例如：宇航员、医生、艺术家',
      personality: '性格（可选）',
      personalityPlaceholder: '例如：有创造力、好奇、喜欢动物',
      generate: '生成未来愿景',
      generating: '正在创建未来愿景...',
      estimatedTokens: '预估费用',
      result: '未来愿景',
      export: '导出为视频',
    },
    nutrifai: {
      title: '营养AI',
      subtitle: '成长与营养助手',
      disclaimer: '此AI仅提供信息指导，不能替代专业医疗建议。',
      birthWeight: '出生体重（公斤）',
      currentAge: '当前年龄（月）',
      currentHeight: '当前身高（厘米）',
      currentWeight: '当前体重（公斤）',
      gender: '性别',
      male: '男',
      female: '女',
      analyze: '分析成长',
      analyzing: '正在分析成长数据...',
      result: '分析结果',
      category: '营养类别',
      insights: '成长洞察',
      projection: '3个月预测',
      recommendations: '建议',
      mealPlan: '每日膳食计划',
      generateMealPlan: '生成膳食计划',
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '零食',
      estimatedTokens: '预估费用',
    },
    tokens: {
      title: '代币余额',
      subtitle: '购买代币以解锁AI功能',
      balance: '当前余额',
      history: '交易记录',
      buyTokens: '购买代币',
      packages: '代币套餐',
      perToken: '每代币',
      popular: '最受欢迎',
      payment: '支付',
      noHistory: '暂无交易记录',
      selectCurrency: '选择货币',
      processingPayment: '处理付款中...',
      paymentSuccess: '付款成功！代币已添加。',
      paymentFailed: '付款失败。请重试。',
      tokenAmount: '代币数量',
      minTokens: '最少100个代币',
      totalPrice: '总价',
      redirecting: '正在跳转到支付...',
      paymentCancelled: '付款已取消。',
    },
    auth: {
      loginTitle: '欢迎回来',
      loginSubtitle: '登录以继续您的旅程',
      registerTitle: '创建账户',
      registerSubtitle: '今天开始您的神奇之旅',
      email: '电子邮件',
      password: '密码',
      confirmPassword: '确认密码',
      name: '全名',
      login: '登录',
      register: '注册',
      loggingIn: '正在登录...',
      creating: '正在创建账户...',
      createAccount: '创建账户',
      noAccount: '还没有账户？',
      hasAccount: '已有账户？',
      bonusTitle: '欢迎奖励！',
      bonusText: '注册即可获得300个免费代币',
      loginRequired: '需要登录',
      loginToAccess: '请登录以访问此功能',
    },
    common: {
      loading: '加载中...',
      error: '出现错误',
      success: '成功！',
      cancel: '取消',
      confirm: '确认',
      back: '返回',
      next: '下一步',
      save: '保存',
      close: '关闭',
      tokens: '代币',
    },
    footer: {
      tagline: '通过AI赋能每个孩子的梦想',
      rights: '版权所有。',
      madeWith: '用爱为全球家庭打造',
    },
  },
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.en;
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('id')) return 'id';
  if (lang.startsWith('zh')) return 'zh';
  return 'en';
}

export const localeNames: Record<Locale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
  zh: '中文',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  id: '🇮🇩',
  zh: '🇨🇳',
};
