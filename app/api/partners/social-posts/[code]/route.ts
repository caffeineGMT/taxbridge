/**
 * Social Media Posts API for Partners
 * Returns pre-written social media content for LinkedIn, Twitter, Facebook
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAffiliatePartnerByReferralCode } from '@/lib/db/queries/affiliates';
import { generateSocialPosts } from '@/lib/partners/marketing-content';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const partner = getAffiliatePartnerByReferralCode(code);

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    if (partner.status !== 'approved') {
      return NextResponse.json(
        { error: 'Partner not approved' },
        { status: 403 }
      );
    }

    const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'}/p/${code}`;
    const posts = generateSocialPosts(partner.firm_name, referralUrl);

    // Group by platform
    const linkedinPosts = posts.filter(p => p.platform === 'linkedin');
    const twitterPosts = posts.filter(p => p.platform === 'twitter');

    // Return as HTML page
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Social Media Posts - ${partner.firm_name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #10b981; margin-bottom: 10px; }
    h2 { color: #3b82f6; margin-top: 40px; margin-bottom: 20px; }
    .subtitle { color: #94a3b8; margin-bottom: 40px; }
    .post { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .post .content { background: #0f172a; padding: 16px; border-radius: 8px; white-space: pre-wrap; line-height: 1.6; margin-bottom: 12px; }
    .post .hashtags { color: #3b82f6; font-size: 14px; margin-top: 12px; }
    .copy-btn { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .copy-btn:hover { background: #059669; }
    .platform-icon { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
    .linkedin { background: #0077b5; color: white; }
    .twitter { background: #1da1f2; color: white; }
    .header { text-align: center; margin-bottom: 40px; }
    @media print { body { background: white; color: black; } .post { border-color: #ccc; } .copy-btn { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Social Media Content for ${partner.firm_name}</h1>
    <p class="subtitle">Ready-to-post content for your professional networks</p>
  </div>

  <h2>LinkedIn Posts</h2>
  ${linkedinPosts.map((post, idx) => `
    <div class="post">
      <div class="platform-icon linkedin">LinkedIn</div>
      <div class="content" id="linkedin-${idx}">${post.content}</div>
      <div class="hashtags">${post.hashtags.map(h => '#' + h).join(' ')}</div>
      <button class="copy-btn" onclick="copyPost('linkedin-${idx}')">Copy Post</button>
    </div>
  `).join('')}

  <h2>Twitter/X Posts</h2>
  ${twitterPosts.map((post, idx) => `
    <div class="post">
      <div class="platform-icon twitter">Twitter/X</div>
      <div class="content" id="twitter-${idx}">${post.content}</div>
      <div class="hashtags">${post.hashtags.map(h => '#' + h).join(' ')}</div>
      <button class="copy-btn" onclick="copyPost('twitter-${idx}')">Copy Post</button>
    </div>
  `).join('')}

  <div style="margin-top: 40px; padding: 20px; background: #1e293b; border-radius: 12px; border: 1px solid #334155;">
    <h3 style="color: #10b981; margin-top: 0;">Best Practices for Social Sharing</h3>
    <ul style="color: #94a3b8; line-height: 1.8;">
      <li>Post during business hours (9am-5pm) for maximum engagement</li>
      <li>Share 2-3 times per week, not all at once</li>
      <li>Engage with comments to boost visibility</li>
      <li>Tag relevant companies (e.g., @Meta, @Amazon) when appropriate</li>
      <li>Include a professional headshot or firm logo when posting</li>
      <li>Customize the posts to match your firm's voice</li>
    </ul>
  </div>

  <script>
    function copyPost(id) {
      const text = document.getElementById(id).innerText;
      navigator.clipboard.writeText(text);
      event.target.innerText = 'Copied!';
      setTimeout(() => { event.target.innerText = 'Copy Post'; }, 2000);
    }
  </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating social posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
