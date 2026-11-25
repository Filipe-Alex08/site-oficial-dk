# Graph Report - site-oficial-dk  (2026-11-25)

## Corpus Check
- 321 files · ~144,749 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 12, .example 1, (none) 1)

## Summary
- 2007 nodes · 5328 edges · 100 communities (84 shown, 16 thin omitted)
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
- viewer.ts
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
- MediaSection.tsx
- Row Level Security
- Emblemas de build + docs
- jsonApiFetch
- Registro e instrumentacao
- relative-day.test.cjs
- ProfileEditDialog.tsx
- settings/route.ts
- public
- Realtime SSE
- security-phrase.test.cjs
- anotacoes/page.tsx
- Configuracao do Site Oficial do DK (SETUP)
- useToast
- public.registration_rate_limits
- DocumentManager.tsx
- AttendancePanel.tsx
- Teste login Google
- app/layout.tsx
- createClient
- Admin de avaliacoes (acoes)
- sections/CalendarSection.tsx
- Home, robots e skeletons
- Cards de jogos
- Config TypeScript
- steps
- types.ts
- MembersSection
- components/CalendarSection.tsx
- Teste de fluxo de perfil
- assessments.ts
- AuthShell
- AssessmentAdmin.tsx
- Teste storage Instagram
- ref_node_fs
- MemberHomeView.tsx
- instagram-apify.ts
- Teste cofre de contas
- Teste app-log
- logs/route.ts
- admin/layout.tsx
- Teste mapas de jogos
- Teste anotacoes
- SQL: logs do app
- Teste filtros de membros
- Teste estilo do membro
- Teste auth hardening e TypeScript
- attendance-share.test.cjs
- 013_admin_authorization_hardening.sql
- AssessmentCreateForm.tsx
- Teste titulos Instagram
- callback/route.ts
- email-templates-deploy.test.cjs
- Teste senha
- Area do membro
- ref_node_assert
- [...path]/route.ts
- SQL+doc: templates de conteudo
- Loading admin
- Loading login
- SQL: zodiaco
- account-email.test.cjs
- graphify-agent-guard.js
- Project instructions
- Insignia.tsx
- member-notes.ts
- MembersSection.tsx
- [token]/route.ts
- password-recovery.test.cjs
- proxy.ts
- build-emblem.test.cjs
- typescript
- next.config.ts
- 1. Texto em português
- public.set_own_whatsapp

## God Nodes (most connected - your core abstractions)
1. `next` - 100 edges
2. `react` - 88 edges
3. `public.profiles` - 77 edges
4. `lucide-react` - 73 edges
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
- `Progressive document access (Bronze/Prata/Ouro, min rank)` --references--> `public.can_access_document()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/015_graduation_tracks.sql
- `Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation)` --references--> `public.can_manage_assessments()`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Image-generation base prompt for emblems` --semantically_similar_to--> `Medalhoes de arquearia (bronze master + SVG filters for prata/ouro)`  [INFERRED] [semantically similar]
  art/builds/LEIA-ME.md → docs/INSIGNIAS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (100 total, 16 thin omitted)

### Community 0 - "NoteList.tsx"
Cohesion: 0.13
Nodes (19): fold(), NoteComposer(), submit(), call(), dayLabel(), formatDate(), NoteItem, NoteList() (+11 more)

### Community 1 - "Login com Google (section 14)"
Cohesion: 0.09
Nodes (26): Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Supabase Site URL and Redirect URLs (/auth/callback), Orphan accounts without profile (14.7), Disable public sign-ups (14.5), .env.local keys (Supabase URL, publishable key, secret key, site URL), Delete Google-created account when no profile exists (/auth/callback) (+18 more)

### Community 2 - "AssessmentCreateForm.tsx"
Cohesion: 0.16
Nodes (11): AssessmentCreateForm(), goToPending(), setScopes(), submit(), toggleGroup(), toggleScope(), BankMeter(), Field() (+3 more)

