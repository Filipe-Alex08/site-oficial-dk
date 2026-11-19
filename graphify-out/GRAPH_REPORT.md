# Graph Report - site-oficial-dk  (2026-11-19)

## Corpus Check
- 311 files · ~141,022 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 9, .example 1, (none) 1)

## Summary
- 1940 nodes · 5140 edges · 99 communities (84 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 122 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d6de02c2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- jsonApiFetch
- [token]/route.ts
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
- Jogos publicos
- AdminDashboard.tsx
- ShareButton.tsx
- 009_assessment_module.sql
- Emblemas de build + docs
- member-notes.ts
- Registro e instrumentacao
- ref_node_fs
- ProfileEditDialog.tsx
- AttendanceManager.tsx
- public.profiles
- Realtime SSE
- security-phrase.test.cjs
- viewer.ts
- Configuracao do Site Oficial do DK (SETUP)
- MediaSection
- 013_admin_authorization_hardening.sql
- react
- Painel de presenca
- Teste login Google
- Layout raiz e estilos
- next
- Admin de avaliacoes (acoes)
- useToast
- Home, robots e skeletons
- Cards de jogos
- Config TypeScript
- steps
- AssessmentRunner.tsx
- MembersSection
- proxy.ts
- Teste de fluxo de perfil
- assessments.ts
- reset/route.ts
- lucide-react
- Teste storage Instagram
- ref_node_fs
- sections/CalendarSection.tsx
- Select
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
- email-templates-deploy.test.cjs
- assessment-server.ts
- Teste titulos Instagram
- callback/route.ts
- NoteList.tsx
- Teste senha
- getViewer
- Teste datas relativas
- ref_node_assert
- membro/page.tsx
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
- `Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation)` --references--> `public.can_manage_assessments()`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/013_admin_authorization_hardening.sql
- `Image-generation base prompt for emblems` --semantically_similar_to--> `Medalhoes de arquearia (bronze master + SVG filters for prata/ouro)`  [INFERRED] [semantically similar]
  art/builds/LEIA-ME.md → docs/INSIGNIAS.md
- `Row Level Security` --references--> `public.profiles`  [EXTRACTED]
  README.md → supabase/migrations/001_initial_schema.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (99 total, 15 thin omitted)

### Community 0 - "jsonApiFetch"
Cohesion: 0.07
Nodes (37): metadata, RegisterPage(), ForgotPasswordPage(), metadata, AuthShell(), ForgotPasswordForm(), handleSubmit(), GoogleIcon() (+29 more)

### Community 1 - "[token]/route.ts"
Cohesion: 0.18
Nodes (18): PATCH(), POST(), CandidateContext, candidatePayload(), expireOrSubmitIfNeeded(), GET(), getContext(), getDeadline() (+10 more)

### Community 2 - "AssessmentCreateForm.tsx"
Cohesion: 0.10
Nodes (21): AssessmentCreateForm(), goToPending(), setScopes(), submit(), toggleGroup(), toggleScope(), AssessmentPayload, BankMeter() (+13 more)

### Community 3 - "components/CalendarSection.tsx"
Cohesion: 0.20
Nodes (15): CalendarSection(), CalendarViews(), statusLabel, activityDateKey(), CalendarYearView(), eventTimes(), statusLabel, weekdays (+7 more)

### Community 4 - "typescript"
Cohesion: 0.14
Nodes (18): devDependencies, eslint@^9.0.0, eslint-config-next@^16.4.6, @types/node@^22.0.0, @types/pg@^8.23.1, @types/react@^19.0.0, @types/react-dom@^19.0.0, typescript@^5.7.0 (+10 more)

### Community 5 - "instagram-apify.ts"
Cohesion: 0.08
Nodes (40): GET(), isDateOnly(), maxDuration, POST(), runSync(), runtime, CRON_SECRET scheduled sync endpoint /api/admin/instagram/sync, FFmpeg video compression (50-250 MB to MP4 H.264/AAC) (+32 more)

### Community 6 - "types.ts"
Cohesion: 0.11
Nodes (33): defaultInstagramDateRange(), postCategories, Quota, toDateInput(), copy, queryKey(), TemplateStore, toError() (+25 more)

### Community 7 - "Midias publicas"
Cohesion: 0.14
Nodes (24): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+16 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.09
Nodes (24): auditActionLabel, auditCategoryLabel, auditCategoryOptions, formatDate(), JsonBlock(), copy(), levelBadge, levelLabel (+16 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.13
Nodes (25): Seguranca (convite, aprovacao, RLS, bucket privado), activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at, games_updated_at (+17 more)

### Community 10 - "createAdminClient"
Cohesion: 0.12
Nodes (30): allRows(), GET(), PATCH(), DELETE(), PATCH(), POST(), runtime, GET() (+22 more)

### Community 11 - "Troca de contas"
Cohesion: 0.13
Nodes (36): DELETE(), GET(), NO_STORE, NO_STORE, POST(), GET(), NO_STORE, LoginPage() (+28 more)

### Community 12 - "createClient"
Cohesion: 0.15
Nodes (36): NO_STORE, POST(), POST(), NO_STORE, POST(), NO_STORE, POST(), POST() (+28 more)

### Community 13 - "Jogos publicos"
Cohesion: 0.10
Nodes (25): GamesPage(), metadata, dynamicParams, GamePage(), generateMetadata(), Props, metadata, SwordplayPage() (+17 more)

### Community 14 - "AdminDashboard.tsx"
Cohesion: 0.12
Nodes (26): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+18 more)

### Community 15 - "ShareButton.tsx"
Cohesion: 0.40
Nodes (5): ShareButton(), flash(), share(), State, title()

### Community 16 - "009_assessment_module.sql"
Cohesion: 0.12
Nodes (30): POST(), shuffled(), dynamic, Audit history of assessment actions, assessment_answers_review_idx, assessment_answers_state_guard, assessment_answers_updated_at, assessment_assignments_member_idx (+22 more)

### Community 17 - "Emblemas de build + docs"
Cohesion: 0.09
Nodes (28): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), npm run prepare:emblems script, Image-generation base prompt for emblems (+20 more)

