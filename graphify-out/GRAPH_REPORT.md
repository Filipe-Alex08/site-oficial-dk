# Graph Report - site-oficial-dk  (2026-11-27)

## Corpus Check
- 329 files · ~152,155 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 12, .example 1, (none) 1)

## Summary
- 2048 nodes · 5417 edges · 114 communities (94 shown, 20 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 125 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b819959f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NoteList.tsx
- callback/route.ts
- AssessmentCreateForm.tsx
- viewer.ts
- package.json
- swordplay/page.tsx
- membro/layout.tsx
- Midias publicas
- LogsViewer.tsx
- SQL+docs: perfil, rank e acesso a documentos
- createAdminClient
- Troca de contas
- next
- PageHero
- AdminDashboard.tsx
- MediaSection.tsx
- member-notes.ts
- BuildEmblem.tsx
- Header.tsx
- Registro e instrumentacao
- sobre/page.tsx
- ProfileEditDialog.tsx
- MemberQueue.tsx
- public
- Realtime SSE
- security-phrase.test.cjs
- LoginForm.tsx
- Configuracao do Site Oficial do DK (SETUP)
- useToast
- public.registration_rate_limits
- ProfileEditDialog
- AttendancePanel.tsx
- Teste login Google
- app/layout.tsx
- react
- Admin de avaliacoes (acoes)
- sections/CalendarSection.tsx
- seo.ts
- types.ts
- Config TypeScript
- steps
- types.ts
- MembersSection
- components/CalendarSection.tsx
- Teste de fluxo de perfil
- eventos/page.tsx
- check-migrations.mjs
- NoteComposer.tsx
- Teste storage Instagram
- ref_node_fs
- MemberHomeView.tsx
- instagram-apify.ts
- Teste cofre de contas
- Teste app-log
- logs/route.ts
- Login com Google (section 14)
- Teste mapas de jogos
- Teste anotacoes
- SQL: logs do app
- Teste filtros de membros
- Teste estilo do membro
- ref_node_vm
- attendance-share.test.cjs
- content-templates.test.cjs
- email-templates.test.cjs
- Teste titulos Instagram
- isSameOriginRequest
- RankInsignia
- Teste senha
- simulados/page.tsx
- ToastProvider.tsx
- ref_node_assert
- [...path]/route.ts
- SQL+doc: templates de conteudo
- atividades/page.tsx
- Loading admin
- Loading login
- SQL: zodiaco
- account-email.test.cjs
- graphify-agent-guard.js
- Project instructions
- assessment-self-guard.test.cjs
- insignias.ts
- notes/[id]/route.ts
- MembersSection.tsx
- assessments.ts
- password-recovery.test.cjs
- seo.test.cjs
- proxy.ts
- build-emblem.test.cjs
- https-redirect.test.cjs
- 015_graduation_tracks.sql
- createClient
- next.config.ts
- public.member_notes
- 1. Texto em português
- prepare-build-emblems.mjs
- ForgotPasswordForm.tsx
- ResetPasswordForm.tsx
- 013_admin_authorization_hardening.sql
- profiles_zz_guard_own_access

## God Nodes (most connected - your core abstractions)
1. `next` - 100 edges
2. `react` - 88 edges
3. `public.profiles` - 78 edges
4. `lucide-react` - 73 edges
5. `createAdminClient()` - 47 edges
6. `createClient()` - 46 edges
7. `jsonApiFetch()` - 43 edges
8. `MembersSection()` - 41 edges
9. `isSameOriginRequest()` - 37 edges
10. `forbidden()` - 36 edges

## Surprising Connections (you probably didn't know these)
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/011_member_access_requests.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/016_house_tracks.sql
- `Progressive document access (Bronze/Prata/Ouro, min rank)` --references--> `public.can_access_document()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/001_initial_schema.sql
- `Seguranca (convite, aprovacao, RLS, bucket privado)` --references--> `public.documents`  [INFERRED]
  README.md → supabase/migrations/001_initial_schema.sql
- `Seguranca (convite, aprovacao, RLS, bucket privado)` --references--> `public.invites`  [INFERRED]
  README.md → supabase/migrations/001_initial_schema.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (114 total, 20 thin omitted)

### Community 0 - "NoteList.tsx"
Cohesion: 0.18
Nodes (12): SearchField(), call(), dayLabel(), formatDate(), NoteList(), remove(), run(), saveEdit() (+4 more)

### Community 1 - "callback/route.ts"
Cohesion: 0.10
Nodes (30): NO_STORE, POST(), metadata, ResetPasswordPage(), backToLogin(), GET(), giveBack(), relativeRedirect() (+22 more)

### Community 2 - "AssessmentCreateForm.tsx"
Cohesion: 0.10
Nodes (22): AssessmentCreateForm(), goToPending(), setScopes(), submit(), toggleGroup(), toggleScope(), AssessmentPayload, BankMeter() (+14 more)

### Community 3 - "viewer.ts"
Cohesion: 0.32
Nodes (8): MemberPage(), metadata, LiveRefresh(), UpcomingActivity, getMemberBadges, getNotesSettings, usesPasswordLogin(), getViewer

### Community 4 - "package.json"
Cohesion: 0.05
Nodes (45): dependencies, ffmpeg-static@^5.3.0, lucide-react@^0.468.0, next@16.4.6, nodemailer@^10.6.1, pg@^8.23.1, react@^19.0.0, react-dom@^19.0.0 (+37 more)

### Community 5 - "swordplay/page.tsx"
Cohesion: 0.15
Nodes (16): concepts, equipment, metadata, rules, SwordplayPage(), GraduationIcon(), Icon(), IconProps (+8 more)

### Community 6 - "membro/layout.tsx"
Cohesion: 0.10
Nodes (26): AdminLayout(), metadata, metadata, PrivateLayout(), AdminProviders(), ConfirmProvider(), ToastProvider(), listeners (+18 more)

### Community 7 - "Midias publicas"
Cohesion: 0.10
Nodes (30): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+22 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.07
Nodes (27): auditActionLabel, auditCategoryLabel, auditCategoryOptions, formatDate(), JsonBlock(), copy(), levelBadge, levelLabel (+19 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.10
Nodes (33): activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at, games_updated_at, media_items_post_id_idx (+25 more)

### Community 10 - "createAdminClient"
Cohesion: 0.14
Nodes (28): allRows(), GET(), PATCH(), canSeeDocument(), DELETE(), PATCH(), POST(), runtime (+20 more)

### Community 11 - "Troca de contas"
Cohesion: 0.13
Nodes (36): DELETE(), GET(), NO_STORE, NO_STORE, POST(), POST(), GET(), NO_STORE (+28 more)

### Community 12 - "next"
Cohesion: 0.10
Nodes (19): NO_STORE, POST(), POST(), GET(), NO_STORE, POST(), Private bucket dk-documents with temporary links, Documentos e PDFs internos (progressive access) (+11 more)

### Community 13 - "PageHero"
Cohesion: 0.11
Nodes (28): GraduationPage(), metadata, tiers, tracks, GamesPage(), metadata, dynamicParams, GamePage() (+20 more)

### Community 14 - "AdminDashboard.tsx"
Cohesion: 0.15
Nodes (22): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+14 more)

### Community 15 - "MediaSection.tsx"
Cohesion: 0.11
Nodes (25): FormSectionHead(), MediaGalleryManager(), defaultInstagramDateRange(), formFromPost(), MediaSection(), loadPostForm(), openEdit(), openNew() (+17 more)

### Community 16 - "member-notes.ts"
Cohesion: 0.13
Nodes (25): MemberNotesPage(), metadata, NoteItem, canWriteNotes(), canWriteNoteTo(), commandedTracks(), DEFAULT_NOTES_SETTINGS, hasRankAccess() (+17 more)

### Community 17 - "BuildEmblem.tsx"
Cohesion: 0.14
Nodes (22): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), Image-generation base prompt for emblems, BuildEmblem() (+14 more)

### Community 18 - "Header.tsx"
Cohesion: 0.18
Nodes (16): initialsOf(), SavedAccounts(), enter(), forget(), Header(), signOut(), switchAccount(), HeaderAccount (+8 more)

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.10
Nodes (29): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+21 more)

### Community 20 - "sobre/page.tsx"
Cohesion: 0.21
Nodes (11): AboutPage(), metadata, steps, values, Footer(), motto, WhatsAppIcon(), socialLinks (+3 more)

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.27
Nodes (13): EditableProfile, EditMemberProfile(), openDialog(), submit(), countProfileChanges(), EMPTY_PASSWORD, ProfileFormErrors, profileFormFrom() (+5 more)

### Community 22 - "MemberQueue.tsx"
Cohesion: 0.14
Nodes (16): adjustmentsOf(), commanderOptions, Draft, levelOptions, MemberQueue(), startAdjust(), Props, rankOptions (+8 more)

### Community 23 - "public"
Cohesion: 0.12
Nodes (12): profiles_nickname_unique_idx, public.update_own_member_profile(), public.update_own_member_avatar(), public.update_own_member_profile_with_access_request(), public.check_registration_rate_limit(), profiles_sync_houses, public.sync_profile_houses(), public.update_own_member_profile_with_access_request() (+4 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.13
Nodes (24): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+16 more)

### Community 25 - "security-phrase.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), phrase, route(), { test }, ts, vm

### Community 26 - "LoginForm.tsx"
Cohesion: 0.29
Nodes (10): AuthInput(), PasswordInput(), GoogleIcon(), LoginForm(), handleGoogle(), handleSubmit(), empty, RegistrationForm() (+2 more)

### Community 27 - "Configuracao do Site Oficial do DK (SETUP)"
Cohesion: 0.18
Nodes (20): Member birthdays calendar (migration 008), Profile completion with pending access-request approval (migration 011), Content templates for posts and activities (migration 021), Validation order (18 steps), Admin roles: principal, midias, atividades, membros, Bootstrap first ADM Principal via SQL, Configuracao do Site Oficial do DK (SETUP), Supabase project creation (+12 more)

### Community 28 - "useToast"
Cohesion: 0.12
Nodes (27): useAdminData(), AdminTitle(), ActivityRow, AttendanceManager(), Correction, Entry, History, Member (+19 more)

### Community 29 - "public.registration_rate_limits"
Cohesion: 0.19
Nodes (9): invites_code_idx, public.invites, public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, public.release_registration_invite(), registration_rate_limits_window_idx, public.check_registration_rate_limit() (+1 more)

### Community 31 - "AttendancePanel.tsx"
Cohesion: 0.16
Nodes (18): AttendancePanel(), copyList(), listText(), shareOnWhatsApp(), Filter, filterLabels, isActivityClosed(), monthTitle() (+10 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "app/layout.tsx"
Cohesion: 0.11
Nodes (9): cinzel, inter, metadata, RootLayout(), InsigniaColorFilters(), QueryActivityFeedback(), QueryProvider(), RealtimeProvider() (+1 more)

### Community 34 - "react"
Cohesion: 0.08
Nodes (24): CommandPalette(), choose(), onKeyDown(), normalize(), Result, accessLabel(), DocumentManager(), renderJoin() (+16 more)

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.15
Nodes (17): AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion(), reviewAnswer() (+9 more)

### Community 36 - "sections/CalendarSection.tsx"
Cohesion: 0.07
Nodes (46): AdminDialog(), ConfirmContext, ConfirmOptions, Pending, useConfirm(), CalendarSection(), loadActivityForm(), openEdit() (+38 more)

### Community 37 - "seo.ts"
Cohesion: 0.13
Nodes (13): metadata, revalidate, JSON-LD (organization, Article, BreadcrumbList), lib/seo.ts (canonical domain death-knights.com.br), Post-publication SEO checklist (Search Console, Lighthouse), /robots.txt, SEO do site DK, /sitemap.xml (+5 more)

### Community 38 - "types.ts"
Cohesion: 0.14
Nodes (14): GameCard(), GameDialog(), GameView, noopSubscribe(), catalog, Filter, filterLabels, gameCategories (+6 more)

### Community 39 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "steps"
Cohesion: 0.12
Nodes (15): Future deployment (env vars, lint, build), runs-on, steps, jobs, build, name, on, pull_request (+7 more)

### Community 41 - "types.ts"
Cohesion: 0.08
Nodes (31): AdminTab, AssessmentAdminData, assessmentAdminQueryKey, emptyQuestion, MemberSummary, PendingReview, QuestionForm, AssessmentPayload (+23 more)

### Community 42 - "MembersSection"
Cohesion: 0.21
Nodes (14): removeActivity(), MembersSection(), canEditAccess(), canManageMember(), decideRegistration(), deleteMember(), editMember(), isSelfTarget() (+6 more)

### Community 43 - "components/CalendarSection.tsx"
Cohesion: 0.24
Nodes (14): CalendarSection(), CalendarViews(), statusLabel, activityDateKey(), CalendarYearView(), eventTimes(), statusLabel, weekdays (+6 more)

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.14
Nodes (17): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+9 more)

### Community 45 - "eventos/page.tsx"
Cohesion: 0.15
Nodes (15): anchors, EventKind, EventsPage(), externalEvents, hostedOptions, internalEvents, metadata, HomePage() (+7 more)

### Community 46 - "check-migrations.mjs"
Cohesion: 0.24
Nodes (11): Ordered migrations 001-012 applied manually in SQL Editor, byPrefix, duplicates, isKnown(), known, KNOWN_DUPLICATES, migrationsDir, unexpected (+3 more)

### Community 47 - "NoteComposer.tsx"
Cohesion: 0.24
Nodes (8): fold(), NoteComposer(), submit(), NoteSeal(), trackNames, noteDisplayName(), NoteSeal, noteSealsFor()

### Community 48 - "Teste storage Instagram"
Cohesion: 0.18
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "ref_node_fs"
Cohesion: 0.08
Nodes (20): apply, body, dir, subjects, outDir, render(), siteTemplates, templates (+12 more)

### Community 50 - "MemberHomeView.tsx"
Cohesion: 0.21
Nodes (13): AnswerBadge(), day(), MemberHomeView(), month(), time(), TrackGroup(), normalizeBuildName(), houseFor() (+5 more)

### Community 51 - "instagram-apify.ts"
Cohesion: 0.08
Nodes (37): GET(), isDateOnly(), maxDuration, POST(), runSync(), runtime, CRON_SECRET scheduled sync endpoint /api/admin/instagram/sync, FFmpeg video compression (50-250 MB to MP4 H.264/AAC) (+29 more)

### Community 52 - "Teste cofre de contas"
Cohesion: 0.18
Nodes (8): assert, fs, plain(), raw, { test }, ts, vault, vm

### Community 53 - "Teste app-log"
Cohesion: 0.20
Nodes (10): assert, clientIp, fs, load(), loadAppLog(), loadLogsRoute(), sanitize, { test } (+2 more)

### Community 54 - "logs/route.ts"
Cohesion: 0.24
Nodes (9): FeedRow, GET(), LEVELS, NO_STORE, PERIODS, safeSearch(), SECTIONS, SERVER_SOURCES (+1 more)

### Community 55 - "Login com Google (section 14)"
Cohesion: 0.15
Nodes (15): Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Supabase Site URL and Redirect URLs (/auth/callback), Orphan accounts without profile (14.7), Disable public sign-ups (14.5), .env.local keys (Supabase URL, publishable key, secret key, site URL), Delete Google-created account when no profile exists (/auth/callback) (+7 more)

### Community 56 - "Teste mapas de jogos"
Cohesion: 0.18
Nodes (9): assert, expectedMaps, fs, { gameCategories, gameCategoryLabels }, { gameFieldMaps }, { games }, { test }, ts (+1 more)

### Community 57 - "Teste anotacoes"
Cohesion: 0.18
Nodes (7): access, assert, fs, notes, { test }, ts, vm

### Community 58 - "SQL: logs do app"
Cohesion: 0.33
Nodes (9): app_logs_category_idx, app_logs_created_at_idx, app_logs_level_idx, audit_log_viewer_permissions, public.app_logs, public.can_view_logs(), public.log_feed, public.log_viewer_permissions (+1 more)

### Community 59 - "Teste filtros de membros"
Cohesion: 0.20
Nodes (7): access, assert, filters, fs, { test }, ts, vm

### Community 60 - "Teste estilo do membro"
Cohesion: 0.22
Nodes (8): assert, fs, load(), route(), style, { test }, ts, vm

### Community 61 - "ref_node_vm"
Cohesion: 0.12
Nodes (12): assert, fs, { test }, ts, vm, assert, fs, moduleExports (+4 more)

### Community 62 - "attendance-share.test.cjs"
Cohesion: 0.18
Nodes (9): activity, assert, { attendanceTally, buildShareText, whatsappShareUrl }, fs, { normalizeWhatsapp, maskPhone, phoneFieldValue }, roster, { test }, ts (+1 more)

### Community 63 - "content-templates.test.cjs"
Cohesion: 0.22
Nodes (7): assert, fs, lib, path, { test }, ts, vm

### Community 64 - "email-templates.test.cjs"
Cohesion: 0.17
Nodes (9): assert, fs, siteNames, siteSubjects, smtp, subjects, { test }, ts (+1 more)

### Community 65 - "Teste titulos Instagram"
Cohesion: 0.22
Nodes (7): assert, { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost }, fs, photo, { test }, ts, vm

### Community 66 - "isSameOriginRequest"
Cohesion: 0.13
Nodes (30): NO_STORE, POST(), NO_STORE, POST(), POST(), fields, GET(), NO_STORE (+22 more)

### Community 67 - "RankInsignia"
Cohesion: 0.26
Nodes (14): AttendanceInsignias(), BirthdayBadge(), BuildInsignia(), GraduationInsignias(), Insignia(), RankInsignia(), Variant, InsigniaBadge() (+6 more)

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "simulados/page.tsx"
Cohesion: 0.19
Nodes (18): AdminPage(), metadata, MemberActivitiesPage(), MemberDocumentsPage(), metadata, formatDate(), MemberAssessmentsPage(), metadata (+10 more)

### Community 70 - "ToastProvider.tsx"
Cohesion: 0.25
Nodes (7): icons, lifetime, ToastAction, ToastApi, ToastContext, ToastItem, ToastKind

### Community 71 - "ref_node_assert"
Cohesion: 0.10
Nodes (15): assert, exportsMap, fs, { test }, ts, vm, assert, fs (+7 more)

### Community 72 - "[...path]/route.ts"
Cohesion: 0.17
Nodes (12): ALLOWED_PREFIXES, DELETE, GET, handle(), HEAD, PATCH, POST, PUT (+4 more)

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.36
Nodes (5): content_templates_kind_name_key, content_templates_updated_at, public.content_templates, public.sync_profile_email(), sync_profile_email

### Community 74 - "atividades/page.tsx"
Cohesion: 0.32
Nodes (7): metadata, Presenca nas atividades (/membro/atividades), Attendance test script, Area do membro, Cadastro por convite com aprovacao administrativa, Documentos e PDFs privados por nivel de acesso, Confirmacao de presenca em atividades e lista para WhatsApp

### Community 82 - "account-email.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), recovery, setup(), { test }, ts, vm

### Community 91 - "assessment-self-guard.test.cjs"
Cohesion: 0.20
Nodes (6): assert, fs, params, { test }, ts, vm

### Community 92 - "insignias.ts"
Cohesion: 0.27
Nodes (11): lib/insignias.ts catalog, components/member/Insignia.tsx and app/insignias.css, Icones de patentes, graduacoes e builds (insignias), Medalhoes de arquearia (bronze master + SVG filters for prata/ouro), public/images/insignias assets, buildOptions, getGraduationTrack(), normalize() (+3 more)

### Community 93 - "notes/[id]/route.ts"
Cohesion: 0.14
Nodes (15): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, denied(), POST() (+7 more)

### Community 94 - "MembersSection.tsx"
Cohesion: 0.10
Nodes (34): Chip(), Medal(), MemberFilters(), optionLabel(), Props, MemberAccessForm, MemberStatusFilter, statusFilters (+26 more)

### Community 95 - "assessments.ts"
Cohesion: 0.05
Nodes (80): PATCH(), POST(), shuffled(), POST(), DELETE(), PATCH(), POST(), POST() (+72 more)

### Community 96 - "password-recovery.test.cjs"
Cohesion: 0.18
Nodes (13): assert, fs, load(), now, recovery, requestRoute(), resetRoute(), run() (+5 more)

### Community 97 - "seo.test.cjs"
Cohesion: 0.12
Nodes (14): typescript@^5.7.0, typescript, assert, fs, moduleExports, { test }, ts, vm (+6 more)

### Community 98 - "proxy.ts"
Cohesion: 0.43
Nodes (6): updateSession(), canonicalHost, cloudflareVisitorScheme(), config, httpsRedirect(), proxy()

### Community 99 - "build-emblem.test.cjs"
Cohesion: 0.22
Nodes (7): assert, fs, { getBuildKey, getBuildIcon, buildOptions, normalizeBuildName }, { test }, ts, vm, { wreathLeaves, leafTip, leafPath, wreathStemPath, defaultWreath }

### Community 100 - "https-redirect.test.cjs"
Cohesion: 0.22
Nodes (6): assert, fs, SITE, { test }, ts, vm

### Community 101 - "015_graduation_tracks.sql"
Cohesion: 0.13
Nodes (6): Progressive document access (Bronze/Prata/Ouro, min rank), public.can_access_document(), public.can_access_document(), profiles_sync_graduations, public.can_access_document(), public.sync_profile_graduations()

### Community 103 - "createClient"
Cohesion: 0.18
Nodes (4): AvatarCropper(), MemberAvatar(), changePhoto(), removePhoto()

### Community 104 - "next.config.ts"
Cohesion: 0.40
Nodes (4): contentSecurityPolicy, nextConfig, securityHeaders, supabaseOrigin

### Community 105 - "public.member_notes"
Cohesion: 0.29
Nodes (9): dk_broadcast_change, member_notes_author_idx, member_notes_before_write, member_notes_recipient_idx, public.can_write_member_notes(), public.member_notes, public.member_notes_before_write(), public.notes_min_rank() (+1 more)

### Community 106 - "1. Texto em português"
Cohesion: 0.20
Nodes (9): 1. Texto em português, 2. Assinatura: SPF, DKIM e DMARC, 3. Frase de segurança (prova dentro do e-mail), 4. E-mails enviados pelo site (cadastro), Conferir se ficou assinado, Configurar, E-mails (autenticação, cadastro e assinatura), Projeto hospedado (teste) (+1 more)

### Community 109 - "prepare-build-emblems.mjs"
Cohesion: 0.25
Nodes (6): npm run prepare:emblems script, public/images/builds (served webp output), BUILD_KEYS, done, EXTENSIONS, missing

### Community 112 - "ForgotPasswordForm.tsx"
Cohesion: 0.23
Nodes (9): metadata, RegisterPage(), ForgotPasswordPage(), metadata, AuthShell(), authTabs, ForgotPasswordForm(), handleSubmit() (+1 more)

### Community 113 - "ResetPasswordForm.tsx"
Cohesion: 0.24
Nodes (10): ResetPasswordForm(), handleSubmit(), PasswordState, ProfileFormState, Props, rankOptions, SECTIONS, PASSWORD_MAX (+2 more)

### Community 114 - "013_admin_authorization_hardening.sql"
Cohesion: 0.52
Nodes (6): admin_audit_log_occurred_at_idx, admin_audit_log_target_idx, audit_invites, audit_user_admin_roles, public.admin_audit_log, public.log_admin_audit()

## Knowledge Gaps
- **5 isolated node(s):** `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`, `Test cleanup`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 736 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `NoteList.tsx`, `callback/route.ts`, `viewer.ts`, `package.json`, `swordplay/page.tsx`, `membro/layout.tsx`, `Midias publicas`, `createAdminClient`, `Troca de contas`, `PageHero`, `AdminDashboard.tsx`, `member-notes.ts`, `Header.tsx`, `Registro e instrumentacao`, `sobre/page.tsx`, `ProfileEditDialog.tsx`, `LoginForm.tsx`, `app/layout.tsx`, `react`, `seo.ts`, `types.ts`, `types.ts`, `components/CalendarSection.tsx`, `eventos/page.tsx`, `NoteComposer.tsx`, `MemberHomeView.tsx`, `instagram-apify.ts`, `logs/route.ts`, `isSameOriginRequest`, `RankInsignia`, `simulados/page.tsx`, `[...path]/route.ts`, `atividades/page.tsx`, `notes/[id]/route.ts`, `MembersSection.tsx`, `assessments.ts`, `proxy.ts`, `next.config.ts`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`?**
  _High betweenness centrality (0.236) - this node is a cross-community bridge._
- **What connects `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `callback/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10252100840336134 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `NoteList.tsx`, `AssessmentCreateForm.tsx`, `viewer.ts`, `package.json`, `swordplay/page.tsx`, `membro/layout.tsx`, `Midias publicas`, `LogsViewer.tsx`, `Troca de contas`, `PageHero`, `AdminDashboard.tsx`, `MediaSection.tsx`, `BuildEmblem.tsx`, `Header.tsx`, `ProfileEditDialog.tsx`, `MemberQueue.tsx`, `LoginForm.tsx`, `useToast`, `AttendancePanel.tsx`, `app/layout.tsx`, `sections/CalendarSection.tsx`, `types.ts`, `types.ts`, `components/CalendarSection.tsx`, `eventos/page.tsx`, `NoteComposer.tsx`, `MemberHomeView.tsx`, `RankInsignia`, `simulados/page.tsx`, `ToastProvider.tsx`, `MembersSection.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Should `AssessmentCreateForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `seo.test.cjs` to `package.json`, `security-phrase.test.cjs`, `Teste login Google`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `ref_node_fs`, `Teste cofre de contas`, `Teste app-log`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `ref_node_vm`, `attendance-share.test.cjs`, `content-templates.test.cjs`, `email-templates.test.cjs`, `Teste titulos Instagram`, `Teste senha`, `ref_node_assert`, `account-email.test.cjs`, `assessment-self-guard.test.cjs`, `password-recovery.test.cjs`, `build-emblem.test.cjs`, `https-redirect.test.cjs`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05272108843537415 - nodes in this community are weakly interconnected._