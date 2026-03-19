/**
 * Video Hero Component for Landing Page A/B Test
 *
 * Displays either:
 * 1. Autoplay muted video demo
 * 2. Click-to-play video with thumbnail
 * 3. Animated statistics showcase
 *
 * Tracks engagement: video plays, completions, and bounce impact
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoHeroProps {
  variant: 'autoplay' | 'click-to-play' | 'animated-stats';
  onVideoPlayed?: () => void;
  onVideoCompleted?: () => void;
  className?: string;
}

export function VideoHero({
  variant,
  onVideoPlayed,
  onVideoCompleted,
  className = '',
}: VideoHeroProps) {
  const [isPlaying, setIsPlaying] = useState(variant === 'autoplay');
  const [isMuted, setIsMuted] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay on mount if variant is autoplay
  useEffect(() => {
    if (variant === 'autoplay' && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked by browser
        setIsPlaying(false);
      });
    }
  }, [variant]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      if (!hasEnded) {
        onVideoPlayed?.();
      }
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoEnded = () => {
    setHasEnded(true);
    setIsPlaying(false);
    onVideoCompleted?.();
  };

  // Animated stats variant
  if (variant === 'animated-stats') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        <AnimatedStat
          icon={<DollarSign className="h-8 w-8 text-emerald-500" />}
          value="$8,000"
          label="Average Tax Savings"
          delay={0}
        />
        <AnimatedStat
          icon={<Users className="h-8 w-8 text-blue-500" />}
          value="2,500+"
          label="H-1B/TN Workers Helped"
          delay={200}
        />
        <AnimatedStat
          icon={<TrendingUp className="h-8 w-8 text-amber-500" />}
          value="95%"
          label="Foreign Tax Credit Accuracy"
          delay={400}
        />
      </div>
    );
  }

  // Video variants
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted={isMuted}
        loop={false}
        playsInline
        onEnded={handleVideoEnded}
        poster="/images/video-thumbnail.jpg" // Fallback poster image
      >
        <source src="/videos/taxbridge-demo.mp4" type="video/mp4" />
        {/* Fallback: If video fails to load, show animated stats instead */}
        <div className="w-full h-64 bg-gradient-to-br from-emerald-900 to-blue-900 flex items-center justify-center">
          <p className="text-slate-300 text-lg">Video not supported. Please update your browser.</p>
        </div>
      </video>

      {/* Video Controls Overlay */}
      {variant === 'click-to-play' && !isPlaying && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center group cursor-pointer" onClick={handlePlayPause}>
          <div className="bg-emerald-500 rounded-full p-6 group-hover:bg-emerald-400 transition-all group-hover:scale-110">
            <Play className="h-12 w-12 text-slate-950 fill-slate-950" />
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white text-lg font-semibold">Watch 90-Second Demo</p>
            <p className="text-slate-300 text-sm mt-1">See how TaxBridge saves you thousands</p>
          </div>
        </div>
      )}

      {/* Playback Controls (bottom bar) */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-4">
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePlayPause}
              className="text-white hover:bg-slate-800"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMuteToggle}
              className="text-white hover:bg-slate-800"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Video completion overlay */}
      {hasEnded && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <p className="text-white text-xl font-bold">Ready to Save Thousands?</p>
            <Button
              size="lg"
              onClick={() => window.location.href = '/dashboard'}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950"
            >
              Start Your Free Calculation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Animated stat counter component
function AnimatedStat({
  icon,
  value,
  label,
  delay = 0,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}
