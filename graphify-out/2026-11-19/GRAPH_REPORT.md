# Graph Report - site-oficial-dk  (2026-11-19)

## Corpus Check
- 309 files · ~140,013 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 9, .example 1, (none) 1)

## Summary
- 1924 nodes · 5014 edges · 98 communities (82 shown, 16 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 122 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d6de02c2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- jsonApiFetch
- MemberFilters.tsx
- AssessmentCreateForm.tsx
- components/CalendarSection.tsx
- package.json
- instagram-apify.ts
- Calendario de atividades
- Midias publicas
- LogsViewer.tsx
- SQL+docs: perfil, rank e acesso a documentos
- createAdminClient
- Troca de contas
- createClient
- Jogos publicos
- AdminDashboard.tsx
- ShareButton.tsx
- assessment-server.ts
- Emblemas de build + docs
- member-notes.ts
- Registro e instrumentacao
- ref_node_fs
- ProfileEditDialog.tsx
- useToast
- public
- Realtime SSE
- security-phrase.test.cjs
- viewer.ts
- public.user_admin_roles
- MediaSection.tsx
- SQL: cadastro por convite
- ConfirmProvider.tsx
- Painel de presenca
- Teste login Google
- Layout raiz e estilos
- next
- Admin de avaliacoes (acoes)
- react
- Home, robots e skeletons
- Cards de jogos
- Config TypeScript
- check-migrations.mjs
- types.ts
- MembersSection
- proxy.ts
- Teste de fluxo de perfil
- 015_graduation_tracks.sql
- lucide-react
- Teste storage Instagram
- typescript
- next.config.ts
- Teste cofre de contas
- Teste app-log
- logs/route.ts
- Sobre e rodape
- Teste mapas de jogos
- Teste anotacoes
- SQL: logs do app
- Teste filtros de membros
- Teste estilo do membro
- Teste auth hardening e TypeScript
- Teste de emblemas
- content-templates.test.cjs
- Teste redirect HTTPS
- Teste titulos Instagram
- callback/route.ts
- NoteList.tsx
- Teste senha
- Teste datas relativas
- Teste SEO
- membro/page.tsx
- SQL+doc: templates de conteudo
- Loading admin
- Loading login
- SQL: zodiaco
- account-email.test.cjs
- graphify-agent-guard.js
- Project instructions
- [...path]/route.ts
- Insignia.tsx
- public.member_notes
- MembersSection.tsx
- password-recovery.test.cjs
- membro/layout.tsx
- public.sync_profile_email
- public.member_notes
- RankInsignia
- 013_admin_authorization_hardening.sql
- 1. Texto em português

## God Nodes (most connected - your core abstractions)
1. `next` - 97 edges
2. `react` - 83 edges
3. `public.profiles` - 76 edges
4. `lucide-react` - 70 edges
5. `createAdminClient()` - 47 edges
6. `createClient()` - 44 edges
7. `jsonApiFetch()` - 43 edges
8. `MembersSection()` - 41 edges
9. `isSameOriginRequest()` - 37 edges
10. `forbidden()` - 36 edges

## Surprising Connections (you probably didn't know these)
- `Audit history of assessment actions` --references--> `public.assessment_audit_log`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Progressive document access (Bronze/Prata/Ouro, min rank)` --references--> `public.can_access_document()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/001_initial_schema.sql
- `Image-generation base prompt for emblems` --semantically_similar_to--> `Medalhoes de arquearia (bronze master + SVG filters for prata/ouro)`  [INFERRED] [semantically similar]
  art/builds/LEIA-ME.md → docs/INSIGNIAS.md
- `Row Level Security` --references--> `public.member_notes`  [EXTRACTED]
  README.md → supabase/migrations/025_member_notes.sql
- `Row Level Security` --references--> `public.site_settings`  [EXTRACTED]
  README.md → supabase/migrations/025_member_notes.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (98 total, 16 thin omitted)

### Community 0 - "jsonApiFetch"
Cohesion: 0.06
Nodes (43): metadata, RegisterPage(), ForgotPasswordPage(), metadata, AuthShell(), ForgotPasswordForm(), handleSubmit(), GoogleIcon() (+35 more)

### Community 1 - "MemberFilters.tsx"
Cohesion: 0.19
Nodes (11): Chip(), Medal(), MemberFilters(), optionLabel(), Props, ChipOption, FilterChips(), SearchField() (+3 more)

### Community 2 - "AssessmentCreateForm.tsx"
Cohesion: 0.10
Nodes (22): AssessmentCreateForm(), goToPending(), setScopes(), submit(), toggleGroup(), toggleScope(), AssessmentPayload, BankMeter() (+14 more)

### Community 3 - "components/CalendarSection.tsx"
Cohesion: 0.18
Nodes (17): CalendarSection(), CalendarViews(), statusLabel, activityDateKey(), CalendarYearView(), eventTimes(), statusLabel, weekdays (+9 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (39): dependencies, ffmpeg-static@^5.3.0, lucide-react@^0.468.0, next@16.4.6, pg@^8.23.1, react@^19.0.0, react-dom@^19.0.0, @supabase/supabase-js@^2.57.0 (+31 more)

### Community 5 - "instagram-apify.ts"
Cohesion: 0.07
Nodes (40): GET(), isDateOnly(), maxDuration, POST(), runSync(), runtime, CRON_SECRET scheduled sync endpoint /api/admin/instagram/sync, FFmpeg video compression (50-250 MB to MP4 H.264/AAC) (+32 more)

### Community 6 - "Calendario de atividades"
Cohesion: 0.07
Nodes (47): JsonBlock(), copy(), CalendarSection(), loadActivityForm(), openEdit(), openNew(), saveActivity(), endOf() (+39 more)

### Community 7 - "Midias publicas"
Cohesion: 0.14
Nodes (23): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+15 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.10
Nodes (20): auditActionLabel, auditCategoryLabel, auditCategoryOptions, formatDate(), levelBadge, levelLabel, levelOptions, LogItem (+12 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.11
Nodes (31): Seguranca (convite, aprovacao, RLS, bucket privado), activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at, games_updated_at (+23 more)

### Community 10 - "createAdminClient"
Cohesion: 0.10
Nodes (35): allRows(), GET(), PATCH(), DELETE(), PATCH(), POST(), runtime, GET() (+27 more)

### Community 11 - "Troca de contas"
Cohesion: 0.13
Nodes (36): DELETE(), GET(), NO_STORE, NO_STORE, POST(), GET(), NO_STORE, LoginPage() (+28 more)

### Community 12 - "createClient"
Cohesion: 0.21
Nodes (26): NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST() (+18 more)

### Community 13 - "Jogos publicos"
Cohesion: 0.11
Nodes (23): GamesPage(), metadata, dynamicParams, GamePage(), generateMetadata(), Props, metadata, SwordplayPage() (+15 more)

### Community 14 - "AdminDashboard.tsx"
Cohesion: 0.10
Nodes (31): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+23 more)

### Community 15 - "ShareButton.tsx"
Cohesion: 0.40
Nodes (5): ShareButton(), flash(), share(), State, title()

### Community 16 - "assessment-server.ts"
Cohesion: 0.05
Nodes (81): PATCH(), POST(), shuffled(), POST(), DELETE(), PATCH(), POST(), POST() (+73 more)

### Community 17 - "Emblemas de build + docs"
Cohesion: 0.09
Nodes (28): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), npm run prepare:emblems script, Image-generation base prompt for emblems (+20 more)

### Community 18 - "member-notes.ts"
Cohesion: 0.11
Nodes (30): MemberNotesPage(), metadata, fold(), NoteComposer(), submit(), NoteItem, canWriteNotes(), canWriteNoteTo() (+22 more)

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.12
Nodes (21): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+13 more)