### Community 18 - "member-notes.ts"
Cohesion: 0.17
Nodes (20): MemberNotesPage(), canWriteNotes(), canWriteNoteTo(), commandedTracks(), hasRankAccess(), isRank(), isScope(), isWriters() (+12 more)

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.12
Nodes (21): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+13 more)

### Community 20 - "ref_node_fs"
Cohesion: 0.25
Nodes (6): assert, fs, seo, { test }, ts, vm

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.11
Nodes (26): EditableProfile, EditMemberProfile(), openDialog(), AnswerBadge(), day(), MemberHomeView(), month(), time() (+18 more)

### Community 22 - "AttendanceManager.tsx"
Cohesion: 0.17
Nodes (17): useAdminData(), AdminTitle(), ActivityRow, AttendanceManager(), Correction, Entry, History, Member (+9 more)

### Community 23 - "public.profiles"
Cohesion: 0.08
Nodes (26): Progressive document access (Bronze/Prata/Ouro, min rank), Profile completion and rank-request test script, public.activity_attendance, public.can_access_document(), public.get_activity_attendance(), public.profiles, public.can_access_document(), public.can_access_document() (+18 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.08
Nodes (36): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+28 more)

### Community 25 - "security-phrase.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), phrase, route(), { test }, ts, vm

### Community 26 - "viewer.ts"
Cohesion: 0.18
Nodes (21): metadata, MemberActivitiesPage(), metadata, MemberDocumentsPage(), metadata, formatDate(), MemberAssessmentsPage(), metadata (+13 more)

