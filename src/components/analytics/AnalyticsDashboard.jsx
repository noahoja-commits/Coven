import { useState, useEffect } from 'react';
import { X, Eye, Users, MessageCircle, Heart, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { F } from '../../styles/fonts';
import { SectionLabel } from '../shared/SectionLabel';

const DAYS_OPTIONS = [7, 30, 90];

export function AnalyticsDashboard({ onClose, meHandle }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cancellation flag (matches every other fetch effect here): a stale in-flight range
    // switch must not overwrite a newer one, and a resolve after close must not setState.
    let on = true;
    setLoading(true);
    setError(null);
    // The api/analytics.js endpoint reads the session from the Authorization header.
    // In the browser, we need to get the current session token.
    import('../../lib/supabase').then(async ({ supabase }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!on) return;
      if (!session?.access_token) { setError('not signed in'); setLoading(false); return; }

      try {
        const res = await fetch(`/api/analytics?days=${days}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (on) setData(json);
      } catch (e) {
        if (on) setError(e?.message || 'Failed to load analytics');
      }
      if (on) setLoading(false);
    });
    return () => { on = false; };
  }, [days, reload]);

  const maxViews = Math.max(...(data?.viewHistory || []).map(d => d.views), 1);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1 transition-colors">
            <X size={20} />
          </button>
          <BarChart3 size={18} className="text-[#C9A961]" />
          <div className="flex-1 min-w-0">
            <div className="text-[#F5F1E8] text-sm font-semibold" style={F.ui}>analytics</div>
            <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{meHandle}</div>
          </div>
          {/* Day range selector */}
          <div className="flex gap-1">
            {DAYS_OPTIONS.map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`tap px-2 py-1 text-[10px] rounded transition-colors ${
                  days === d ? 'bg-[#8B0000] text-[#F5F1E8]' : 'bg-[#1A1A1A] text-[#6B6B6B] hover:text-[#F5F1E8]'
                }`} style={F.ui}>
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="animate-pulse text-[#6B6B6B] text-xs" style={F.ui}>loading…</div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-48 p-6 text-center">
            <div className="text-[#6B6B6B] text-sm mb-2" style={F.ui}>{error}</div>
            <button onClick={() => setReload(r => r + 1)} className="btn btn-ghost text-xs">retry</button>
          </div>
        )}

        {data && (
          <div className="p-4 space-y-6">
            {/* Overview cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Eye size={16} />} label="Post views" value={data.overview.totalViews} />
              <StatCard icon={<Users size={16} />} label="Profile views" value={data.overview.profileViews} />
              <StatCard icon={<TrendingUp size={16} />} label="Followers" value={data.overview.followers} />
              <StatCard icon={<MessageCircle size={16} />} label="Comments" value={data.overview.totalComments} />
              <StatCard icon={<Heart size={16} />} label="Reactions" value={data.overview.totalReactions} />
              <StatCard icon={<BarChart3 size={16} />} label="Posts" value={data.overview.totalPosts} />
            </div>

            {/* Views trend chart */}
            {data.viewHistory?.length > 0 && (
              <div className="card p-4">
                <SectionLabel rule={false} className="mb-3">views over time</SectionLabel>
                <div className="flex items-end gap-1 h-32">
                  {data.viewHistory.map((d, i) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-[#8B0000] to-[#9E2A33] rounded-t transition-all duration-300 hover:opacity-80"
                        style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: d.views > 0 ? '4px' : '0' }}
                        title={`${d.date}: ${d.views} views`}
                      />
                      {i % Math.max(1, Math.floor(data.viewHistory.length / 6)) === 0 && (
                        <span className="text-[7px] text-[#6B6B6B] -rotate-45 origin-left whitespace-nowrap" style={F.mono}>
                          {d.date.slice(5)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top posts */}
            {data.topPosts?.length > 0 && (
              <div className="card p-4">
                <SectionLabel rule={false} className="mb-3">top posts by views</SectionLabel>
                <div className="space-y-2">
                  {data.topPosts.map((post, i) => (
                    <div key={post.id} className="flex items-center gap-3 p-2 rounded hover:bg-[#1A1A1A] transition-colors">
                      <span className="text-[10px] text-[#6B6B6B] w-4 text-right" style={F.mono}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#F5F1E8] truncate" style={F.serif}>
                          {post.body || '(no text)'}
                        </div>
                        <div className="text-[9px] text-[#6B6B6B]" style={F.mono}>
                          {post.views} views · {post.reactions} reactions · {post.comments} comments
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="text-[#C9A961]">{icon}</div>
      <div>
        <div className="text-[#F5F1E8] text-lg font-semibold" style={F.mono}>{value}</div>
        <div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>{label}</div>
      </div>
    </div>
  );
}
