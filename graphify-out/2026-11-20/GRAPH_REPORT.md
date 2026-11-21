# Graph Report - site-oficial-dk  (2026-11-20)

## Corpus Check
- 316 files · ~142,742 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 12, .example 1, (none) 1)

## Summary
- 1980 nodes · 5246 edges · 108 communities (91 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 126 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c0b14d30`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- jsonApiFetch
- Login com Google (section 14)
- AssessmentCreateForm.tsx
- components/CalendarSection.tsx
- typescript
- instagram-apify.ts
- types.ts
- Midias publicas
- LogsViewer.tsx
- SQL+docs: perfil, rank e acesso a documentos
- createAdminClient
- Troca de contas
- createClient
- graduacoes/page.tsx
- AdminDashboard.tsx
- react
- assessment-server.ts
- Emblemas de build + docs
- member-notes.ts
- Registro e instrumentacao
- ref_node_fs
- ProfileEditDialog.tsx
- AttendanceManager.tsx
- public
- Realtime SSE
- security-phrase.test.cjs
- viewer.ts
- Configuracao do Site Oficial do DK (SETUP)
- MediaSection
- public.registration_rate_limits
- DocumentManager
- Painel de presenca
- Teste login Google
- app/layout.tsx
- next
- Admin de avaliacoes (acoes)
- SettingsSection.tsx
- Home, robots e skeletons
- Cards de jogos
- Config TypeScript
- steps
- types.ts
- MembersSection
- proxy.ts
- Teste de fluxo de perfil
- assessments.ts
- ProfileEditDialog.tsx
- MemberQueue.tsx
- Teste storage Instagram
- ref_node_fs
- next
- instagram-storage.ts
- Teste cofre de contas
- Teste app-log
- logs/route.ts
- PageHero
- Teste mapas de jogos
- Teste anotacoes
- SQL: logs do app
- Teste filtros de membros
- Teste estilo do membro
- Teste auth hardening e TypeScript
- Teste de emblemas
- email-templates-deploy.test.cjs
- public.user_admin_roles
- Teste titulos Instagram
- callback/route.ts
- NoteList.tsx
- Teste senha
- public.member_notes
- Teste datas relativas
- ref_node_assert
- viewer.ts
- SQL+doc: templates de conteudo
- check-migrations.mjs
- Loading admin
- Loading login
- SQL: zodiaco
- account-email.test.cjs
- graphify-agent-guard.js
- Project instructions
- scripts
- Insignia.tsx
- public.member_notes
- MembersSection.tsx
- react-dom
- password-recovery.test.cjs
- membro/layout.tsx
- sync/route.ts
- prepare-build-emblems.mjs
- https-redirect.test.cjs
- instagram-sync.ts
- security-phrase.ts
- 015_graduation_tracks.sql
- next.config.ts
- ref_node_path
- 1. Texto em português
- AssessmentRunnerLoaded

## God Nodes (most connected - your core abstractions)
1. `next` - 99 edges
2. `react` - 86 edges
3. `public.profiles` - 76 edges
4. `lucide-react` - 72 edges
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
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/011_member_access_requests.sql
- `Progressive document access (Bronze/Prata/Ouro, min rank)` --references--> `public.can_access_document()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/015_graduation_tracks.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/015_graduation_tracks.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (108 total, 17 thin omitted)

### Community 0 - "jsonApiFetch"
Cohesion: 0.12
Nodes (23): GoogleIcon(), LoginForm(), handleGoogle(), handleSubmit(), RegistrationForm(), submit(), initialsOf(), SavedAccounts() (+15 more)

### Community 1 - "Login com Google (section 14)"
Cohesion: 0.15
Nodes (15): Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Supabase Site URL and Redirect URLs (/auth/callback), Orphan accounts without profile (14.7), Disable public sign-ups (14.5), .env.local keys (Supabase URL, publishable key, secret key, site URL), Delete Google-created account when no profile exists (/auth/callback) (+7 more)

### Community 2 - "AssessmentCreateForm.tsx"
Cohesion: 0.10
Nodes (20): AssessmentCreateForm(), goToPending(), setScopes(), submit(), toggleGroup(), toggleScope(), AssessmentPayload, BankMeter() (+12 more)

### Community 3 - "components/CalendarSection.tsx"
Cohesion: 0.17
Nodes (16): CalendarSection(), CalendarViews(), statusLabel, activityDateKey(), CalendarYearView(), eventTimes(), statusLabel, weekdays (+8 more)

### Community 4 - "typescript"
Cohesion: 0.14
Nodes (18): devDependencies, eslint@^9.0.0, eslint-config-next@^16.4.6, @types/node@^22.0.0, @types/pg@^8.23.1, @types/react@^19.0.0, @types/react-dom@^19.0.0, typescript@^5.7.0 (+10 more)

### Community 5 - "instagram-apify.ts"
Cohesion: 0.25
Nodes (13): buildInstagramTitle(), fallbackTitle(), fetchInstagramPosts(), hasWords(), InstagramScrapedPost, isVideo(), normalizeInstagramPost(), normalizePermalink() (+5 more)

### Community 6 - "types.ts"
Cohesion: 0.07
Nodes (51): CalendarSection(), loadActivityForm(), openEdit(), openNew(), saveActivity(), endOf(), monthLabel(), Period (+43 more)

### Community 7 - "Midias publicas"
Cohesion: 0.12
Nodes (27): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+19 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.10
Nodes (22): auditActionLabel, auditCategoryLabel, auditCategoryOptions, formatDate(), JsonBlock(), copy(), levelBadge, levelLabel (+14 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.11
Nodes (33): Seguranca (convite, aprovacao, RLS, bucket privado), activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at, games_updated_at (+25 more)

### Community 10 - "createAdminClient"
Cohesion: 0.09
Nodes (39): allRows(), GET(), PATCH(), DELETE(), PATCH(), POST(), runtime, GET() (+31 more)

### Community 11 - "Troca de contas"
Cohesion: 0.14
Nodes (34): DELETE(), GET(), NO_STORE, NO_STORE, POST(), GET(), NO_STORE, LoginPage() (+26 more)

### Community 12 - "createClient"
Cohesion: 0.18
Nodes (29): NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST() (+21 more)

### Community 13 - "graduacoes/page.tsx"
Cohesion: 0.10
Nodes (32): GraduationPage(), metadata, tiers, tracks, GamesPage(), metadata, dynamicParams, GamePage() (+24 more)

### Community 14 - "AdminDashboard.tsx"
Cohesion: 0.10
Nodes (32): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+24 more)

### Community 15 - "react"
Cohesion: 0.08
Nodes (21): accessLabel(), ruleLabel(), RulesState, icons, lifetime, ToastAction, ToastApi, ToastContext (+13 more)

### Community 16 - "assessment-server.ts"
Cohesion: 0.06
Nodes (67): PATCH(), POST(), shuffled(), POST(), DELETE(), PATCH(), POST(), POST() (+59 more)

### Community 17 - "Emblemas de build + docs"
Cohesion: 0.14
Nodes (22): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), Image-generation base prompt for emblems, BuildEmblem() (+14 more)

