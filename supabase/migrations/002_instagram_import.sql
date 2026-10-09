alter table public.posts
  add column source text,
  add column source_id text,
  add column source_url text,
  add constraint posts_source_source_id_key unique (source, source_id);