### Community 27 - "Configuracao do Site Oficial do DK (SETUP)"
Cohesion: 0.14
Nodes (25): Activation: migrations 009 and 010 plus three Supabase env vars, Avaliacoes e Simulados do DK, Classificacao das questoes (manual, tipo, area, dificuldade), Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation), Selecao manual de questoes, Sorteio individual por filtro (frozen random set per indication), Member birthdays calendar (migration 008), Avaliacoes e simulados setup (migrations 009/010) (+17 more)

### Community 28 - "MediaSection"
Cohesion: 0.10
Nodes (19): FormSectionHead(), MediaGalleryManager(), formFromPost(), MediaSection(), loadPostForm(), openEdit(), openNew(), removePost() (+11 more)

### Community 29 - "013_admin_authorization_hardening.sql"
Cohesion: 0.13
Nodes (15): public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, public.release_registration_invite(), registration_rate_limits_window_idx, admin_audit_log_occurred_at_idx, admin_audit_log_target_idx, audit_invites (+7 more)

### Community 30 - "react"
Cohesion: 0.10
Nodes (18): AdminDialog(), ConfirmContext, ConfirmOptions, Pending, useConfirm(), accessLabel(), DocumentManager(), renderJoin() (+10 more)

### Community 31 - "Painel de presenca"
Cohesion: 0.15
Nodes (15): activityTime(), AttendancePanel(), copyList(), listText(), shareOnWhatsApp(), buildShareText(), dateOptions, Filter (+7 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "Layout raiz e estilos"
Cohesion: 0.13
Nodes (9): cinzel, inter, metadata, RootLayout(), InsigniaColorFilters(), QueryActivityFeedback(), QueryProvider(), RealtimeProvider() (+1 more)

### Community 34 - "next"
Cohesion: 0.08
Nodes (19): ALLOWED_PREFIXES, DELETE, GET, HEAD, PATCH, POST, PUT, STRIPPED_REQUEST_HEADERS (+11 more)

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.10
Nodes (28): AdminTab, AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion() (+20 more)

### Community 36 - "useToast"
Cohesion: 0.12
Nodes (17): rankOptions, saveNotes(), settingsKey, SettingsSection(), SettingsTab, tabs, icons, lifetime (+9 more)

### Community 37 - "Home, robots e skeletons"
Cohesion: 0.11
Nodes (20): metadata, HomePage(), metadata, CalendarSkeleton(), JSON-LD (organization, Article, BreadcrumbList), lib/seo.ts (canonical domain death-knights.com.br), Post-publication SEO checklist (Search Console, Lighthouse), /robots.txt (+12 more)

### Community 38 - "Cards de jogos"
Cohesion: 0.14
Nodes (15): GameCard(), GameDialog(), GameView, noopSubscribe(), catalog, categories, Filter, GameCatalogMetadata (+7 more)

### Community 39 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "steps"
Cohesion: 0.12
Nodes (15): Future deployment (env vars, lint, build), runs-on, steps, jobs, build, name, on, pull_request (+7 more)

### Community 41 - "AssessmentRunner.tsx"
Cohesion: 0.14
Nodes (13): AssessmentPayload, AssessmentRunner(), AssessmentRunnerLoaded(), formatRemaining(), SafeQuestion, SavedAnswer, assessmentAssignmentStatusLabels, assessmentTrackOptions (+5 more)

### Community 42 - "MembersSection"
Cohesion: 0.18
Nodes (17): removeActivity(), createInvite(), disableInvite(), MembersSection(), canEditAccess(), canManageMember(), decideRegistration(), deleteMember() (+9 more)

### Community 43 - "proxy.ts"
Cohesion: 0.43
Nodes (6): updateSession(), canonicalHost, cloudflareVisitorScheme(), config, httpsRedirect(), proxy()

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.16
Nodes (15): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+7 more)

### Community 45 - "assessments.ts"
Cohesion: 0.22
Nodes (18): optionalText(), validateAssessmentDefinition(), validateAssessmentQuestion(), ValidationResult, assessmentQuestionCountOptions, assessmentQuestionTypeOptions, assessmentSelectionModeOptions, delegableAssessmentRanks (+10 more)