### Community 18 - "member-notes.ts"
Cohesion: 0.13
Nodes (26): MemberNotesPage(), metadata, isCommander(), canWriteNotes(), canWriteNoteTo(), commandedTracks(), DEFAULT_NOTES_SETTINGS, hasRankAccess() (+18 more)

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.12
Nodes (21): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+13 more)

### Community 20 - "ref_node_fs"
Cohesion: 0.25
Nodes (6): assert, fs, seo, { test }, ts, vm

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.20
Nodes (13): AnswerBadge(), day(), MemberHomeView(), month(), time(), UpcomingActivity, TrackGroup(), houseFor() (+5 more)

### Community 22 - "AttendanceManager.tsx"
Cohesion: 0.16
Nodes (17): useAdminData(), AdminTitle(), ActivityRow, AttendanceManager(), Correction, Entry, History, Member (+9 more)

### Community 23 - "public"
Cohesion: 0.12
Nodes (12): profiles_nickname_unique_idx, public.update_own_member_profile(), public.update_own_member_avatar(), public.update_own_member_profile_with_access_request(), public.check_registration_rate_limit(), public.can_access_document(), profiles_sync_houses, public.sync_profile_houses() (+4 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.07
Nodes (39): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+31 more)

### Community 25 - "security-phrase.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), phrase, route(), { test }, ts, vm

