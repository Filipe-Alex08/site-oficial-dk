# Graph Report - site-oficial-dk  (2026-11-26)

## Corpus Check
- 323 files · ~145,400 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 12, .example 1, (none) 1)

## Summary
- 2012 nodes · 5263 edges · 117 communities (98 shown, 19 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 125 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2d11c78d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NoteList.tsx
- callback/route.ts
- AssessmentCreateForm.tsx
- membro/page.tsx
- package.json
- swordplay/page.tsx
- membro/layout.tsx
- Midias publicas
- LogsViewer.tsx
- SQL+docs: perfil, rank e acesso a documentos
- createAdminClient
- Troca de contas
- createClient
- PageHero
- AdminDashboard.tsx
- MediaSection.tsx
- member-notes.ts
- BuildEmblem.tsx
- jsonApiFetch
- Registro e instrumentacao
- relative-day.test.cjs
- ProfileEditDialog.tsx
- MemberQueue.tsx
- public
- Realtime SSE
- security-phrase.test.cjs
- anotacoes/page.tsx
- Configuracao do Site Oficial do DK (SETUP)
- useToast
- public.registration_rate_limits
- assessment-server.ts
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
- [token]/route.ts
- ref_node_vm
- Teste storage Instagram
- ref_node_path
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
- Teste auth hardening e TypeScript
- attendance-share.test.cjs
- 013_admin_authorization_hardening.sql
- AttendanceManager.tsx
- Teste titulos Instagram
- next
- DocumentManager.tsx
- Teste senha
- simulados/page.tsx
- MemberFilters.tsx
- ref_node_assert
- [...path]/route.ts
- SQL+doc: templates de conteudo
- Select
- Loading admin
- Loading login
- SQL: zodiaco
- account-email.test.cjs
- graphify-agent-guard.js
- Project instructions
- membro/layout.tsx
- Insignia.tsx
- notes/[id]/route.ts
- MembersSection.tsx
- 009_assessment_module.sql
- password-recovery.test.cjs
- LoginForm.tsx
- proxy.ts
- build-emblem.test.cjs
- https-redirect.test.cjs
- anotacoes/page.tsx
- createClient
- next.config.ts
- check-migrations.mjs
- 1. Texto em português
- NoteComposer.tsx
- prepare-build-emblems.mjs
- content-templates.test.cjs
- ToastProvider.tsx
- wreath.ts
- MemberNav.tsx
- public.set_own_whatsapp
- client.ts
- AssessmentRunnerLoaded
- profiles_zz_guard_own_access

## God Nodes (most connected - your core abstractions)
1. `next` - 100 edges
2. `react` - 88 edges
3. `public.profiles` - 78 edges
4. `lucide-react` - 73 edges
5. `createAdminClient()` - 47 edges
6. `createClient()` - 46 edges
7. `jsonApiFetch()` - 43 edges
8. `MembersSection()` - 40 edges
9. `isSameOriginRequest()` - 37 edges
10. `forbidden()` - 36 edges

## Surprising Connections (you probably didn't know these)
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/024_track_commander.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/011_member_access_requests.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/015_graduation_tracks.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/016_house_tracks.sql
- `Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation)` --references--> `public.can_manage_assessments()`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (117 total, 19 thin omitted)

### Community 0 - "NoteList.tsx"
Cohesion: 0.22
Nodes (12): call(), dayLabel(), formatDate(), NoteList(), remove(), run(), saveEdit(), shortWhen() (+4 more)

### Community 1 - "callback/route.ts"
Cohesion: 0.11
Nodes (29): NO_STORE, POST(), backToLogin(), GET(), giveBack(), relativeRedirect(), ActiveSnapshot, callbackFailureCode() (+21 more)

### Community 2 - "AssessmentCreateForm.tsx"
Cohesion: 0.10
Nodes (20): AssessmentCreateForm(), goToPending(), setScopes(), submit(), toggleGroup(), toggleScope(), AssessmentPayload, BankMeter() (+12 more)

### Community 3 - "membro/page.tsx"
Cohesion: 0.13
Nodes (17): MemberPage(), metadata, UpcomingActivity, getMemberBadges, DEFAULT_NOTES_SETTINGS, getNotesSettings, usesPasswordLogin(), readSecurityPhrase() (+9 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (40): dependencies, ffmpeg-static@^5.3.0, lucide-react@^0.468.0, next@16.4.6, pg@^8.23.1, react@^19.0.0, react-dom@^19.0.0, @supabase/supabase-js@^2.57.0 (+32 more)

### Community 5 - "swordplay/page.tsx"
Cohesion: 0.13
Nodes (19): concepts, equipment, metadata, rules, HeaderAccount, GraduationIcon(), Icon(), IconProps (+11 more)

### Community 6 - "membro/layout.tsx"
Cohesion: 0.21
Nodes (13): MemberStyleToggle(), options, MemberThemeContext, MemberThemeContextValue, MemberThemeProvider(), useMemberTheme(), graduationLabels, effectiveMemberTheme() (+5 more)

### Community 7 - "Midias publicas"
Cohesion: 0.10
Nodes (29): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+21 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.09
Nodes (22): auditActionLabel, auditCategoryLabel, auditCategoryOptions, formatDate(), JsonBlock(), copy(), levelBadge, levelLabel (+14 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.07
Nodes (40): Progressive document access (Bronze/Prata/Ouro, min rank), Seguranca (convite, aprovacao, RLS, bucket privado), activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at (+32 more)

### Community 10 - "createAdminClient"
Cohesion: 0.10
Nodes (34): allRows(), GET(), PATCH(), canSeeDocument(), DELETE(), PATCH(), POST(), runtime (+26 more)

### Community 11 - "Troca de contas"
Cohesion: 0.13
Nodes (36): DELETE(), GET(), NO_STORE, NO_STORE, POST(), GET(), NO_STORE, LoginPage() (+28 more)

### Community 12 - "createClient"
Cohesion: 0.21
Nodes (25): NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST(), POST(), POST() (+17 more)

### Community 13 - "PageHero"
Cohesion: 0.09
Nodes (32): GraduationPage(), metadata, tiers, tracks, GamesPage(), metadata, dynamicParams, GamePage() (+24 more)

### Community 14 - "AdminDashboard.tsx"
Cohesion: 0.18
Nodes (17): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+9 more)

### Community 15 - "MediaSection.tsx"
Cohesion: 0.12
Nodes (23): FormSectionHead(), MediaGalleryManager(), defaultInstagramDateRange(), formFromPost(), MediaSection(), loadPostForm(), openEdit(), openNew() (+15 more)

### Community 16 - "member-notes.ts"
Cohesion: 0.15
Nodes (15): trackNames, isRank(), isScope(), isWriters(), NOTES_SETTING_KEYS, NotesCommanderScope, NoteSeal, NotesWriters (+7 more)

### Community 17 - "BuildEmblem.tsx"
Cohesion: 0.20
Nodes (15): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), Image-generation base prompt for emblems, BuildEmblem() (+7 more)

### Community 18 - "jsonApiFetch"
Cohesion: 0.17
Nodes (18): submit(), initialsOf(), SavedAccounts(), enter(), forget(), Header(), signOut(), switchAccount() (+10 more)

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.12
Nodes (21): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+13 more)

