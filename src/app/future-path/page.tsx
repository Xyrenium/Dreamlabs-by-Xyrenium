'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import PageWrapper, { SectionHeader, TokenCostPreview, LoadingOverlay, ConfirmModal } from '@/components/PageWrapper';

interface FutureResult {
  dreamProfession: string;
  futureImageUrl: string;
}

interface StorySlide {
  text: string;
  imageUrl: string | null;
}

interface StoryResult {
  title: string;
  dreamProfession: string;
  slides: StorySlide[];
}

export default function FuturePathPage() {
  const { t, isAuthenticated, deductTokens, tokens, locale } = useApp();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dreamProfession, setDreamProfession] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStoryConfirm, setShowStoryConfirm] = useState(false);
  const [result, setResult] = useState<FutureResult | null>(null);
  const [storyResult, setStoryResult] = useState<StoryResult | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState('');

  // Voice states for story
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const getVoiceForLocale = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const langMap: Record<string, string[]> = {
      'en': ['en-US', 'en-GB', 'en'],
      'id': ['id-ID', 'id'],
      'zh': ['zh-CN', 'zh-TW', 'zh'],
    };
    const targetLangs = langMap[locale] || langMap['en'];
    for (const targetLang of targetLangs) {
      const voice = voices.find(v => v.lang.startsWith(targetLang));
      if (voice) return voice;
    }
    return voices[0] || null;
  }, [locale]);

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !voiceEnabled) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getVoiceForLocale();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, getVoiceForLocale]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  if (!isAuthenticated) return null;

  const imageTokenCost = 3;
  const storyTokenCost = 20;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    if (!dreamProfession.trim()) return;
    setShowConfirm(true);
  };

  const confirmGenerate = async () => {
    setShowConfirm(false);
    setError('');
    
    const canProceed = deductTokens(imageTokenCost, `FuturePath: ${dreamProfession}`);
    if (!canProceed) {
      setError('Not enough tokens');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate/future-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamProfession,
          photoBase64: photoPreview,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'Failed to generate');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStory = () => {
    setShowStoryConfirm(true);
  };

  const confirmGenerateStory = async () => {
    setShowStoryConfirm(false);
    setError('');
    
    const canProceed = deductTokens(storyTokenCost, `FuturePath Story: ${dreamProfession}`);
    if (!canProceed) {
      setError('Not enough tokens');
      return;
    }

    setIsGeneratingStory(true);
    
    try {
      const response = await fetch('/api/generate/future-path-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamProfession: result?.dreamProfession || dreamProfession,
          locale,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStoryResult(data.story);
        setCurrentSlide(0);
      } else {
        setError(data.error || 'Failed to generate story');
      }
    } catch (err) {
      console.error('Story generation error:', err);
      setError('Failed to generate story. Please try again.');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const professionSuggestions = [
    { label: 'Astronaut', icon: '🚀' },
    { label: 'Doctor', icon: '🩺' },
    { label: 'Artist', icon: '🎨' },
    { label: 'Scientist', icon: '🔬' },
    { label: 'Engineer', icon: '⚙️' },
    { label: 'Teacher', icon: '📚' },
  ];

  const resetAll = () => {
    setResult(null);
    setStoryResult(null);
    setDreamProfession('');
    setPhotoPreview(null);
    setError('');
    setIsPlaying(false);
    stopSpeaking();
  };

  // Story playback controls
  const goToSlide = (index: number) => {
    setIsPlaying(false);
    stopSpeaking();
    if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    setCurrentSlide(index);
  };

  return (
    <PageWrapper>
      <SectionHeader title={t.futurePath.title} subtitle={t.futurePath.subtitle} badge="Dream Visualizer" />

      <AnimatePresence>
        {isGenerating && <LoadingOverlay message={t.futurePath.generating} />}
        {isGeneratingStory && <LoadingOverlay message="Generating your journey story..." />}
        {showConfirm && (
          <ConfirmModal
            message={`This will use ${imageTokenCost} tokens. Continue?`}
            onConfirm={confirmGenerate}
            onCancel={() => setShowConfirm(false)}
          />
        )}
        {showStoryConfirm && (
          <ConfirmModal
            message={`Generate story will use ${storyTokenCost} tokens. Continue?`}
            onConfirm={confirmGenerateStory}
            onCancel={() => setShowStoryConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Step 1: Input Form */}
      {!result && !storyResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Photo Upload (Optional) */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t.futurePath.uploadPhoto} <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video max-h-[150px] rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-purple-500/30 transition-all flex flex-col items-center justify-center gap-3 group overflow-hidden"
              >
                {photoPreview ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${photoPreview})` }}
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)] group-hover:text-purple-400 transition-colors">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <span className="text-[var(--text-muted)] text-sm">Upload your photo (any size)</span>
                  </>
                )}
              </button>
            </div>

            {/* Dream Profession */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t.futurePath.dreamProfession}</label>
              <input
                type="text"
                value={dreamProfession}
                onChange={(e) => setDreamProfession(e.target.value)}
                placeholder={t.futurePath.dreamProfessionPlaceholder}
                className="input-magic mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {professionSuggestions.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setDreamProfession(p.label)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      dreamProfession === p.label
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Token Cost */}
            <TokenCostPreview cost={imageTokenCost} label="Token cost for vision image" />

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!dreamProfession.trim() || tokens < imageTokenCost}
              className="btn-magic w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Generate Future Vision
            </button>

            {tokens < imageTokenCost && (
              <p className="text-center text-sm text-amber-400/70">
                Not enough tokens. You need {imageTokenCost} tokens but have {tokens}.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 2: Image Result with Generate Story button */}
      {result && !storyResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            {error && (
              <motion.div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                {error}
              </motion.div>
            )}

            <div className="text-center mb-6">
              <p className="text-purple-400 text-sm font-medium mb-2">Your Future Vision</p>
              <h2 className="text-2xl font-bold">Future {result.dreamProfession}</h2>
            </div>

            {/* Future Image - 9:16 */}
            <div className="w-full max-w-sm mx-auto aspect-[9/16] rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 overflow-hidden mb-6">
              {result.futureImageUrl ? (
                <img src={result.futureImageUrl} alt="Future vision" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white/20">Image failed to generate</span>
                </div>
              )}
            </div>

            {/* Generate Story Button */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-[var(--text-muted)] text-sm mb-2">
                  Want to see the journey to achieve this dream?
                </p>
                <TokenCostPreview cost={storyTokenCost} label="Story generation cost" />
              </div>
              
              <button
                onClick={handleGenerateStory}
                disabled={tokens < storyTokenCost}
                className="btn-magic w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate Journey Story
              </button>

              <button
                onClick={resetAll}
                className="btn-outline-magic w-full py-3 text-sm"
              >
                Start Over
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Story Viewer */}
      {storyResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="relative bg-gradient-to-br from-blue-600/10 to-purple-600/10 aspect-[9/16] max-h-[450px] flex items-center justify-center p-6 sm:p-8">
              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30"
                >
                  <div className="flex gap-0.5">
                    <span className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                    <span className="w-1 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                  </div>
                  <span className="text-xs text-purple-300">Speaking</span>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                  className="text-center max-w-2xl"
                >
                  <div className="w-full aspect-[9/16] max-h-[220px] rounded-2xl bg-white/5 border border-white/10 mb-4 flex items-center justify-center overflow-hidden">
                    {storyResult.slides[currentSlide]?.imageUrl ? (
                      <img src={storyResult.slides[currentSlide].imageUrl!} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/20 text-xs">AI Generated (9:16)</span>
                    )}
                  </div>
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                    {storyResult.slides[currentSlide]?.text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[var(--text-muted)] text-sm">
                  {currentSlide + 1} / {storyResult.slides.length}
                </span>
                <span className="text-[var(--text-muted)] text-sm font-medium">{storyResult.title}</span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] mb-6">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  animate={{ width: `${((currentSlide + 1) / storyResult.slides.length) * 100}%` }}
                />
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => { setVoiceEnabled(!voiceEnabled); if (voiceEnabled) stopSpeaking(); }}
                  className={`p-3 rounded-full transition-all ${
                    voiceEnabled 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]'
                  }`}
                >
                  {voiceEnabled ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => goToSlide(0)}
                  className="p-3 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-secondary)] transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => goToSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="btn-outline-magic py-2.5 px-5 text-sm disabled:opacity-30"
                >
                  {t.common.back}
                </button>

                <div className="flex gap-1.5">
                  {storyResult.slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentSlide ? 'bg-blue-400 w-6' : 'bg-[var(--border-color-strong)]'
                      }`}
                    />
                  ))}
                </div>

                {currentSlide < storyResult.slides.length - 1 ? (
                  <button
                    onClick={() => goToSlide(currentSlide + 1)}
                    className="btn-magic py-2.5 px-5 text-sm"
                  >
                    {t.common.next}
                  </button>
                ) : (
                  <button className="btn-magic py-2.5 px-5 text-sm">
                    Export
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button onClick={resetAll} className="btn-outline-magic py-3 px-6 text-sm">
              Create Another Vision
            </button>
          </div>
        </motion.div>
      )}
    </PageWrapper>
  );
}