### Community 26 - "viewer.ts"
Cohesion: 0.17
Nodes (20): MemberActivitiesPage(), metadata, MemberDocumentsPage(), metadata, formatDate(), MemberAssessmentsPage(), metadata, AssessmentAttemptPage() (+12 more)

### Community 27 - "Configuracao do Site Oficial do DK (SETUP)"
Cohesion: 0.11
Nodes (20): Member birthdays calendar (migration 008), Private bucket dk-documents with temporary links, Profile completion with pending access-request approval (migration 011), Content templates for posts and activities (migration 021), Documentos e PDFs internos (progressive access), Validation order (18 steps), Configuracao do Site Oficial do DK (SETUP), Supabase project creation (+12 more)

### Community 28 - "MediaSection"
Cohesion: 0.11
Nodes (18): ConfirmContext, ConfirmOptions, Pending, useConfirm(), FormSectionHead(), MediaGalleryManager(), formFromPost(), MediaSection() (+10 more)

### Community 29 - "public.registration_rate_limits"
Cohesion: 0.22
Nodes (7): public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, public.release_registration_invite(), registration_rate_limits_window_idx, public.check_registration_rate_limit(), public.check_registration_rate_limit()

### Community 30 - "DocumentManager"
Cohesion: 0.18
Nodes (5): DocumentManager(), renderJoin(), renderRules(), newRule(), RowMenu()

### Community 31 - "Painel de presenca"
Cohesion: 0.15
Nodes (15): activityTime(), AttendancePanel(), copyList(), listText(), shareOnWhatsApp(), buildShareText(), dateOptions, Filter (+7 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "app/layout.tsx"
Cohesion: 0.06
Nodes (24): cinzel, inter, metadata, RootLayout(), Footer(), motto, HeaderAccount, InsigniaColorFilters() (+16 more)

### Community 34 - "next"
Cohesion: 0.12
Nodes (14): ALLOWED_PREFIXES, DELETE, GET, HEAD, PATCH, POST, PUT, STRIPPED_REQUEST_HEADERS (+6 more)

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.11
Nodes (25): AdminTab, AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion() (+17 more)

### Community 36 - "SettingsSection.tsx"
Cohesion: 0.17
Nodes (10): rankOptions, saveNotes(), settingsKey, SettingsSection(), SettingsTab, tabs, onTabListKeyDown(), Select() (+2 more)

### Community 37 - "Home, robots e skeletons"
Cohesion: 0.09
Nodes (25): anchors, EventKind, EventsPage(), externalEvents, hostedOptions, internalEvents, metadata, HomePage() (+17 more)

### Community 38 - "Cards de jogos"
Cohesion: 0.11
Nodes (17): revalidate, GameCard(), GameDialog(), GameView, noopSubscribe(), catalog, categories, Filter (+9 more)

### Community 39 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "steps"
Cohesion: 0.12
Nodes (15): Future deployment (env vars, lint, build), runs-on, steps, jobs, build, name, on, pull_request (+7 more)

### Community 41 - "types.ts"
Cohesion: 0.10
Nodes (25): AssessmentPayload, SafeQuestion, SavedAnswer, assessmentAssignmentStatusLabels, documentAudienceOptions, GraduationFields, memberKindLabels, memberKindOptions (+17 more)

### Community 42 - "MembersSection"
Cohesion: 0.12
Nodes (23): removeActivity(), createInvite(), disableInvite(), MembersSection(), canEditAccess(), canManageMember(), decideRegistration(), deleteMember() (+15 more)

### Community 43 - "proxy.ts"
Cohesion: 0.43
Nodes (6): updateSession(), canonicalHost, cloudflareVisitorScheme(), config, httpsRedirect(), proxy()

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.16
Nodes (15): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+7 more)

