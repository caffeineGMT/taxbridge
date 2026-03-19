'use client';

import { useState } from 'react';
import { VIDEO_SCRIPTS, POSTING_SCHEDULE, CONTENT_CATEGORIES, HASHTAG_SETS, INFLUENCER_TARGETS, VideoScript } from '@/lib/social-media/video-scripts';
import { GROWTH_TARGETS, SOCIAL_PROFILES, BIO_LINKS } from '@/lib/social-media/analytics-tracker';
import { CONTENT_PILLARS, PRODUCTION_WORKFLOW, generateContentCalendar } from '@/lib/social-media/content-calendar';

type TabId = 'overview' | 'scripts' | 'calendar' | 'analytics' | 'influencers';

export default function SocialMediaDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedScript, setSelectedScript] = useState<VideoScript | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'scripts', label: 'Video Scripts' },
    { id: 'calendar', label: 'Content Calendar' },
    { id: 'analytics', label: 'Growth Targets' },
    { id: 'influencers', label: 'Influencers' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Social Media Command Center</h1>
          <p className="text-slate-400">Instagram Reels & TikTok content management for TaxBridge</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 rounded-lg p-1 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'scripts' && (
          <ScriptsTab
            selectedScript={selectedScript}
            setSelectedScript={setSelectedScript}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />
        )}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'influencers' && <InfluencersTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Scripts" value={VIDEO_SCRIPTS.length.toString()} color="emerald" />
        <StatCard label="Posts/Week" value="3" color="blue" />
        <StatCard label="Target Followers (6mo)" value="5,000" color="purple" />
        <StatCard label="Target Bio CTR" value="10%" color="orange" />
      </div>

      {/* Account Setup */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Instagram Profile */}
        <div className="bg-slate-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />
            Instagram Setup
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Handle</span>
              <span className="font-mono">{SOCIAL_PROFILES.instagram.handle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Display Name</span>
              <span>{SOCIAL_PROFILES.instagram.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category</span>
              <span>{SOCIAL_PROFILES.instagram.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bio Link</span>
              <span className="text-emerald-400 font-mono text-xs">{BIO_LINKS.instagram.shortUrl}</span>
            </div>
            <div className="mt-3 p-3 bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-300 whitespace-pre-line">{SOCIAL_PROFILES.instagram.bio}</p>
            </div>
          </div>
        </div>

        {/* TikTok Profile */}
        <div className="bg-slate-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full" />
            TikTok Setup
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Handle</span>
              <span className="font-mono">{SOCIAL_PROFILES.tiktok.handle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Display Name</span>
              <span>{SOCIAL_PROFILES.tiktok.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category</span>
              <span>{SOCIAL_PROFILES.tiktok.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bio Link</span>
              <span className="text-emerald-400 font-mono text-xs">{BIO_LINKS.tiktok.shortUrl}</span>
            </div>
            <div className="mt-3 p-3 bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-300 whitespace-pre-line">{SOCIAL_PROFILES.tiktok.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posting Schedule */}
      <div className="bg-slate-900 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Posting Schedule (3x/week)</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {POSTING_SCHEDULE.days.map(day => {
            const dayKey = day as keyof typeof POSTING_SCHEDULE.bestTimes.instagram;
            return (
              <div key={day} className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-400 mb-2">{day}</h4>
                <p className="text-xs text-slate-400 mb-2">{POSTING_SCHEDULE.rationale[dayKey]}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Instagram</span>
                    <span>{POSTING_SCHEDULE.bestTimes.instagram[dayKey]}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>TikTok</span>
                    <span>{POSTING_SCHEDULE.bestTimes.tiktok[dayKey]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Pillars */}
      <div className="bg-slate-900 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Content Pillars</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {CONTENT_PILLARS.map(pillar => (
            <div key={pillar.name} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{pillar.name}</h4>
                <span className="text-emerald-400 font-bold">{pillar.percentage}%</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{pillar.description}</p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-emerald-500 rounded-full h-2"
                  style={{ width: `${pillar.percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{pillar.scripts.length} scripts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Production Workflow */}
      <div className="bg-slate-900 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Video Production Workflow</h3>
        <div className="grid md:grid-cols-6 gap-3 mb-6">
          {PRODUCTION_WORKFLOW.steps.map((step, idx) => (
            <div key={step.name} className="bg-slate-800 rounded-lg p-3 relative">
              <div className="text-xs text-emerald-400 font-mono mb-1">Step {idx + 1}</div>
              <h4 className="font-semibold text-sm mb-1">{step.name}</h4>
              <p className="text-xs text-slate-400">{step.duration}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-300">
          <span>Total: <strong className="text-emerald-400">{PRODUCTION_WORKFLOW.totalTime}</strong></span>
          <span className="text-slate-600">|</span>
          <span>{PRODUCTION_WORKFLOW.batchTip}</span>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Equipment Needed</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              {PRODUCTION_WORKFLOW.equipment.map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Editing Tools</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              {PRODUCTION_WORKFLOW.editingTools.map(tool => (
                <li key={tool} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">-</span>
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScriptsTab({
  selectedScript,
  setSelectedScript,
  filterCategory,
  setFilterCategory,
}: {
  selectedScript: VideoScript | null;
  setSelectedScript: (s: VideoScript | null) => void;
  filterCategory: string;
  setFilterCategory: (c: string) => void;
}) {
  const filteredScripts = filterCategory === 'all'
    ? VIDEO_SCRIPTS
    : VIDEO_SCRIPTS.filter(s => s.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filterCategory === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All ({VIDEO_SCRIPTS.length})
        </button>
        {Object.entries(CONTENT_CATEGORIES).map(([key, cat]) => {
          const count = VIDEO_SCRIPTS.filter(s => s.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCategory === key
                  ? 'text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              style={filterCategory === key ? { backgroundColor: cat.color } : {}}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Script list */}
        <div className="space-y-3">
          {filteredScripts.map(script => {
            const cat = CONTENT_CATEGORIES[script.category];
            return (
              <button
                key={script.id}
                onClick={() => setSelectedScript(script)}
                className={`w-full text-left bg-slate-900 rounded-xl p-4 transition-all hover:bg-slate-800 border ${
                  selectedScript?.id === script.id
                    ? 'border-emerald-500'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{script.title}</h4>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    {cat.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{script.hook}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <span>{script.estimatedDuration}s</span>
                  <span>{script.difficulty}</span>
                  <span>{script.targetAudience[0]}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Script detail */}
        {selectedScript ? (
          <div className="bg-slate-900 rounded-xl p-6 sticky top-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-1">{selectedScript.title}</h3>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-slate-400">{selectedScript.estimatedDuration}s</span>
              <span className="text-xs text-slate-600">|</span>
              <span className="text-xs text-slate-400">{selectedScript.difficulty}</span>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  Hook (First 3 seconds)
                </h4>
                <p className="text-sm text-white bg-emerald-900/30 rounded-lg p-3 border border-emerald-700/30">
                  {selectedScript.hook}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                  Body (45 seconds)
                </h4>
                <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {selectedScript.body}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">
                  Call to Action (Last 10 seconds)
                </h4>
                <p className="text-sm text-white bg-orange-900/30 rounded-lg p-3 border border-orange-700/30">
                  {selectedScript.cta}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                  Caption Options
                </h4>
                <ul className="space-y-1">
                  {selectedScript.captions.map((cap, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-purple-400">{i + 1}.</span> {cap}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2">
                  Hashtags
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedScript.hashtags.map(tag => (
                    <span key={tag} className="text-xs text-pink-300 bg-pink-900/20 rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {selectedScript.props && (
                <div>
                  <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2">
                    Visual Props / On-Screen Text
                  </h4>
                  <ul className="space-y-1">
                    {selectedScript.props.map((prop, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-yellow-500">-</span> {prop}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedScript.bRollSuggestions && (
                <div>
                  <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                    B-Roll Suggestions
                  </h4>
                  <ul className="space-y-1">
                    {selectedScript.bRollSuggestions.map((broll, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-cyan-500">-</span> {broll}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Target Audience
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedScript.targetAudience.map(aud => (
                    <span key={aud} className="text-xs text-slate-300 bg-slate-800 rounded-full px-2 py-0.5">
                      {aud}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-sm font-medium transition-colors"
                onClick={() => {
                  const text = `HOOK: ${selectedScript.hook}\n\nBODY: ${selectedScript.body}\n\nCTA: ${selectedScript.cta}\n\nHASHTAGS: ${selectedScript.hashtags.join(' ')}`;
                  navigator.clipboard.writeText(text);
                }}
              >
                Copy Script to Clipboard
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl p-6 flex items-center justify-center text-slate-500">
            <p>Select a script to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarTab() {
  const calendar = generateContentCalendar(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">12-Week Content Calendar</h3>
        <div className="flex gap-2">
          <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded">Both platforms</span>
          <span className="text-xs bg-pink-900/50 text-pink-400 px-2 py-1 rounded">Instagram</span>
          <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">TikTok</span>
        </div>
      </div>

      {calendar.map(week => (
        <div key={week.weekNumber} className="bg-slate-900 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-400 mb-3">
            Week {week.weekNumber} — {week.startDate}
          </h4>
          <div className="grid md:grid-cols-3 gap-3">
            {week.posts.map(post => (
              <div
                key={post.id}
                className={`rounded-lg p-3 border ${
                  post.platform === 'both'
                    ? 'bg-emerald-900/20 border-emerald-700/30'
                    : post.platform === 'instagram'
                    ? 'bg-pink-900/20 border-pink-700/30'
                    : 'bg-slate-800 border-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-300">{post.dayOfWeek}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    post.platform === 'both'
                      ? 'bg-emerald-800 text-emerald-300'
                      : post.platform === 'instagram'
                      ? 'bg-pink-800 text-pink-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {post.platform}
                  </span>
                </div>
                <h5 className="text-sm font-semibold mb-1">{post.script.title}</h5>
                <p className="text-xs text-slate-400 line-clamp-2">{post.script.hook}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                  <span>{post.time}</span>
                  <span>{post.script.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Growth Targets — 12-Month Plan</h3>

      <div className="bg-slate-900 rounded-xl p-6">
        <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-slate-400 border-b border-slate-800 pb-3 mb-3">
          <div>Month</div>
          <div>Followers Target</div>
          <div>Bio Click Rate</div>
          <div>Signup Conversion</div>
        </div>
        {GROWTH_TARGETS.map(target => (
          <div key={target.month} className={`grid grid-cols-4 gap-2 text-sm py-3 border-b border-slate-800/50 ${
            target.month === 6 ? 'bg-emerald-900/20 -mx-6 px-6 rounded-lg' : ''
          }`}>
            <div className="font-medium">
              Month {target.month}
              {target.month === 6 && (
                <span className="text-[10px] text-emerald-400 ml-2">MILESTONE</span>
              )}
            </div>
            <div className="text-emerald-400 font-mono">{target.targetFollowers.toLocaleString()}</div>
            <div className="text-blue-400 font-mono">{target.targetBioClickRate}%</div>
            <div className="text-purple-400 font-mono">{target.targetSignupConversion}%</div>
          </div>
        ))}
      </div>

      {/* Revenue projection */}
      <div className="bg-slate-900 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Projection from Social</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Month 6 Projection</p>
            <p className="text-3xl font-bold text-emerald-400">$4,900</p>
            <p className="text-xs text-slate-500 mt-1">5,000 followers x 10% CTR x 2% conv x $49</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Month 12 Projection</p>
            <p className="text-3xl font-bold text-emerald-400">$29,400</p>
            <p className="text-xs text-slate-500 mt-1">20,000 followers x 12% CTR x 3% conv x $49 (annualized)</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Cost per Video</p>
            <p className="text-3xl font-bold text-blue-400">$0</p>
            <p className="text-xs text-slate-500 mt-1">Founder-created content (90 min/video)</p>
          </div>
        </div>
      </div>

      {/* Hashtag Strategy */}
      <div className="bg-slate-900 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Hashtag Strategy</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {(['instagram', 'tiktok'] as const).map(platform => (
            <div key={platform}>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 capitalize">{platform}</h4>
              {Object.entries(HASHTAG_SETS[platform]).map(([tier, tags]) => (
                <div key={tier} className="mb-3">
                  <p className="text-xs text-slate-400 capitalize mb-1">{tier}</p>
                  <div className="flex flex-wrap gap-1">
                    {tags.map(tag => (
                      <span key={tag} className="text-xs text-slate-300 bg-slate-800 rounded-full px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfluencersTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Influencer Collaboration Targets</h3>

      <div className="grid md:grid-cols-2 gap-4">
        {INFLUENCER_TARGETS.map(inf => (
          <div key={inf.handle} className="bg-slate-900 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">{inf.handle}</h4>
                <p className="text-xs text-slate-400">{inf.platform} | {inf.followers} followers</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                inf.priority === 'high'
                  ? 'bg-red-900/50 text-red-400'
                  : 'bg-yellow-900/50 text-yellow-400'
              }`}>
                {inf.priority} priority
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-slate-500">Niche:</span>
                <span className="text-slate-300">{inf.niche}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500">Collab Type:</span>
                <span className="text-slate-300">{inf.collaborationType}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
  };

  return (
    <div className="bg-slate-900 rounded-xl p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}
