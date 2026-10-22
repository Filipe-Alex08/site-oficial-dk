alter table public.posts
  add column if not exists youtube_url text,
  add column if not exists tiktok_url text;