### Community 45 - "assessments.ts"
Cohesion: 0.22
Nodes (18): optionalText(), validateAssessmentDefinition(), validateAssessmentQuestion(), ValidationResult, assessmentQuestionCountOptions, assessmentQuestionTypeOptions, assessmentSelectionModeOptions, assessmentTrackOptions (+10 more)

### Community 46 - "ProfileEditDialog.tsx"
Cohesion: 0.14
Nodes (21): ResetPasswordForm(), handleSubmit(), EditableProfile, EditMemberProfile(), openDialog(), submit(), countProfileChanges(), EMPTY_PASSWORD (+13 more)

### Community 47 - "MemberQueue.tsx"
Cohesion: 0.10
Nodes (23): adjustmentsOf(), commanderOptions, Draft, levelOptions, MemberQueue(), startAdjust(), Props, rankOptions (+15 more)

### Community 48 - "Teste storage Instagram"
Cohesion: 0.17
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "ref_node_fs"
Cohesion: 0.11
Nodes (13): apply, body, dir, subjects, outDir, templates, assert, fs (+5 more)

### Community 50 - "next"
Cohesion: 0.17
Nodes (8): metadata, RegisterPage(), ForgotPasswordPage(), metadata, AuthShell(), ForgotPasswordForm(), handleSubmit(), next

### Community 51 - "instagram-storage.ts"
Cohesion: 0.21
Nodes (10): FFmpeg video compression (50-250 MB to MP4 H.264/AAC), instagram-media public bucket (permanent copies), archiveInstagramPost(), download(), INSTAGRAM_BUCKET, InstagramMediaArchiveError, MIME_EXTENSIONS, sourceUrl() (+2 more)

### Community 52 - "Teste cofre de contas"
Cohesion: 0.18
Nodes (8): assert, fs, plain(), raw, { test }, ts, vault, vm

### Community 53 - "Teste app-log"
Cohesion: 0.20
Nodes (10): assert, clientIp, fs, load(), loadAppLog(), loadLogsRoute(), sanitize, { test } (+2 more)

### Community 54 - "logs/route.ts"
Cohesion: 0.24
Nodes (9): FeedRow, GET(), LEVELS, NO_STORE, PERIODS, safeSearch(), SECTIONS, SERVER_SOURCES (+1 more)

### Community 55 - "PageHero"
Cohesion: 0.16
Nodes (13): Loading(), metadata, PrivacyPage(), AboutPage(), facts, metadata, steps, values (+5 more)

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
Nodes (11): assert, fs, { test }, ts, vm, assert, exportsMap, fs (+3 more)

### Community 62 - "Teste de emblemas"
Cohesion: 0.22
Nodes (7): assert, fs, { getBuildKey, getBuildIcon, buildOptions, normalizeBuildName }, { test }, ts, vm, { wreathLeaves, leafTip, leafPath, wreathStemPath, defaultWreath }

### Community 63 - "email-templates-deploy.test.cjs"
Cohesion: 0.18
Nodes (8): assert, fs, os, path, python, { spawnSync }, subjects, { test }

### Community 64 - "public.user_admin_roles"
Cohesion: 0.31
Nodes (13): Admin roles: principal, midias, atividades, membros, Bootstrap first ADM Principal via SQL, Four ADM levels action matrix, CMS (papeis de ADM), public.has_admin_role(), public.user_admin_roles, admin_audit_log_occurred_at_idx, admin_audit_log_target_idx (+5 more)