### Community 20 - "ref_node_fs"
Cohesion: 0.15
Nodes (8): outDir, templates, assert, fs, seo, { test }, ts, vm

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.10
Nodes (28): EditableProfile, EditMemberProfile(), openDialog(), submit(), AnswerBadge(), day(), MemberHomeView(), month() (+20 more)

### Community 22 - "useToast"
Cohesion: 0.10
Nodes (19): AdminTitle(), AttendanceManager(), useConfirm(), DocumentManager(), renderJoin(), renderRules(), newRule(), MediaGalleryManager() (+11 more)

### Community 23 - "public"
Cohesion: 0.11
Nodes (16): Profile completion and rank-request test script, profiles_nickname_unique_idx, public.update_own_member_profile(), public.update_own_member_avatar(), public.update_own_member_profile_with_access_request(), public.check_registration_rate_limit(), public.update_own_member_profile_with_access_request(), public.get_activity_attendance() (+8 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.13
Nodes (24): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+16 more)

### Community 25 - "security-phrase.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), phrase, route(), { test }, ts, vm

### Community 26 - "viewer.ts"
Cohesion: 0.15
Nodes (22): AdminPage(), metadata, MemberActivitiesPage(), metadata, MemberDocumentsPage(), metadata, formatDate(), MemberAssessmentsPage() (+14 more)

