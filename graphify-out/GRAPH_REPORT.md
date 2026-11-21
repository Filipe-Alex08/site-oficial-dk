# Graph Report - site-oficial-dk  (2026-11-21)

## Corpus Check
- 316 files · ~142,714 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 12, .example 1, (none) 1)

## Summary
- 1979 nodes · 5232 edges · 104 communities (89 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 125 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c0b14d30`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- jsonApiFetch
- Login com Google (section 14)
- AssessmentCreateForm.tsx
- AttendancePanel.tsx
- package.json
- swordplay/page.tsx
- types.ts
- Midias publicas
- LogsViewer.tsx
- SQL+docs: perfil, rank e acesso a documentos
- createAdminClient
- Troca de contas
- isSameOriginRequest
- PageHero
- AdminDashboard.tsx
- useToast
- Row Level Security
- Emblemas de build + docs
- types.ts
- Registro e instrumentacao
- ref_node_fs
- ProfileEditDialog.tsx
- sections/CalendarSection.tsx
- public
- Realtime SSE
- security-phrase.test.cjs
- member-notes.ts
- Configuracao do Site Oficial do DK (SETUP)
- react
- public.registration_rate_limits
- [token]/route.ts
- eventos/page.tsx
- Teste login Google
- app/layout.tsx
- createClient
- Admin de avaliacoes (acoes)
- Select
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
- MemberQueue.tsx
- Teste storage Instagram
- ref_node_fs
- createClient
- instagram-apify.ts
- Teste cofre de contas
- Teste app-log
- logs/route.ts
- sobre/page.tsx
- Teste mapas de jogos
- Teste anotacoes
- SQL: logs do app
- Teste filtros de membros
- Teste estilo do membro
- Teste auth hardening e TypeScript
- assessment-server.ts
- public.user_admin_roles
- site-nav.ts
- Teste titulos Instagram
- callback/route.ts
- assessment-scoring.ts
- Teste senha
- 015_graduation_tracks.sql
- Teste datas relativas
- ref_node_assert
- [...path]/route.ts
- SQL+doc: templates de conteudo
- check-migrations.mjs
- Loading admin
- Loading login
- SQL: zodiaco
- account-email.test.cjs
- graphify-agent-guard.js
- Project instructions
- email-templates-deploy.test.cjs
- Insignia.tsx
- public.member_notes
- MembersSection.tsx
- react-dom
- password-recovery.test.cjs
- MemberHero.tsx
- Avaliacoes e Simulados do DK
- build-emblem.test.cjs
- https-redirect.test.cjs
- ToastProvider.tsx
- next.config.ts
- 1. Texto em português

## God Nodes (most connected - your core abstractions)
1. `next` - 99 edges
2. `react` - 87 edges
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
- `Snapshot of questions in published assessments` --references--> `public.assessment_items`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation)` --references--> `public.can_manage_assessments()`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Seguranca (convite, aprovacao, RLS, bucket privado)` --references--> `public.invites`  [INFERRED]
  README.md → supabase/migrations/001_initial_schema.sql
- `Seguranca (convite, aprovacao, RLS, bucket privado)` --references--> `public.documents`  [INFERRED]
  README.md → supabase/migrations/001_initial_schema.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (104 total, 15 thin omitted)

### Community 0 - "jsonApiFetch"
Cohesion: 0.05
Nodes (58): ForgotPasswordPage(), metadata, ForgotPasswordForm(), handleSubmit(), GoogleIcon(), LoginForm(), handleGoogle(), handleSubmit() (+50 more)

### Community 1 - "Login com Google (section 14)"
Cohesion: 0.15
Nodes (15): Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Supabase Site URL and Redirect URLs (/auth/callback), Orphan accounts without profile (14.7), Disable public sign-ups (14.5), .env.local keys (Supabase URL, publishable key, secret key, site URL), Delete Google-created account when no profile exists (/auth/callback) (+7 more)

### Community 2 - "AssessmentCreateForm.tsx"
Cohesion: 0.10
Nodes (20): AssessmentCreateForm(), goToPending(), setScopes(), submit(), toggleGroup(), toggleScope(), AssessmentPayload, BankMeter() (+12 more)

### Community 3 - "AttendancePanel.tsx"
Cohesion: 0.08
Nodes (31): CalendarSection(), CalendarViews(), statusLabel, activityDateKey(), CalendarYearView(), eventTimes(), statusLabel, weekdays (+23 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (41): dependencies, ffmpeg-static@^5.3.0, lucide-react@^0.468.0, next@16.4.6, pg@^8.23.1, react@^19.0.0, react-dom@^19.0.0, @supabase/supabase-js@^2.57.0 (+33 more)

### Community 5 - "swordplay/page.tsx"
Cohesion: 0.27
Nodes (9): concepts, equipment, metadata, rules, GraduationIcon(), Icon(), IconProps, RoundShieldIcon() (+1 more)

### Community 6 - "types.ts"
Cohesion: 0.09
Nodes (43): createInvite(), disableInvite(), defaultInstagramDateRange(), formFromPost(), MediaSection(), loadPostForm(), openEdit(), openNew() (+35 more)

### Community 7 - "Midias publicas"
Cohesion: 0.10
Nodes (30): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+22 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.07
Nodes (31): ActivityRow, AttendanceManager(), Correction, Entry, History, Member, readJson(), auditActionLabel (+23 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.13
Nodes (26): activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at, games_updated_at, media_items_post_id_idx (+18 more)

### Community 10 - "createAdminClient"
Cohesion: 0.14
Nodes (26): allRows(), GET(), PATCH(), DELETE(), PATCH(), POST(), runtime, GET() (+18 more)

### Community 11 - "Troca de contas"
Cohesion: 0.16
Nodes (32): DELETE(), GET(), NO_STORE, NO_STORE, POST(), POST(), GET(), NO_STORE (+24 more)

### Community 12 - "isSameOriginRequest"
Cohesion: 0.12
Nodes (34): NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST(), POST(), fields (+26 more)

### Community 13 - "PageHero"
Cohesion: 0.12
Nodes (23): GraduationPage(), metadata, tiers, tracks, GamesPage(), metadata, dynamicParams, GamePage() (+15 more)

### Community 14 - "AdminDashboard.tsx"
Cohesion: 0.12
Nodes (26): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+18 more)

### Community 15 - "useToast"
Cohesion: 0.09
Nodes (20): ConfirmContext, ConfirmOptions, Pending, useConfirm(), FormSectionHead(), MediaGalleryManager(), rankOptions, saveNotes() (+12 more)

### Community 16 - "Row Level Security"
Cohesion: 0.15
Nodes (25): dynamic, GET(), assessment_answers_review_idx, assessment_answers_state_guard, assessment_answers_updated_at, assessment_assignments_member_idx, assessment_assignments_number, assessment_assignments_status_idx (+17 more)

### Community 17 - "Emblemas de build + docs"
Cohesion: 0.09
Nodes (28): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), npm run prepare:emblems script, Image-generation base prompt for emblems (+20 more)

### Community 18 - "types.ts"
Cohesion: 0.13
Nodes (17): AdminTab, AssessmentAdminData, assessmentAdminQueryKey, emptyQuestion, MemberSummary, PendingReview, QuestionForm, ActivityTemplateData (+9 more)

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.13
Nodes (22): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+14 more)

### Community 20 - "ref_node_fs"
Cohesion: 0.25
Nodes (6): assert, fs, seo, { test }, ts, vm

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.10
Nodes (27): EditableProfile, EditMemberProfile(), openDialog(), submit(), AnswerBadge(), day(), MemberHomeView(), month() (+19 more)

### Community 22 - "sections/CalendarSection.tsx"
Cohesion: 0.16
Nodes (22): useAdminData(), AdminTitle(), CalendarSection(), loadActivityForm(), openEdit(), openNew(), removeActivity(), saveActivity() (+14 more)

### Community 23 - "public"
Cohesion: 0.10
Nodes (17): Profile completion with pending access-request approval (migration 011), Profile completion and rank-request test script, profiles_nickname_unique_idx, public.update_own_member_profile(), public.update_own_member_avatar(), public.update_own_member_profile_with_access_request(), public.check_registration_rate_limit(), public.update_own_member_profile_with_access_request() (+9 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.13
Nodes (24): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+16 more)

### Community 25 - "security-phrase.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), phrase, route(), { test }, ts, vm

### Community 26 - "member-notes.ts"
Cohesion: 0.06
Nodes (69): AdminLayout(), metadata, AdminPage(), metadata, NO_STORE, POST(), MemberNotesPage(), metadata (+61 more)

### Community 27 - "Configuracao do Site Oficial do DK (SETUP)"
Cohesion: 0.14
Nodes (19): Member birthdays calendar (migration 008), Private bucket dk-documents with temporary links, Content templates for posts and activities (migration 021), Documentos e PDFs internos (progressive access), Validation order (18 steps), Presenca nas atividades (/membro/atividades), Configuracao do Site Oficial do DK (SETUP), Supabase project creation (+11 more)

### Community 28 - "react"
Cohesion: 0.09
Nodes (19): AdminDialog(), accessLabel(), DocumentManager(), renderJoin(), renderRules(), newRule(), ruleLabel(), RulesState (+11 more)

### Community 29 - "public.registration_rate_limits"
Cohesion: 0.19
Nodes (9): invites_code_idx, public.invites, public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, public.release_registration_invite(), registration_rate_limits_window_idx, public.check_registration_rate_limit() (+1 more)

### Community 30 - "[token]/route.ts"
Cohesion: 0.35
Nodes (10): CandidateContext, candidatePayload(), expireOrSubmitIfNeeded(), GET(), getContext(), getDeadline(), PATCH(), POST() (+2 more)

### Community 31 - "eventos/page.tsx"
Cohesion: 0.12
Nodes (15): generateMetadata(), anchors, EventKind, externalEvents, hostedOptions, internalEvents, metadata, metadata (+7 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "app/layout.tsx"
Cohesion: 0.10
Nodes (10): cinzel, inter, metadata, RootLayout(), Footer(), InsigniaColorFilters(), QueryActivityFeedback(), QueryProvider() (+2 more)

### Community 34 - "createClient"
Cohesion: 0.21
Nodes (5): AvatarCropper(), MemberAvatar(), changePhoto(), removePhoto(), createClient()

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.15
Nodes (17): AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion(), reviewAnswer() (+9 more)

### Community 36 - "Select"
Cohesion: 0.20
Nodes (9): TemplateBar(), closeDialog(), rename(), saveNew(), updateApplied(), Select(), handleKeyDown(), openMenu() (+1 more)

### Community 37 - "Home, robots e skeletons"
Cohesion: 0.12
Nodes (18): metadata, HomePage(), metadata, portals, virtues, JSON-LD (organization, Article, BreadcrumbList), lib/seo.ts (canonical domain death-knights.com.br), Post-publication SEO checklist (Search Console, Lighthouse) (+10 more)

### Community 38 - "Cards de jogos"
Cohesion: 0.16
Nodes (13): GameCard(), GameDialog(), GameView, noopSubscribe(), categories, Filter, GameCatalogMetadata, gameCatalogMetadata (+5 more)

### Community 39 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "steps"
Cohesion: 0.12
Nodes (15): Future deployment (env vars, lint, build), runs-on, steps, jobs, build, name, on, pull_request (+7 more)

### Community 41 - "AssessmentRunner.tsx"
Cohesion: 0.13
Nodes (17): AssessmentPayload, AssessmentRunnerLoaded(), formatRemaining(), SafeQuestion, SavedAnswer, assessmentAssignmentStatusLabels, assessmentDifficultyOptions, assessmentQuestionTypeOptions (+9 more)

### Community 42 - "MembersSection"
Cohesion: 0.13
Nodes (17): Chip(), Medal(), MemberFilters(), optionLabel(), MembersSection(), canEditAccess(), canManageMember(), decideRegistration() (+9 more)

### Community 43 - "proxy.ts"
Cohesion: 0.43
Nodes (6): updateSession(), canonicalHost, cloudflareVisitorScheme(), config, httpsRedirect(), proxy()

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.16
Nodes (15): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+7 more)

### Community 45 - "assessments.ts"
Cohesion: 0.22
Nodes (15): POST(), POST(), Classificacao das questoes (manual, tipo, area, dificuldade), optionalText(), validateAssessmentDefinition(), validateAssessmentQuestion(), ValidationResult, isAssessmentDifficulty() (+7 more)

### Community 46 - "reset/route.ts"
Cohesion: 0.11
Nodes (20): NO_STORE, POST(), metadata, RegisterPage(), metadata, ResetPasswordPage(), AuthShell(), ResetPasswordForm() (+12 more)

### Community 47 - "MemberQueue.tsx"
Cohesion: 0.14
Nodes (15): adjustmentsOf(), commanderOptions, Draft, levelOptions, MemberQueue(), startAdjust(), Props, rankOptions (+7 more)

### Community 48 - "Teste storage Instagram"
Cohesion: 0.18
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "ref_node_fs"
Cohesion: 0.11
Nodes (13): apply, body, dir, subjects, outDir, templates, assert, fs (+5 more)

### Community 50 - "createClient"
Cohesion: 0.20
Nodes (12): POST(), LoginPage(), metadata, POST(), loginErrorMessage(), googleEnabledFromSettings(), isGoogleLoginAvailable(), SUPABASE_COOKIE_OPTIONS (+4 more)

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

### Community 55 - "sobre/page.tsx"
Cohesion: 0.25
Nodes (7): AboutPage(), metadata, steps, values, CalendarSkeleton(), SectionHeading(), WhatsAppIcon()

### Community 56 - "Teste mapas de jogos"
Cohesion: 0.18
Nodes (9): assert, expectedMaps, fs, { gameCatalogMetadata }, { gameFieldMaps }, { games }, { test }, ts (+1 more)

### Community 57 - "Teste anotacoes"
Cohesion: 0.18
Nodes (7): access, assert, fs, notes, { test }, ts, vm

### Community 58 - "SQL: logs do app"
Cohesion: 0.26
Nodes (12): assessment_audit_created_idx, public.assessment_audit_log, app_logs_category_idx, app_logs_created_at_idx, app_logs_level_idx, assessment_audit_log_created_at_idx, audit_log_viewer_permissions, public.app_logs (+4 more)

### Community 59 - "Teste filtros de membros"
Cohesion: 0.20
Nodes (7): access, assert, filters, fs, { test }, ts, vm

### Community 60 - "Teste estilo do membro"
Cohesion: 0.22
Nodes (8): assert, fs, load(), route(), style, { test }, ts, vm

### Community 61 - "Teste auth hardening e TypeScript"
Cohesion: 0.13
Nodes (11): assert, fs, { test }, ts, vm, assert, fs, moduleExports (+3 more)

### Community 62 - "assessment-server.ts"
Cohesion: 0.26
Nodes (10): POST(), shuffled(), POST(), DELETE(), PATCH(), AssessmentActor, getApprovedAssessmentActor(), requireAssessmentManager() (+2 more)

### Community 63 - "public.user_admin_roles"
Cohesion: 0.31
Nodes (13): Admin roles: principal, midias, atividades, membros, Bootstrap first ADM Principal via SQL, Four ADM levels action matrix, CMS (papeis de ADM), public.has_admin_role(), public.user_admin_roles, admin_audit_log_occurred_at_idx, admin_audit_log_target_idx (+5 more)

### Community 64 - "site-nav.ts"
Cohesion: 0.19
Nodes (10): motto, activityLinks, footerColumns, legalLinks, mainLinks, NavIcon, NavLink, formatBuildDate() (+2 more)

### Community 65 - "Teste titulos Instagram"
Cohesion: 0.22
Nodes (7): assert, { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost }, fs, photo, { test }, ts, vm

### Community 66 - "callback/route.ts"
Cohesion: 0.16
Nodes (19): backToLogin(), GET(), giveBack(), relativeRedirect(), ActiveSnapshot, callbackFailureCode(), decideGoogleLogin(), GoogleAccount (+11 more)

### Community 67 - "assessment-scoring.ts"
Cohesion: 0.29
Nodes (8): PATCH(), POST(), AssessmentAdmin, AssignmentItemLink, loadAssignmentItems(), AssessmentAdmin, recalculateAssessmentResult(), submitAssessmentAttempt()

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "015_graduation_tracks.sql"
Cohesion: 0.12
Nodes (7): Progressive document access (Bronze/Prata/Ouro, min rank), public.can_access_document(), public.can_access_document(), public.can_access_document(), profiles_sync_graduations, public.can_access_document(), public.sync_profile_graduations()

### Community 70 - "Teste datas relativas"
Cohesion: 0.15
Nodes (11): typescript, fs, path, ts, assert, fs, moduleExports, now (+3 more)

### Community 71 - "ref_node_assert"
Cohesion: 0.09
Nodes (19): assert, fs, subjects, { test }, assert, exportsMap, fs, { test } (+11 more)

### Community 72 - "[...path]/route.ts"
Cohesion: 0.18
Nodes (11): ALLOWED_PREFIXES, DELETE, GET, handle(), HEAD, PATCH, POST, PUT (+3 more)

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.36
Nodes (5): content_templates_kind_name_key, content_templates_updated_at, public.content_templates, public.sync_profile_email(), sync_profile_email

### Community 74 - "check-migrations.mjs"
Cohesion: 0.24
Nodes (11): Ordered migrations 001-012 applied manually in SQL Editor, byPrefix, duplicates, isKnown(), known, KNOWN_DUPLICATES, migrationsDir, unexpected (+3 more)

### Community 82 - "account-email.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), recovery, setup(), { test }, ts, vm

### Community 91 - "email-templates-deploy.test.cjs"
Cohesion: 0.18
Nodes (8): assert, fs, os, path, python, { spawnSync }, subjects, { test }

### Community 92 - "Insignia.tsx"
Cohesion: 0.19
Nodes (17): GraduationInsignia(), Insignia(), Variant, InsigniaBadge(), trackNames, lib/insignias.ts catalog, components/member/Insignia.tsx and app/insignias.css, Icones de patentes, graduacoes e builds (insignias) (+9 more)

### Community 93 - "public.member_notes"
Cohesion: 0.10
Nodes (24): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, denied(), POST() (+16 more)

### Community 94 - "MembersSection.tsx"
Cohesion: 0.11
Nodes (34): Props, MemberAccessForm, MemberStatusFilter, statusFilters, ChipOption, HeaderAccount, adminRoleOptions, documentAudienceOptions (+26 more)

### Community 95 - "react-dom"
Cohesion: 0.40
Nodes (3): GalleryItem, MediaGallery(), noopSubscribe()

### Community 96 - "password-recovery.test.cjs"
Cohesion: 0.18
Nodes (13): assert, fs, load(), now, recovery, requestRoute(), resetRoute(), run() (+5 more)

### Community 97 - "MemberHero.tsx"
Cohesion: 0.29
Nodes (12): AttendanceInsignias(), BirthdayBadge(), BuildInsignia(), GraduationInsignias(), RankInsignia(), MemberHero(), MemberInsignias(), MemberStyleToggle() (+4 more)

### Community 98 - "Avaliacoes e Simulados do DK"
Cohesion: 0.31
Nodes (9): Activation: migrations 009 and 010 plus three Supabase env vars, Audit history of assessment actions, Avaliacoes e Simulados do DK, Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation), Selecao manual de questoes, Sorteio individual por filtro (frozen random set per indication), Avaliacoes e simulados setup (migrations 009/010), Assessment test script (18 steps) (+1 more)

### Community 99 - "build-emblem.test.cjs"
Cohesion: 0.22
Nodes (7): assert, fs, { getBuildKey, getBuildIcon, buildOptions, normalizeBuildName }, { test }, ts, vm, { wreathLeaves, leafTip, leafPath, wreathStemPath, defaultWreath }

### Community 100 - "https-redirect.test.cjs"
Cohesion: 0.22
Nodes (6): assert, fs, SITE, { test }, ts, vm

### Community 101 - "ToastProvider.tsx"
Cohesion: 0.25
Nodes (7): icons, lifetime, ToastAction, ToastApi, ToastContext, ToastItem, ToastKind

### Community 104 - "next.config.ts"
Cohesion: 0.40
Nodes (4): contentSecurityPolicy, nextConfig, securityHeaders, supabaseOrigin

### Community 106 - "1. Texto em português"
Cohesion: 0.25
Nodes (7): 1. Texto em português, 2. Assinatura: SPF, DKIM e DMARC, 3. Frase de segurança (prova dentro do e-mail), Conferir se ficou assinado, E-mails de autenticação (português e assinatura), Projeto hospedado (teste), Servidor próprio (produção): automático no deploy

## Knowledge Gaps
- **5 isolated node(s):** `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 700 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `reset/route.ts` to `jsonApiFetch`, `AttendancePanel.tsx`, `package.json`, `Midias publicas`, `createAdminClient`, `Troca de contas`, `isSameOriginRequest`, `PageHero`, `AdminDashboard.tsx`, `Row Level Security`, `Registro e instrumentacao`, `ProfileEditDialog.tsx`, `member-notes.ts`, `[token]/route.ts`, `eventos/page.tsx`, `app/layout.tsx`, `createClient`, `Home, robots e skeletons`, `Cards de jogos`, `AssessmentRunner.tsx`, `proxy.ts`, `assessments.ts`, `MemberQueue.tsx`, `createClient`, `instagram-apify.ts`, `logs/route.ts`, `assessment-server.ts`, `site-nav.ts`, `assessment-scoring.ts`, `[...path]/route.ts`, `Insignia.tsx`, `public.member_notes`, `MembersSection.tsx`, `next.config.ts`?**
  _High betweenness centrality (0.216) - this node is a cross-community bridge._
- **What connects `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `jsonApiFetch` be split into smaller, more focused modules?**
  _Cohesion score 0.050239234449760764 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `jsonApiFetch`, `AssessmentCreateForm.tsx`, `AttendancePanel.tsx`, `package.json`, `swordplay/page.tsx`, `types.ts`, `Midias publicas`, `LogsViewer.tsx`, `PageHero`, `AdminDashboard.tsx`, `useToast`, `Emblemas de build + docs`, `types.ts`, `ProfileEditDialog.tsx`, `sections/CalendarSection.tsx`, `member-notes.ts`, `app/layout.tsx`, `createClient`, `Home, robots e skeletons`, `Cards de jogos`, `AssessmentRunner.tsx`, `reset/route.ts`, `MemberQueue.tsx`, `sobre/page.tsx`, `site-nav.ts`, `Insignia.tsx`, `MembersSection.tsx`, `react-dom`, `MemberHero.tsx`, `ToastProvider.tsx`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Should `AssessmentCreateForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10461538461538461 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `Teste datas relativas` to `package.json`, `ref_node_fs`, `security-phrase.test.cjs`, `Teste login Google`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `ref_node_fs`, `Teste cofre de contas`, `Teste app-log`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `Teste auth hardening e TypeScript`, `Teste titulos Instagram`, `Teste senha`, `ref_node_assert`, `account-email.test.cjs`, `password-recovery.test.cjs`, `build-emblem.test.cjs`, `https-redirect.test.cjs`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Should `AttendancePanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08414634146341464 - nodes in this community are weakly interconnected._