### Community 65 - "Teste titulos Instagram"
Cohesion: 0.22
Nodes (7): assert, { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost }, fs, photo, { test }, ts, vm

### Community 66 - "callback/route.ts"
Cohesion: 0.10
Nodes (29): metadata, ResetPasswordPage(), backToLogin(), GET(), giveBack(), relativeRedirect(), ActiveSnapshot, callbackFailureCode() (+21 more)

### Community 67 - "NoteList.tsx"
Cohesion: 0.15
Nodes (16): call(), dayLabel(), formatDate(), NoteItem, NoteList(), remove(), run(), saveEdit() (+8 more)

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "public.member_notes"
Cohesion: 0.29
Nodes (9): dk_broadcast_change, member_notes_author_idx, member_notes_before_write, member_notes_recipient_idx, public.can_write_member_notes(), public.member_notes, public.member_notes_before_write(), public.notes_min_rank() (+1 more)

### Community 70 - "Teste datas relativas"
Cohesion: 0.25
Nodes (7): assert, fs, moduleExports, now, { test }, ts, vm

### Community 71 - "ref_node_assert"
Cohesion: 0.09
Nodes (19): assert, fs, subjects, { test }, assert, fs, moduleExports, { test } (+11 more)

### Community 72 - "viewer.ts"
Cohesion: 0.33
Nodes (8): AdminPage(), metadata, MemberPage(), metadata, Unavailable(), getMemberBadges, getNotesSettings, getViewer

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.36
Nodes (5): content_templates_kind_name_key, content_templates_updated_at, public.content_templates, public.sync_profile_email(), sync_profile_email

### Community 74 - "check-migrations.mjs"
Cohesion: 0.24
Nodes (11): Ordered migrations 001-012 applied manually in SQL Editor, byPrefix, duplicates, isKnown(), known, KNOWN_DUPLICATES, migrationsDir, unexpected (+3 more)

### Community 82 - "account-email.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), recovery, setup(), { test }, ts, vm

### Community 91 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, apply:email-templates, build, check:migrations, check:realtime, dev, lint, prepare:emblems (+2 more)

### Community 92 - "Insignia.tsx"
Cohesion: 0.18
Nodes (24): AttendanceInsignias(), BuildInsignia(), GraduationInsignia(), GraduationInsignias(), Insignia(), RankInsignia(), Variant, InsigniaBadge() (+16 more)

### Community 93 - "public.member_notes"
Cohesion: 0.14
Nodes (15): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, denied(), POST() (+7 more)

### Community 94 - "MembersSection.tsx"
Cohesion: 0.11
Nodes (25): Chip(), Medal(), MemberFilters(), optionLabel(), Props, MemberAccessForm, MemberStatusFilter, statusFilters (+17 more)

### Community 95 - "react-dom"
Cohesion: 0.40
Nodes (3): GalleryItem, MediaGallery(), noopSubscribe()

### Community 96 - "password-recovery.test.cjs"
Cohesion: 0.18
Nodes (13): assert, fs, load(), now, recovery, requestRoute(), resetRoute(), run() (+5 more)

### Community 97 - "membro/layout.tsx"
Cohesion: 0.11
Nodes (23): AdminLayout(), metadata, metadata, metadata, PrivateLayout(), AdminProviders(), ConfirmProvider(), ToastProvider() (+15 more)

### Community 98 - "sync/route.ts"
Cohesion: 0.31
Nodes (8): GET(), isDateOnly(), maxDuration, POST(), runSync(), runtime, CRON_SECRET scheduled sync endpoint /api/admin/instagram/sync, Instagram import via Apify (apify/instagram-scraper)

### Community 99 - "prepare-build-emblems.mjs"
Cohesion: 0.25
Nodes (6): npm run prepare:emblems script, public/images/builds (served webp output), BUILD_KEYS, done, EXTENSIONS, missing

### Community 100 - "https-redirect.test.cjs"
Cohesion: 0.22
Nodes (6): assert, fs, SITE, { test }, ts, vm

