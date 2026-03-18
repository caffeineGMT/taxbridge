'use client';

import { Star, Play, Building2, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

export interface TestimonialData {
  id: number;
  name: string;
  role?: string;
  company?: string;
  location?: string;
  photo_url?: string;
  testimonial_text: string;
  savings_amount?: number;
  rating: number;
  video_url?: string;
}

interface TestimonialsSectionProps {
  testimonials: TestimonialData[];
  stats?: {
    totalCount: number;
    averageSavings: number;
    averageRating: number;
    fiveStarCount: number;
  };
  showTrustBadges?: boolean;
  featured?: boolean;
}

export function TestimonialsSection({
  testimonials,
  stats,
  showTrustBadges = true,
  featured = false,
}: TestimonialsSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-slate-900/50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            {featured ? 'Success Stories' : 'Real Results from H-1B/TN Workers'}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Don't just take our word for it - hear from tech workers who saved thousands on cross-border taxes
          </p>
        </div>

        {/* Trust Badges */}
        {showTrustBadges && stats && (
          <TrustBadges stats={stats} />
        )}

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBadges({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
        <div className="text-3xl font-bold text-emerald-400 mb-2">
          {stats.totalCount}+
        </div>
        <div className="text-sm text-slate-400">Happy Customers</div>
      </div>

      <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
        <div className="text-3xl font-bold text-emerald-400 mb-2">
          ${(stats.averageSavings / 1000).toFixed(1)}K
        </div>
        <div className="text-sm text-slate-400">Average Savings</div>
      </div>

      <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
        <div className="flex items-center justify-center gap-1 mb-2">
          <span className="text-3xl font-bold text-emerald-400">{stats.averageRating}</span>
          <Star className="h-5 w-5 fill-emerald-400 text-emerald-400" />
        </div>
        <div className="text-sm text-slate-400">Average Rating</div>
      </div>

      <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
        <div className="text-3xl font-bold text-emerald-400 mb-2">
          {stats.fiveStarCount}+
        </div>
        <div className="text-sm text-slate-400">5-Star Reviews</div>
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <Card className="group border-slate-800 bg-slate-800/50 backdrop-blur-sm hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
      <CardContent className="p-6">
        {/* Video Thumbnail */}
        {testimonial.video_url && !showVideo && (
          <div
            onClick={() => setShowVideo(true)}
            className="relative mb-4 rounded-lg overflow-hidden cursor-pointer group/video"
          >
            <div className="aspect-video bg-slate-900 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 group-hover/video:from-emerald-500/30 group-hover/video:to-blue-500/30 transition-all" />
              <Play className="h-16 w-16 text-white drop-shadow-lg group-hover/video:scale-110 transition-transform" />
            </div>
          </div>
        )}

        {/* Video Player */}
        {testimonial.video_url && showVideo && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <iframe
              src={testimonial.video_url}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Header with Avatar */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-slate-950 font-bold text-lg flex-shrink-0">
            {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-100 truncate">
              {testimonial.name}
            </div>
            {testimonial.role && (
              <div className="text-sm text-slate-400 truncate">
                {testimonial.role}
              </div>
            )}
            {testimonial.company && (
              <div className="flex items-center gap-1 text-sm text-emerald-400 mt-1">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{testimonial.company}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating
                  ? 'fill-emerald-400 text-emerald-400'
                  : 'fill-slate-700 text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Testimonial Text */}
        <p className="text-slate-300 mb-4 leading-relaxed">
          "{testimonial.testimonial_text}"
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          {testimonial.location && (
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <MapPin className="h-3 w-3" />
              <span>{testimonial.location}</span>
            </div>
          )}

          {testimonial.savings_amount && (
            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-400">
              <DollarSign className="h-4 w-4" />
              <span>Saved ${testimonial.savings_amount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanyLogos() {
  const companies = [
    { name: 'Meta', logo: 'M' },
    { name: 'Google', logo: 'G' },
    { name: 'Amazon', logo: 'A' },
    { name: 'Microsoft', logo: 'M' },
    { name: 'Salesforce', logo: 'S' },
  ];

  return (
    <div className="py-8">
      <div className="text-center mb-6">
        <p className="text-sm text-slate-400 uppercase tracking-wide">
          Trusted by engineers at
        </p>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {companies.map((company) => (
          <div
            key={company.name}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-2xl font-bold text-slate-300 hover:from-emerald-500/20 hover:to-blue-500/20 hover:border-emerald-500/50 transition-all"
            title={company.name}
          >
            {company.logo}
          </div>
        ))}
      </div>
    </div>
  );
}