### Community 46 - "reset/route.ts"
Cohesion: 0.19
Nodes (14): NO_STORE, metadata, ResetPasswordPage(), ResetPasswordForm(), handleSubmit(), PASSWORD_MAX, PASSWORD_MIN, validateNewPassword() (+6 more)

### Community 47 - "lucide-react"
Cohesion: 0.13
Nodes (12): AvatarCropper(), Point, submit(), MemberAvatar(), changePhoto(), removePhoto(), CLIENT_HEADER, createClient() (+4 more)

### Community 48 - "Teste storage Instagram"
Cohesion: 0.18
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "ref_node_fs"
Cohesion: 0.12
Nodes (12): apply, body, dir, subjects, outDir, templates, assert, fs (+4 more)

### Community 50 - "sections/CalendarSection.tsx"
Cohesion: 0.21
Nodes (15): CalendarSection(), loadActivityForm(), openEdit(), openNew(), saveActivity(), endOf(), monthLabel(), Period (+7 more)

### Community 51 - "Select"
Cohesion: 0.17
Nodes (10): TemplateBar(), closeDialog(), rename(), saveNew(), updateApplied(), Select(), handleKeyDown(), openMenu() (+2 more)

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
Cohesion: 0.36
Nodes (9): app_logs_category_idx, app_logs_created_at_idx, app_logs_level_idx, audit_log_viewer_permissions, public.app_logs, public.can_view_logs(), public.log_feed, public.log_viewer_permissions (+1 more)

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
Cohesion: 0.08
Nodes (17): ffmpeg-static@^5.3.0, ffmpeg-static, assert, fs, lib, path, { test }, ts (+9 more)

### Community 64 - "assessment-server.ts"
Cohesion: 0.23
Nodes (11): POST(), DELETE(), PATCH(), POST(), GET(), POST(), AssessmentActor, getApprovedAssessmentActor() (+3 more)

### Community 65 - "Teste titulos Instagram"
Cohesion: 0.22
Nodes (7): assert, { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost }, fs, photo, { test }, ts, vm

### Community 66 - "callback/route.ts"
Cohesion: 0.09
Nodes (35): backToLogin(), GET(), giveBack(), relativeRedirect(), Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Supabase Site URL and Redirect URLs (/auth/callback) (+27 more)

### Community 67 - "NoteList.tsx"
Cohesion: 0.11
Nodes (23): Avatar(), fold(), NoteComposer(), submit(), call(), dayLabel(), formatDate(), NoteItem (+15 more)

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "getViewer"
Cohesion: 0.26
Nodes (8): AdminLayout(), metadata, AdminPage(), metadata, AdminProviders(), ConfirmProvider(), ToastProvider(), getViewer

### Community 70 - "Teste datas relativas"
Cohesion: 0.25
Nodes (7): assert, fs, moduleExports, now, { test }, ts, vm

### Community 71 - "ref_node_assert"
Cohesion: 0.08
Nodes (19): assert, fs, subjects, { test }, assert, fs, SITE, { test } (+11 more)

### Community 72 - "membro/page.tsx"
Cohesion: 0.33
Nodes (7): MemberPage(), metadata, getMemberBadges, DEFAULT_NOTES_SETTINGS, getNotesSettings, usesPasswordLogin(), readSecurityPhrase()

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
Cohesion: 0.17
Nodes (25): GraduationPage(), metadata, AttendanceInsignias(), BuildInsignia(), GraduationInsignia(), GraduationInsignias(), Insignia(), RankInsignia() (+17 more)

### Community 93 - "public.member_notes"
Cohesion: 0.09
Nodes (26): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, POST(), runtime (+18 more)

### Community 94 - "MembersSection.tsx"
Cohesion: 0.07
Nodes (52): Chip(), Medal(), MemberFilters(), optionLabel(), Props, adjustmentsOf(), commanderOptions, Draft (+44 more)

