// Vercel serverless: daily at 15:00 UTC, push a "tonight · {event}" reminder
// to every user who RSVP'd to an event happening today.
// Uses a UTC date-range query (safe for both `date` and `timestamptz` columns).
import { getSupa, initVapid, checkCronAuth, sendToUser } from './_push';

export default async function handler(req, res) {
  if (!checkCronAuth(req, res)) return;
  try { initVapid(); } catch (e) { res.status(500).json({ error: e.message }); return; }

  try {
    const supa = getSupa();

    // 1. Events happening today — UTC range query
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    const { data: events } = await supa
      .from('event_feed')
      .select('id, name, venue')
      .gte('event_date', todayStart.toISOString())
      .lt('event_date', todayEnd.toISOString());

    if (!events?.length) return res.status(200).json({ usersNotified: 0, eventsToday: 0 });

    const eventById = {};
    events.forEach(e => { eventById[e.id] = e; });

    // 2. RSVPs for today's events
    const { data: rsvps } = await supa
      .from('event_rsvps')
      .select('event_id, user_id')
      .in('event_id', events.map(e => e.id));

    if (!rsvps?.length) return res.status(200).json({ usersNotified: 0, eventsToday: events.length });

    // Group: userId → [eventIds]
    const userEvents = {};
    rsvps.forEach(r => {
      if (!userEvents[r.user_id]) userEvents[r.user_id] = [];
      userEvents[r.user_id].push(r.event_id);
    });

    // 3. Send one push per user (first event + "+N more")
    let usersNotified = 0, totalErrors = 0;

    for (const [uid, uEvents] of Object.entries(userEvents)) {
      const ev = eventById[uEvents[0]];
      if (!ev) continue;

      let body = `tonight · ${ev.name || 'an event'}${ev.venue ? ' at ' + ev.venue : ''}`;
      if (uEvents.length > 1) body += ` +${uEvents.length - 1} more`;

      const { errors } = await sendToUser(uid, { title: 'Coven', body, tag: 'event-' + ev.id, url: '/' }, 'event_reminder');
      totalErrors += errors.length;
      usersNotified++;
    }

    if (totalErrors) console.warn('event-reminder: push errors', totalErrors);
    res.status(200).json({ usersNotified, eventsToday: events.length, errors: totalErrors });
  } catch (e) {
    console.error('event-reminder', e?.message || e || 'Unknown error');
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