### Community 20 - "relative-day.test.cjs"
Cohesion: 0.25
Nodes (7): assert, fs, moduleExports, now, { test }, ts, vm

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.15
Nodes (18): EditableProfile, EditMemberProfile(), openDialog(), submit(), countProfileChanges(), EMPTY_PASSWORD, PasswordState, ProfileEditDialog() (+10 more)

### Community 22 - "MemberQueue.tsx"
Cohesion: 0.13
Nodes (17): adjustmentsOf(), commanderOptions, Draft, levelOptions, MemberQueue(), startAdjust(), Props, rankOptions (+9 more)

### Community 23 - "public"
Cohesion: 0.13
Nodes (11): profiles_nickname_unique_idx, public.update_own_member_profile(), public.update_own_member_avatar(), public.update_own_member_profile_with_access_request(), public.check_registration_rate_limit(), profiles_sync_houses, public.sync_profile_houses(), public.update_own_member_profile_with_access_request() (+3 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.13
Nodes (24): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+16 more)

### Community 25 - "security-phrase.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), phrase, route(), { test }, ts, vm

### Community 26 - "anotacoes/page.tsx"
Cohesion: 0.21
Nodes (11): AdminPage(), metadata, MemberDocumentsPage(), metadata, AssessmentAttemptPage(), metadata, AppPageHeader(), Crumb (+3 more)