### Community 3 - "viewer.ts"
Cohesion: 0.16
Nodes (17): MemberPage(), metadata, UpcomingActivity, getMemberBadges, getNotesSettings, usesPasswordLogin(), readSecurityPhrase(), SECURITY_PHRASE_KEY (+9 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (40): dependencies, ffmpeg-static@^5.3.0, lucide-react@^0.468.0, next@16.4.6, pg@^8.23.1, react@^19.0.0, @supabase/supabase-js@^2.57.0, @tanstack/react-query@^5.104.3 (+32 more)

### Community 5 - "swordplay/page.tsx"
Cohesion: 0.25
Nodes (9): GraduationIcon(), Icon(), IconProps, RoundShieldIcon(), SpearIcon(), activityLinks, legalLinks, NavIcon (+1 more)

### Community 6 - "membro/layout.tsx"
Cohesion: 0.15
Nodes (18): metadata, PrivateLayout(), listeners, useStoredFlag(), Badges, MemberNav(), NavItem, MemberThemeContext (+10 more)

### Community 7 - "Midias publicas"
Cohesion: 0.09
Nodes (32): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+24 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.08
Nodes (25): SelectField(), auditActionLabel, auditCategoryLabel, auditCategoryOptions, formatDate(), JsonBlock(), copy(), levelBadge (+17 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.08
Nodes (31): Progressive document access (Bronze/Prata/Ouro, min rank), Seguranca (convite, aprovacao, RLS, bucket privado), activities_updated_at, activity_attendance_updated_at, documents_access_idx, documents_updated_at, games_updated_at, invites_code_idx (+23 more)

### Community 10 - "createAdminClient"
Cohesion: 0.12
Nodes (30): allRows(), GET(), PATCH(), DELETE(), PATCH(), POST(), runtime, GET() (+22 more)

### Community 11 - "Troca de contas"
Cohesion: 0.13
Nodes (36): DELETE(), GET(), NO_STORE, NO_STORE, POST(), GET(), NO_STORE, LoginPage() (+28 more)

### Community 12 - "isSameOriginRequest"
Cohesion: 0.20
Nodes (27): NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST() (+19 more)

### Community 13 - "PageHero"
Cohesion: 0.10
Nodes (36): GraduationPage(), metadata, tiers, tracks, GamesPage(), metadata, dynamicParams, GamePage() (+28 more)

### Community 14 - "AdminDashboard.tsx"
Cohesion: 0.12
Nodes (27): AdminPage(), metadata, AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot (+19 more)

### Community 15 - "MediaSection.tsx"
Cohesion: 0.10
Nodes (25): useConfirm(), FormSectionHead(), MediaGalleryManager(), defaultInstagramDateRange(), formFromPost(), MediaSection(), loadPostForm(), openEdit() (+17 more)

### Community 16 - "Row Level Security"
Cohesion: 0.13
Nodes (29): POST(), shuffled(), dynamic, assessment_answers_review_idx, assessment_answers_state_guard, assessment_answers_updated_at, assessment_assignments_member_idx, assessment_assignments_number (+21 more)

### Community 17 - "Emblemas de build + docs"
Cohesion: 0.10
Nodes (27): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), npm run prepare:emblems script, Image-generation base prompt for emblems (+19 more)

### Community 18 - "jsonApiFetch"
Cohesion: 0.10
Nodes (32): AuthInput(), PasswordInput(), GoogleIcon(), LoginForm(), handleGoogle(), handleSubmit(), empty, RegistrationForm() (+24 more)

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.12
Nodes (21): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+13 more)

### Community 20 - "relative-day.test.cjs"
Cohesion: 0.25
Nodes (7): assert, fs, moduleExports, now, { test }, ts, vm

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.11
Nodes (26): ResetPasswordForm(), handleSubmit(), EditableProfile, EditMemberProfile(), openDialog(), submit(), countProfileChanges(), EMPTY_PASSWORD (+18 more)

### Community 22 - "settings/route.ts"
Cohesion: 0.21
Nodes (11): fields, GET(), NO_STORE, runtime, POST(), runtime, loadNotesSettings(), NotesSettings (+3 more)

### Community 23 - "public"
Cohesion: 0.07
Nodes (20): Profile completion with pending access-request approval (migration 011), Profile completion and rank-request test script, profiles_nickname_unique_idx, public.update_own_member_profile(), public.update_own_member_avatar(), public.update_own_member_profile_with_access_request(), public.check_registration_rate_limit(), public.update_own_member_profile_with_access_request() (+12 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.13
Nodes (24): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+16 more)

