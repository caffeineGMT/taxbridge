'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  location: string;
  quote: string;
  rating: number;
  savings_amount?: string | null;
  avatar_url?: string | null;
  video_url?: string | null;
}

interface TestimonialCarouselProps {
  variant?: 'default' | 'compact' | 'featured';
  limit?: number;
  autoRotate?: boolean;
  autoRotateInterval?: number; // milliseconds
}

export default function TestimonialCarousel({
  variant = 'default',
  limit = 3,
  autoRotate = true,
  autoRotateInterval = 8000
}: TestimonialCarouselProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch testimonials from API
  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch(`/api/testimonials?status=active&limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        const data = await response.json();
        setTestimonials(data.testimonials || []);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, [limit]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!autoRotate || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, autoRotateInterval, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || testimonials.length === 0) {
    return null; // Silently fail if no testimonials
  }

  // FEATURED VARIANT: Single rotating testimonial with large quote
  if (variant === 'featured') {
    const current = testimonials[currentIndex];
    return (
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 border border-slate-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            {current.avatar_url ? (
              <img
                src={current.avatar_url}
                alt={current.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-emerald-500"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold text-2xl">
                {current.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-xl text-slate-100">{current.name}</div>
              <div className="text-sm text-slate-400">{current.role}, {current.company}</div>
              <div className="text-sm text-emerald-400">{current.location}</div>
            </div>
          </div>

          <div className="flex gap-1 mb-4">
            {[...Array(current.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
            ))}
          </div>

          <blockquote className="text-slate-300 text-lg md:text-xl leading-relaxed mb-6">
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          {current.savings_amount && (
            <div className="pt-4 border-t border-slate-700">
              <span className="text-emerald-400 font-bold text-2xl">{current.savings_amount}</span>
              <span className="text-slate-400 text-sm ml-2">tax savings identified</span>
            </div>
          )}
        </div>

        {testimonials.length > 1 && (
          <>
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-700 hover:bg-slate-600 text-white rounded-full p-2 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-700 hover:bg-slate-600 text-white rounded-full p-2 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-600 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // COMPACT VARIANT: Single card with minimal design
  if (variant === 'compact') {
    const current = testimonials[currentIndex];
    return (
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm hover:border-emerald-500 transition-all">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            {current.avatar_url ? (
              <img
                src={current.avatar_url}
                alt={current.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold text-lg flex-shrink-0">
                {current.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-slate-100">{current.name}</div>
              <div className="text-xs text-slate-400">{current.role}, {current.company}</div>
              <div className="text-xs text-emerald-400">{current.location}</div>
            </div>
          </div>
          <div className="flex gap-1 mb-3">
            {[...Array(current.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
            ))}
          </div>
          <CardDescription className="text-slate-300 text-sm leading-relaxed">
            &ldquo;{current.quote}&rdquo;
          </CardDescription>
          {current.savings_amount && (
            <div className="mt-4 pt-3 border-t border-slate-700">
              <span className="text-emerald-400 font-bold text-lg">{current.savings_amount}</span>
              <span className="text-slate-400 text-xs ml-2">tax savings</span>
            </div>
          )}
        </CardHeader>
      </Card>
    );
  }

  // DEFAULT VARIANT: Grid of 3 testimonial cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {testimonials.slice(0, 3).map((testimonial) => (
        <Card
          key={testimonial.id}
          className="border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10"
        >
          <CardHeader className="px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-3">
              {testimonial.avatar_url ? (
                <img
                  src={testimonial.avatar_url}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold text-lg flex-shrink-0">
                  {testimonial.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-bold text-slate-100">{testimonial.name}</div>
                <div className="text-xs text-slate-400">{testimonial.role}, {testimonial.company}</div>
                <div className="text-xs text-emerald-400">{testimonial.location}</div>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <CardDescription className="text-slate-300 text-sm leading-relaxed">
              &ldquo;{testimonial.quote}&rdquo;
            </CardDescription>
            {testimonial.savings_amount && (
              <div className="mt-4 pt-3 border-t border-slate-700">
                <span className="text-emerald-400 font-bold text-lg">{testimonial.savings_amount}</span>
                <span className="text-slate-400 text-xs ml-2">tax savings</span>
              </div>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