### Community 27 - "Configuracao do Site Oficial do DK (SETUP)"
Cohesion: 0.13
Nodes (28): Activation: migrations 009 and 010 plus three Supabase env vars, Avaliacoes e Simulados do DK, Classificacao das questoes (manual, tipo, area, dificuldade), Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation), Routes: /membro/simulados, /membro/simulados/[token], /admin, Selecao manual de questoes, Sorteio individual por filtro (frozen random set per indication), Member birthdays calendar (migration 008) (+20 more)

### Community 28 - "useToast"
Cohesion: 0.16
Nodes (20): useAdminData(), AdminTitle(), useConfirm(), InvitesSection(), inviteState(), Kpi(), OverviewSection(), rankOptions (+12 more)

### Community 29 - "public.registration_rate_limits"
Cohesion: 0.22
Nodes (7): public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, public.release_registration_invite(), registration_rate_limits_window_idx, public.check_registration_rate_limit(), public.check_registration_rate_limit()

### Community 30 - "assessment-server.ts"
Cohesion: 0.14
Nodes (25): POST(), shuffled(), POST(), DELETE(), PATCH(), POST(), GET(), POST() (+17 more)

### Community 31 - "AttendancePanel.tsx"
Cohesion: 0.16
Nodes (18): AttendancePanel(), copyList(), listText(), shareOnWhatsApp(), Filter, filterLabels, isActivityClosed(), monthTitle() (+10 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "app/layout.tsx"
Cohesion: 0.08
Nodes (16): cinzel, inter, metadata, RootLayout(), Footer(), motto, InsigniaColorFilters(), QueryActivityFeedback() (+8 more)

### Community 34 - "react"
Cohesion: 0.10
Nodes (20): AdminDialog(), CommandPalette(), choose(), onKeyDown(), normalize(), Result, ConfirmContext, ConfirmOptions (+12 more)

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.15
Nodes (18): AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion(), reviewAnswer() (+10 more)

### Community 36 - "sections/CalendarSection.tsx"
Cohesion: 0.11
Nodes (35): CalendarSection(), loadActivityForm(), openEdit(), openNew(), saveActivity(), endOf(), monthLabel(), Period (+27 more)

### Community 37 - "seo.ts"
Cohesion: 0.11
Nodes (19): metadata, HomePage(), metadata, portals, virtues, CalendarSkeleton(), JSON-LD (organization, Article, BreadcrumbList), lib/seo.ts (canonical domain death-knights.com.br) (+11 more)

### Community 38 - "types.ts"
Cohesion: 0.11
Nodes (17): revalidate, GameCard(), GameDialog(), GameView, noopSubscribe(), catalog, categories, Filter (+9 more)

### Community 39 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "steps"
Cohesion: 0.12
Nodes (15): Future deployment (env vars, lint, build), runs-on, steps, jobs, build, name, on, pull_request (+7 more)

### Community 41 - "types.ts"
Cohesion: 0.11
Nodes (25): AdminTab, AssessmentAdminData, assessmentAdminQueryKey, emptyQuestion, MemberSummary, PendingReview, QuestionForm, AssessmentPayload (+17 more)

### Community 42 - "MembersSection"
Cohesion: 0.16
Nodes (16): removeActivity(), createInvite(), disableInvite(), MembersSection(), canEditAccess(), canManageMember(), decideRegistration(), deleteMember() (+8 more)

### Community 43 - "components/CalendarSection.tsx"
Cohesion: 0.27
Nodes (9): statusLabel, activityDateKey(), CalendarYearView(), eventTimes(), statusLabel, weekdays, MemberBirthday, ActivityStatus (+1 more)

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.15
Nodes (16): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+8 more)

