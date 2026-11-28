# Graph Report - site-oficial-dk  (2026-11-28)

## Corpus Check
- 343 files · ~162,110 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .css 13, .example 1, (none) 1)

## Summary
- 2183 nodes · 5947 edges · 116 communities (95 shown, 21 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 129 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3087254a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NoteComposer.tsx
- check-migrations.mjs
- AssessmentCreateForm.tsx
- instagram-sync.ts
- package.json
- site-nav.ts
- admin/tournaments/route.ts
- Midias publicas
- LogsViewer.tsx
- SQL+docs: perfil, rank e acesso a documentos
- createAdminClient
- Troca de contas
- @supabase/supabase-js
- PageHero
- AdminDashboard.tsx
- MediaSection.tsx
- next
- BuildEmblem.tsx
- security-phrase/route.ts
- Registro e instrumentacao
- eventos/page.tsx
- ProfileEditDialog.tsx
- MemberQueue.tsx
- public
- Realtime SSE
- security-phrase.test.cjs
- client.ts
- Configuracao do Site Oficial do DK (SETUP)
- sync/route.ts
- public.registration_rate_limits
- tournaments.ts
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
- assessments.ts
- MembersSection.tsx
- components/CalendarSection.tsx
- Teste de fluxo de perfil
- instagram-storage.ts
- assessments.ts
- ToastProvider.tsx
- Teste storage Instagram
- ref_node_fs
- MemberHomeView.tsx
- instagram-apify.ts
- Teste cofre de contas
- Teste app-log
- tournaments.test.cjs
- typescript
- Teste mapas de jogos
- Teste anotacoes
- SQL: logs do app
- Teste filtros de membros
- Teste estilo do membro
- typescript
- attendance-share.test.cjs
- content-templates.test.cjs
- email-templates.test.cjs
- Teste titulos Instagram
- next
- Insignia.tsx
- Teste senha
- member-notes.ts
- callback/route.ts
- ref_node_assert
- build-email-templates.mjs
- SQL+doc: templates de conteudo
- NoteList.tsx
- Loading admin
- Loading login
- SQL: zodiaco
- account-email.test.cjs
- graphify-agent-guard.js
- Project instructions
- assessment-self-guard.test.cjs
- notes/[id]/route.ts
- MembersSection.tsx
- assessments.ts
- password-recovery.test.cjs
- ref_node_vm
- proxy.ts
- build-emblem.test.cjs
- https-redirect.test.cjs
- 015_graduation_tracks.sql
- createClient
- next.config.ts
- [token]/route.ts
- 1. Texto em português
- DocumentManager.tsx
- redefinir-senha/page.tsx
- 013_admin_authorization_hardening.sql
- jsonApiFetch
- profiles_zz_guard_own_access
- MediaGallery.tsx

## God Nodes (most connected - your core abstractions)
1. `next` - 106 edges
2. `react` - 93 edges
3. `public.profiles` - 78 edges
4. `lucide-react` - 76 edges
5. `createAdminClient()` - 56 edges
6. `jsonApiFetch()` - 50 edges
7. `isSameOriginRequest()` - 49 edges
8. `forbidden()` - 48 edges
9. `createClient()` - 44 edges
10. `MembersSection()` - 41 edges

## Surprising Connections (you probably didn't know these)
- `Audit history of assessment actions` --references--> `public.assessment_audit_log`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql
- `Progressive document access (Bronze/Prata/Ouro, min rank)` --references--> `public.can_access_document()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/001_initial_schema.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/015_graduation_tracks.sql
- `Profile completion and rank-request test script` --references--> `public.update_own_member_profile_with_access_request()`  [INFERRED]
  docs/TESTES-ACESSO.md → supabase/migrations/024_track_commander.sql
- `Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation)` --references--> `public.can_manage_assessments()`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (116 total, 21 thin omitted)

### Community 0 - "NoteComposer.tsx"
Cohesion: 0.32
Nodes (5): fold(), NoteComposer(), submit(), noteSealsFor(), NoteCounterpart

### Community 1 - "check-migrations.mjs"
Cohesion: 0.24
Nodes (11): Ordered migrations 001-012 applied manually in SQL Editor, byPrefix, duplicates, isKnown(), known, KNOWN_DUPLICATES, migrationsDir, unexpected (+3 more)

### Community 2 - "AssessmentCreateForm.tsx"
Cohesion: 0.10
Nodes (20): AssessmentCreateForm(), goToPending(), setScopes(), submit(), toggleGroup(), toggleScope(), AssessmentPayload, BankMeter() (+12 more)

### Community 3 - "instagram-sync.ts"
Cohesion: 0.23
Nodes (11): fetchInstagramPosts(), isLegacyInstagramTitle(), ensureInstagramBucket(), refreshExistingPost(), saoPauloDate(), ScrapedPost, syncInstagram(), fs (+3 more)

### Community 4 - "package.json"
Cohesion: 0.05
Nodes (44): dependencies, ffmpeg-static@^5.3.0, lucide-react@^0.468.0, next@16.4.6, nodemailer@^10.6.1, pg@^8.23.1, react@^19.0.0, @supabase/ssr@^0.8.0 (+36 more)

### Community 5 - "site-nav.ts"
Cohesion: 0.23
Nodes (10): GraduationIcon(), Icon(), IconProps, RoundShieldIcon(), SpearIcon(), footerColumns, legalLinks, mainLinks (+2 more)

### Community 6 - "admin/tournaments/route.ts"
Cohesion: 0.39
Nodes (10): changed(), denied(), GET(), noStore, PATCH(), POST(), PATCH(), findTournament() (+2 more)

### Community 7 - "Midias publicas"
Cohesion: 0.11
Nodes (29): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+21 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.07
Nodes (33): ActivityRow, AttendanceManager(), Correction, Entry, History, Member, readJson(), auditActionLabel (+25 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.10
Nodes (34): Seguranca (convite, aprovacao, RLS, bucket privado), activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at, games_updated_at (+26 more)

### Community 10 - "createAdminClient"
Cohesion: 0.11
Nodes (35): allRows(), GET(), PATCH(), canSeeDocument(), DELETE(), PATCH(), POST(), runtime (+27 more)

### Community 11 - "Troca de contas"
Cohesion: 0.13
Nodes (37): DELETE(), GET(), NO_STORE, NO_STORE, POST(), POST(), GET(), NO_STORE (+29 more)

### Community 12 - "@supabase/supabase-js"
Cohesion: 0.21
Nodes (10): FeedRow, GET(), LEVELS, NO_STORE, PERIODS, safeSearch(), SECTIONS, SERVER_SOURCES (+2 more)

### Community 13 - "PageHero"
Cohesion: 0.10
Nodes (33): GraduationPage(), metadata, tiers, tracks, GamesPage(), metadata, dynamicParams, GamePage() (+25 more)

### Community 14 - "AdminDashboard.tsx"
Cohesion: 0.10
Nodes (30): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+22 more)

### Community 15 - "MediaSection.tsx"
Cohesion: 0.07
Nodes (27): useConfirm(), DocumentManager(), FormSectionHead(), MediaGalleryManager(), defaultInstagramDateRange(), formFromPost(), MediaSection(), loadPostForm() (+19 more)

### Community 16 - "next"
Cohesion: 0.17
Nodes (7): POST(), runtime, NotesSettings, NO_STORE, NoteActor, requireNoteActor(), next

### Community 17 - "BuildEmblem.tsx"
Cohesion: 0.09
Nodes (28): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), npm run prepare:emblems script, Image-generation base prompt for emblems (+20 more)

### Community 18 - "security-phrase/route.ts"
Cohesion: 0.31
Nodes (7): NO_STORE, readSecurityPhrase(), SECURITY_PHRASE_KEY, SECURITY_PHRASE_MAX, SECURITY_PHRASE_MIN, SecurityPhraseResult, validateSecurityPhrase()

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.10
Nodes (29): POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs(), LogEntry (+21 more)

### Community 20 - "eventos/page.tsx"
Cohesion: 0.09
Nodes (23): anchors, EventKind, externalEvents, hostedOptions, internalEvents, metadata, metadata, PrivacyPage() (+15 more)

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.12
Nodes (22): EditableProfile, EditMemberProfile(), openDialog(), submit(), countProfileChanges(), EMPTY_PASSWORD, PasswordState, ProfileEditDialog() (+14 more)

### Community 22 - "MemberQueue.tsx"
Cohesion: 0.14
Nodes (16): adjustmentsOf(), commanderOptions, Draft, levelOptions, MemberQueue(), startAdjust(), Props, rankOptions (+8 more)

### Community 23 - "public"
Cohesion: 0.11
Nodes (15): Profile completion with pending access-request approval (migration 011), Profile completion and rank-request test script, profiles_nickname_unique_idx, public.update_own_member_profile(), public.update_own_member_avatar(), public.update_own_member_profile_with_access_request(), public.check_registration_rate_limit(), public.update_own_member_profile_with_access_request() (+7 more)

### Community 24 - "Realtime SSE"
Cohesion: 0.13
Nodes (24): clientIp(), dynamic, encoder, GET(), cleanup(), send(), NO_STORE, runtime (+16 more)

### Community 25 - "security-phrase.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), phrase, route(), { test }, ts, vm

### Community 26 - "client.ts"
Cohesion: 0.25
Nodes (12): AuthInput(), PasswordInput(), GoogleIcon(), LoginForm(), handleGoogle(), handleSubmit(), CLIENT_HEADER, isSupabaseConfigured() (+4 more)

### Community 27 - "Configuracao do Site Oficial do DK (SETUP)"
Cohesion: 0.11
Nodes (31): Activation: migrations 009 and 010 plus three Supabase env vars, Audit history of assessment actions, Avaliacoes e Simulados do DK, Classificacao das questoes (manual, tipo, area, dificuldade), Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation), Selecao manual de questoes, Sorteio individual por filtro (frozen random set per indication), Member birthdays calendar (migration 008) (+23 more)

### Community 28 - "sync/route.ts"
Cohesion: 0.24
Nodes (10): GET(), isDateOnly(), maxDuration, POST(), runSync(), runtime, CRON_SECRET scheduled sync endpoint /api/admin/instagram/sync, FFmpeg video compression (50-250 MB to MP4 H.264/AAC) (+2 more)

### Community 29 - "public.registration_rate_limits"
Cohesion: 0.22
Nodes (7): public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, public.release_registration_invite(), registration_rate_limits_window_idx, public.check_registration_rate_limit(), public.check_registration_rate_limit()

### Community 30 - "tournaments.ts"
Cohesion: 0.05
Nodes (99): home, MemberTournamentsPage(), metadata, Action, Detail, readResponse(), TournamentSection(), closeRegistration() (+91 more)

### Community 31 - "AttendancePanel.tsx"
Cohesion: 0.15
Nodes (19): AttendancePanel(), copyList(), listText(), shareOnWhatsApp(), Filter, filterLabels, isActivityClosed(), monthTitle() (+11 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "app/layout.tsx"
Cohesion: 0.11
Nodes (8): cinzel, inter, metadata, RootLayout(), InsigniaColorFilters(), QueryActivityFeedback(), QueryProvider(), RealtimeProvider()

### Community 34 - "react"
Cohesion: 0.22
Nodes (7): AdminDialog(), ConfirmContext, ConfirmOptions, Pending, openModals, useDialogBehavior(), react

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.12
Nodes (24): AdminTab, AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion() (+16 more)

### Community 36 - "sections/CalendarSection.tsx"
Cohesion: 0.08
Nodes (44): CalendarSection(), loadActivityForm(), openEdit(), openNew(), removeActivity(), saveActivity(), endOf(), monthLabel() (+36 more)

### Community 37 - "seo.ts"
Cohesion: 0.11
Nodes (18): metadata, HomePage(), metadata, portals, virtues, JSON-LD (organization, Article, BreadcrumbList), lib/seo.ts (canonical domain death-knights.com.br), Open Graph / Twitter metadata and default social image (+10 more)

### Community 38 - "types.ts"
Cohesion: 0.14
Nodes (14): GameCard(), GameDialog(), GameView, noopSubscribe(), catalog, Filter, filterLabels, gameCategories (+6 more)

### Community 39 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "steps"
Cohesion: 0.12
Nodes (15): Future deployment (env vars, lint, build), runs-on, steps, jobs, build, name, on, pull_request (+7 more)

### Community 41 - "assessments.ts"
Cohesion: 0.11
Nodes (19): AssessmentPayload, AssessmentRunnerLoaded(), formatRemaining(), SafeQuestion, SavedAnswer, assessmentAssignmentStatusLabels, assessmentTrackOptions, rankShortLabels (+11 more)

### Community 42 - "MembersSection.tsx"
Cohesion: 0.12
Nodes (25): useAdminData(), AdminTitle(), InvitesSection(), createInvite(), disableInvite(), inviteState(), MembersSection(), canEditAccess() (+17 more)

### Community 43 - "components/CalendarSection.tsx"
Cohesion: 0.18
Nodes (16): CalendarSection(), CalendarViews(), statusLabel, activityDateKey(), CalendarYearView(), eventTimes(), statusLabel, weekdays (+8 more)

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.14
Nodes (17): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+9 more)

### Community 45 - "instagram-storage.ts"
Cohesion: 0.33
Nodes (6): archiveInstagramPost(), download(), INSTAGRAM_BUCKET, InstagramMediaArchiveError, MIME_EXTENSIONS, sourceUrl()

### Community 46 - "assessments.ts"
Cohesion: 0.31
Nodes (14): optionalText(), validateAssessmentDefinition(), validateAssessmentQuestion(), ValidationResult, assessmentSelectionModeOptions, generalAssessmentRanks, isAssessmentDifficulty(), isAssessmentQuestionCount() (+6 more)

### Community 47 - "ToastProvider.tsx"
Cohesion: 0.25
Nodes (7): icons, lifetime, ToastAction, ToastApi, ToastContext, ToastItem, ToastKind

### Community 48 - "Teste storage Instagram"
Cohesion: 0.18
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "ref_node_fs"
Cohesion: 0.14
Nodes (10): compressInstagramVideo(), run, assert, fs, os, path, python, { spawnSync } (+2 more)

### Community 50 - "MemberHomeView.tsx"
Cohesion: 0.26
Nodes (11): AnswerBadge(), day(), MemberHomeView(), month(), time(), UpcomingActivity, normalizeBuildName(), houseFor() (+3 more)

### Community 51 - "instagram-apify.ts"
Cohesion: 0.29
Nodes (11): buildInstagramTitle(), fallbackTitle(), hasWords(), InstagramScrapedPost, isVideo(), normalizeInstagramPost(), normalizePermalink(), ScrapedMedia (+3 more)

### Community 52 - "Teste cofre de contas"
Cohesion: 0.18
Nodes (8): assert, fs, plain(), raw, { test }, ts, vault, vm

### Community 53 - "Teste app-log"
Cohesion: 0.20
Nodes (10): assert, clientIp, fs, load(), loadAppLog(), loadLogsRoute(), sanitize, { test } (+2 more)

### Community 54 - "tournaments.test.cjs"
Cohesion: 0.18
Nodes (6): assert, fs, model, { test }, ts, vm

### Community 55 - "typescript"
Cohesion: 0.14
Nodes (11): apply, body, dir, subjects, assert, fs, moduleExports, now (+3 more)

### Community 56 - "Teste mapas de jogos"
Cohesion: 0.18
Nodes (9): assert, expectedMaps, fs, { gameCategories, gameCategoryLabels }, { gameFieldMaps }, { games }, { test }, ts (+1 more)

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

### Community 61 - "typescript"
Cohesion: 0.22
Nodes (7): typescript@^5.7.0, typescript, assert, fs, { test }, ts, vm

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

### Community 66 - "next"
Cohesion: 0.11
Nodes (39): NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST(), POST(), POST() (+31 more)

### Community 67 - "Insignia.tsx"
Cohesion: 0.15
Nodes (26): AttendanceInsignias(), BuildInsignia(), GraduationInsignia(), GraduationInsignias(), Insignia(), RankInsignia(), Variant, InsigniaBadge() (+18 more)

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "member-notes.ts"
Cohesion: 0.05
Nodes (74): AdminLayout(), metadata, AdminPage(), metadata, MemberNotesPage(), metadata, MemberActivitiesPage(), metadata (+66 more)

### Community 70 - "callback/route.ts"
Cohesion: 0.07
Nodes (39): backToLogin(), GET(), giveBack(), relativeRedirect(), Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Supabase Site URL and Redirect URLs (/auth/callback) (+31 more)

### Community 71 - "ref_node_assert"
Cohesion: 0.10
Nodes (16): assert, exportsMap, fs, { test }, ts, vm, assert, fs (+8 more)

### Community 72 - "build-email-templates.mjs"
Cohesion: 0.33
Nodes (5): outDir, render(), siteTemplates, templates, writeGroup()

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.36
Nodes (5): content_templates_kind_name_key, content_templates_updated_at, public.content_templates, public.sync_profile_email(), sync_profile_email

### Community 74 - "NoteList.tsx"
Cohesion: 0.16
Nodes (17): call(), dayLabel(), formatDate(), NoteItem, NoteList(), remove(), run(), saveEdit() (+9 more)

### Community 82 - "account-email.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), recovery, setup(), { test }, ts, vm

### Community 91 - "assessment-self-guard.test.cjs"
Cohesion: 0.20
Nodes (6): assert, fs, params, { test }, ts, vm

### Community 93 - "notes/[id]/route.ts"
Cohesion: 0.10
Nodes (24): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, denied(), POST() (+16 more)

### Community 94 - "MembersSection.tsx"
Cohesion: 0.12
Nodes (30): Chip(), Medal(), MemberFilters(), optionLabel(), Props, MemberAccessForm, MemberStatusFilter, statusFilters (+22 more)

### Community 95 - "assessments.ts"
Cohesion: 0.10
Nodes (37): PATCH(), POST(), shuffled(), DELETE(), PATCH(), POST(), POST(), dynamic (+29 more)

### Community 96 - "password-recovery.test.cjs"
Cohesion: 0.18
Nodes (13): assert, fs, load(), now, recovery, requestRoute(), resetRoute(), run() (+5 more)

### Community 97 - "ref_node_vm"
Cohesion: 0.12
Nodes (11): assert, fs, { test }, ts, vm, assert, fs, seo (+3 more)

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
Nodes (6): AvatarCropper(), Point, MemberAvatar(), changePhoto(), removePhoto(), createClient()

### Community 104 - "next.config.ts"
Cohesion: 0.40
Nodes (4): contentSecurityPolicy, nextConfig, securityHeaders, supabaseOrigin

### Community 105 - "[token]/route.ts"
Cohesion: 0.20
Nodes (17): CandidateContext, candidatePayload(), expireOrSubmitIfNeeded(), GET(), getContext(), getDeadline(), PATCH(), POST() (+9 more)

### Community 106 - "1. Texto em português"
Cohesion: 0.20
Nodes (9): 1. Texto em português, 2. Assinatura: SPF, DKIM e DMARC, 3. Frase de segurança (prova dentro do e-mail), 4. E-mails enviados pelo site (cadastro), Conferir se ficou assinado, Configurar, E-mails (autenticação, cadastro e assinatura), Projeto hospedado (teste) (+1 more)

### Community 110 - "DocumentManager.tsx"
Cohesion: 0.09
Nodes (22): accessLabel(), renderJoin(), renderRules(), newRule(), ruleLabel(), RulesState, rankOptions, saveNotes() (+14 more)

### Community 113 - "redefinir-senha/page.tsx"
Cohesion: 0.14
Nodes (16): metadata, RegisterPage(), ForgotPasswordPage(), metadata, metadata, ResetPasswordPage(), AuthShell(), authTabs (+8 more)

### Community 114 - "013_admin_authorization_hardening.sql"
Cohesion: 0.52
Nodes (6): admin_audit_log_occurred_at_idx, admin_audit_log_target_idx, audit_invites, audit_user_admin_roles, public.admin_audit_log, public.log_admin_audit()

### Community 115 - "jsonApiFetch"
Cohesion: 0.15
Nodes (19): initialsOf(), SavedAccounts(), enter(), forget(), Header(), signOut(), switchAccount(), HeaderAccount (+11 more)

### Community 118 - "MediaGallery.tsx"
Cohesion: 0.29
Nodes (5): GalleryItem, MediaGallery(), noopSubscribe(), react-dom@^19.0.0, react-dom

## Knowledge Gaps
- **5 isolated node(s):** `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 767 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `NoteComposer.tsx`, `package.json`, `admin/tournaments/route.ts`, `Midias publicas`, `createAdminClient`, `Troca de contas`, `@supabase/supabase-js`, `PageHero`, `AdminDashboard.tsx`, `security-phrase/route.ts`, `Registro e instrumentacao`, `eventos/page.tsx`, `ProfileEditDialog.tsx`, `client.ts`, `sync/route.ts`, `tournaments.ts`, `app/layout.tsx`, `seo.ts`, `types.ts`, `assessments.ts`, `MembersSection.tsx`, `components/CalendarSection.tsx`, `MemberHomeView.tsx`, `next`, `Insignia.tsx`, `member-notes.ts`, `NoteList.tsx`, `notes/[id]/route.ts`, `MembersSection.tsx`, `assessments.ts`, `proxy.ts`, `createClient`, `next.config.ts`, `[token]/route.ts`, `redefinir-senha/page.tsx`, `jsonApiFetch`?**
  _High betweenness centrality (0.218) - this node is a cross-community bridge._
