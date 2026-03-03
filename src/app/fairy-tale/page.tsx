'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import PageWrapper, { SectionHeader, TokenCostPreview, LoadingOverlay, ConfirmModal } from '@/components/PageWrapper';

interface StorySlide {
  text: string;
  imageUrl: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
}

interface StoryCharacter {
  name: string;
  role: string;
  visual: string;
}

interface GeneratedStory {
  title: string;
  slides: StorySlide[];
  characters?: StoryCharacter[];
}

type ConfirmType = 'generate' | 'animate';

export default function FairyTalePage() {
  const { t, isAuthenticated, deductTokens, tokens, locale } = useApp();
  const router = useRouter();
  const [storyIdea, setStoryIdea] = useState('');
  const [slideCount, setSlideCount] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<ConfirmType>('generate');
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState('');

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNarratorEnabled, setIsNarratorEnabled] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState('');

  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const generateTTS = useCallback(async (text: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/generate/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, locale }),
      });
      const data = await res.json();
      return data.success ? data.audioUrl : null;
    } catch (err) {
      console.error('TTS error:', err);
      return null;
    }
  }, [locale]);

  const generateAllTTS = useCallback(async (story: GeneratedStory) => {
    setIsLoadingAudio(true);
    const updatedSlides = [...story.slides];
    for (let i = 0; i < updatedSlides.length; i++) {
      if (!updatedSlides[i].audioUrl) {
        const audioUrl = await generateTTS(updatedSlides[i].text);
        updatedSlides[i] = { ...updatedSlides[i], audioUrl };
      }
    }
    setGeneratedStory(prev => prev ? { ...prev, slides: updatedSlides } : null);
    setIsLoadingAudio(false);
  }, [generateTTS]);

  const playSlideAudio = useCallback((slideIndex: number, onEnd?: () => void) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (!generatedStory || !isNarratorEnabled) {
      onEnd?.();
      return;
    }
    const audioUrl = generatedStory.slides[slideIndex]?.audioUrl;
    if (!audioUrl) {
      autoplayTimerRef.current = setTimeout(() => onEnd?.(), 5000);
      return;
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => {
      audioRef.current = null;
      autoplayTimerRef.current = setTimeout(() => onEnd?.(), 500);
    };
    audio.onerror = () => {
      audioRef.current = null;
      autoplayTimerRef.current = setTimeout(() => onEnd?.(), 3000);
    };
    audio.play().catch(() => {
      autoplayTimerRef.current = setTimeout(() => onEnd?.(), 5000);
    });
  }, [generatedStory, isNarratorEnabled]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const goToNextSlide = useCallback(() => {
    if (!generatedStory) return;
    if (currentSlide < generatedStory.slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setIsPlaying(false);
      stopAudio();
    }
  }, [currentSlide, generatedStory, stopAudio]);

  useEffect(() => {
    if (!isPlaying || !generatedStory) return;
    if (isNarratorEnabled) {
      playSlideAudio(currentSlide, goToNextSlide);
    } else {
      autoplayTimerRef.current = setTimeout(goToNextSlide, 5000);
    }
    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, [isPlaying, currentSlide, generatedStory, isNarratorEnabled, playSlideAudio, goToNextSlide]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAudio();
    } else {
      setIsPlaying(true);
    }
  };

  const toggleNarrator = () => {
    if (isNarratorEnabled) stopAudio();
    setIsNarratorEnabled(!isNarratorEnabled);
  };

  const goToSlide = (index: number) => {
    setIsPlaying(false);
    stopAudio();
    setCurrentSlide(index);
  };

  const toggleFullscreen = () => {
    if (!fullscreenRef.current) return;
    if (!document.fullscreenElement) {
      fullscreenRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleAnimate = () => {
    if (!generatedStory) return;
    const imageSlides = generatedStory.slides.filter(s => s.imageUrl && !s.videoUrl);
    if (imageSlides.length === 0) return;
    setConfirmType('animate');
    setShowConfirm(true);
  };

  const confirmAnimate = async () => {
    setShowConfirm(false);
    if (!generatedStory) return;
    const imageSlides = generatedStory.slides.filter(s => s.imageUrl && !s.videoUrl);
    const cost = imageSlides.length * 30;
    const canProceed = deductTokens(cost, 'Animate ' + imageSlides.length + ' fairy tale images');
    if (!canProceed) {
      setError('Not enough tokens');
      return;
    }
    setIsAnimating(true);
    const updatedSlides = [...generatedStory.slides];
    for (let i = 0; i < updatedSlides.length; i++) {
      const slide = updatedSlides[i];
      if (!slide.imageUrl || slide.videoUrl) continue;
      setAnimationProgress('Animating image ' + (i + 1) + '/' + generatedStory.slides.length + '...');
      try {
        const res = await fetch('/api/generate/i2v', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: slide.imageUrl,
            prompt: 'gentle animation, subtle movement, fairy tale scene comes alive',
          }),
        });
        const data = await res.json();
        if (data.success) {
          updatedSlides[i] = { ...updatedSlides[i], videoUrl: data.videoUrl };
        }
      } catch (err) {
        console.error('I2V error for slide ' + (i + 1) + ':', err);
      }
    }
    setGeneratedStory(prev => prev ? { ...prev, slides: updatedSlides } : null);
    setIsAnimating(false);
    setAnimationProgress('');
  };

  const handleExport = async () => {
    if (!generatedStory) return;
    setIsExporting(true);
    setExportProgress('Preparing media files...');
    setError('');

    try {
      const mediaItems: Array<{
        type: 'image' | 'video';
        url: string;
        audioUrl?: string;
        duration: number;
      }> = [];

      for (const slide of generatedStory.slides) {
        if (slide.videoUrl) {
          mediaItems.push({ type: 'video', url: slide.videoUrl, audioUrl: slide.audioUrl || undefined, duration: 5 });
        } else if (slide.imageUrl) {
          mediaItems.push({ type: 'image', url: slide.imageUrl, audioUrl: slide.audioUrl || undefined, duration: 6 });
        }
      }

      if (mediaItems.length === 0) {
        setError('No media to export');
        setIsExporting(false);
        return;
      }

      // Helper to fetch via proxy for external URLs
      const fetchMedia = async (url: string): Promise<Blob> => {
        if (url.includes('aliyuncs.com') || url.includes('dashscope')) {
          const proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
          const res = await fetch(proxyUrl);
          if (!res.ok) throw new Error('Proxy fetch failed: ' + res.status);
          return res.blob();
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        return res.blob();
      };

      setExportProgress('Downloading media (0/' + mediaItems.length + ')...');

      const downloads = [];
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];
        setExportProgress('Downloading media (' + (i + 1) + '/' + mediaItems.length + ')...');
        try {
          const mediaBlob = await fetchMedia(item.url);
          let audioBlob: Blob | null = null;
          if (item.audioUrl) {
            audioBlob = await fetchMedia(item.audioUrl).catch(() => null);
          }
          downloads.push({ ...item, mediaBlob, audioBlob });
        } catch (err) {
          console.error('Download error for item ' + i + ':', err);
          throw new Error('Failed to download slide ' + (i + 1));
        }
      }

      setExportProgress('Loading FFmpeg...');
      console.log('Loading FFmpeg WASM...');

      const ffmpegMod = await import('@ffmpeg/ffmpeg');
      const utilMod = await import('@ffmpeg/util');
      const FFmpegClass = ffmpegMod.FFmpeg;
      const fetchFileFn = utilMod.fetchFile;
      const toBlobURLFn = utilMod.toBlobURL;

      const ffmpeg = new FFmpegClass();
      
      // Log FFmpeg output for debugging
      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      console.log('Loading FFmpeg core from:', baseURL);
      
      await ffmpeg.load({
        coreURL: await toBlobURLFn(baseURL + '/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURLFn(baseURL + '/ffmpeg-core.wasm', 'application/wasm'),
      });
      
      console.log('FFmpeg loaded successfully');

      const segments: string[] = [];

      for (let i = 0; i < downloads.length; i++) {
        const item = downloads[i];
        setExportProgress('Encoding slide ' + (i + 1) + '/' + downloads.length + '...');
        console.log('Processing slide ' + i + ', type:', item.type);

        const segName = 'seg_' + i + '.mp4';

        if (item.type === 'video') {
          const videoName = 'video_' + i + '.mp4';
          await ffmpeg.writeFile(videoName, await fetchFileFn(item.mediaBlob));

          if (item.audioBlob) {
            const audioName = 'audio_' + i + '.mp3';
            await ffmpeg.writeFile(audioName, await fetchFileFn(item.audioBlob));
            // Loop video infinitely (-stream_loop -1) so it repeats until audio ends (-shortest)
            await ffmpeg.exec([
              '-stream_loop', '-1', '-i', videoName, '-i', audioName,
              '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
              '-c:a', 'aac', '-b:a', '128k',
              '-shortest', '-y', segName
            ]);
          } else {
            // No audio: just re-encode video as-is
            await ffmpeg.exec([
              '-i', videoName,
              '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
              '-an', '-y', segName
            ]);
          }
        } else {
          // Image slide
          const imgName = 'img_' + i + '.png';
          await ffmpeg.writeFile(imgName, await fetchFileFn(item.mediaBlob));

          if (item.audioBlob) {
            const audioName = 'audio_' + i + '.mp3';
            await ffmpeg.writeFile(audioName, await fetchFileFn(item.audioBlob));
            await ffmpeg.exec([
              '-loop', '1', '-i', imgName, '-i', audioName,
              '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
              '-tune', 'stillimage',
              '-c:a', 'aac', '-b:a', '128k',
              '-pix_fmt', 'yuv420p',
              '-shortest', '-y', segName
            ]);
          } else {
            await ffmpeg.exec([
              '-loop', '1', '-i', imgName,
              '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
              '-tune', 'stillimage',
              '-t', String(item.duration),
              '-pix_fmt', 'yuv420p',
              '-an', '-y', segName
            ]);
          }
        }
        
        segments.push(segName);
        console.log('Segment ' + i + ' created:', segName);
      }

      setExportProgress('Combining slides...');
      console.log('Combining ' + segments.length + ' segments');

      // Write concat file
      const concatContent = segments.map(s => "file '" + s + "'").join('\n');
      await ffmpeg.writeFile('concat.txt', concatContent);

      // Concatenate all segments
      await ffmpeg.exec([
        '-f', 'concat', '-safe', '0', '-i', 'concat.txt',
        '-c', 'copy', '-y', 'output.mp4'
      ]);

      console.log('Reading output file...');
      const outputData = await ffmpeg.readFile('output.mp4');
      const rawBytes = outputData as Uint8Array;
      console.log('Output size:', rawBytes.byteLength, 'bytes');
      
      const outputBlob = new Blob([rawBytes.buffer.slice(rawBytes.byteOffset, rawBytes.byteOffset + rawBytes.byteLength) as ArrayBuffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(outputBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = (generatedStory.title || 'fairy-tale').replace(/[^a-zA-Z0-9]/g, '_') + '.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Export completed successfully');
      setExportProgress('');
    } catch (err) {
      console.error('Export error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError('Export failed: ' + errMsg + '. Check browser console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAuthenticated) return null;

  const estimatedTokens = slideCount * 3;

  const handleGenerate = () => {
    if (!storyIdea.trim()) return;
    setConfirmType('generate');
    setShowConfirm(true);
  };

  const confirmGenerate = async () => {
    setShowConfirm(false);
    setError('');
    const canProceed = deductTokens(estimatedTokens, 'Fairy Tale: ' + storyIdea.substring(0, 30));
    if (!canProceed) {
      setError('Not enough tokens');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate/fairy-tale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyIdea, slideCount, locale }),
      });
      const data = await response.json();
      if (data.success) {
        const story: GeneratedStory = data.story;
        setGeneratedStory(story);
        setCurrentSlide(0);
        setIsPlaying(false);
        generateAllTTS(story);
      } else {
        setError(data.error || 'Failed to generate story');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (confirmType === 'generate') confirmGenerate();
    else if (confirmType === 'animate') confirmAnimate();
  };

  const getConfirmMessage = () => {
    if (confirmType === 'animate' && generatedStory) {
      const imageSlides = generatedStory.slides.filter(s => s.imageUrl && !s.videoUrl);
      const cost = imageSlides.length * 30;
      return t.fairyTale.animateTokenCost.replace('{tokens}', String(cost));
    }
    return t.fairyTale.confirmTokens.replace('{tokens}', String(estimatedTokens));
  };

  const currentSlideData = generatedStory?.slides[currentSlide];
  const hasAnimatableSlides = generatedStory?.slides.some(s => s.imageUrl && !s.videoUrl);

  return (
    <PageWrapper>
      <AnimatePresence>
        {(isGenerating || isAnimating || isExporting) && (
          <LoadingOverlay message={
            isAnimating ? (animationProgress || t.fairyTale.animating) :
            isExporting ? (exportProgress || t.fairyTale.exportingVideo) :
            t.fairyTale.generating
          } />
        )}
        {showConfirm && (
          <ConfirmModal
            message={getConfirmMessage()}
            onConfirm={handleConfirm}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>

      {!generatedStory ? (
        <>
          <SectionHeader title={t.fairyTale.title} subtitle={t.fairyTale.subtitle} badge="AI Story Creator" />
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

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t.fairyTale.storyIdea}
                </label>
                <textarea
                  value={storyIdea}
                  onChange={(e) => setStoryIdea(e.target.value)}
                  placeholder={t.fairyTale.storyIdeaPlaceholder}
                  rows={4}
                  className="input-magic resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t.fairyTale.slides}: <span className="font-bold">{slideCount}</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={10}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <TokenCostPreview cost={estimatedTokens} label={t.fairyTale.estimatedTokens} />

              <button
                onClick={handleGenerate}
                disabled={!storyIdea.trim() || tokens < estimatedTokens}
                className="btn-magic w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.fairyTale.generate}
              </button>

              {tokens < estimatedTokens && (
                <p className="text-center text-sm text-amber-400/70">
                  Not enough tokens. You need {estimatedTokens} tokens but have {tokens}.
                </p>
              )}
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4"
            >
              {error}
            </motion.div>
          )}

          <div ref={fullscreenRef} className={isFullscreen ? 'bg-black' : ''}>
            <div className={isFullscreen ? 'h-screen flex flex-col' : 'glass-card rounded-3xl overflow-hidden'}>

              <div className={'relative flex-1 flex items-center justify-center overflow-hidden ' + (isFullscreen ? 'bg-black' : 'bg-gradient-to-br from-indigo-950/40 to-purple-950/40')}>

                {isLoadingAudio && (
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30">
                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-blue-300">{t.fairyTale.generatingNarration}</span>
                  </div>
                )}

                {isPlaying && isNarratorEnabled && audioRef.current && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30"
                  >
                    <div className="flex gap-0.5">
                      <span className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" />
                      <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-xs text-purple-300">{t.fairyTale.narrator}</span>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className={'relative w-full flex items-center justify-center' + (isFullscreen ? ' h-full' : '')}
                  >
                    <div className={'relative overflow-hidden' + (isFullscreen ? ' h-full w-auto aspect-[9/16]' : ' w-full max-w-md mx-auto aspect-[9/16] rounded-2xl m-4')}>
                      {currentSlideData?.videoUrl ? (
                        <video
                          key={currentSlideData.videoUrl}
                          src={currentSlideData.videoUrl}
                          className="w-full h-full object-cover"
                          autoPlay loop muted playsInline
                        />
                      ) : currentSlideData?.imageUrl ? (
                        <img
                          src={currentSlideData.imageUrl}
                          alt={'Slide ' + (currentSlide + 1)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <div className="text-center p-4">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20 mx-auto mb-2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span className="text-white/20 text-xs">Generating...</span>
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-12">
                        <p className="text-white text-sm sm:text-base leading-relaxed text-center">
                          {currentSlideData?.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={'p-4 sm:p-6' + (isFullscreen ? ' bg-black/90' : '')}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[var(--text-muted)] text-sm">
                    {t.fairyTale.slideOf
                      .replace('{current}', String(currentSlide + 1))
                      .replace('{total}', String(generatedStory.slides.length))}
                  </span>
                  <span className="text-[var(--text-muted)] text-sm font-medium truncate ml-4">
                    {generatedStory.title}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] mb-4">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    animate={{ width: ((currentSlide + 1) / generatedStory.slides.length * 100) + '%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="flex items-center justify-center gap-3 mb-4">
                  <button
                    onClick={toggleNarrator}
                    className={'p-2.5 rounded-full transition-all ' + (isNarratorEnabled ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]')}
                    title={t.fairyTale.narrator}
                  >
                    {isNarratorEnabled ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => goToSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className="p-2.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] disabled:opacity-30 transition-all"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105"
                  >
                    {isPlaying ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => goToSlide(Math.min(generatedStory.slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === generatedStory.slides.length - 1}
                    className="p-2.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] disabled:opacity-30 transition-all"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  <button
                    onClick={() => goToSlide(0)}
                    className="p-2.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] transition-all"
                    title="Restart"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] transition-all"
                    title={isFullscreen ? t.fairyTale.exitFullscreen : t.fairyTale.fullscreen}
                  >
                    {isFullscreen ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="4 14 10 14 10 20" />
                        <polyline points="20 10 14 10 14 4" />
                        <line x1="14" y1="10" x2="21" y2="3" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex justify-center gap-1.5 mb-4">
                  {generatedStory.slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      className={'h-2 rounded-full transition-all ' + (i === currentSlide ? 'bg-purple-400 w-6' : 'bg-[var(--border-color-strong)] hover:bg-[var(--text-muted)] w-2')}
                    />
                  ))}
                </div>

                {!isFullscreen && (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {hasAnimatableSlides && (
                      <button
                        onClick={handleAnimate}
                        disabled={isAnimating}
                        className="btn-outline-magic py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-40"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                        {t.fairyTale.animateImages}
                        <span className="text-xs opacity-60">({t.fairyTale.animateDesc})</span>
                      </button>
                    )}

                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="btn-magic py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-40"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {t.fairyTale.export}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isFullscreen && (
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setGeneratedStory(null);
                  setStoryIdea('');
                  setError('');
                  setIsPlaying(false);
                  stopAudio();
                }}
                className="btn-outline-magic py-3 px-6 text-sm"
              >
                Create Another Story
              </button>
            </div>
          )}
        </motion.div>
      )}
    </PageWrapper>
  );
}
