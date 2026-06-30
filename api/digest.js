// Vercel serverless: weekly (Thursday 18:00 UTC) digest push.
// "N rites near you this weekend" — city-matched, preference-gated.
import { getSupa, initVapid, checkCronAuth, sendToUsers } from '../lib/push-server.js';

export default async function handler(req, res) {
  if (!checkCronAuth(req, res)) return;
  try { initVapid(); } catch (e) { res.status(500).json({ error: e.message }); return; }

  try {
    const supa = getSupa();

    // 1. Events in the next 3 days
    const today = new Date();
    const start = today.toISOString().slice(0, 10);
    const end = new Date(today);
    end.setDate(end.getDate() + 3);

    const { data: events } = await supa
      .from('event_feed')
      .select('city, name')
      .gte('event_date', start)
      .lte('event_date', end.toISOString().slice(0, 10));

    // 2. Build city → { count } map
    const cityEvents = {};
    (events || []).forEach(e => {
      const city = (e.city || '').trim().toLowerCase();
      if (!city) return;
      cityEvents[city] = (cityEvents[city] || 0) + 1;
    });

    if (!Object.keys(cityEvents).length) return res.status(200).json({ usersNotified: 0, eventsConsidered: 0 });

    // 3. All subscribers + their profiles
    const [subsRes, profilesRes] = await Promise.all([
      supa.from('push_subscriptions').select('user_id'),
      supa.from('profiles').select('id, city'),
    ]);

    const profileCities = {};
    (profilesRes.data || []).forEach(p => { profileCities[p.id] = (p.city || '').trim().toLowerCase(); });

    // 4. Build one digest recipient per subscribed user whose city has events,
    //    then fan out in a single batched, concurrency-bounded send (sendToUsers
    //    dedups per user and gates on the 'digest' preference).
    const seen = new Set();
    const recipients = [];
    for (const sub of (subsRes.data || [])) {
      if (seen.has(sub.user_id)) continue; // one push per user across devices
      seen.add(sub.user_id);
      const userCity = profileCities[sub.user_id];
      if (!userCity || !cityEvents[userCity]) continue;

      const count = cityEvents[userCity];
      const body = `the coven gathers · ${count} ${count === 1 ? 'rite' : 'rites'} near ${userCity} this weekend`;
      recipients.push({ userId: sub.user_id, payload: { title: 'Coven', body, tag: 'digest', url: '/' } });
    }

    const { usersSent, errors } = await sendToUsers(recipients, 'digest');
    if (errors) console.warn('digest: push errors', errors);
    res.status(200).json({ usersNotified: usersSent, eventsConsidered: events?.length || 0, errors });
  } catch (e) {
    console.error('digest', e?.message || e || 'Unknown error');
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
