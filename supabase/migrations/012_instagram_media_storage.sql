-- Only the server's service role uploads imported media. Public access is read-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'instagram-media', 'instagram-media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;