### Community 27 - "public.user_admin_roles"
Cohesion: 0.71
Nodes (7): Admin roles: principal, midias, atividades, membros, Bootstrap first ADM Principal via SQL, Four ADM levels action matrix, CMS (papeis de ADM), public.has_admin_role(), public.user_admin_roles, public.has_admin_role()

### Community 28 - "MediaSection.tsx"
Cohesion: 0.15
Nodes (14): formFromPost(), MediaSection(), loadPostForm(), openEdit(), openNew(), removePost(), removeSelectedPosts(), savePost() (+6 more)

### Community 29 - "SQL: cadastro por convite"
Cohesion: 0.22
Nodes (7): public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, public.release_registration_invite(), registration_rate_limits_window_idx, public.check_registration_rate_limit(), public.check_registration_rate_limit()

### Community 30 - "ConfirmProvider.tsx"
Cohesion: 0.24
Nodes (7): AdminDialog(), ConfirmContext, ConfirmOptions, Pending, Drawer(), openModals, useDialogBehavior()

### Community 31 - "Painel de presenca"
Cohesion: 0.14
Nodes (16): activityTime(), AttendanceInsignias(), AttendancePanel(), copyList(), listText(), shareOnWhatsApp(), buildShareText(), dateOptions (+8 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "Layout raiz e estilos"
Cohesion: 0.13
Nodes (9): cinzel, inter, metadata, RootLayout(), InsigniaColorFilters(), QueryActivityFeedback(), QueryProvider(), RealtimeProvider() (+1 more)

### Community 34 - "next"
Cohesion: 0.14
Nodes (9): NO_STORE, POST(), POST(), isMemberStyle(), SUPABASE_COOKIE_OPTIONS, isSupabaseConfigured(), @supabase/ssr@^0.8.0, next (+1 more)

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.15
Nodes (17): AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion(), reviewAnswer() (+9 more)

### Community 36 - "react"
Cohesion: 0.06
Nodes (36): ActivityRow, Correction, Entry, History, Member, readJson(), accessLabel(), ruleLabel() (+28 more)

### Community 37 - "Home, robots e skeletons"
Cohesion: 0.11
Nodes (20): metadata, HomePage(), metadata, CalendarSkeleton(), JSON-LD (organization, Article, BreadcrumbList), lib/seo.ts (canonical domain death-knights.com.br), Post-publication SEO checklist (Search Console, Lighthouse), /robots.txt (+12 more)

### Community 38 - "Cards de jogos"
Cohesion: 0.11
Nodes (17): revalidate, GameCard(), GameDialog(), GameView, noopSubscribe(), catalog, categories, Filter (+9 more)

### Community 39 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "check-migrations.mjs"
Cohesion: 0.05
Nodes (47): Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Activation: migrations 009 and 010 plus three Supabase env vars, Member birthdays calendar (migration 008), Avaliacoes e simulados setup (migrations 009/010), Profile completion with pending access-request approval (migration 011), Orphan accounts without profile (14.7) (+39 more)

### Community 41 - "types.ts"
Cohesion: 0.08
Nodes (31): AdminTab, AssessmentAdminData, assessmentAdminQueryKey, emptyQuestion, MemberSummary, PendingReview, QuestionForm, onTabListKeyDown() (+23 more)

### Community 42 - "MembersSection"
Cohesion: 0.21
Nodes (15): removeActivity(), MembersSection(), canEditAccess(), canManageMember(), decideRegistration(), deleteMember(), editMember(), isOtherPrincipal() (+7 more)

### Community 43 - "proxy.ts"
Cohesion: 0.43
Nodes (6): updateSession(), canonicalHost, cloudflareVisitorScheme(), config, httpsRedirect(), proxy()

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.16
Nodes (15): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+7 more)

### Community 46 - "015_graduation_tracks.sql"
Cohesion: 0.13
Nodes (6): Progressive document access (Bronze/Prata/Ouro, min rank), public.can_access_document(), public.can_access_document(), profiles_sync_graduations, public.can_access_document(), public.sync_profile_graduations()

### Community 47 - "lucide-react"
Cohesion: 0.11
Nodes (10): GalleryItem, MediaGallery(), noopSubscribe(), AvatarCropper(), Point, MemberAvatar(), changePhoto(), removePhoto() (+2 more)

### Community 48 - "Teste storage Instagram"
Cohesion: 0.17
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "typescript"
Cohesion: 0.22
Nodes (7): typescript@^5.7.0, typescript, assert, fs, { test }, ts, vm

### Community 50 - "next.config.ts"
Cohesion: 0.40
Nodes (4): contentSecurityPolicy, nextConfig, securityHeaders, supabaseOrigin

