'use client';

import React, { useMemo } from 'react';

export default function BackgroundEffects() {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${(i * 37 + 13) % 100}%`,
      top: `${(i * 53 + 7) % 100}%`,
      duration: `${2 + (i % 5)}s`,
      delay: `${(i * 0.3) % 3}s`,
      size: i % 3 === 0 ? 3 : 2,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient orbs */}
      <div
        className="bg-orb w-[600px] h-[600px] -top-48 -left-48 animate-float"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }}
      />
      <div
        className="bg-orb w-[500px] h-[500px] top-1/3 -right-32 animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)' }}
      />
      <div
        className="bg-orb w-[400px] h-[400px] bottom-0 left-1/4 animate-float-slower"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)' }}
      />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            ['--duration' as string]: star.duration,
            ['--delay' as string]: star.delay,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}
