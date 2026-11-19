# Graph Report - site-oficial-dk  (2026-11-19)

## Corpus Check
- 287 files · ~128,904 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 9, .example 1, (none) 1)

## Summary
- 1795 nodes · 4757 edges · 91 communities (76 shown, 15 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a51ccb5e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Dialogs, login e cadastro
- API de settings e anotacoes
- assessments.ts
- MemberFilters.tsx
- Dependencias, proxy e regras do Next
- Sync Instagram (API)
- Calendario de atividades
- Midias publicas
- LogsViewer.tsx
- SQL+docs: perfil, rank e acesso a documentos
- API presenca e documentos
- Troca de contas
- API senha, revalidate e logout
- Jogos publicos
- Dashboard e navegacao admin
- react
- Avaliacoes: migrations 009/010 + docs
- Emblemas de build + docs
- anotacoes/page.tsx
- Registro e instrumentacao
- Graduacoes e insignias
- Edicao de perfil
- Docs login com Google
- SQL schema inicial + RLS + seguranca
- Realtime SSE
- assessment-validation.ts
- MembersSection.tsx
- Docs SETUP: avaliacoes, CMS e aniversarios
- API avaliacoes por token + docs
- SQL: cadastro por convite
- Midias admin
- Painel de presenca
- Teste login Google
- Layout raiz e estilos
- member-access.ts
- Admin de avaliacoes (acoes)
- Gestao de presenca admin
- Home, robots e skeletons
- Cards de jogos
- Config TypeScript
- createClient
- types.ts
- Secao de membros admin
- CI GitHub Actions + docs
- Teste de fluxo de perfil
- insignias.ts
- Home do membro e zodiaco
- Recorte de avatar
- Teste storage Instagram
- Testes de migracoes e versao
- next.config.ts
- DocumentManager.tsx
- Teste cofre de contas
- Teste app-log
- createClient
- Sobre e rodape
- Teste mapas de jogos
- Teste anotacoes
- SQL: logs do app
- Teste filtros de membros
- Teste estilo do membro
- Teste auth hardening e TypeScript
- Teste de emblemas
- Teste templates de conteudo
- Teste redirect HTTPS
- Teste titulos Instagram
- logEvent
- Teste insignias
- Teste senha
- Teste de tema
- Teste datas relativas
- Teste SEO
- MemberQueue.tsx
- SQL+doc: templates de conteudo
- assessment-server.ts
- Loading admin
- Loading login
- SQL: zodiaco
- MediaFeed.tsx
- graphify-agent-guard.js
- Project instructions

## God Nodes (most connected - your core abstractions)
1. `next` - 89 edges
2. `react` - 78 edges
3. `public.profiles` - 75 edges
4. `lucide-react` - 65 edges
5. `createAdminClient()` - 47 edges
6. `MembersSection()` - 41 edges
7. `MediaSection()` - 35 edges
8. `createClient()` - 34 edges
9. `useToast()` - 33 edges
10. `Select()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Audit history of assessment actions` --references--> `public.assessment_audit_log`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Seguranca (convite, aprovacao, RLS, bucket privado)` --references--> `public.invites`  [INFERRED]
  README.md → supabase/migrations/001_initial_schema.sql
- `Seguranca (convite, aprovacao, RLS, bucket privado)` --references--> `public.documents`  [INFERRED]
  README.md → supabase/migrations/001_initial_schema.sql
- `Snapshot of questions in published assessments` --references--> `public.assessment_items`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/013_admin_authorization_hardening.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (91 total, 15 thin omitted)

### Community 0 - "Dialogs, login e cadastro"
Cohesion: 0.07
Nodes (41): metadata, RegisterPage(), AuthShell(), GoogleIcon(), LoginForm(), handleGoogle(), handleSubmit(), empty (+33 more)

### Community 1 - "API de settings e anotacoes"
Cohesion: 0.06
Nodes (53): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, POST(), runtime (+45 more)

### Community 2 - "assessments.ts"
Cohesion: 0.12
Nodes (18): AssessmentPayload, AssessmentRunnerLoaded(), formatRemaining(), SafeQuestion, SavedAnswer, assessmentAssignmentStatusLabels, assessmentDifficultyOptions, assessmentQuestionCountOptions (+10 more)

### Community 3 - "MemberFilters.tsx"
Cohesion: 0.13
Nodes (19): Chip(), Medal(), MemberFilters(), optionLabel(), Props, ChipOption, FilterChips(), SearchField() (+11 more)

### Community 4 - "Dependencias, proxy e regras do Next"
Cohesion: 0.06
Nodes (40): dependencies, ffmpeg-static@^5.3.0, lucide-react@^0.468.0, next@16.4.6, pg@^8.23.1, react@^19.0.0, react-dom@^19.0.0, @supabase/ssr@^0.8.0 (+32 more)

### Community 5 - "Sync Instagram (API)"
Cohesion: 0.07
Nodes (40): GET(), isDateOnly(), maxDuration, POST(), runSync(), runtime, CRON_SECRET scheduled sync endpoint /api/admin/instagram/sync, FFmpeg video compression (50-250 MB to MP4 H.264/AAC) (+32 more)

### Community 6 - "Calendario de atividades"
Cohesion: 0.08
Nodes (44): CalendarSection(), loadActivityForm(), openEdit(), openNew(), saveActivity(), endOf(), monthLabel(), Period (+36 more)

### Community 7 - "Midias publicas"
Cohesion: 0.10
Nodes (31): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+23 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.10
Nodes (20): auditActionLabel, auditCategoryLabel, auditCategoryOptions, formatDate(), JsonBlock(), copy(), levelBadge, levelLabel (+12 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.07
Nodes (27): Progressive document access (Bronze/Prata/Ouro, min rank), Profile completion and rank-request test script, public.activity_attendance, public.can_access_document(), public.get_activity_attendance(), public.profiles, public.can_access_document(), public.can_access_document() (+19 more)

### Community 10 - "API presenca e documentos"
Cohesion: 0.14
Nodes (27): allRows(), GET(), PATCH(), DELETE(), PATCH(), POST(), runtime, GET() (+19 more)

### Community 11 - "Troca de contas"
Cohesion: 0.15
Nodes (28): DELETE(), GET(), NO_STORE, GET(), NO_STORE, LoginPage(), metadata, activeUserId() (+20 more)

### Community 12 - "API senha, revalidate e logout"
Cohesion: 0.10
Nodes (29): NO_STORE, POST(), POST(), fields, NO_STORE, POST(), runtime, POST() (+21 more)

### Community 13 - "Jogos publicos"
Cohesion: 0.11
Nodes (23): GamesPage(), metadata, dynamicParams, GamePage(), generateMetadata(), Props, metadata, SwordplayPage() (+15 more)

### Community 14 - "Dashboard e navegacao admin"
Cohesion: 0.12
Nodes (26): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+18 more)

### Community 15 - "react"
Cohesion: 0.16
Nodes (11): AdminDialog(), Drawer(), RowMenuItem, openModals, useDialogBehavior(), GalleryItem, Point, State (+3 more)

### Community 16 - "Avaliacoes: migrations 009/010 + docs"
Cohesion: 0.10
Nodes (37): PATCH(), POST(), shuffled(), POST(), DELETE(), POST(), dynamic, GET() (+29 more)

### Community 17 - "Emblemas de build + docs"
Cohesion: 0.09
Nodes (29): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), npm run prepare:emblems script, Image-generation base prompt for emblems (+21 more)

### Community 18 - "anotacoes/page.tsx"
Cohesion: 0.06
Nodes (61): AdminLayout(), metadata, AdminPage(), metadata, MemberNotesPage(), metadata, MemberActivitiesPage(), metadata (+53 more)

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.12
Nodes (22): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+14 more)

### Community 20 - "Graduacoes e insignias"
Cohesion: 0.20
Nodes (13): GraduationPage(), metadata, BuildInsignia(), GraduationInsignia(), GraduationInsignias(), Insignia(), RankInsignia(), Variant (+5 more)

### Community 21 - "Edicao de perfil"
Cohesion: 0.17
Nodes (17): EditableProfile, EditMemberProfile(), openDialog(), submit(), countProfileChanges(), EMPTY_PASSWORD, PasswordState, ProfileFormErrors (+9 more)

### Community 22 - "Docs login com Google"
Cohesion: 0.06
Nodes (45): backToLogin(), GET(), giveBack(), relativeRedirect(), Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Supabase Site URL and Redirect URLs (/auth/callback) (+37 more)

### Community 23 - "SQL schema inicial + RLS + seguranca"
Cohesion: 0.14
Nodes (21): activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at, games_updated_at, media_items_post_id_idx (+13 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.13
Nodes (24): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+16 more)

### Community 25 - "assessment-validation.ts"
Cohesion: 0.25
Nodes (14): PATCH(), POST(), optionalText(), validateAssessmentDefinition(), validateAssessmentQuestion(), ValidationResult, isAssessmentDifficulty(), isAssessmentQuestionCount() (+6 more)

### Community 26 - "MembersSection.tsx"
Cohesion: 0.13
Nodes (15): MemberAccessForm, MemberStatusFilter, statusFilters, rankOptions, saveNotes(), settingsKey, SettingsSection(), SettingsTab (+7 more)

### Community 27 - "Docs SETUP: avaliacoes, CMS e aniversarios"
Cohesion: 0.10
Nodes (34): Activation: migrations 009 and 010 plus three Supabase env vars, Audit history of assessment actions, Avaliacoes e Simulados do DK, Selecao manual de questoes, Sorteio individual por filtro (frozen random set per indication), Member birthdays calendar (migration 008), Avaliacoes e simulados setup (migrations 009/010), Private bucket dk-documents with temporary links (+26 more)

### Community 28 - "API avaliacoes por token + docs"
Cohesion: 0.20
Nodes (17): CandidateContext, candidatePayload(), expireOrSubmitIfNeeded(), GET(), getContext(), getDeadline(), PATCH(), POST() (+9 more)

### Community 29 - "SQL: cadastro por convite"
Cohesion: 0.12
Nodes (17): invites_code_idx, public.invites, public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, public.release_registration_invite(), registration_rate_limits_window_idx, admin_audit_log_occurred_at_idx (+9 more)

### Community 30 - "Midias admin"
Cohesion: 0.11
Nodes (21): FormSectionHead(), defaultInstagramDateRange(), formFromPost(), MediaSection(), loadPostForm(), openEdit(), openNew(), removePost() (+13 more)

### Community 31 - "Painel de presenca"
Cohesion: 0.14
Nodes (16): activityTime(), AttendanceInsignias(), AttendancePanel(), copyList(), listText(), shareOnWhatsApp(), buildShareText(), dateOptions (+8 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "Layout raiz e estilos"
Cohesion: 0.13
Nodes (9): cinzel, inter, metadata, RootLayout(), InsigniaColorFilters(), QueryActivityFeedback(), QueryProvider(), RealtimeProvider() (+1 more)

### Community 34 - "member-access.ts"
Cohesion: 0.11
Nodes (20): activityLinks, HeaderAccount, MemberStyleToggle(), options, useMemberTheme(), trackNames, ClientAccount, adminRoleOptions (+12 more)

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.14
Nodes (17): AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion(), reviewAnswer() (+9 more)

### Community 36 - "Gestao de presenca admin"
Cohesion: 0.14
Nodes (12): ActivityRow, AttendanceManager(), Correction, Entry, History, Member, readJson(), Column (+4 more)

### Community 37 - "Home, robots e skeletons"
Cohesion: 0.14
Nodes (14): metadata, HomePage(), metadata, CalendarSkeleton(), JSON-LD (organization, Article, BreadcrumbList), lib/seo.ts (canonical domain death-knights.com.br), Post-publication SEO checklist (Search Console, Lighthouse), /robots.txt (+6 more)

### Community 38 - "Cards de jogos"
Cohesion: 0.13
Nodes (15): revalidate, GameCard(), GameDialog(), GameView, noopSubscribe(), categories, Filter, games (+7 more)

### Community 39 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "createClient"
Cohesion: 0.26
Nodes (10): useAdminData(), AdminTitle(), Kpi(), OverviewSection(), Avatar(), createClient(), PROXIED_PREFIXES, proxiedPath() (+2 more)

### Community 41 - "types.ts"
Cohesion: 0.14
Nodes (17): AdminTab, AssessmentAdminData, assessmentAdminQueryKey, AssessmentForm, emptyAssessment, emptyQuestion, MemberSummary, PendingReview (+9 more)

### Community 42 - "Secao de membros admin"
Cohesion: 0.13
Nodes (20): removeActivity(), createInvite(), disableInvite(), MembersSection(), canEditAccess(), canManageMember(), decideRegistration(), deleteMember() (+12 more)

### Community 43 - "CI GitHub Actions + docs"
Cohesion: 0.12
Nodes (15): Future deployment (env vars, lint, build), runs-on, steps, jobs, build, name, on, pull_request (+7 more)

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.16
Nodes (15): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+7 more)

### Community 45 - "insignias.ts"
Cohesion: 0.30
Nodes (10): lib/insignias.ts catalog, components/member/Insignia.tsx and app/insignias.css, Icones de patentes, graduacoes e builds (insignias), Medalhoes de arquearia (bronze master + SVG filters for prata/ouro), public/images/insignias assets, getGraduationTrack(), normalize(), rankIcons (+2 more)

### Community 46 - "Home do membro e zodiaco"
Cohesion: 0.25
Nodes (12): AnswerBadge(), day(), MemberHomeView(), month(), time(), TrackGroup(), normalizeBuildName(), houseFor() (+4 more)

### Community 47 - "Recorte de avatar"
Cohesion: 0.18
Nodes (4): AvatarCropper(), MemberAvatar(), changePhoto(), removePhoto()

### Community 48 - "Teste storage Instagram"
Cohesion: 0.18
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "Testes de migracoes e versao"
Cohesion: 0.25
Nodes (5): assert, fs, { test }, ts, vm

### Community 50 - "next.config.ts"
Cohesion: 0.40
Nodes (4): contentSecurityPolicy, nextConfig, securityHeaders, supabaseOrigin

### Community 51 - "DocumentManager.tsx"
Cohesion: 0.09
Nodes (25): ConfirmContext, ConfirmOptions, Pending, useConfirm(), accessLabel(), DocumentManager(), renderJoin(), renderRules() (+17 more)

### Community 52 - "Teste cofre de contas"
Cohesion: 0.18
Nodes (8): assert, fs, plain(), raw, { test }, ts, vault, vm

### Community 53 - "Teste app-log"
Cohesion: 0.20
Nodes (10): assert, clientIp, fs, load(), loadAppLog(), loadLogsRoute(), sanitize, { test } (+2 more)

### Community 54 - "createClient"
Cohesion: 0.12
Nodes (20): FeedRow, GET(), LEVELS, NO_STORE, PERIODS, safeSearch(), SECTIONS, SERVER_SOURCES (+12 more)

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
Cohesion: 0.25
Nodes (5): assert, fs, { test }, ts, vm

### Community 62 - "Teste de emblemas"
Cohesion: 0.22
Nodes (7): assert, fs, { getBuildKey, getBuildIcon, buildOptions, normalizeBuildName }, { test }, ts, vm, { wreathLeaves, leafTip, leafPath, wreathStemPath, defaultWreath }

### Community 63 - "Teste templates de conteudo"
Cohesion: 0.22
Nodes (7): assert, fs, lib, path, { test }, ts, vm

### Community 64 - "Teste redirect HTTPS"
Cohesion: 0.22
Nodes (6): assert, fs, SITE, { test }, ts, vm

### Community 65 - "Teste titulos Instagram"
Cohesion: 0.22
Nodes (7): assert, { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost }, fs, photo, { test }, ts, vm

### Community 66 - "logEvent"
Cohesion: 0.44
Nodes (9): NO_STORE, POST(), POST(), createStatelessSupabase(), snapshotCurrent(), stashPrevious(), removeAccount(), upsertAccount() (+1 more)

### Community 67 - "Teste insignias"
Cohesion: 0.25
Nodes (6): assert, exportsMap, fs, { test }, ts, vm

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "Teste de tema"
Cohesion: 0.15
Nodes (10): assert, fs, moduleExports, { test }, ts, vm, assert, fs (+2 more)

### Community 70 - "Teste datas relativas"
Cohesion: 0.20
Nodes (9): typescript@^5.7.0, typescript, assert, fs, moduleExports, now, { test }, ts (+1 more)

### Community 71 - "Teste SEO"
Cohesion: 0.25
Nodes (6): assert, fs, seo, { test }, ts, vm

### Community 72 - "MemberQueue.tsx"
Cohesion: 0.14
Nodes (16): adjustmentsOf(), commanderOptions, Draft, levelOptions, MemberQueue(), startAdjust(), Props, rankOptions (+8 more)

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.60
Nodes (3): content_templates_kind_name_key, content_templates_updated_at, public.content_templates

### Community 74 - "assessment-server.ts"
Cohesion: 0.25
Nodes (6): POST(), Classificacao das questoes (manual, tipo, area, dificuldade), AssessmentActor, isGeneralAssessmentRank(), DkRank, GraduationLevel

### Community 82 - "MediaFeed.tsx"
Cohesion: 0.32
Nodes (3): catalog, MediaFeed(), normalizeSearch()

## Knowledge Gaps
- **5 isolated node(s):** `Test cleanup`, `Member birthdays calendar (migration 008)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`, `Content templates for posts and activities (migration 021)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 613 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `API senha, revalidate e logout` to `Dialogs, login e cadastro`, `API de settings e anotacoes`, `assessments.ts`, `Dependencias, proxy e regras do Next`, `Sync Instagram (API)`, `Midias publicas`, `API presenca e documentos`, `Troca de contas`, `Jogos publicos`, `Dashboard e navegacao admin`, `react`, `Avaliacoes: migrations 009/010 + docs`, `anotacoes/page.tsx`, `Registro e instrumentacao`, `Graduacoes e insignias`, `Edicao de perfil`, `assessment-validation.ts`, `MembersSection.tsx`, `API avaliacoes por token + docs`, `Layout raiz e estilos`, `member-access.ts`, `Home, robots e skeletons`, `Cards de jogos`, `createClient`, `Home do membro e zodiaco`, `next.config.ts`, `createClient`, `Sobre e rodape`, `logEvent`, `assessment-server.ts`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **What connects `Test cleanup`, `Member birthdays calendar (migration 008)`, `Supabase project creation` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dialogs, login e cadastro` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `Teste datas relativas` to `Dependencias, proxy e regras do Next`, `Sync Instagram (API)`, `Teste login Google`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `Testes de migracoes e versao`, `Teste cofre de contas`, `Teste app-log`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `Teste auth hardening e TypeScript`, `Teste de emblemas`, `Teste templates de conteudo`, `Teste redirect HTTPS`, `Teste titulos Instagram`, `Teste insignias`, `Teste senha`, `Teste de tema`, `Teste SEO`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Should `API de settings e anotacoes` be split into smaller, more focused modules?**
  _Cohesion score 0.05641025641025641 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Dialogs, login e cadastro`, `assessments.ts`, `MemberFilters.tsx`, `Dependencias, proxy e regras do Next`, `Calendario de atividades`, `Midias publicas`, `LogsViewer.tsx`, `Jogos publicos`, `Dashboard e navegacao admin`, `Emblemas de build + docs`, `anotacoes/page.tsx`, `Graduacoes e insignias`, `Edicao de perfil`, `MembersSection.tsx`, `Midias admin`, `Painel de presenca`, `Layout raiz e estilos`, `member-access.ts`, `Gestao de presenca admin`, `Home, robots e skeletons`, `Cards de jogos`, `createClient`, `types.ts`, `Home do membro e zodiaco`, `DocumentManager.tsx`, `MemberQueue.tsx`, `MediaFeed.tsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Should `assessments.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._