### Community 25 - "security-phrase.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), phrase, route(), { test }, ts, vm

### Community 26 - "anotacoes/page.tsx"
Cohesion: 0.20
Nodes (20): MemberNotesPage(), metadata, MemberActivitiesPage(), metadata, MemberDocumentsPage(), metadata, formatDate(), MemberAssessmentsPage() (+12 more)

### Community 27 - "Configuracao do Site Oficial do DK (SETUP)"
Cohesion: 0.13
Nodes (26): POST(), Activation: migrations 009 and 010 plus three Supabase env vars, Audit history of assessment actions, Avaliacoes e Simulados do DK, Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation), Selecao manual de questoes, Sorteio individual por filtro (frozen random set per indication), Member birthdays calendar (migration 008) (+18 more)

### Community 28 - "useToast"
Cohesion: 0.08
Nodes (35): useAdminData(), AdminTitle(), ActivityRow, AttendanceManager(), Correction, Entry, History, Member (+27 more)

### Community 29 - "public.registration_rate_limits"
Cohesion: 0.24
Nodes (6): public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, registration_rate_limits_window_idx, public.check_registration_rate_limit(), public.check_registration_rate_limit()

### Community 30 - "DocumentManager.tsx"
Cohesion: 0.08
Nodes (22): AdminDialog(), ConfirmContext, ConfirmOptions, Pending, accessLabel(), DocumentManager(), renderJoin(), renderRules() (+14 more)

### Community 31 - "AttendancePanel.tsx"
Cohesion: 0.15
Nodes (20): AttendanceInsignias(), AttendancePanel(), copyList(), listText(), shareOnWhatsApp(), Filter, filterLabels, isActivityClosed() (+12 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "app/layout.tsx"
Cohesion: 0.08
Nodes (18): cinzel, inter, metadata, RootLayout(), AboutPage(), metadata, steps, values (+10 more)

### Community 34 - "createClient"
Cohesion: 0.15
Nodes (8): AvatarCropper(), Point, MemberAvatar(), changePhoto(), removePhoto(), createClient(), react-dom@^19.0.0, react-dom

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.16
Nodes (17): AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion(), reviewAnswer() (+9 more)

### Community 36 - "sections/CalendarSection.tsx"
Cohesion: 0.08
Nodes (43): CalendarSection(), loadActivityForm(), openEdit(), openNew(), saveActivity(), endOf(), monthLabel(), Period (+35 more)

### Community 37 - "Home, robots e skeletons"
Cohesion: 0.09
Nodes (24): HomePage(), metadata, portals, virtues, metadata, PrivacyPage(), revalidate, metadata (+16 more)

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
Cohesion: 0.14
Nodes (12): AssessmentPayload, AssessmentRunnerLoaded(), formatRemaining(), SafeQuestion, SavedAnswer, assessmentAssignmentStatusLabels, assessmentTrackOptions, rankShortLabels (+4 more)

### Community 42 - "MembersSection"
Cohesion: 0.19
Nodes (15): removeActivity(), MembersSection(), canEditAccess(), canManageMember(), decideRegistration(), deleteMember(), editMember(), isOtherPrincipal() (+7 more)

### Community 43 - "components/CalendarSection.tsx"
Cohesion: 0.24
Nodes (14): CalendarSection(), CalendarViews(), statusLabel, activityDateKey(), CalendarYearView(), eventTimes(), statusLabel, weekdays (+6 more)

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.16
Nodes (15): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+7 more)

### Community 45 - "assessments.ts"
Cohesion: 0.20
Nodes (18): POST(), POST(), Classificacao das questoes (manual, tipo, area, dificuldade), optionalText(), validateAssessmentDefinition(), validateAssessmentQuestion(), ValidationResult, assessmentSelectionModeOptions (+10 more)

### Community 46 - "AuthShell"
Cohesion: 0.16
Nodes (9): metadata, RegisterPage(), ForgotPasswordPage(), metadata, AuthShell(), authTabs, ForgotPasswordForm(), handleSubmit() (+1 more)

### Community 47 - "AssessmentAdmin.tsx"
Cohesion: 0.14
Nodes (13): AdminTab, AssessmentAdminData, assessmentAdminQueryKey, emptyQuestion, MemberSummary, PendingReview, QuestionForm, assessmentQuestionTypeOptions (+5 more)

