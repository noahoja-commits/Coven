# Operator runbook — reviewing reports

Coven auto-hides a post once **3 distinct users** report it (the `feed_posts` view).
That handles the worst case automatically, but content with 1–2 reports, repeat
offenders, and anything **illegal/copyright** need a human look. This is how you do it.

Run these in the **Supabase → SQL Editor** (the `postgres` role bypasses RLS; the app
itself can't list all reports by design). No app deploy needed.

## 1. Priority slice — illegal / copyright first (review immediately)

These categories are legally sensitive and should be actioned regardless of reporter count:

```sql
select r.target_kind, r.target_id, r.reason, r.created_at
from public.reports r
where r.reason ilike 'illegal%' or r.reason ilike 'copyright%'
order by r.created_at desc
limit 100;
```

## 2. Everything else — by report volume

```sql
select r.target_kind,
       r.target_id,
       count(distinct r.reporter_id) as reporters,
       array_agg(distinct r.reason) filter (where r.reason <> '') as reasons,
       max(r.created_at) as last_reported
from public.reports r
group by r.target_kind, r.target_id
order by reporters desc, last_reported desc
limit 100;
```

## 3. Inspect a reported target

```sql
-- target_kind = 'post'
select * from public.posts where id = '<target_id>';
-- target_kind = 'user'
select id, handle, created_at from public.profiles where id = '<target_id>';
```

## 4. Act

- **Remove a post:** `delete from public.posts where id = '<id>';`
- **Remove a user** (cascades to all their content): delete the auth user in
  **Authentication → Users** in the Supabase dashboard, or via the Management API.
  Irreversible — confirm with the inspect queries first.
- **CSAM / content involving minors:** remove immediately, **preserve evidence**, and
  report to **NCMEC** (https://report.cybertip.org) as required by 18 U.S.C. §2258A.
- **DMCA:** if a valid takedown notice arrives at noahoja@gmail.com, remove the work,
  notify the poster (counter-notice possible), and track repeat infringers.

## Notes
- Report reasons are populated by the in-app ReportSheet (`spam`, `harassment`, `hate`,
  `sexual`, `illegal`, `copyright`, `other`).
- An in-app admin triage panel (gated by a `profiles.is_admin` flag + a SECURITY DEFINER
  `admin_reports()` RPC) is a possible future upgrade — deferred; this runbook is v1.
