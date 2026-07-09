// Vercel serverless: analytics data for the current user's dashboard.
// Returns aggregated stats: post views, profile views, follower growth,
// top posts, engagement, and activity timeline.
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '../lib/ratelimit.js';
import { verifyUser } from './_auth.js';

// Per-instance short-TTL cache: this endpoint runs ~15 DB round-trips, and a user
// refreshing their dashboard would otherwise re-run all of them each time. 60s is plenty
// fresh for engagement stats and collapses repeat loads to a single cached response.
const cache = new Map(); // `${userId}:${days}` -> { at: ms, payload }
const CACHE_TTL = 60000;

export default async function handler(req, res) {
  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const user = await verifyUser(req, supa);
  if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }

  const userId = user.id;
  // Clamp to [1, 90]. A non-numeric ?days (e.g. "abc") yields NaN, and NaN flows into
  // `new Date(Date.now() - NaN * 86400000)` → RangeError → the catch below used to echo the
  // raw error to the client. A negative/tiny value also multiplied the per-user cache key space.
  const parsedDays = parseInt(req.query?.days, 10);
  const days = Number.isFinite(parsedDays) ? Math.min(Math.max(parsedDays, 1), 90) : 30;

  if (!rateLimit(`analytics:${userId}`, { limit: 20, windowMs: 60000 })) {
    res.status(429).json({ error: 'too many requests — try again in a moment' }); return;
  }
  const cacheKey = `${userId}:${days}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL) { res.status(200).json(hit.payload); return; }

  try {
    const since = new Date(Date.now() - days * 86400000).toISOString();

    // This user's post ids, fetched once and reused across the queries below.
    const postIds = await getUserPostIds(supa, userId);

    // Run all queries in parallel
    const [
      postViewsRes, profileViewsRes, followersRes,
      postsRes, reactionsRes, commentsRes,
    ] = await Promise.all([
      // Total post views (unique)
      supa.rpc('view_counts', { p_kind: 'post', p_ids: postIds }).catch(() => ({ data: [] })),

      // Profile views (unique) in the period
      supa.from('profile_views').select('created_at', { count: 'exact', head: true })
        .eq('profile_id', userId).gte('created_at', since),

      // Follower count
      supa.from('follows').select('created_at', { count: 'exact', head: true })
        .eq('followee_id', userId),

      // Total posts
      supa.from('posts').select('id', { count: 'exact', head: true })
        .eq('author_id', userId),

      // Total reactions received on posts (table is `reactions`, keyed by post_id)
      supa.from('reactions').select('post_id', { count: 'exact', head: true })
        .in('post_id', postIds),

      // Total comments received
      supa.from('comments').select('id', { count: 'exact', head: true })
        .in('post_id', postIds),
    ]);

    // Compute daily view counts for the chart (sample every 5 days for performance)
    const viewHistory = await getDailyViewCounts(supa, userId, days);

    // Top posts by views
    const topPosts = await getTopPosts(supa, userId);

    const payload = {
      overview: {
        totalViews: postViewsRes.data?.reduce((sum, r) => sum + Number(r.n), 0) || 0,
        profileViews: profileViewsRes.count || 0,
        followers: followersRes.count || 0,
        totalPosts: postsRes.count || 0,
        totalReactions: reactionsRes.count || 0,
        totalComments: commentsRes.count || 0,
      },
      viewHistory,
      topPosts,
    };
    cache.set(cacheKey, { at: Date.now(), payload });
    // Opportunistic eviction so a warm instance seeing many users/day-values doesn't grow forever.
    if (cache.size > 500) {
      const now = Date.now();
      for (const [k, v] of cache) { if (now - v.at >= CACHE_TTL) cache.delete(k); }
    }
    res.status(200).json(payload);
  } catch (e) {
    // Log the detail server-side; never echo raw internal/DB error strings to the client.
    console.error('analytics', e?.message || e);
    res.status(500).json({ error: 'analytics unavailable' });
  }
}

async function getUserPostIds(supa, userId) {
  const { data } = await supa.from('posts').select('id').eq('author_id', userId);
  return (data || []).map(p => p.id);
}

async function getDailyViewCounts(supa, userId, days) {
  const data = [];
  const postIds = await getUserPostIds(supa, userId);
  if (!postIds.length) return data;

  // Sample every 5 days to build a trend line
  for (let i = days; i >= 0; i -= 5) {
    const day = new Date(Date.now() - i * 86400000);
    const dayEnd = new Date(day.getTime() + 86400000);

    const { count } = await supa.from('post_views')
      .select('post_id', { count: 'exact', head: true })
      .in('post_id', postIds)
      .gte('created_at', day.toISOString())
      .lt('created_at', dayEnd.toISOString());

    data.push({
      date: day.toISOString().slice(0, 10),
      views: count || 0,
    });
  }
  return data;
}

async function getTopPosts(supa, userId) {
  const { data: posts } = await supa
    .from('posts')
    .select('id, body, created_at')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!posts?.length) return [];

  const ids = posts.map(p => p.id);

  const [viewsRes, reactionsRes, commentsRes] = await Promise.all([
    supa.rpc('view_counts', { p_kind: 'post', p_ids: ids }),
    supa.from('reactions').select('post_id, kind').in('post_id', ids),
    supa.from('comments').select('post_id').in('post_id', ids),
  ]);

  const viewMap = {};
  (viewsRes.data || []).forEach(v => { viewMap[v.id] = Number(v.n) || 0; });

  const reactionCounts = {};
  (reactionsRes.data || []).forEach(r => {
    if (!reactionCounts[r.post_id]) reactionCounts[r.post_id] = 0;
    reactionCounts[r.post_id]++;
  });

  const commentCounts = {};
  (commentsRes.data || []).forEach(c => {
    if (!commentCounts[c.post_id]) commentCounts[c.post_id] = 0;
    commentCounts[c.post_id]++;
  });

  return posts.map(p => ({
    id: p.id,
    body: (p.body || '').slice(0, 100),
    createdAt: p.created_at,
    views: viewMap[p.id] || 0,
    reactions: reactionCounts[p.id] || 0,
    comments: commentCounts[p.id] || 0,
  })).sort((a, b) => b.views - a.views).slice(0, 5);
}