### Community 48 - "Teste storage Instagram"
Cohesion: 0.17
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "ref_node_fs"
Cohesion: 0.11
Nodes (13): apply, body, dir, subjects, outDir, templates, assert, fs (+5 more)

### Community 50 - "MemberHomeView.tsx"
Cohesion: 0.21
Nodes (13): AnswerBadge(), day(), MemberHomeView(), month(), time(), TrackGroup(), normalizeBuildName(), houseFor() (+5 more)

### Community 51 - "instagram-apify.ts"
Cohesion: 0.09
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

### Community 55 - "admin/layout.tsx"
Cohesion: 0.22
Nodes (7): AdminLayout(), metadata, metadata, AdminProviders(), ConfirmProvider(), ToastProvider(), privateRobots

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

### Community 62 - "attendance-share.test.cjs"
Cohesion: 0.18
Nodes (9): activity, assert, { attendanceTally, buildShareText, whatsappShareUrl }, fs, { normalizeWhatsapp, maskPhone, phoneFieldValue }, roster, { test }, ts (+1 more)

### Community 63 - "013_admin_authorization_hardening.sql"
Cohesion: 0.52
Nodes (6): admin_audit_log_occurred_at_idx, admin_audit_log_target_idx, audit_invites, audit_user_admin_roles, public.admin_audit_log, public.log_admin_audit()

### Community 64 - "AssessmentCreateForm.tsx"
Cohesion: 0.15
Nodes (11): AssessmentPayload, emptyForm, FormState, Segmented(), SegmentedOption, STEP_TITLES, assessmentDifficultyOptions, assessmentQuestionCountOptions (+3 more)

### Community 65 - "Teste titulos Instagram"
Cohesion: 0.22
Nodes (7): assert, { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost }, fs, photo, { test }, ts, vm

### Community 66 - "callback/route.ts"
Cohesion: 0.10
Nodes (29): metadata, ResetPasswordPage(), backToLogin(), GET(), giveBack(), relativeRedirect(), ActiveSnapshot, callbackFailureCode() (+21 more)

### Community 67 - "email-templates-deploy.test.cjs"
Cohesion: 0.15
Nodes (8): assert, fs, os, path, python, { spawnSync }, subjects, { test }

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "Area do membro"
Cohesion: 0.29
Nodes (7): Presenca nas atividades (/membro/atividades), Attendance test script, Area do membro, Cadastro por convite com aprovacao administrativa, Documentos e PDFs privados por nivel de acesso, Patentes (Recruta a General de Exercito) e graduacoes Bronze/Prata/Ouro, Confirmacao de presenca em atividades e lista para WhatsApp

### Community 71 - "ref_node_assert"
Cohesion: 0.09
Nodes (19): assert, fs, subjects, { test }, assert, fs, moduleExports, { test } (+11 more)

### Community 72 - "[...path]/route.ts"
Cohesion: 0.12
Nodes (15): ALLOWED_PREFIXES, DELETE, GET, HEAD, PATCH, POST, PUT, STRIPPED_REQUEST_HEADERS (+7 more)

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.36
Nodes (5): content_templates_kind_name_key, content_templates_updated_at, public.content_templates, public.sync_profile_email(), sync_profile_email

### Community 82 - "account-email.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), recovery, setup(), { test }, ts, vm

### Community 92 - "Insignia.tsx"
Cohesion: 0.13
Nodes (28): BuildInsignia(), GraduationInsignia(), GraduationInsignias(), Insignia(), Variant, InsigniaBadge(), MemberHero(), MemberInsignias() (+20 more)

### Community 93 - "member-notes.ts"
Cohesion: 0.06
Nodes (45): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, denied(), POST() (+37 more)

### Community 94 - "MembersSection.tsx"
Cohesion: 0.06
Nodes (51): Chip(), Medal(), MemberFilters(), optionLabel(), Props, adjustmentsOf(), commanderOptions, Draft (+43 more)

### Community 95 - "[token]/route.ts"
Cohesion: 0.13
Nodes (25): PATCH(), DELETE(), PATCH(), POST(), GET(), CandidateContext, candidatePayload(), expireOrSubmitIfNeeded() (+17 more)