### Community 101 - "instagram-sync.ts"
Cohesion: 0.48
Nodes (6): isLegacyInstagramTitle(), ensureInstagramBucket(), refreshExistingPost(), saoPauloDate(), ScrapedPost, syncInstagram()

### Community 102 - "security-phrase.ts"
Cohesion: 0.33
Nodes (6): readSecurityPhrase(), SECURITY_PHRASE_KEY, SECURITY_PHRASE_MAX, SECURITY_PHRASE_MIN, SecurityPhraseResult, validateSecurityPhrase()

### Community 104 - "next.config.ts"
Cohesion: 0.40
Nodes (4): contentSecurityPolicy, nextConfig, securityHeaders, supabaseOrigin

### Community 105 - "ref_node_path"
Cohesion: 0.40
Nodes (3): fs, path, ts

### Community 106 - "1. Texto em português"
Cohesion: 0.25
Nodes (7): 1. Texto em português, 2. Assinatura: SPF, DKIM e DMARC, 3. Frase de segurança (prova dentro do e-mail), Conferir se ficou assinado, E-mails de autenticação (português e assinatura), Projeto hospedado (teste), Servidor próprio (produção): automático no deploy

## Knowledge Gaps
- **5 isolated node(s):** `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`, `Test cleanup`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 700 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `jsonApiFetch`, `components/CalendarSection.tsx`, `typescript`, `Midias publicas`, `createAdminClient`, `Troca de contas`, `createClient`, `graduacoes/page.tsx`, `AdminDashboard.tsx`, `react`, `assessment-server.ts`, `member-notes.ts`, `Registro e instrumentacao`, `ProfileEditDialog.tsx`, `Realtime SSE`, `viewer.ts`, `app/layout.tsx`, `next`, `Home, robots e skeletons`, `Cards de jogos`, `types.ts`, `MembersSection`, `proxy.ts`, `ProfileEditDialog.tsx`, `MemberQueue.tsx`, `logs/route.ts`, `PageHero`, `callback/route.ts`, `NoteList.tsx`, `viewer.ts`, `Insignia.tsx`, `public.member_notes`, `MembersSection.tsx`, `membro/layout.tsx`, `sync/route.ts`, `next.config.ts`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **What connects `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `jsonApiFetch` be split into smaller, more focused modules?**
  _Cohesion score 0.11954022988505747 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `jsonApiFetch`, `AssessmentCreateForm.tsx`, `components/CalendarSection.tsx`, `typescript`, `types.ts`, `Midias publicas`, `LogsViewer.tsx`, `graduacoes/page.tsx`, `AdminDashboard.tsx`, `Emblemas de build + docs`, `ProfileEditDialog.tsx`, `AttendanceManager.tsx`, `Realtime SSE`, `viewer.ts`, `MediaSection`, `Painel de presenca`, `app/layout.tsx`, `Admin de avaliacoes (acoes)`, `SettingsSection.tsx`, `Home, robots e skeletons`, `Cards de jogos`, `types.ts`, `MembersSection`, `ProfileEditDialog.tsx`, `MemberQueue.tsx`, `next`, `PageHero`, `NoteList.tsx`, `viewer.ts`, `Insignia.tsx`, `MembersSection.tsx`, `react-dom`, `membro/layout.tsx`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Should `AssessmentCreateForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10461538461538461 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `typescript` to `ref_node_fs`, `security-phrase.test.cjs`, `Teste login Google`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `ref_node_fs`, `Teste cofre de contas`, `Teste app-log`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `Teste auth hardening e TypeScript`, `Teste de emblemas`, `Teste titulos Instagram`, `Teste senha`, `Teste datas relativas`, `ref_node_assert`, `account-email.test.cjs`, `password-recovery.test.cjs`, `https-redirect.test.cjs`, `ref_node_path`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Should `typescript` be split into smaller, more focused modules?**
  _Cohesion score 0.14210526315789473 - nodes in this community are weakly interconnected._