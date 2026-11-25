# Graph Report - site-oficial-dk  (2026-11-25)

## Corpus Check
- 320 files · ~144,115 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 12, .example 1, (none) 1)

## Summary
- 2002 nodes · 5309 edges · 109 communities (90 shown, 19 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 125 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6f01faa9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NoteList.tsx
- Login com Google (section 14)
- AssessmentCreateForm.tsx
- sobre/page.tsx
- package.json
- swordplay/page.tsx
- membro/layout.tsx
- Midias publicas
- LogsViewer.tsx
- SQL+docs: perfil, rank e acesso a documentos
- createAdminClient
- Troca de contas
- isSameOriginRequest
- PageHero
- AdminDashboard.tsx
- sections/CalendarSection.tsx
- Row Level Security
- Emblemas de build + docs
- jsonApiFetch
- Registro e instrumentacao
- relative-day.test.cjs
- ProfileEditDialog.tsx
- member-notes-server.ts
- public
- Realtime SSE
- security-phrase.test.cjs
- AttendancePanel.tsx
- Configuracao do Site Oficial do DK (SETUP)
- useToast
- public.registration_rate_limits
- react
- MemberHero.tsx
- Teste login Google
- app/layout.tsx
- createClient
- Admin de avaliacoes (acoes)
- MediaSection.tsx
- Home, robots e skeletons
- Cards de jogos
- Config TypeScript
- steps
- types.ts
- MembersSection
- requireAdmin
- Teste de fluxo de perfil
- assessments.ts
- AuthShell
- client.ts
- Teste storage Instagram
- ref_node_fs
- MemberHomeView.tsx
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
- attendance-share.test.cjs
- 013_admin_authorization_hardening.sql
- dependencies
- Teste titulos Instagram
- callback/route.ts
- scripts
- Teste senha
- 015_graduation_tracks.sql
- assessment-server.ts
- ref_node_assert
- [...path]/route.ts
- SQL+doc: templates de conteudo
- public.member_notes
- Loading admin
- Loading login
- SQL: zodiaco
- account-email.test.cjs
- graphify-agent-guard.js
- Project instructions
- 026_notes_settings.sql
- Insignia.tsx
- member-notes.ts
- MembersSection.tsx
- [token]/route.ts
- password-recovery.test.cjs
- pg
- server.ts
- build-emblem.test.cjs
- https-redirect.test.cjs
- isGoogleLoginAvailable
- react-dom
- next.config.ts
- 1. Texto em português
- typescript
- content-templates.test.cjs
- seo.test.cjs
- public.set_own_whatsapp

## God Nodes (most connected - your core abstractions)
1. `next` - 99 edges
2. `react` - 87 edges
3. `public.profiles` - 77 edges
4. `lucide-react` - 72 edges
5. `createAdminClient()` - 47 edges
6. `createClient()` - 44 edges
7. `jsonApiFetch()` - 43 edges
8. `MembersSection()` - 41 edges
9. `isSameOriginRequest()` - 37 edges
10. `forbidden()` - 36 edges

## Surprising Connections (you probably didn't know these)
- `Seguranca (convite, aprovacao, RLS, bucket privado)` --references--> `public.documents`  [INFERRED]
  README.md → supabase/migrations/001_initial_schema.sql
- `Snapshot of questions in published assessments` --references--> `public.assessment_items`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Audit history of assessment actions` --references--> `public.assessment_audit_log`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Progressive document access (Bronze/Prata/Ouro, min rank)` --references--> `public.can_access_document()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/001_initial_schema.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/015_graduation_tracks.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (109 total, 19 thin omitted)

### Community 0 - "NoteList.tsx"
Cohesion: 0.12
Nodes (20): fold(), NoteComposer(), call(), dayLabel(), formatDate(), NoteItem, NoteList(), remove() (+12 more)

### Community 1 - "Login com Google (section 14)"
Cohesion: 0.11
Nodes (23): Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Orphan accounts without profile (14.7), Disable public sign-ups (14.5), Delete Google-created account when no profile exists (/auth/callback), Google Cloud Console configuration (14.1), Self-hosted Supabase GoTrue Google env vars (14.3) (+15 more)

### Community 2 - "AssessmentCreateForm.tsx"
Cohesion: 0.10
Nodes (20): AssessmentCreateForm(), goToPending(), setScopes(), submit(), toggleGroup(), toggleScope(), AssessmentPayload, BankMeter() (+12 more)

### Community 3 - "sobre/page.tsx"
Cohesion: 0.13
Nodes (15): revalidate, AboutPage(), metadata, steps, values, metadata, TermsPage(), Footer() (+7 more)

### Community 4 - "package.json"
Cohesion: 0.16
Nodes (16): devDependencies, eslint@^9.0.0, eslint-config-next@^16.4.6, @types/node@^22.0.0, @types/pg@^8.23.1, @types/react@^19.0.0, @types/react-dom@^19.0.0, name (+8 more)

### Community 5 - "swordplay/page.tsx"
Cohesion: 0.19
Nodes (12): HeaderAccount, GraduationIcon(), Icon(), IconProps, RoundShieldIcon(), SpearIcon(), activityLinks, footerColumns (+4 more)

### Community 6 - "membro/layout.tsx"
Cohesion: 0.10
Nodes (25): AdminLayout(), metadata, metadata, PrivateLayout(), AdminProviders(), ConfirmProvider(), ToastProvider(), listeners (+17 more)

### Community 7 - "Midias publicas"
Cohesion: 0.10
Nodes (30): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+22 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.09
Nodes (23): auditActionLabel, auditCategoryLabel, auditCategoryOptions, formatDate(), JsonBlock(), copy(), levelBadge, levelLabel (+15 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.10
Nodes (35): Expected permission matrix (pending, member, officer), Seguranca (convite, aprovacao, RLS, bucket privado), activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at (+27 more)

### Community 10 - "createAdminClient"
Cohesion: 0.17
Nodes (19): DELETE(), PATCH(), POST(), runtime, ADJUSTABLE_FIELDS, ALLOWED_STATUSES, COMMANDER_FIELDS, COMMANDER_OF (+11 more)

### Community 11 - "Troca de contas"
Cohesion: 0.15
Nodes (34): DELETE(), GET(), NO_STORE, NO_STORE, POST(), GET(), NO_STORE, LoginPage() (+26 more)

### Community 12 - "isSameOriginRequest"
Cohesion: 0.16
Nodes (32): NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST() (+24 more)

### Community 13 - "PageHero"
Cohesion: 0.11
Nodes (30): GraduationPage(), metadata, tiers, tracks, GamesPage(), metadata, dynamicParams, GamePage() (+22 more)

### Community 14 - "AdminDashboard.tsx"
Cohesion: 0.12
Nodes (22): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+14 more)

### Community 15 - "sections/CalendarSection.tsx"
Cohesion: 0.12
Nodes (21): useConfirm(), CalendarSection(), loadActivityForm(), openEdit(), openNew(), saveActivity(), endOf(), monthLabel() (+13 more)

### Community 16 - "Row Level Security"
Cohesion: 0.16
Nodes (22): assessment_answers_review_idx, assessment_answers_state_guard, assessment_answers_updated_at, assessment_assignments_member_idx, assessment_assignments_number, assessment_assignments_status_idx, assessment_assignments_updated_at, assessment_audit_created_idx (+14 more)

### Community 17 - "Emblemas de build + docs"
Cohesion: 0.09
Nodes (28): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), npm run prepare:emblems script, Image-generation base prompt for emblems (+20 more)

### Community 18 - "jsonApiFetch"
Cohesion: 0.17
Nodes (17): empty, RegistrationForm(), submit(), initialsOf(), SavedAccounts(), enter(), forget(), Header() (+9 more)

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.12
Nodes (21): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+13 more)

### Community 20 - "relative-day.test.cjs"
Cohesion: 0.25
Nodes (7): assert, fs, moduleExports, now, { test }, ts, vm

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.16
Nodes (21): ResetPasswordForm(), handleSubmit(), EditableProfile, EditMemberProfile(), submit(), countProfileChanges(), EMPTY_PASSWORD, PasswordState (+13 more)

### Community 22 - "member-notes-server.ts"
Cohesion: 0.20
Nodes (18): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, POST(), runtime (+10 more)

### Community 23 - "public"
Cohesion: 0.11
Nodes (14): Profile completion with pending access-request approval (migration 011), Profile completion and rank-request test script, profiles_nickname_unique_idx, public.update_own_member_profile(), public.update_own_member_avatar(), public.update_own_member_profile_with_access_request(), public.check_registration_rate_limit(), public.update_own_member_profile_with_access_request() (+6 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.13
Nodes (24): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+16 more)

### Community 25 - "security-phrase.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), phrase, route(), { test }, ts, vm

### Community 26 - "AttendancePanel.tsx"
Cohesion: 0.05
Nodes (72): AdminPage(), metadata, MemberNotesPage(), metadata, MemberActivitiesPage(), metadata, MemberDocumentsPage(), metadata (+64 more)

### Community 27 - "Configuracao do Site Oficial do DK (SETUP)"
Cohesion: 0.17
Nodes (22): Member birthdays calendar (migration 008), Content templates for posts and activities (migration 021), Documentos e PDFs internos (progressive access), Validation order (18 steps), Admin roles: principal, midias, atividades, membros, Presenca nas atividades (/membro/atividades), Bootstrap first ADM Principal via SQL, Configuracao do Site Oficial do DK (SETUP) (+14 more)

### Community 28 - "useToast"
Cohesion: 0.10
Nodes (30): useAdminData(), AdminTitle(), ActivityRow, AttendanceManager(), Correction, Entry, History, Member (+22 more)

### Community 29 - "public.registration_rate_limits"
Cohesion: 0.24
Nodes (6): public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, registration_rate_limits_window_idx, public.check_registration_rate_limit(), public.check_registration_rate_limit()

### Community 30 - "react"
Cohesion: 0.14
Nodes (15): AdminDialog(), CommandPalette(), choose(), onKeyDown(), normalize(), Result, ConfirmContext, ConfirmOptions (+7 more)

### Community 31 - "MemberHero.tsx"
Cohesion: 0.27
Nodes (10): AttendanceInsignias(), BuildInsignia(), GraduationInsignias(), RankInsignia(), MemberHero(), MemberInsignias(), ProfileEditDialog(), sendResetLink() (+2 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "app/layout.tsx"
Cohesion: 0.10
Nodes (11): cinzel, inter, metadata, RootLayout(), InsigniaColorFilters(), QueryActivityFeedback(), QueryProvider(), Listener (+3 more)

### Community 34 - "createClient"
Cohesion: 0.16
Nodes (5): AvatarCropper(), Point, MemberAvatar(), changePhoto(), removePhoto()

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.11
Nodes (25): AdminTab, AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion() (+17 more)

### Community 36 - "MediaSection.tsx"
Cohesion: 0.06
Nodes (51): FormSectionHead(), MediaGalleryManager(), defaultInstagramDateRange(), formFromPost(), MediaSection(), loadPostForm(), openEdit(), openNew() (+43 more)

### Community 37 - "Home, robots e skeletons"
Cohesion: 0.11
Nodes (19): metadata, HomePage(), metadata, portals, virtues, JSON-LD (organization, Article, BreadcrumbList), lib/seo.ts (canonical domain death-knights.com.br), Open Graph / Twitter metadata and default social image (+11 more)

### Community 38 - "Cards de jogos"
Cohesion: 0.14
Nodes (15): GameCard(), GameDialog(), GameView, noopSubscribe(), catalog, categories, Filter, GameCatalogMetadata (+7 more)

### Community 39 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "steps"
Cohesion: 0.12
Nodes (15): Future deployment (env vars, lint, build), runs-on, steps, jobs, build, name, on, pull_request (+7 more)

### Community 41 - "types.ts"
Cohesion: 0.09
Nodes (21): AssessmentPayload, AssessmentRunnerLoaded(), formatRemaining(), SafeQuestion, SavedAnswer, assessmentAssignmentStatusLabels, assessmentTrackOptions, rankShortLabels (+13 more)

### Community 42 - "MembersSection"
Cohesion: 0.16
Nodes (18): removeActivity(), createInvite(), disableInvite(), MembersSection(), canEditAccess(), canManageMember(), decideRegistration(), deleteMember() (+10 more)

### Community 43 - "requireAdmin"
Cohesion: 0.27
Nodes (9): allRows(), GET(), PATCH(), GET(), GET(), NO_STORE, POST(), AdminSession (+1 more)

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.16
Nodes (15): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+7 more)

### Community 45 - "assessments.ts"
Cohesion: 0.22
Nodes (18): optionalText(), validateAssessmentDefinition(), validateAssessmentQuestion(), ValidationResult, assessmentDifficultyOptions, assessmentQuestionTypeOptions, assessmentSelectionModeOptions, delegableAssessmentRanks (+10 more)

### Community 46 - "AuthShell"
Cohesion: 0.15
Nodes (11): metadata, RegisterPage(), ForgotPasswordPage(), metadata, metadata, ResetPasswordPage(), AuthShell(), ForgotPasswordForm() (+3 more)

### Community 47 - "client.ts"
Cohesion: 0.27
Nodes (10): GoogleIcon(), LoginForm(), handleGoogle(), handleSubmit(), CLIENT_HEADER, isSupabaseConfigured(), PROXIED_PREFIXES, proxiedPath() (+2 more)

### Community 48 - "Teste storage Instagram"
Cohesion: 0.17
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "ref_node_fs"
Cohesion: 0.20
Nodes (6): apply, body, dir, subjects, outDir, templates

### Community 50 - "MemberHomeView.tsx"
Cohesion: 0.28
Nodes (10): AnswerBadge(), day(), MemberHomeView(), month(), time(), TrackGroup(), houseFor(), relativeDayLabel() (+2 more)

### Community 51 - "instagram-apify.ts"
Cohesion: 0.06
Nodes (48): GET(), isDateOnly(), maxDuration, POST(), runSync(), runtime, CRON_SECRET scheduled sync endpoint /api/admin/instagram/sync, FFmpeg video compression (50-250 MB to MP4 H.264/AAC) (+40 more)

### Community 52 - "Teste cofre de contas"
Cohesion: 0.18
Nodes (8): assert, fs, plain(), raw, { test }, ts, vault, vm

### Community 53 - "Teste app-log"
Cohesion: 0.20
Nodes (10): assert, clientIp, fs, load(), loadAppLog(), loadLogsRoute(), sanitize, { test } (+2 more)

### Community 54 - "logs/route.ts"
Cohesion: 0.25
Nodes (8): FeedRow, GET(), LEVELS, NO_STORE, PERIODS, safeSearch(), SECTIONS, SERVER_SOURCES

### Community 55 - "sobre/page.tsx"
Cohesion: 0.23
Nodes (9): anchors, EventKind, EventsPage(), externalEvents, hostedOptions, internalEvents, metadata, CalendarSkeleton() (+1 more)

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
Nodes (10): assert, fs, { test }, ts, vm, assert, fs, { test } (+2 more)

### Community 62 - "attendance-share.test.cjs"
Cohesion: 0.18
Nodes (9): activity, assert, { buildShareText, whatsappShareUrl }, fs, { normalizeWhatsapp, maskPhone, phoneFieldValue }, roster, { test }, ts (+1 more)

### Community 63 - "013_admin_authorization_hardening.sql"
Cohesion: 0.52
Nodes (6): admin_audit_log_occurred_at_idx, admin_audit_log_target_idx, audit_invites, audit_user_admin_roles, public.admin_audit_log, public.log_admin_audit()

### Community 64 - "dependencies"
Cohesion: 0.24
Nodes (10): dependencies, ffmpeg-static@^5.3.0, lucide-react@^0.468.0, next@16.4.6, react@^19.0.0, @supabase/ssr@^0.8.0, @supabase/supabase-js@^2.57.0, @tanstack/react-query@^5.104.3 (+2 more)

### Community 65 - "Teste titulos Instagram"
Cohesion: 0.22
Nodes (7): assert, { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost }, fs, photo, { test }, ts, vm

### Community 66 - "callback/route.ts"
Cohesion: 0.13
Nodes (23): backToLogin(), GET(), giveBack(), relativeRedirect(), Supabase Site URL and Redirect URLs (/auth/callback), Redirect URL configuration (14.4), ActiveSnapshot, callbackFailureCode() (+15 more)

### Community 67 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, apply:email-templates, build, check:migrations, check:realtime, dev, lint, prepare:emblems (+2 more)

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "015_graduation_tracks.sql"
Cohesion: 0.13
Nodes (6): Progressive document access (Bronze/Prata/Ouro, min rank), public.can_access_document(), public.can_access_document(), profiles_sync_graduations, public.can_access_document(), public.sync_profile_graduations()

### Community 70 - "assessment-server.ts"
Cohesion: 0.11
Nodes (27): POST(), shuffled(), POST(), DELETE(), PATCH(), POST(), dynamic, GET() (+19 more)

### Community 71 - "ref_node_assert"
Cohesion: 0.12
Nodes (14): assert, fs, subjects, { test }, assert, exportsMap, fs, { test } (+6 more)

### Community 72 - "[...path]/route.ts"
Cohesion: 0.18
Nodes (10): ALLOWED_PREFIXES, DELETE, GET, HEAD, PATCH, POST, PUT, STRIPPED_REQUEST_HEADERS (+2 more)

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.36
Nodes (5): content_templates_kind_name_key, content_templates_updated_at, public.content_templates, public.sync_profile_email(), sync_profile_email

### Community 74 - "public.member_notes"
Cohesion: 0.31
Nodes (8): dk_broadcast_change, member_notes_author_idx, member_notes_before_write, member_notes_recipient_idx, public.can_write_member_notes(), public.member_notes, public.member_notes_before_write(), public.notes_min_rank()

### Community 82 - "account-email.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), recovery, setup(), { test }, ts, vm

### Community 92 - "Insignia.tsx"
Cohesion: 0.14
Nodes (22): openDialog(), GraduationInsignia(), Insignia(), Variant, InsigniaBadge(), NoteSeal(), trackNames, profileFormFrom() (+14 more)

### Community 93 - "member-notes.ts"
Cohesion: 0.11
Nodes (24): fields, GET(), NO_STORE, POST(), runtime, DEFAULT_NOTES_SETTINGS, isRank(), isScope() (+16 more)

### Community 94 - "MembersSection.tsx"
Cohesion: 0.06
Nodes (56): accessLabel(), ruleLabel(), RulesState, Chip(), Medal(), MemberFilters(), optionLabel(), Props (+48 more)

### Community 95 - "[token]/route.ts"
Cohesion: 0.18
Nodes (18): PATCH(), POST(), CandidateContext, candidatePayload(), expireOrSubmitIfNeeded(), GET(), getContext(), getDeadline() (+10 more)

### Community 96 - "password-recovery.test.cjs"
Cohesion: 0.18
Nodes (13): assert, fs, load(), now, recovery, requestRoute(), resetRoute(), run() (+5 more)

### Community 97 - "pg"
Cohesion: 0.40
Nodes (4): pg@^8.23.1, pg, client, url

### Community 98 - "server.ts"
Cohesion: 0.16
Nodes (13): NO_STORE, POST(), POST(), isMemberStyle(), SUPABASE_COOKIE_OPTIONS, updateSession(), isSupabaseConfigured(), canonicalHost (+5 more)

### Community 99 - "build-emblem.test.cjs"
Cohesion: 0.22
Nodes (7): assert, fs, { getBuildKey, getBuildIcon, buildOptions, normalizeBuildName }, { test }, ts, vm, { wreathLeaves, leafTip, leafPath, wreathStemPath, defaultWreath }

### Community 100 - "https-redirect.test.cjs"
Cohesion: 0.22
Nodes (6): assert, fs, SITE, { test }, ts, vm

### Community 104 - "next.config.ts"
Cohesion: 0.40
Nodes (4): contentSecurityPolicy, nextConfig, securityHeaders, supabaseOrigin

### Community 106 - "1. Texto em português"
Cohesion: 0.25
Nodes (7): 1. Texto em português, 2. Assinatura: SPF, DKIM e DMARC, 3. Frase de segurança (prova dentro do e-mail), Conferir se ficou assinado, E-mails de autenticação (português e assinatura), Projeto hospedado (teste), Servidor próprio (produção): automático no deploy

### Community 108 - "typescript"
Cohesion: 0.22
Nodes (8): typescript@^5.7.0, typescript, assert, fs, moduleExports, { test }, ts, vm

### Community 109 - "content-templates.test.cjs"
Cohesion: 0.22
Nodes (7): assert, fs, lib, path, { test }, ts, vm

### Community 111 - "seo.test.cjs"
Cohesion: 0.25
Nodes (6): assert, fs, seo, { test }, ts, vm

## Knowledge Gaps
- **5 isolated node(s):** `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 713 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `AuthShell` to `NoteList.tsx`, `sobre/page.tsx`, `package.json`, `swordplay/page.tsx`, `membro/layout.tsx`, `Midias publicas`, `createAdminClient`, `Troca de contas`, `isSameOriginRequest`, `PageHero`, `AdminDashboard.tsx`, `jsonApiFetch`, `Registro e instrumentacao`, `ProfileEditDialog.tsx`, `member-notes-server.ts`, `AttendancePanel.tsx`, `app/layout.tsx`, `createClient`, `Home, robots e skeletons`, `Cards de jogos`, `types.ts`, `requireAdmin`, `client.ts`, `MemberHomeView.tsx`, `instagram-apify.ts`, `logs/route.ts`, `dependencies`, `assessment-server.ts`, `[...path]/route.ts`, `Insignia.tsx`, `member-notes.ts`, `MembersSection.tsx`, `[token]/route.ts`, `server.ts`, `next.config.ts`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **What connects `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NoteList.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `typescript` to `package.json`, `relative-day.test.cjs`, `security-phrase.test.cjs`, `Teste login Google`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `instagram-apify.ts`, `Teste cofre de contas`, `Teste app-log`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `Teste auth hardening e TypeScript`, `attendance-share.test.cjs`, `Teste titulos Instagram`, `Teste senha`, `ref_node_assert`, `account-email.test.cjs`, `password-recovery.test.cjs`, `build-emblem.test.cjs`, `https-redirect.test.cjs`, `content-templates.test.cjs`, `seo.test.cjs`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Should `Login com Google (section 14)` be split into smaller, more focused modules?**
  _Cohesion score 0.11076923076923077 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `NoteList.tsx`, `AssessmentCreateForm.tsx`, `package.json`, `swordplay/page.tsx`, `membro/layout.tsx`, `Midias publicas`, `LogsViewer.tsx`, `PageHero`, `AdminDashboard.tsx`, `sections/CalendarSection.tsx`, `Emblemas de build + docs`, `jsonApiFetch`, `ProfileEditDialog.tsx`, `AttendancePanel.tsx`, `useToast`, `app/layout.tsx`, `createClient`, `Admin de avaliacoes (acoes)`, `MediaSection.tsx`, `Home, robots e skeletons`, `Cards de jogos`, `types.ts`, `AuthShell`, `client.ts`, `MemberHomeView.tsx`, `sobre/page.tsx`, `dependencies`, `Insignia.tsx`, `MembersSection.tsx`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Should `AssessmentCreateForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10461538461538461 - nodes in this community are weakly interconnected._