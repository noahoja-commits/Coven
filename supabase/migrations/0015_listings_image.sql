-- Expose listing image_url through the listings_feed view.
create or replace view public.listings_feed as
 SELECT l.id, l.seller_id, l.title, l.price_cents, l.price_mode, l.condition,
    l.category, l.description, l.story_behind, l.status, l.created_at,
    p.handle AS seller_handle, p.avatar AS seller_avatar,
    l.image_url
   FROM listings l
     JOIN profiles p ON p.id = l.seller_id
  WHERE l.status = 'active'::text;

grant select on public.listings_feed to anon, authenticated;