### Community 45 - "eventos/page.tsx"
Cohesion: 0.29
Nodes (6): anchors, EventKind, externalEvents, hostedOptions, internalEvents, metadata

### Community 46 - "[token]/route.ts"
Cohesion: 0.18
Nodes (18): PATCH(), POST(), CandidateContext, candidatePayload(), expireOrSubmitIfNeeded(), GET(), getContext(), getDeadline() (+10 more)

### Community 47 - "ref_node_vm"
Cohesion: 0.13
Nodes (12): assert, exportsMap, fs, { test }, ts, vm, assert, fs (+4 more)

### Community 48 - "Teste storage Instagram"
Cohesion: 0.18
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "ref_node_path"
Cohesion: 0.20
Nodes (6): apply, body, dir, subjects, outDir, templates

### Community 50 - "MemberHomeView.tsx"
Cohesion: 0.21
Nodes (12): AnswerBadge(), day(), MemberHomeView(), month(), time(), TrackGroup(), houseFor(), dayKey (+4 more)

### Community 51 - "instagram-apify.ts"
Cohesion: 0.06
Nodes (45): GET(), isDateOnly(), maxDuration, POST(), runSync(), runtime, CRON_SECRET scheduled sync endpoint /api/admin/instagram/sync, FFmpeg video compression (50-250 MB to MP4 H.264/AAC) (+37 more)

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
Cohesion: 0.10
Nodes (15): typescript@^5.7.0, typescript, fs, path, ts, assert, fs, { test } (+7 more)

### Community 62 - "attendance-share.test.cjs"
Cohesion: 0.18
Nodes (9): activity, assert, { attendanceTally, buildShareText, whatsappShareUrl }, fs, { normalizeWhatsapp, maskPhone, phoneFieldValue }, roster, { test }, ts (+1 more)

### Community 63 - "013_admin_authorization_hardening.sql"
Cohesion: 0.52
Nodes (6): admin_audit_log_occurred_at_idx, admin_audit_log_target_idx, audit_invites, audit_user_admin_roles, public.admin_audit_log, public.log_admin_audit()

### Community 64 - "AttendanceManager.tsx"
Cohesion: 0.14
Nodes (13): ActivityRow, AttendanceManager(), Correction, Entry, History, Member, readJson(), Column (+5 more)

### Community 65 - "Teste titulos Instagram"
Cohesion: 0.22
Nodes (7): assert, { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost }, fs, photo, { test }, ts, vm

### Community 66 - "next"
Cohesion: 0.11
Nodes (17): metadata, RegisterPage(), ForgotPasswordPage(), metadata, metadata, ResetPasswordPage(), AuthShell(), authTabs (+9 more)

### Community 67 - "DocumentManager.tsx"
Cohesion: 0.14
Nodes (10): accessLabel(), DocumentManager(), renderJoin(), renderRules(), newRule(), ruleLabel(), RulesState, RowMenu() (+2 more)

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "simulados/page.tsx"
Cohesion: 0.21
Nodes (16): MemberActivitiesPage(), metadata, formatDate(), MemberAssessmentsPage(), metadata, CalendarSection(), CalendarViews(), LiveRefresh() (+8 more)

### Community 70 - "MemberFilters.tsx"
Cohesion: 0.19
Nodes (11): Chip(), Medal(), MemberFilters(), optionLabel(), Props, ChipOption, FilterChips(), SearchField() (+3 more)

### Community 71 - "ref_node_assert"
Cohesion: 0.11
Nodes (14): assert, fs, subjects, { test }, assert, fs, recent, { test } (+6 more)

### Community 72 - "[...path]/route.ts"
Cohesion: 0.12
Nodes (15): ALLOWED_PREFIXES, DELETE, GET, HEAD, PATCH, POST, PUT, STRIPPED_REQUEST_HEADERS (+7 more)

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.36
Nodes (5): content_templates_kind_name_key, content_templates_updated_at, public.content_templates, public.sync_profile_email(), sync_profile_email

### Community 74 - "Select"
Cohesion: 0.20
Nodes (9): TemplateBar(), closeDialog(), rename(), saveNew(), updateApplied(), Select(), handleKeyDown(), openMenu() (+1 more)

