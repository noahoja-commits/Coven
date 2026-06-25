-- De-cartoon pass: rewrite stored colour-emoji avatars (incl. the old '🦇' default) and
-- crew glyphs to monochrome occult marks, so existing souls go monochrome everywhere with
-- no client change. Marks chosen to match the shared GLYPHS set (src/data/glyphs.js).
do $$
declare
  m jsonb := '{
    "🦇":"☾","🕯":"†","🥀":"❦","🌹":"❦","🌙":"☾","🌑":"●","💀":"☥","☠":"☥",
    "⚰":"†","⚱":"†","🔮":"◉","🕸":"✺","🗝":"✦","🦴":"✕","🩸":"†","🐺":"⛧","🌫":"◌"
  }'::jsonb;
  k text;
begin
  for k in select jsonb_object_keys(m) loop
    update public.profiles set avatar = m->>k where avatar = k;
    begin
      update public.crews set glyph = m->>k where glyph = k;
    exception when undefined_table then null; end;
  end loop;
end $$;