### Community 52 - "Teste cofre de contas"
Cohesion: 0.18
Nodes (8): assert, fs, plain(), raw, { test }, ts, vault, vm

### Community 53 - "Teste app-log"
Cohesion: 0.20
Nodes (10): assert, clientIp, fs, load(), loadAppLog(), loadLogsRoute(), sanitize, { test } (+2 more)

### Community 54 - "logs/route.ts"
Cohesion: 0.24
Nodes (9): FeedRow, GET(), LEVELS, NO_STORE, PERIODS, safeSearch(), SECTIONS, SERVER_SOURCES (+1 more)

### Community 55 - "Sobre e rodape"
Cohesion: 0.31
Nodes (7): AboutPage(), metadata, Footer(), WhatsAppIcon(), formatBuildDate(), getSiteVersion(), SiteVersion

### Community 56 - "Teste mapas de jogos"
Cohesion: 0.18
Nodes (9): assert, expectedMaps, fs, { gameCatalogMetadata }, { gameFieldMaps }, { games }, { test }, ts (+1 more)

### Community 57 - "Teste anotacoes"
Cohesion: 0.18
Nodes (7): access, assert, fs, notes, { test }, ts, vm

### Community 58 - "SQL: logs do app"
Cohesion: 0.31
Nodes (10): app_logs_category_idx, app_logs_created_at_idx, app_logs_level_idx, assessment_audit_log_created_at_idx, audit_log_viewer_permissions, public.app_logs, public.can_view_logs(), public.log_feed (+2 more)

### Community 59 - "Teste filtros de membros"
Cohesion: 0.20
Nodes (7): access, assert, filters, fs, { test }, ts, vm

### Community 60 - "Teste estilo do membro"
Cohesion: 0.22
Nodes (8): assert, fs, load(), route(), style, { test }, ts, vm

### Community 61 - "Teste auth hardening e TypeScript"
Cohesion: 0.13
Nodes (12): assert, exportsMap, fs, { test }, ts, vm, assert, fs (+4 more)

### Community 62 - "Teste de emblemas"
Cohesion: 0.22
Nodes (7): assert, fs, { getBuildKey, getBuildIcon, buildOptions, normalizeBuildName }, { test }, ts, vm, { wreathLeaves, leafTip, leafPath, wreathStemPath, defaultWreath }

### Community 63 - "content-templates.test.cjs"
Cohesion: 0.22
Nodes (7): assert, fs, lib, path, { test }, ts, vm

### Community 64 - "Teste redirect HTTPS"
Cohesion: 0.22
Nodes (6): assert, fs, SITE, { test }, ts, vm

### Community 65 - "Teste titulos Instagram"
Cohesion: 0.22
Nodes (7): assert, { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost }, fs, photo, { test }, ts, vm

### Community 66 - "callback/route.ts"
Cohesion: 0.10
Nodes (30): metadata, ResetPasswordPage(), backToLogin(), GET(), giveBack(), relativeRedirect(), Supabase Site URL and Redirect URLs (/auth/callback), Redirect URL configuration (14.4) (+22 more)

### Community 67 - "NoteList.tsx"
Cohesion: 0.19
Nodes (13): call(), dayLabel(), formatDate(), NoteList(), remove(), run(), saveEdit(), shortWhen() (+5 more)

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 70 - "Teste datas relativas"
Cohesion: 0.25
Nodes (7): assert, fs, moduleExports, now, { test }, ts, vm

### Community 71 - "Teste SEO"
Cohesion: 0.12
Nodes (13): assert, fs, { test }, ts, vm, assert, fs, subjects (+5 more)

### Community 72 - "membro/page.tsx"
Cohesion: 0.28
Nodes (10): MemberPage(), metadata, UpcomingActivity, getMemberBadges, DEFAULT_NOTES_SETTINGS, loadNotesSettings(), getNotesSettings, usesPasswordLogin() (+2 more)

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.60
Nodes (3): content_templates_kind_name_key, content_templates_updated_at, public.content_templates

### Community 82 - "account-email.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), recovery, setup(), { test }, ts, vm

### Community 91 - "[...path]/route.ts"
Cohesion: 0.18
Nodes (10): ALLOWED_PREFIXES, DELETE, GET, HEAD, PATCH, POST, PUT, STRIPPED_REQUEST_HEADERS (+2 more)

### Community 92 - "Insignia.tsx"
Cohesion: 0.14
Nodes (21): GraduationPage(), metadata, GraduationInsignia(), Insignia(), Variant, InsigniaBadge(), NoteSeal(), trackNames (+13 more)