### Community 82 - "account-email.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), recovery, setup(), { test }, ts, vm

### Community 91 - "membro/layout.tsx"
Cohesion: 0.26
Nodes (10): AdminLayout(), metadata, metadata, PrivateLayout(), AdminProviders(), ConfirmProvider(), ToastProvider(), getMemberTheme() (+2 more)

### Community 92 - "Insignia.tsx"
Cohesion: 0.18
Nodes (24): AttendanceInsignias(), BuildInsignia(), GraduationInsignia(), GraduationInsignias(), Insignia(), RankInsignia(), Variant, InsigniaBadge() (+16 more)

### Community 93 - "notes/[id]/route.ts"
Cohesion: 0.10
Nodes (23): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, denied(), POST() (+15 more)

### Community 94 - "MembersSection.tsx"
Cohesion: 0.10
Nodes (33): ADJUSTABLE_FIELDS, ALLOWED_STATUSES, COMMANDER_FIELDS, COMMANDER_OF, GRADUATION_TRACK_FIELDS, MemberStatus, MemberAccessForm, MemberStatusFilter (+25 more)

### Community 95 - "009_assessment_module.sql"
Cohesion: 0.12
Nodes (28): dynamic, Audit history of assessment actions, assessment_answers_review_idx, assessment_answers_state_guard, assessment_answers_updated_at, assessment_assignments_member_idx, assessment_assignments_number, assessment_assignments_status_idx (+20 more)

### Community 96 - "password-recovery.test.cjs"
Cohesion: 0.18
Nodes (13): assert, fs, load(), now, recovery, requestRoute(), resetRoute(), run() (+5 more)

### Community 97 - "LoginForm.tsx"
Cohesion: 0.32
Nodes (9): AuthInput(), PasswordInput(), GoogleIcon(), LoginForm(), handleGoogle(), handleSubmit(), empty, RegistrationForm() (+1 more)

### Community 98 - "proxy.ts"
Cohesion: 0.43
Nodes (6): updateSession(), canonicalHost, cloudflareVisitorScheme(), config, httpsRedirect(), proxy()

### Community 99 - "build-emblem.test.cjs"
Cohesion: 0.22
Nodes (7): assert, fs, { getBuildKey, getBuildIcon, buildOptions, normalizeBuildName }, { test }, ts, vm, { wreathLeaves, leafTip, leafPath, wreathStemPath, defaultWreath }

### Community 100 - "https-redirect.test.cjs"
Cohesion: 0.22
Nodes (6): assert, fs, SITE, { test }, ts, vm

### Community 101 - "anotacoes/page.tsx"
Cohesion: 0.30
Nodes (11): MemberNotesPage(), metadata, NoteItem, canWriteNotes(), canWriteNoteTo(), commandedTracks(), hasRankAccess(), NOTE_COUNTERPART_COLUMNS (+3 more)

### Community 103 - "createClient"
Cohesion: 0.20
Nodes (5): AvatarCropper(), MemberAvatar(), changePhoto(), removePhoto(), createClient()

### Community 104 - "next.config.ts"
Cohesion: 0.40
Nodes (4): contentSecurityPolicy, nextConfig, securityHeaders, supabaseOrigin

### Community 105 - "check-migrations.mjs"
Cohesion: 0.24
Nodes (11): Ordered migrations 001-012 applied manually in SQL Editor, byPrefix, duplicates, isKnown(), known, KNOWN_DUPLICATES, migrationsDir, unexpected (+3 more)

### Community 106 - "1. Texto em português"
Cohesion: 0.25
Nodes (7): 1. Texto em português, 2. Assinatura: SPF, DKIM e DMARC, 3. Frase de segurança (prova dentro do e-mail), Conferir se ficou assinado, E-mails de autenticação (português e assinatura), Projeto hospedado (teste), Servidor próprio (produção): automático no deploy

### Community 107 - "NoteComposer.tsx"
Cohesion: 0.33
Nodes (6): Avatar(), fold(), NoteComposer(), NoteSeal(), noteDisplayName(), noteSealsFor()

