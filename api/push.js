// Vercel serverless: send a web-push for a notification. Called by the
// notifications-insert pg_net trigger (verified by a shared secret).
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const VAPID_PUBLIC = 'BJvKOjGluah854Raon-oa790O523DqelcqKhpACc4fBf05qclYJbO9mf2srhijr3p0X1ABbrX4sv6PyvLGNsjS8';
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const REACT_EMOJI = { bat: '🦇', fire: '🔥', skull: '💀', smoke: '💨' };
function bodyFor(n, actor) {
  switch (n.kind) {
    case 'follow':      return `${actor} followed you`;
    case 'react':       return `${actor} reacted ${REACT_EMOJI[n.reaction] || ''} to your post`;
    case 'comment':     return n.body ? `${actor} commented: "${n.body}"` : `${actor} commented on your post`;
    case 'dm':          return n.body ? `${actor} whispered: "${n.body}"` : `${actor} sent you a whisper`;
    case 'story_react': return `${actor} reacted ${n.reaction || ''} to your story`;
    case 'rsvp':        return n.body ? `${actor} is coming to ${n.body}` : `${actor} is coming to your event`;
    case 'crew_join':   return n.body ? `${actor} joined ${n.body}` : `${actor} joined your crew`;
    case 'mention':     return `${actor} mentioned you`;
    default:            return `${actor} did something`;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  if (!process.env.PUSH_SECRET || req.headers['x-push-secret'] !== process.env.PUSH_SECRET) {
    res.status(401).json({ error: 'unauthorized' }); return;
  }
  if (!process.env.VAPID_PRIVATE_KEY) { res.status(500).json({ error: 'VAPID not configured' }); return; }
  webpush.setVapidDetails('mailto:noahoja@gmail.com', VAPID_PUBLIC, process.env.VAPID_PRIVATE_KEY);

  try {
    const { notification_id } = req.body || {};
    if (!notification_id) { res.status(400).json({ error: 'notification_id required' }); return; }

    const { data: n } = await supa.from('notifications').select('*').eq('id', notification_id).single();
    if (!n) { res.status(404).json({ error: 'not found' }); return; }

    let actor = 'someone';
    if (n.actor_id) {
      const { data: p } = await supa.from('profiles').select('handle').eq('id', n.actor_id).single();
      if (p?.handle) actor = p.handle;
    }
    const payload = JSON.stringify({ title: 'Coven', body: bodyFor(n, actor), tag: n.id, url: '/' });

    const { data: subs } = await supa.from('push_subscriptions').select('*').eq('user_id', n.user_id);
    let sent = 0;
    await Promise.all((subs || []).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        sent++;
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) {
          await supa.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
        }
      }
    }));
    res.status(200).json({ sent });
  } catch (e) {
    console.error('push', e.message);
    res.status(500).json({ error: e.message });
  }
}
