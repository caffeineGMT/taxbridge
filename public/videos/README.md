# Placeholder Video File

**Status:** ⏳ TO BE CREATED

This is a placeholder for the TaxBridge product demo video.

## Video Requirements:
- **Duration:** 90 seconds max
- **Format:** MP4 (H.264 codec)
- **Size:** <5MB (optimized for web)
- **Resolution:** 1920x1080 or 1280x720
- **Content:**
  1. Problem: H-1B/TN workers overpay on cross-border taxes
  2. Solution: TaxBridge calculator optimizes Foreign Tax Credits
  3. Demo: Show calculator in action (5-step process)
  4. Results: Real user testimonial showing $8,000 saved
  5. CTA: "Start Your Free Calculation"

## Production Checklist:
- [ ] Record screen demo of calculator
- [ ] Add voiceover narration
- [ ] Add captions/subtitles
- [ ] Optimize file size (<5MB)
- [ ] Test on mobile devices
- [ ] Upload to CDN (recommended: Cloudinary or Vimeo)

## Alternative (Recommended):
Host video on **Vimeo** or **YouTube** and embed using iframe to avoid build size bloat.

Update `VideoHero.tsx` to use embedded video:
```typescript
<iframe
  src="https://player.vimeo.com/video/YOUR_VIDEO_ID"
  className="w-full h-full"
  allow="autoplay; fullscreen"
/>
```
