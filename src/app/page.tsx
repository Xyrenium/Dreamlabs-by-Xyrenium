'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const floatAnimation = (delay: number, yRange: number) => ({
  y: [0, -yRange, 0],
  transition: { duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' as const, delay },
});

export default function HomePage() {
  const { t, isAuthenticated } = useApp();

  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">
        {/* Animated gradient orbs for hero */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-pink-600/15 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[150px]"
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto text-center relative z-10"
        >
          {/* Tagline badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400" />
              </span>
              {t.hero.tagline}
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6"
          >
            <span className="text-white">{t.hero.title}</span>
            <br />
            <span className="gradient-text">{t.hero.titleHighlight}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-white/50 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href={isAuthenticated ? '/fairy-tale' : '/register'} className="btn-magic text-center text-lg px-8 py-4">
              {t.hero.cta}
            </Link>
            <a href="#features" className="btn-outline-magic text-center text-lg px-8 py-4">
              {t.hero.ctaSecondary}
            </a>
          </motion.div>

          {/* Hero Visual — Three floating preview cards */}
          <motion.div variants={itemVariants} className="relative mx-auto max-w-4xl">
            <div className="relative h-72 sm:h-80 md:h-96">
              {/* Center card: Fairy Tale */}
              <motion.div
                animate={floatAnimation(0, 15)}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-60 sm:w-72 md:w-80 z-20"
              >
                <div className="glass-strong rounded-3xl p-5 sm:p-6 shadow-2xl shadow-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-white/90 font-semibold text-sm block">Fairy Tale</span>
                      <span className="text-white/40 text-xs">AI Story Creator</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/10 aspect-video flex items-center justify-center mb-3 overflow-hidden">
                    <div className="text-center">
                      <div className="text-3xl mb-1">&#x1F31F;&#x1F4D6;&#x2728;</div>
                      <p className="text-[10px] text-purple-300/60">Once upon a time...</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-1 flex-1 rounded-full bg-purple-400/60" />
                    <div className="h-1 flex-1 rounded-full bg-purple-400/30" />
                    <div className="h-1 flex-1 rounded-full bg-purple-400/15" />
                  </div>
                </div>
              </motion.div>

              {/* Left card: FuturePath */}
              <motion.div
                animate={floatAnimation(0.5, 10)}
                className="absolute left-0 sm:left-4 top-8 sm:top-12 w-44 sm:w-52 z-10"
              >
                <div className="glass rounded-2xl p-4 opacity-80 border border-blue-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                    <span className="text-white/70 font-medium text-xs">FuturePath</span>
                  </div>
                  <div className="rounded-xl bg-blue-900/20 border border-blue-500/10 h-16 flex items-center justify-center">
                    <div className="text-xl">&#x1F680;&#x1F468;&#x200D;&#x1F680;</div>
                  </div>
                </div>
              </motion.div>

              {/* Right card: NutrifAI */}
              <motion.div
                animate={floatAnimation(1, 12)}
                className="absolute right-0 sm:right-4 top-12 sm:top-16 w-44 sm:w-52 z-10"
              >
                <div className="glass rounded-2xl p-4 opacity-80 border border-pink-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <span className="text-white/70 font-medium text-xs">NutrifAI</span>
                  </div>
                  <div className="rounded-xl bg-pink-900/20 border border-pink-500/10 h-16 flex items-center justify-center">
                    <div className="text-xl">&#x1F96C;&#x1F4CA;&#x2764;&#xFE0F;</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-2.5 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {[
              { value: '3', label: 'AI Features', icon: '&#x2728;' },
              { value: '9:16', label: 'HD Output', icon: '&#x1F3AC;' },
              { value: '3', label: 'Languages', icon: '&#x1F30F;' },
              { value: '300', label: 'Free Tokens', icon: '&#x1F381;' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl mb-2" dangerouslySetInnerHTML={{ __html: stat.icon }} />
                <div className="text-2xl sm:text-3xl font-extrabold gradient-text mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
              {t.features.title}
            </h2>
            <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </motion.div>

          {/* Feature 1: Fairy Tale — Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <Link href="/fairy-tale" className="block group">
              <div className="glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-600/10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">Featured</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                      {t.features.fairyTale.title}
                    </h3>
                    <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
                      {t.features.fairyTale.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {['AI Images', 'TTS Narrator', 'Video Export', 'Animation'].map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 text-white/50 border border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 group-hover:gap-3 transition-all">
                      {t.features.fairyTale.cta}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  <div className="w-full md:w-80 shrink-0">
                    <div className="aspect-[9/16] max-h-72 mx-auto rounded-2xl bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-indigo-900/40 border border-purple-500/10 flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.15),transparent_70%)]" />
                      <div className="text-center relative z-10">
                        <div className="text-5xl mb-3">&#x1F4D6;</div>
                        <p className="text-purple-300/60 text-xs px-4">AI-generated fairy tales with narration &amp; animation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Feature 2 & 3: Side by side */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* FuturePath */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link href="/future-path" className="block group h-full">
                <div className="glass-card rounded-3xl p-8 h-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                      {t.features.futurePath.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-5">
                      {t.features.futurePath.description}
                    </p>
                    <div className="rounded-2xl bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/10 p-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">&#x1F476;</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-full rounded-full bg-blue-400/20">
                              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                            </div>
                          </div>
                          <p className="text-[10px] text-white/30 mt-1">Photo &rarr; AI Transformation</p>
                        </div>
                        <div className="text-2xl">&#x1F468;&#x200D;&#x1F393;</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 group-hover:gap-3 transition-all">
                      {t.features.futurePath.cta}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* NutrifAI */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/nutrifai" className="block group h-full">
                <div className="glass-card rounded-3xl p-8 h-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-600/5 to-rose-600/5 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                      {t.features.nutrifai.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-5">
                      {t.features.nutrifai.description}
                    </p>
                    <div className="rounded-2xl bg-gradient-to-br from-pink-900/30 to-rose-900/20 border border-pink-500/10 p-4 mb-5">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-400">Normal</div>
                          <p className="text-[10px] text-white/30">Weight</p>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-400">85cm</div>
                          <p className="text-[10px] text-white/30">Height</p>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-pink-400">12kg</div>
                          <p className="text-[10px] text-white/30">Weight</p>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-pink-400 group-hover:gap-3 transition-all">
                      {t.features.nutrifai.cta}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-white/5 mb-4">
              Simple &amp; Easy
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto">
              Three simple steps to unlock AI magic for your family
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden sm:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-purple-500/20 via-purple-500/40 to-purple-500/20" />

            {[
              { step: '01', title: 'Choose', desc: 'Pick a feature — create stories, visualize dreams, or check nutrition.', color: 'from-violet-500 to-purple-600', icon: '&#x1F3AF;' },
              { step: '02', title: 'Create', desc: 'Enter details and let AI generate personalized, beautiful content.', color: 'from-blue-500 to-cyan-500', icon: '&#x2728;' },
              { step: '03', title: 'Share', desc: 'Export as video, save, and share magical moments with family.', color: 'from-pink-500 to-rose-500', icon: '&#x1F389;' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className={'w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ' + item.color + ' flex items-center justify-center text-white mb-6 shadow-lg relative z-10'}>
                  <span className="text-2xl" dangerouslySetInnerHTML={{ __html: item.icon }} />
                </div>
                <div className="text-xs font-bold text-white/20 tracking-widest mb-2">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Trust Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Powered by Advanced AI</h2>
            <p className="text-white/40 text-sm sm:text-base max-w-xl mx-auto">Built with cutting-edge technology to deliver the best experience for your family</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { name: 'Qwen AI', desc: 'Text Generation', gradient: 'from-purple-500/10 to-purple-500/5' },
              { name: 'Wan 2.6', desc: 'Image & Video', gradient: 'from-blue-500/10 to-blue-500/5' },
              { name: 'TTS Flash', desc: 'Voice Narrator', gradient: 'from-pink-500/10 to-pink-500/5' },
              { name: 'FFmpeg', desc: 'Video Export', gradient: 'from-green-500/10 to-green-500/5' },
            ].map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={'rounded-2xl p-5 text-center bg-gradient-to-br ' + tech.gradient + ' border border-white/5'}
              >
                <p className="font-bold text-white text-sm mb-1">{tech.name}</p>
                <p className="text-white/30 text-xs">{tech.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          >
            {/* CTA background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 pointer-events-none" />
            <div className="absolute inset-0 border border-purple-500/10 rounded-3xl pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-6">
                <span className="text-sm">&#x1F381;</span>
                300 Free Tokens on Sign Up
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Start the Journey?
              </h2>
              <p className="text-white/50 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Every dream deserves a chance to grow. Start creating magical experiences for your child today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={isAuthenticated ? '/fairy-tale' : '/register'} className="btn-magic inline-block text-lg px-8 py-4">
                  {isAuthenticated ? t.hero.cta : t.auth.createAccount}
                </Link>
                {!isAuthenticated && (
                  <Link href="/login" className="btn-outline-magic inline-block text-lg px-8 py-4">
                    {t.auth.login}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
