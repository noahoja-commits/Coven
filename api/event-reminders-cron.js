// Vercel serverless: scheduled "starts soon" push to event attendees.
// Part B of event-reminders. Runs hourly (1h look-ahead window; a 2h schedule would leave gaps).
import { getSupa, initVapid, checkCronAuth, sendToUser } from './_push';

export default async function handler(req, res) {
  if (!checkCronAuth(req, res)) return;
  try { initVapid(); } catch (e) { res.status(500).json({ error: e.message }); return; }

  try {
    const supa = getSupa();
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const { data: events } = await supa
      .from('events')
      .select('id, name, venue')
      .gte('starts_at', now.toISOString())
      .lt('starts_at', oneHourLater.toISOString());

    if (!events?.length) return res.status(200).json({ reminded: 0 });

    const eventById = {};
    events.forEach(e => { eventById[e.id] = e; });

    const { data: rsvps } = await supa
      .from('event_rsvps')
      .select('event_id, user_id')
      .in('event_id', events.map(e => e.id));

    if (!rsvps?.length) return res.status(200).json({ reminded: 0 });

    const userEvents = {};
    rsvps.forEach(r => {
      if (!userEvents[r.user_id]) userEvents[r.user_id] = [];
      userEvents[r.user_id].push(r.event_id);
    });

    let reminded = 0, totalErrors = 0;
    for (const [uid, uEvents] of Object.entries(userEvents)) {
      const ev = eventById[uEvents[0]];
      if (!ev) continue;
      const body = `starting soon · ${ev.name || 'an event'}${ev.venue ? ' at ' + ev.venue : ''}`;
      const { errors } = await sendToUser(uid, { title: 'Coven', body, tag: 'starting-' + ev.id, url: '/' }, 'event_reminder');
      totalErrors += errors.length;
      reminded++;
    }

    if (totalErrors) console.warn('event-reminders-cron: push errors', totalErrors);
    res.status(200).json({ reminded, errors: totalErrors });
  } catch (e) {
    console.error('event-reminders-cron', e?.message || e || 'Unknown error');
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
