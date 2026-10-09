alter table public.posts
  add constraint posts_source_source_url_key unique (source, source_url);