### Community 95 - "react-dom"
Cohesion: 0.29
Nodes (5): GalleryItem, MediaGallery(), noopSubscribe(), react-dom@^19.0.0, react-dom

### Community 96 - "password-recovery.test.cjs"
Cohesion: 0.18
Nodes (13): assert, fs, load(), now, recovery, requestRoute(), resetRoute(), run() (+5 more)

### Community 97 - "membro/layout.tsx"
Cohesion: 0.19
Nodes (16): metadata, PrivateLayout(), MemberStyleToggle(), options, MemberThemeContext, MemberThemeContextValue, MemberThemeProvider(), useMemberTheme() (+8 more)

### Community 106 - "1. Texto em português"
Cohesion: 0.25
Nodes (7): 1. Texto em português, 2. Assinatura: SPF, DKIM e DMARC, 3. Frase de segurança (prova dentro do e-mail), Conferir se ficou assinado, E-mails de autenticação (português e assinatura), Projeto hospedado (teste), Servidor próprio (produção): automático no deploy

## Knowledge Gaps
- **5 isolated node(s):** `Post-publication SEO checklist (Search Console, Lighthouse)`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Test cleanup`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 678 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `jsonApiFetch`, `[token]/route.ts`, `components/CalendarSection.tsx`, `typescript`, `instagram-apify.ts`, `Midias publicas`, `createAdminClient`, `Troca de contas`, `createClient`, `Jogos publicos`, `AdminDashboard.tsx`, `009_assessment_module.sql`, `Registro e instrumentacao`, `ProfileEditDialog.tsx`, `Realtime SSE`, `viewer.ts`, `Layout raiz e estilos`, `Home, robots e skeletons`, `Cards de jogos`, `AssessmentRunner.tsx`, `proxy.ts`, `reset/route.ts`, `lucide-react`, `logs/route.ts`, `Sobre e rodape`, `assessment-server.ts`, `NoteList.tsx`, `getViewer`, `membro/page.tsx`, `Insignia.tsx`, `public.member_notes`, `MembersSection.tsx`, `membro/layout.tsx`?**
  _High betweenness centrality (0.226) - this node is a cross-community bridge._
- **What connects `Post-publication SEO checklist (Search Console, Lighthouse)`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `jsonApiFetch` be split into smaller, more focused modules?**
  _Cohesion score 0.07197763801537387 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `typescript` to `instagram-apify.ts`, `ref_node_fs`, `security-phrase.test.cjs`, `Teste login Google`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `ref_node_fs`, `Teste cofre de contas`, `Teste app-log`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `Teste auth hardening e TypeScript`, `Teste de emblemas`, `email-templates-deploy.test.cjs`, `Teste titulos Instagram`, `Teste senha`, `Teste datas relativas`, `ref_node_assert`, `account-email.test.cjs`, `password-recovery.test.cjs`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Should `AssessmentCreateForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09971509971509972 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `jsonApiFetch`, `AssessmentCreateForm.tsx`, `components/CalendarSection.tsx`, `typescript`, `types.ts`, `Midias publicas`, `LogsViewer.tsx`, `Jogos publicos`, `AdminDashboard.tsx`, `ShareButton.tsx`, `Emblemas de build + docs`, `ProfileEditDialog.tsx`, `AttendanceManager.tsx`, `Realtime SSE`, `viewer.ts`, `MediaSection`, `Painel de presenca`, `Layout raiz e estilos`, `Admin de avaliacoes (acoes)`, `useToast`, `Home, robots e skeletons`, `Cards de jogos`, `AssessmentRunner.tsx`, `reset/route.ts`, `lucide-react`, `sections/CalendarSection.tsx`, `Select`, `NoteList.tsx`, `getViewer`, `membro/page.tsx`, `Insignia.tsx`, `MembersSection.tsx`, `react-dom`, `membro/layout.tsx`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Should `typescript` be split into smaller, more focused modules?**
  _Cohesion score 0.14210526315789473 - nodes in this community are weakly interconnected._