### Community 93 - "public.member_notes"
Cohesion: 0.13
Nodes (19): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, POST(), runtime (+11 more)

### Community 94 - "MembersSection.tsx"
Cohesion: 0.09
Nodes (38): adjustmentsOf(), commanderOptions, Draft, levelOptions, MemberQueue(), startAdjust(), Props, rankOptions (+30 more)

### Community 96 - "password-recovery.test.cjs"
Cohesion: 0.18
Nodes (13): assert, fs, load(), now, recovery, requestRoute(), resetRoute(), run() (+5 more)

### Community 97 - "membro/layout.tsx"
Cohesion: 0.13
Nodes (21): AdminLayout(), metadata, metadata, PrivateLayout(), AdminProviders(), ConfirmProvider(), ToastProvider(), MemberNav() (+13 more)

### Community 101 - "public.member_notes"
Cohesion: 0.29
Nodes (9): dk_broadcast_change, member_notes_author_idx, member_notes_before_write, member_notes_recipient_idx, public.can_write_member_notes(), public.member_notes, public.member_notes_before_write(), public.notes_min_rank() (+1 more)

### Community 102 - "RankInsignia"
Cohesion: 0.30
Nodes (12): activityLinks, Header(), HeaderAccount, BuildInsignia(), GraduationInsignias(), RankInsignia(), MemberHero(), MemberInsignias() (+4 more)

### Community 104 - "013_admin_authorization_hardening.sql"
Cohesion: 0.52
Nodes (6): admin_audit_log_occurred_at_idx, admin_audit_log_target_idx, audit_invites, audit_user_admin_roles, public.admin_audit_log, public.log_admin_audit()

### Community 106 - "1. Texto em português"
Cohesion: 0.25
Nodes (7): 1. Texto em português, 2. Assinatura: SPF, DKIM e DMARC, 3. Frase de segurança (prova dentro do e-mail), Conferir se ficou assinado, E-mails de autenticação (português e assinatura), Projeto hospedado (teste), Servidor próprio (produção)

## Knowledge Gaps
- **5 isolated node(s):** `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`, `Test cleanup`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 666 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `jsonApiFetch`, `components/CalendarSection.tsx`, `package.json`, `instagram-apify.ts`, `Midias publicas`, `createAdminClient`, `Troca de contas`, `createClient`, `Jogos publicos`, `AdminDashboard.tsx`, `assessment-server.ts`, `member-notes.ts`, `Registro e instrumentacao`, `ProfileEditDialog.tsx`, `viewer.ts`, `Layout raiz e estilos`, `Home, robots e skeletons`, `Cards de jogos`, `types.ts`, `proxy.ts`, `lucide-react`, `next.config.ts`, `logs/route.ts`, `Sobre e rodape`, `callback/route.ts`, `NoteList.tsx`, `membro/page.tsx`, `[...path]/route.ts`, `Insignia.tsx`, `public.member_notes`, `MembersSection.tsx`, `membro/layout.tsx`, `RankInsignia`?**
  _High betweenness centrality (0.214) - this node is a cross-community bridge._
- **What connects `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `jsonApiFetch` be split into smaller, more focused modules?**
  _Cohesion score 0.06352087114337568 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `typescript` to `package.json`, `instagram-apify.ts`, `ref_node_fs`, `security-phrase.test.cjs`, `Teste login Google`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `Teste cofre de contas`, `Teste app-log`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `Teste auth hardening e TypeScript`, `Teste de emblemas`, `content-templates.test.cjs`, `Teste redirect HTTPS`, `Teste titulos Instagram`, `Teste senha`, `Teste datas relativas`, `Teste SEO`, `account-email.test.cjs`, `password-recovery.test.cjs`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **Should `AssessmentCreateForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `jsonApiFetch`, `MemberFilters.tsx`, `AssessmentCreateForm.tsx`, `components/CalendarSection.tsx`, `package.json`, `Calendario de atividades`, `Midias publicas`, `LogsViewer.tsx`, `Jogos publicos`, `AdminDashboard.tsx`, `ShareButton.tsx`, `Emblemas de build + docs`, `member-notes.ts`, `ProfileEditDialog.tsx`, `useToast`, `viewer.ts`, `ConfirmProvider.tsx`, `Painel de presenca`, `Layout raiz e estilos`, `Home, robots e skeletons`, `Cards de jogos`, `types.ts`, `lucide-react`, `NoteList.tsx`, `membro/page.tsx`, `Insignia.tsx`, `MembersSection.tsx`, `membro/layout.tsx`, `RankInsignia`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.059800664451827246 - nodes in this community are weakly interconnected._