### Community 108 - "prepare-build-emblems.mjs"
Cohesion: 0.25
Nodes (6): npm run prepare:emblems script, public/images/builds (served webp output), BUILD_KEYS, done, EXTENSIONS, missing

### Community 109 - "content-templates.test.cjs"
Cohesion: 0.22
Nodes (7): assert, fs, lib, path, { test }, ts, vm

### Community 110 - "ToastProvider.tsx"
Cohesion: 0.25
Nodes (7): icons, lifetime, ToastAction, ToastApi, ToastContext, ToastItem, ToastKind

### Community 111 - "wreath.ts"
Cohesion: 0.36
Nodes (7): defaultWreath, Leaf, leafTip(), rad(), WreathConfig, wreathLeaves(), wreathStemPath()

### Community 112 - "MemberNav.tsx"
Cohesion: 0.38
Nodes (5): listeners, useStoredFlag(), Badges, MemberNav(), NavItem

### Community 114 - "client.ts"
Cohesion: 0.60
Nodes (4): PROXIED_PREFIXES, proxiedPath(), proxyFetch(), stripCredentials()

## Knowledge Gaps
- **5 isolated node(s):** `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 716 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `NoteList.tsx`, `AssessmentCreateForm.tsx`, `membro/page.tsx`, `package.json`, `swordplay/page.tsx`, `membro/layout.tsx`, `Midias publicas`, `LogsViewer.tsx`, `PageHero`, `AdminDashboard.tsx`, `MediaSection.tsx`, `BuildEmblem.tsx`, `jsonApiFetch`, `ProfileEditDialog.tsx`, `MemberQueue.tsx`, `anotacoes/page.tsx`, `useToast`, `AttendancePanel.tsx`, `app/layout.tsx`, `sections/CalendarSection.tsx`, `seo.ts`, `types.ts`, `types.ts`, `components/CalendarSection.tsx`, `MemberHomeView.tsx`, `AttendanceManager.tsx`, `next`, `DocumentManager.tsx`, `simulados/page.tsx`, `MemberFilters.tsx`, `membro/layout.tsx`, `Insignia.tsx`, `MembersSection.tsx`, `LoginForm.tsx`, `NoteComposer.tsx`, `ToastProvider.tsx`, `MemberNav.tsx`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **What connects `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `callback/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10795454545454546 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `NoteList.tsx`, `callback/route.ts`, `membro/page.tsx`, `package.json`, `swordplay/page.tsx`, `Midias publicas`, `createAdminClient`, `Troca de contas`, `createClient`, `PageHero`, `AdminDashboard.tsx`, `jsonApiFetch`, `Registro e instrumentacao`, `ProfileEditDialog.tsx`, `anotacoes/page.tsx`, `assessment-server.ts`, `app/layout.tsx`, `react`, `seo.ts`, `types.ts`, `types.ts`, `components/CalendarSection.tsx`, `[token]/route.ts`, `MemberHomeView.tsx`, `instagram-apify.ts`, `logs/route.ts`, `simulados/page.tsx`, `[...path]/route.ts`, `membro/layout.tsx`, `Insignia.tsx`, `notes/[id]/route.ts`, `MembersSection.tsx`, `009_assessment_module.sql`, `LoginForm.tsx`, `proxy.ts`, `anotacoes/page.tsx`, `next.config.ts`, `NoteComposer.tsx`, `MemberNav.tsx`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Should `AssessmentCreateForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10461538461538461 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `Teste auth hardening e TypeScript` to `package.json`, `relative-day.test.cjs`, `security-phrase.test.cjs`, `Teste login Google`, `Teste de fluxo de perfil`, `ref_node_vm`, `Teste storage Instagram`, `Teste cofre de contas`, `Teste app-log`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `attendance-share.test.cjs`, `Teste titulos Instagram`, `Teste senha`, `ref_node_assert`, `account-email.test.cjs`, `password-recovery.test.cjs`, `build-emblem.test.cjs`, `https-redirect.test.cjs`, `content-templates.test.cjs`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Should `membro/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12987012987012986 - nodes in this community are weakly interconnected._