- **What connects `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AssessmentCreateForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10461538461538461 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `NoteComposer.tsx`, `AssessmentCreateForm.tsx`, `package.json`, `site-nav.ts`, `Midias publicas`, `LogsViewer.tsx`, `PageHero`, `AdminDashboard.tsx`, `MediaSection.tsx`, `BuildEmblem.tsx`, `eventos/page.tsx`, `ProfileEditDialog.tsx`, `MemberQueue.tsx`, `client.ts`, `tournaments.ts`, `AttendancePanel.tsx`, `app/layout.tsx`, `Admin de avaliacoes (acoes)`, `sections/CalendarSection.tsx`, `seo.ts`, `types.ts`, `assessments.ts`, `MembersSection.tsx`, `components/CalendarSection.tsx`, `ToastProvider.tsx`, `Insignia.tsx`, `member-notes.ts`, `NoteList.tsx`, `MembersSection.tsx`, `createClient`, `DocumentManager.tsx`, `redefinir-senha/page.tsx`, `jsonApiFetch`, `MediaGallery.tsx`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.054078014184397165 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `typescript` to `instagram-sync.ts`, `package.json`, `security-phrase.test.cjs`, `Teste login Google`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `Teste cofre de contas`, `Teste app-log`, `tournaments.test.cjs`, `typescript`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `attendance-share.test.cjs`, `content-templates.test.cjs`, `email-templates.test.cjs`, `Teste titulos Instagram`, `Teste senha`, `ref_node_assert`, `account-email.test.cjs`, `assessment-self-guard.test.cjs`, `password-recovery.test.cjs`, `ref_node_vm`, `build-emblem.test.cjs`, `https-redirect.test.cjs`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Should `Midias publicas` be split into smaller, more focused modules?**
  _Cohesion score 0.11282051282051282 - nodes in this community are weakly interconnected._