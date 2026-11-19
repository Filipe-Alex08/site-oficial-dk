# Graph Report - site-oficial-dk  (2026-11-19)

## Corpus Check
- 289 files · ~129,708 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 9, .example 1, (none) 1)

## Summary
- 1818 nodes · 4732 edges · 99 communities (83 shown, 16 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `32ff9315`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Dialogs, login e cadastro
- member-notes-server.ts
- AssessmentRunnerLoaded
- MemberFilters.tsx
- Dependencias, proxy e regras do Next
- instagram-sync.ts
- Calendario de atividades
- Midias publicas
- LogsViewer.tsx
- SQL+docs: perfil, rank e acesso a documentos
- API presenca e documentos
- Troca de contas
- createClient
- Jogos publicos
- Dashboard e navegacao admin
- react
- Avaliacoes: migrations 009/010 + docs
- Emblemas de build + docs
- components/CalendarSection.tsx
- Registro e instrumentacao
- Insignia.tsx
- ProfileEditDialog.tsx
- Docs login com Google
- public
- Realtime SSE
- assessments.ts
- Select
- Docs SETUP: avaliacoes, CMS e aniversarios
- API avaliacoes por token + docs
- SQL: cadastro por convite
- Midias admin
- Painel de presenca
- Teste login Google
- Layout raiz e estilos
- membro/layout.tsx
- Admin de avaliacoes (acoes)
- Gestao de presenca admin
- Home, robots e skeletons
- Cards de jogos
- Config TypeScript
- callback/route.ts
- types.ts
- Secao de membros admin
- CI GitHub Actions + docs
- Teste de fluxo de perfil
- next
- member-notes.ts
- Recorte de avatar
- Teste storage Instagram
- ref_node_assert
- next.config.ts
- useToast
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
- ref_node_fs
- Teste redirect HTTPS
- Teste titulos Instagram
- simulados/page.tsx
- anotacoes/page.tsx
- Teste senha
- ConfirmProvider.tsx
- Teste datas relativas
- Teste SEO
- MemberQueue.tsx
- SQL+doc: templates de conteudo
- instagram-apify.ts
- Loading admin
- Loading login
- SQL: zodiaco
- sync/route.ts
- graphify-agent-guard.js
- Project instructions
- [...path]/route.ts
- settings/route.ts
- public.member_notes
- logs/route.ts
- admin.ts
- 026_notes_settings.sql
- admin/layout.tsx
- SettingsSection.tsx

## God Nodes (most connected - your core abstractions)
1. `next` - 89 edges
2. `react` - 79 edges
3. `public.profiles` - 75 edges
4. `lucide-react` - 66 edges
5. `createAdminClient()` - 47 edges
6. `MembersSection()` - 41 edges
7. `MediaSection()` - 35 edges
8. `createClient()` - 34 edges
9. `useToast()` - 33 edges
10. `friendlyError()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Audit history of assessment actions` --references--> `public.assessment_audit_log`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Snapshot of questions in published assessments` --references--> `public.assessment_items`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation)` --references--> `public.can_manage_assessments()`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Seguranca (convite, aprovacao, RLS, bucket privado)` --references--> `public.documents`  [INFERRED]
  README.md → supabase/migrations/001_initial_schema.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/015_graduation_tracks.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (99 total, 16 thin omitted)

### Community 0 - "Dialogs, login e cadastro"
Cohesion: 0.06
Nodes (47): metadata, RegisterPage(), SearchField(), AuthShell(), GoogleIcon(), LoginForm(), handleGoogle(), handleSubmit() (+39 more)

### Community 1 - "member-notes-server.ts"
Cohesion: 0.19
Nodes (18): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, POST(), runtime (+10 more)

### Community 3 - "MemberFilters.tsx"
Cohesion: 0.10
Nodes (28): Chip(), Medal(), MemberFilters(), optionLabel(), Props, MemberAccessForm, MemberStatusFilter, statusFilters (+20 more)

### Community 4 - "Dependencias, proxy e regras do Next"
Cohesion: 0.06
Nodes (40): dependencies, ffmpeg-static@^5.3.0, lucide-react@^0.468.0, next@16.4.6, pg@^8.23.1, react@^19.0.0, react-dom@^19.0.0, @supabase/ssr@^0.8.0 (+32 more)

### Community 5 - "instagram-sync.ts"
Cohesion: 0.23
Nodes (13): isLegacyInstagramTitle(), archiveInstagramPost(), download(), ensureInstagramBucket(), INSTAGRAM_BUCKET, InstagramMediaArchiveError, MIME_EXTENSIONS, sourceUrl() (+5 more)

### Community 6 - "Calendario de atividades"
Cohesion: 0.10
Nodes (36): CalendarSection(), loadActivityForm(), openEdit(), openNew(), removeActivity(), saveActivity(), endOf(), monthLabel() (+28 more)

### Community 7 - "Midias publicas"
Cohesion: 0.09
Nodes (32): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+24 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.09
Nodes (22): auditActionLabel, auditCategoryLabel, auditCategoryOptions, formatDate(), JsonBlock(), copy(), levelBadge, levelLabel (+14 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.07
Nodes (38): Progressive document access (Bronze/Prata/Ouro, min rank), activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at, games_updated_at (+30 more)

### Community 10 - "API presenca e documentos"
Cohesion: 0.15
Nodes (24): allRows(), GET(), PATCH(), DELETE(), PATCH(), POST(), runtime, GET() (+16 more)

### Community 11 - "Troca de contas"
Cohesion: 0.15
Nodes (31): DELETE(), GET(), NO_STORE, GET(), NO_STORE, LoginPage(), metadata, activeUserId() (+23 more)

### Community 12 - "createClient"
Cohesion: 0.25
Nodes (19): NO_STORE, POST(), POST(), POST(), NO_STORE, POST(), POST(), POST() (+11 more)

### Community 13 - "Jogos publicos"
Cohesion: 0.13
Nodes (20): GraduationPage(), metadata, GamesPage(), metadata, metadata, SwordplayPage(), activities, ActivityTypesPage() (+12 more)

### Community 14 - "Dashboard e navegacao admin"
Cohesion: 0.10
Nodes (32): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+24 more)

### Community 15 - "react"
Cohesion: 0.19
Nodes (8): RowMenuItem, GalleryItem, Point, State, SelectOption, lucide-react, react, react-dom

### Community 16 - "Avaliacoes: migrations 009/010 + docs"
Cohesion: 0.15
Nodes (25): dynamic, assessment_answers_review_idx, assessment_answers_state_guard, assessment_answers_updated_at, assessment_assignments_member_idx, assessment_assignments_number, assessment_assignments_status_idx, assessment_assignments_updated_at (+17 more)

### Community 17 - "Emblemas de build + docs"
Cohesion: 0.09
Nodes (28): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), npm run prepare:emblems script, Image-generation base prompt for emblems (+20 more)

### Community 18 - "components/CalendarSection.tsx"
Cohesion: 0.19
Nodes (16): CalendarSection(), CalendarViews(), statusLabel, activityDateKey(), CalendarYearView(), eventTimes(), statusLabel, weekdays (+8 more)

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.13
Nodes (23): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+15 more)

### Community 20 - "Insignia.tsx"
Cohesion: 0.16
Nodes (25): AttendanceInsignias(), BuildInsignia(), GraduationInsignia(), GraduationInsignias(), Insignia(), RankInsignia(), Variant, InsigniaBadge() (+17 more)

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.10
Nodes (27): EditableProfile, EditMemberProfile(), openDialog(), AnswerBadge(), day(), MemberHomeView(), month(), time() (+19 more)

### Community 22 - "Docs login com Google"
Cohesion: 0.11
Nodes (23): Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Orphan accounts without profile (14.7), Disable public sign-ups (14.5), Delete Google-created account when no profile exists (/auth/callback), Google Cloud Console configuration (14.1), Self-hosted Supabase GoTrue Google env vars (14.3) (+15 more)

### Community 23 - "public"
Cohesion: 0.11
Nodes (17): Profile completion with pending access-request approval (migration 011), Profile completion and rank-request test script, profiles_nickname_unique_idx, public.update_own_member_profile(), public.update_own_member_avatar(), public.update_own_member_profile_with_access_request(), admin_audit_log_occurred_at_idx, admin_audit_log_target_idx (+9 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.13
Nodes (24): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+16 more)

### Community 25 - "assessments.ts"
Cohesion: 0.13
Nodes (28): POST(), shuffled(), POST(), DELETE(), PATCH(), POST(), GET(), POST() (+20 more)

### Community 26 - "Select"
Cohesion: 0.12
Nodes (8): DocumentManager(), renderJoin(), renderRules(), newRule(), RowMenu(), Select(), handleKeyDown(), openMenu()

### Community 27 - "Docs SETUP: avaliacoes, CMS e aniversarios"
Cohesion: 0.17
Nodes (23): Activation: migrations 009 and 010 plus three Supabase env vars, Avaliacoes e Simulados do DK, Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation), Selecao manual de questoes, Sorteio individual por filtro (frozen random set per indication), Member birthdays calendar (migration 008), Avaliacoes e simulados setup (migrations 009/010), Content templates for posts and activities (migration 021) (+15 more)

### Community 28 - "API avaliacoes por token + docs"
Cohesion: 0.18
Nodes (18): PATCH(), POST(), CandidateContext, candidatePayload(), expireOrSubmitIfNeeded(), GET(), getContext(), getDeadline() (+10 more)

### Community 29 - "SQL: cadastro por convite"
Cohesion: 0.18
Nodes (10): Seguranca (convite, aprovacao, RLS, bucket privado), invites_code_idx, public.invites, public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, public.release_registration_invite(), registration_rate_limits_window_idx (+2 more)

### Community 30 - "Midias admin"
Cohesion: 0.10
Nodes (25): FormSectionHead(), MediaGalleryManager(), defaultInstagramDateRange(), formFromPost(), MediaSection(), loadPostForm(), openEdit(), openNew() (+17 more)

### Community 31 - "Painel de presenca"
Cohesion: 0.14
Nodes (16): activityTime(), AttendancePanel(), copyList(), listText(), shareOnWhatsApp(), buildShareText(), dateOptions, Filter (+8 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "Layout raiz e estilos"
Cohesion: 0.11
Nodes (12): cinzel, inter, metadata, RootLayout(), InsigniaColorFilters(), QueryActivityFeedback(), QueryProvider(), Listener (+4 more)

### Community 34 - "membro/layout.tsx"
Cohesion: 0.17
Nodes (18): NO_STORE, POST(), metadata, PrivateLayout(), MemberStyleToggle(), options, MemberThemeContext, MemberThemeContextValue (+10 more)

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.07
Nodes (29): AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion(), reviewAnswer() (+21 more)

### Community 36 - "Gestao de presenca admin"
Cohesion: 0.14
Nodes (13): ActivityRow, AttendanceManager(), Correction, Entry, History, Member, readJson(), Column (+5 more)

### Community 37 - "Home, robots e skeletons"
Cohesion: 0.14
Nodes (15): metadata, HomePage(), metadata, CalendarSkeleton(), JSON-LD (organization, Article, BreadcrumbList), lib/seo.ts (canonical domain death-knights.com.br), Post-publication SEO checklist (Search Console, Lighthouse), /robots.txt (+7 more)

### Community 38 - "Cards de jogos"
Cohesion: 0.09
Nodes (22): dynamicParams, GamePage(), generateMetadata(), Props, revalidate, GameCard(), GameDialog(), GameView (+14 more)

### Community 39 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "callback/route.ts"
Cohesion: 0.14
Nodes (21): backToLogin(), GET(), giveBack(), relativeRedirect(), Supabase Site URL and Redirect URLs (/auth/callback), Redirect URL configuration (14.4), ActiveSnapshot, restoreSnapshot() (+13 more)

### Community 41 - "types.ts"
Cohesion: 0.07
Nodes (52): AdminTab, AssessmentAdminData, assessmentAdminQueryKey, emptyQuestion, MemberSummary, PendingReview, QuestionForm, AssessmentPayload (+44 more)

### Community 42 - "Secao de membros admin"
Cohesion: 0.21
Nodes (15): createInvite(), MembersSection(), canEditAccess(), canManageMember(), decideRegistration(), deleteMember(), editMember(), isOtherPrincipal() (+7 more)

### Community 43 - "CI GitHub Actions + docs"
Cohesion: 0.12
Nodes (15): Future deployment (env vars, lint, build), runs-on, steps, jobs, build, name, on, pull_request (+7 more)

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.16
Nodes (15): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+7 more)

### Community 45 - "next"
Cohesion: 0.13
Nodes (12): MemberActivitiesPage(), metadata, metadata, LiveRefresh(), UpcomingActivity, Presenca nas atividades (/membro/atividades), Attendance test script, Area do membro (+4 more)

### Community 46 - "member-notes.ts"
Cohesion: 0.18
Nodes (17): canWriteNotes(), canWriteNoteTo(), commandedTracks(), DEFAULT_NOTES_SETTINGS, hasRankAccess(), NOTE_COUNTERPART_COLUMNS, NOTES_SETTING_KEYS, NotesCommanderScope (+9 more)

### Community 47 - "Recorte de avatar"
Cohesion: 0.18
Nodes (4): AvatarCropper(), MemberAvatar(), changePhoto(), removePhoto()

### Community 48 - "Teste storage Instagram"
Cohesion: 0.17
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "ref_node_assert"
Cohesion: 0.10
Nodes (15): assert, exportsMap, fs, { test }, ts, vm, assert, fs (+7 more)

### Community 50 - "next.config.ts"
Cohesion: 0.40
Nodes (4): contentSecurityPolicy, nextConfig, securityHeaders, supabaseOrigin

### Community 51 - "useToast"
Cohesion: 0.15
Nodes (14): AdminTitle(), useConfirm(), InvitesSection(), disableInvite(), inviteState(), SettingsSection(), icons, lifetime (+6 more)

### Community 52 - "Teste cofre de contas"
Cohesion: 0.18
Nodes (8): assert, fs, plain(), raw, { test }, ts, vault, vm

### Community 53 - "Teste app-log"
Cohesion: 0.20
Nodes (10): assert, clientIp, fs, load(), loadAppLog(), loadLogsRoute(), sanitize, { test } (+2 more)

### Community 54 - "createClient"
Cohesion: 0.16
Nodes (12): POST(), requireLogViewer(), SUPABASE_COOKIE_OPTIONS, updateSession(), isSupabaseConfigured(), canonicalHost, cloudflareVisitorScheme(), config (+4 more)

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
Cohesion: 0.23
Nodes (13): Audit history of assessment actions, assessment_audit_created_idx, public.assessment_audit_log, app_logs_category_idx, app_logs_created_at_idx, app_logs_level_idx, assessment_audit_log_created_at_idx, audit_log_viewer_permissions (+5 more)

### Community 59 - "Teste filtros de membros"
Cohesion: 0.20
Nodes (7): access, assert, filters, fs, { test }, ts, vm

### Community 60 - "Teste estilo do membro"
Cohesion: 0.22
Nodes (8): assert, fs, load(), route(), style, { test }, ts, vm

### Community 61 - "Teste auth hardening e TypeScript"
Cohesion: 0.13
Nodes (11): assert, fs, { test }, ts, vm, assert, fs, moduleExports (+3 more)

### Community 62 - "Teste de emblemas"
Cohesion: 0.22
Nodes (7): assert, fs, { getBuildKey, getBuildIcon, buildOptions, normalizeBuildName }, { test }, ts, vm, { wreathLeaves, leafTip, leafPath, wreathStemPath, defaultWreath }

### Community 63 - "ref_node_fs"
Cohesion: 0.12
Nodes (11): run, fs, path, ts, assert, fs, lib, path (+3 more)

### Community 64 - "Teste redirect HTTPS"
Cohesion: 0.22
Nodes (6): assert, fs, SITE, { test }, ts, vm

### Community 65 - "Teste titulos Instagram"
Cohesion: 0.22
Nodes (7): assert, { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost }, fs, photo, { test }, ts, vm

### Community 66 - "simulados/page.tsx"
Cohesion: 0.21
Nodes (12): AdminPage(), metadata, formatDate(), MemberAssessmentsPage(), metadata, AssessmentAttemptPage(), metadata, AppPageHeader() (+4 more)

### Community 67 - "anotacoes/page.tsx"
Cohesion: 0.27
Nodes (11): MemberNotesPage(), metadata, MemberDocumentsPage(), metadata, MemberPage(), DocumentAccessBadge(), getMemberBadges, getNotesSettings (+3 more)

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "ConfirmProvider.tsx"
Cohesion: 0.20
Nodes (10): AdminDialog(), ConfirmContext, ConfirmOptions, Pending, TemplateBar(), closeDialog(), rename(), saveNew() (+2 more)

### Community 70 - "Teste datas relativas"
Cohesion: 0.20
Nodes (9): typescript@^5.7.0, typescript, assert, fs, moduleExports, now, { test }, ts (+1 more)

### Community 71 - "Teste SEO"
Cohesion: 0.25
Nodes (6): assert, fs, seo, { test }, ts, vm

### Community 72 - "MemberQueue.tsx"
Cohesion: 0.13
Nodes (15): adjustmentsOf(), commanderOptions, Draft, levelOptions, MemberQueue(), startAdjust(), Props, rankOptions (+7 more)

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.60
Nodes (3): content_templates_kind_name_key, content_templates_updated_at, public.content_templates

### Community 74 - "instagram-apify.ts"
Cohesion: 0.25
Nodes (13): buildInstagramTitle(), fallbackTitle(), fetchInstagramPosts(), hasWords(), InstagramScrapedPost, isVideo(), normalizeInstagramPost(), normalizePermalink() (+5 more)

### Community 82 - "sync/route.ts"
Cohesion: 0.24
Nodes (10): GET(), isDateOnly(), maxDuration, POST(), runSync(), runtime, CRON_SECRET scheduled sync endpoint /api/admin/instagram/sync, FFmpeg video compression (50-250 MB to MP4 H.264/AAC) (+2 more)

### Community 91 - "[...path]/route.ts"
Cohesion: 0.18
Nodes (10): ALLOWED_PREFIXES, DELETE, GET, HEAD, PATCH, POST, PUT, STRIPPED_REQUEST_HEADERS (+2 more)

### Community 92 - "settings/route.ts"
Cohesion: 0.24
Nodes (9): fields, GET(), NO_STORE, runtime, isRank(), isScope(), isWriters(), loadNotesSettings() (+1 more)

### Community 93 - "public.member_notes"
Cohesion: 0.31
Nodes (8): dk_broadcast_change, member_notes_author_idx, member_notes_before_write, member_notes_recipient_idx, public.can_write_member_notes(), public.member_notes, public.member_notes_before_write(), public.notes_min_rank()

### Community 94 - "logs/route.ts"
Cohesion: 0.25
Nodes (8): FeedRow, GET(), LEVELS, NO_STORE, PERIODS, safeSearch(), SECTIONS, SERVER_SOURCES

### Community 95 - "admin.ts"
Cohesion: 0.28
Nodes (6): GET(), Private bucket dk-documents with temporary links, Documentos e PDFs internos (progressive access), .env.local keys (Supabase URL, publishable key, secret key, site URL), Private PDF test script, Documentos e PDFs privados por nivel de acesso

### Community 96 - "026_notes_settings.sql"
Cohesion: 0.22
Nodes (3): public.can_write_member_notes(), public.can_write_note_to(), public.notes_setting()

### Community 97 - "admin/layout.tsx"
Cohesion: 0.39
Nodes (5): AdminLayout(), metadata, AdminProviders(), ConfirmProvider(), ToastProvider()

### Community 98 - "SettingsSection.tsx"
Cohesion: 0.25
Nodes (7): rankOptions, saveNotes(), settingsKey, SettingsTab, tabs, notesScopeOptions, notesWritersOptions

## Knowledge Gaps
- **5 isolated node(s):** `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 620 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `Dialogs, login e cadastro`, `member-notes-server.ts`, `MemberFilters.tsx`, `Dependencias, proxy e regras do Next`, `Midias publicas`, `API presenca e documentos`, `Troca de contas`, `createClient`, `Jogos publicos`, `Dashboard e navegacao admin`, `react`, `Avaliacoes: migrations 009/010 + docs`, `components/CalendarSection.tsx`, `Registro e instrumentacao`, `Insignia.tsx`, `ProfileEditDialog.tsx`, `assessments.ts`, `API avaliacoes por token + docs`, `Layout raiz e estilos`, `membro/layout.tsx`, `Home, robots e skeletons`, `Cards de jogos`, `types.ts`, `next.config.ts`, `createClient`, `Sobre e rodape`, `simulados/page.tsx`, `anotacoes/page.tsx`, `MemberQueue.tsx`, `sync/route.ts`, `[...path]/route.ts`, `settings/route.ts`, `logs/route.ts`, `admin.ts`, `admin/layout.tsx`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **What connects `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dialogs, login e cadastro` be split into smaller, more focused modules?**
  _Cohesion score 0.060285563194077206 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Dialogs, login e cadastro`, `MemberFilters.tsx`, `Dependencias, proxy e regras do Next`, `Calendario de atividades`, `Midias publicas`, `LogsViewer.tsx`, `Jogos publicos`, `Dashboard e navegacao admin`, `Emblemas de build + docs`, `components/CalendarSection.tsx`, `Insignia.tsx`, `ProfileEditDialog.tsx`, `Midias admin`, `Painel de presenca`, `Layout raiz e estilos`, `membro/layout.tsx`, `Gestao de presenca admin`, `Home, robots e skeletons`, `Cards de jogos`, `types.ts`, `useToast`, `simulados/page.tsx`, `anotacoes/page.tsx`, `ConfirmProvider.tsx`, `MemberQueue.tsx`, `admin/layout.tsx`, `SettingsSection.tsx`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **Should `MemberFilters.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09803921568627451 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `Teste datas relativas` to `Teste login Google`, `Teste redirect HTTPS`, `Teste titulos Instagram`, `Dependencias, proxy e regras do Next`, `Teste senha`, `Teste SEO`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `ref_node_assert`, `Teste cofre de contas`, `Teste app-log`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `Teste auth hardening e TypeScript`, `Teste de emblemas`, `ref_node_fs`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **Should `Dependencias, proxy e regras do Next` be split into smaller, more focused modules?**
  _Cohesion score 0.05813953488372093 - nodes in this community are weakly interconnected._