### Community 96 - "password-recovery.test.cjs"
Cohesion: 0.18
Nodes (13): assert, fs, load(), now, recovery, requestRoute(), resetRoute(), run() (+5 more)

### Community 98 - "proxy.ts"
Cohesion: 0.43
Nodes (6): updateSession(), canonicalHost, cloudflareVisitorScheme(), config, httpsRedirect(), proxy()

### Community 99 - "build-emblem.test.cjs"
Cohesion: 0.22
Nodes (7): assert, fs, { getBuildKey, getBuildIcon, buildOptions, normalizeBuildName }, { test }, ts, vm, { wreathLeaves, leafTip, leafPath, wreathStemPath, defaultWreath }

### Community 100 - "typescript"
Cohesion: 0.09
Nodes (16): typescript, fs, path, ts, assert, fs, SITE, { test } (+8 more)

### Community 104 - "next.config.ts"
Cohesion: 0.40
Nodes (4): contentSecurityPolicy, nextConfig, securityHeaders, supabaseOrigin

### Community 106 - "1. Texto em português"
Cohesion: 0.25
Nodes (7): 1. Texto em português, 2. Assinatura: SPF, DKIM e DMARC, 3. Frase de segurança (prova dentro do e-mail), Conferir se ficou assinado, E-mails de autenticação (português e assinatura), Projeto hospedado (teste), Servidor próprio (produção): automático no deploy

## Knowledge Gaps
- **5 isolated node(s):** `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 714 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `AuthShell` to `NoteList.tsx`, `viewer.ts`, `package.json`, `membro/layout.tsx`, `Midias publicas`, `createAdminClient`, `Troca de contas`, `isSameOriginRequest`, `PageHero`, `AdminDashboard.tsx`, `Row Level Security`, `jsonApiFetch`, `Registro e instrumentacao`, `ProfileEditDialog.tsx`, `settings/route.ts`, `anotacoes/page.tsx`, `Configuracao do Site Oficial do DK (SETUP)`, `useToast`, `app/layout.tsx`, `createClient`, `Home, robots e skeletons`, `Cards de jogos`, `types.ts`, `components/CalendarSection.tsx`, `assessments.ts`, `MemberHomeView.tsx`, `instagram-apify.ts`, `logs/route.ts`, `admin/layout.tsx`, `callback/route.ts`, `[...path]/route.ts`, `Insignia.tsx`, `member-notes.ts`, `MembersSection.tsx`, `[token]/route.ts`, `proxy.ts`, `next.config.ts`?**
  _High betweenness centrality (0.199) - this node is a cross-community bridge._
- **What connects `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NoteList.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12923076923076923 - nodes in this community are weakly interconnected._
- **Why does `react` connect `useToast` to `NoteList.tsx`, `viewer.ts`, `package.json`, `swordplay/page.tsx`, `membro/layout.tsx`, `Midias publicas`, `LogsViewer.tsx`, `PageHero`, `AdminDashboard.tsx`, `MediaSection.tsx`, `Emblemas de build + docs`, `jsonApiFetch`, `ProfileEditDialog.tsx`, `anotacoes/page.tsx`, `DocumentManager.tsx`, `AttendancePanel.tsx`, `createClient`, `sections/CalendarSection.tsx`, `Home, robots e skeletons`, `Cards de jogos`, `types.ts`, `components/CalendarSection.tsx`, `AuthShell`, `AssessmentAdmin.tsx`, `MemberHomeView.tsx`, `admin/layout.tsx`, `AssessmentCreateForm.tsx`, `Insignia.tsx`, `MembersSection.tsx`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Should `Login com Google (section 14)` be split into smaller, more focused modules?**
  _Cohesion score 0.09247311827956989 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `typescript` to `package.json`, `relative-day.test.cjs`, `security-phrase.test.cjs`, `Teste login Google`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `ref_node_fs`, `Teste cofre de contas`, `Teste app-log`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `Teste auth hardening e TypeScript`, `attendance-share.test.cjs`, `Teste titulos Instagram`, `Teste senha`, `ref_node_assert`, `account-email.test.cjs`, `password-recovery.test.cjs`, `build-emblem.test.cjs`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05813953488372093 - nodes in this community are weakly interconnected._