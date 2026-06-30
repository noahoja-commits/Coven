// Vercel serverless: send a web-push for a notification.
// Called by the notifications-insert pg_net trigger (verified by a shared secret).
import { getSupa, initVapid, sendToUser } from './_push';

const REACT_EMOJI = { bat: '🦇', fire: '🔥', skull: '💀', smoke: '💨' };

function bodyFor(n, actor) {
  const trunc = (s) => (s || '').slice(0, 100);
  switch (n.kind) {
    case 'follow':      return `${actor} followed you`;
    case 'react':       return `${actor} reacted ${REACT_EMOJI[n.reaction] || ''} to your post`;
    case 'comment':     return n.body ? `${actor} commented: "${trunc(n.body)}"` : `${actor} commented on your post`;
    case 'dm':          return n.body ? `${actor} whispered: "${trunc(n.body)}"` : `${actor} sent you a whisper`;
    case 'story_react': return `${actor} reacted ${n.reaction || ''} to your story`;
    case 'rsvp':        return n.body ? `${actor} is coming to ${n.body}` : `${actor} is coming to your event`;
    case 'crew_join':   return n.body ? `${actor} joined ${n.body}` : `${actor} joined your crew`;
    case 'mention':     return `${actor} mentioned you`;
    case 'coauthor':    return n.body ? `${actor} co-signed a post with you: "${trunc(n.body)}"` : `${actor} co-signed a post with you`;
    default:            return `${actor} did something`;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  if (!process.env.PUSH_SECRET || req.headers['x-push-secret'] !== process.env.PUSH_SECRET) {
    res.status(401).json({ error: 'unauthorized' }); return;
  }
  try { initVapid(); } catch (e) { res.status(500).json({ error: e.message }); return; }

  try {
    const { notification_id } = req.body || {};
    if (!notification_id) { res.status(400).json({ error: 'notification_id required' }); return; }

    const supa = getSupa();
    const { data: n } = await supa.from('notifications').select('*').eq('id', notification_id).single();
    if (!n) { res.status(404).json({ error: 'not found' }); return; }

    let actor = 'someone';
    if (n.actor_id) {
      const { data: p } = await supa.from('profiles').select('handle').eq('id', n.actor_id).single();
      if (p?.handle) actor = p.handle;
    }

    // sendToUser handles the preference gate internally via the 3rd arg (n.kind)
    const { sent, skipped, errors } = await sendToUser(n.user_id, {
      title: 'Coven',
      body: bodyFor(n, actor),
      tag: n.id,
      url: '/',
    }, n.kind);

    if (errors.length) console.warn('push: non-fatal errors', errors.slice(0, 10));
    res.status(200).json(skipped ? { skipped: 'muted' } : { sent, errors: errors.length });
  } catch (e) {
    console.error('push', e?.message || e || 'Unknown error');
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
