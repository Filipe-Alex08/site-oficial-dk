# Graph Report - site-oficial-dk  (2026-11-27)

## Corpus Check
- 343 files · ~161,311 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .css 13, .example 1, (none) 1)

## Summary
- 2176 nodes · 5934 edges · 119 communities (98 shown, 21 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 129 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3087254a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- anotacoes/page.tsx
- check-migrations.mjs
- AssessmentCreateForm.tsx
- membro/page.tsx
- package.json
- site-nav.ts
- membro/layout.tsx
- Midias publicas
- LogsViewer.tsx
- SQL+docs: perfil, rank e acesso a documentos
- createAdminClient
- Troca de contas
- @supabase/supabase-js
- PageHero
- AdminDashboard.tsx
- MediaSection.tsx
- member-notes.ts
- BuildEmblem.tsx
- security-phrase/route.ts
- Registro e instrumentacao
- sobre/page.tsx
- ProfileEditDialog.tsx
- MemberQueue.tsx
- public
- Realtime SSE
- security-phrase.test.cjs
- jsonApiFetch
- Configuracao do Site Oficial do DK (SETUP)
- TournamentSection.tsx
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
- eventos/page.tsx
- assessments.ts
- reset/route.ts
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
- ref_node_vm
- attendance-share.test.cjs
- content-templates.test.cjs
- email-templates.test.cjs
- Teste titulos Instagram
- next
- Insignia.tsx
- Teste senha
- simulados/page.tsx
- callback/route.ts
- ref_node_assert
- DocumentManager.tsx
- SQL+doc: templates de conteudo
- types.ts
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
- seo.test.cjs
- proxy.ts
- build-emblem.test.cjs
- https-redirect.test.cjs
- 015_graduation_tracks.sql
- createClient
- next.config.ts
- [token]/route.ts
- 1. Texto em português
- SettingsSection.tsx
- eventos/page.tsx
- MemberThemeProvider.tsx
- AuthShell
- 013_admin_authorization_hardening.sql
- Header.tsx
- profiles_zz_guard_own_access
- prepare-build-emblems.mjs
- MediaGallery.tsx

## God Nodes (most connected - your core abstractions)
1. `next` - 106 edges
2. `react` - 93 edges
3. `public.profiles` - 78 edges
4. `lucide-react` - 75 edges
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
- `Snapshot of questions in published assessments` --references--> `public.assessment_items`  [INFERRED]
  docs/AVALIACOES-E-SIMULADOS.md → supabase/migrations/009_assessment_module.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Google login setup, configuration and testing** — como_ativar_login_com_google_guia, docs_setup_login_com_google, docs_setup_gotrue_self_hosted, docs_setup_redirect_urls, docs_teste_login_google_roteiro [EXTRACTED 0.95]
- **Assessment module: definition, activation and acceptance testing** — docs_avaliacoes_e_simulados_avaliacoes_e_simulados, docs_setup_avaliacoes_simulados, docs_testes_acesso_testes_avaliacoes, docs_avaliacoes_e_simulados_gestor_de_avaliacoes, docs_avaliacoes_e_simulados_indicacao_individual [INFERRED 0.85]
- **Private document access control (RLS, private bucket, progressive levels)** — readme_documentos_privados, docs_setup_documentos_pdfs, docs_setup_bucket_dk_documents, docs_testes_acesso_progressao_de_documentos, docs_testes_acesso_testes_pdfs [INFERRED 0.85]

## Communities (119 total, 21 thin omitted)

### Community 0 - "anotacoes/page.tsx"
Cohesion: 0.20
Nodes (16): MemberNotesPage(), metadata, fold(), NoteComposer(), NoteItem, NoteSeal(), isCommander(), canWriteNotes() (+8 more)

### Community 1 - "check-migrations.mjs"
Cohesion: 0.11
Nodes (23): Google Cloud OAuth Web client (Client ID/Secret), Como ativar o login com Google (guia rapido), Supabase Google provider (hosted or self-hosted), Orphan accounts without profile (14.7), Disable public sign-ups (14.5), Delete Google-created account when no profile exists (/auth/callback), Google Cloud Console configuration (14.1), Self-hosted Supabase GoTrue Google env vars (14.3) (+15 more)

### Community 2 - "AssessmentCreateForm.tsx"
Cohesion: 0.10
Nodes (22): AssessmentCreateForm(), goToPending(), setScopes(), submit(), toggleGroup(), toggleScope(), AssessmentPayload, BankMeter() (+14 more)

### Community 3 - "membro/page.tsx"
Cohesion: 0.48
Nodes (5): MemberPage(), metadata, LiveRefresh(), usesPasswordLogin(), readSecurityPhrase()

### Community 4 - "package.json"
Cohesion: 0.05
Nodes (46): dependencies, ffmpeg-static@^5.3.0, lucide-react@^0.468.0, next@16.4.6, nodemailer@^10.6.1, pg@^8.23.1, react@^19.0.0, react-dom@^19.0.0 (+38 more)

### Community 5 - "site-nav.ts"
Cohesion: 0.23
Nodes (10): GraduationIcon(), Icon(), IconProps, RoundShieldIcon(), SpearIcon(), footerColumns, legalLinks, mainLinks (+2 more)

### Community 6 - "membro/layout.tsx"
Cohesion: 0.18
Nodes (14): AdminLayout(), metadata, metadata, metadata, PrivateLayout(), AdminProviders(), ConfirmProvider(), ToastProvider() (+6 more)

### Community 7 - "Midias publicas"
Cohesion: 0.12
Nodes (28): MediaPage(), metadata, revalidate, generateMetadata(), generateStaticParams(), loadPost, loadRelated, PostPage() (+20 more)

### Community 8 - "LogsViewer.tsx"
Cohesion: 0.06
Nodes (32): ActivityRow, AttendanceManager(), Correction, Entry, History, Member, readJson(), auditActionLabel (+24 more)

### Community 9 - "SQL+docs: perfil, rank e acesso a documentos"
Cohesion: 0.10
Nodes (36): Seguranca (convite, aprovacao, RLS, bucket privado), activities_starts_at_idx, activities_updated_at, activity_attendance_activity_idx, activity_attendance_updated_at, documents_access_idx, documents_updated_at, games_updated_at (+28 more)

### Community 10 - "createAdminClient"
Cohesion: 0.14
Nodes (28): allRows(), GET(), canSeeDocument(), DELETE(), PATCH(), POST(), runtime, GET() (+20 more)

### Community 11 - "Troca de contas"
Cohesion: 0.13
Nodes (37): DELETE(), GET(), NO_STORE, NO_STORE, POST(), POST(), GET(), NO_STORE (+29 more)

### Community 12 - "@supabase/supabase-js"
Cohesion: 0.21
Nodes (10): FeedRow, GET(), LEVELS, NO_STORE, PERIODS, safeSearch(), SECTIONS, SERVER_SOURCES (+2 more)

### Community 13 - "PageHero"
Cohesion: 0.11
Nodes (30): GraduationPage(), metadata, tiers, tracks, GamesPage(), metadata, dynamicParams, GamePage() (+22 more)

### Community 14 - "AdminDashboard.tsx"
Cohesion: 0.15
Nodes (21): AdminBottomBar(), priority, Sheet(), AdminDashboard(), AdminNav(), DashboardSnapshot, AdminData, AdminDataContext (+13 more)

### Community 15 - "MediaSection.tsx"
Cohesion: 0.12
Nodes (23): FormSectionHead(), MediaGalleryManager(), defaultInstagramDateRange(), formFromPost(), MediaSection(), loadPostForm(), openEdit(), openNew() (+15 more)

### Community 16 - "member-notes.ts"
Cohesion: 0.13
Nodes (19): DEFAULT_NOTES_SETTINGS, isRank(), isScope(), isWriters(), loadNotesSettings(), NOTE_COUNTERPART_COLUMNS, NOTES_SETTING_KEYS, NotesCommanderScope (+11 more)

### Community 17 - "BuildEmblem.tsx"
Cohesion: 0.14
Nodes (22): Build emblem: arqueiro, Build emblem: dual, Build emblem: escudeiro, Build emblem: lanceiro, Build emblem: padrao (oni mask, fallback), Emblemas de build (fundo do cartao do membro), Image-generation base prompt for emblems, BuildEmblem() (+14 more)

### Community 18 - "security-phrase/route.ts"
Cohesion: 0.40
Nodes (4): SECURITY_PHRASE_KEY, SECURITY_PHRASE_MAX, SECURITY_PHRASE_MIN, SecurityPhraseResult

### Community 19 - "Registro e instrumentacao"
Cohesion: 0.09
Nodes (29): notifyApproval(), POST(), readRegistrationBody(), onRequestError(), register(), drain(), enqueue(), flushLogs() (+21 more)

### Community 20 - "sobre/page.tsx"
Cohesion: 0.22
Nodes (10): AboutPage(), metadata, steps, values, Footer(), motto, WhatsAppIcon(), formatBuildDate() (+2 more)

### Community 21 - "ProfileEditDialog.tsx"
Cohesion: 0.15
Nodes (24): ResetPasswordForm(), handleSubmit(), EditableProfile, EditMemberProfile(), openDialog(), submit(), countProfileChanges(), EMPTY_PASSWORD (+16 more)

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

### Community 26 - "jsonApiFetch"
Cohesion: 0.13
Nodes (20): AuthInput(), PasswordInput(), GoogleIcon(), LoginForm(), handleGoogle(), handleSubmit(), empty, RegistrationForm() (+12 more)

### Community 27 - "Configuracao do Site Oficial do DK (SETUP)"
Cohesion: 0.10
Nodes (33): Activation: migrations 009 and 010 plus three Supabase env vars, Audit history of assessment actions, Avaliacoes e Simulados do DK, Gestor de Avaliacoes (role: Generais automatic; Major-Coronel by delegation), Selecao manual de questoes, Sorteio individual por filtro (frozen random set per indication), Member birthdays calendar (migration 008), Avaliacoes e simulados setup (migrations 009/010) (+25 more)

### Community 28 - "TournamentSection.tsx"
Cohesion: 0.11
Nodes (20): Action, Detail, readResponse(), TournamentInvitations(), TournamentSection(), closeRegistration(), matchActions(), openMatchDialog() (+12 more)

### Community 29 - "public.registration_rate_limits"
Cohesion: 0.24
Nodes (6): public.check_registration_rate_limit(), public.consume_registration_invite(), public.registration_rate_limits, registration_rate_limits_window_idx, public.check_registration_rate_limit(), public.check_registration_rate_limit()

### Community 30 - "tournaments.ts"
Cohesion: 0.06
Nodes (88): changed(), denied(), GET(), noStore, PATCH(), POST(), PATCH(), home (+80 more)

### Community 31 - "AttendancePanel.tsx"
Cohesion: 0.16
Nodes (18): AttendancePanel(), copyList(), listText(), shareOnWhatsApp(), Filter, filterLabels, isActivityClosed(), monthTitle() (+10 more)

### Community 32 - "Teste login Google"
Cohesion: 0.11
Nodes (17): alreadyActive, approvedByPassword, assert, availability(), callback(), decide(), envOk, fs (+9 more)

### Community 33 - "app/layout.tsx"
Cohesion: 0.09
Nodes (11): cinzel, inter, metadata, RootLayout(), InsigniaColorFilters(), QueryActivityFeedback(), QueryProvider(), Listener (+3 more)

### Community 34 - "react"
Cohesion: 0.09
Nodes (25): AdminDialog(), CommandPalette(), choose(), onKeyDown(), normalize(), Result, ConfirmContext, ConfirmOptions (+17 more)

### Community 35 - "Admin de avaliacoes (acoes)"
Cohesion: 0.11
Nodes (24): AdminTab, AssessmentAdmin(), applyAssignmentChange(), assignmentUrl(), changeAssignment(), copyAssignmentLink(), createAssessment(), deactivateQuestion() (+16 more)

### Community 36 - "sections/CalendarSection.tsx"
Cohesion: 0.11
Nodes (26): copy, TemplateBar(), closeDialog(), rename(), saveNew(), updateApplied(), queryKey(), TemplateStore (+18 more)

### Community 37 - "seo.ts"
Cohesion: 0.19
Nodes (10): JSON-LD (organization, Article, BreadcrumbList), lib/seo.ts (canonical domain death-knights.com.br), Open Graph / Twitter metadata and default social image, Post-publication SEO checklist (Search Console, Lighthouse), /robots.txt, SEO do site DK, /sitemap.xml, siteName (+2 more)

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
Cohesion: 0.17
Nodes (13): AssessmentPayload, AssessmentRunnerLoaded(), formatRemaining(), SafeQuestion, SavedAnswer, assessmentAssignmentStatusLabels, assessmentSelectionModeOptions, assessmentTrackOptions (+5 more)

### Community 42 - "MembersSection.tsx"
Cohesion: 0.09
Nodes (43): useAdminData(), AdminTitle(), useConfirm(), CalendarSection(), loadActivityForm(), openEdit(), openNew(), removeActivity() (+35 more)

### Community 43 - "components/CalendarSection.tsx"
Cohesion: 0.21
Nodes (13): statusLabel, activityDateKey(), CalendarYearView(), eventTimes(), statusLabel, weekdays, BirthdayBadge(), birthdayLabel() (+5 more)

### Community 44 - "Teste de fluxo de perfil"
Cohesion: 0.14
Nodes (17): accessOptions, account, apiGuard, approve(), assert, fs, loadRoute(), nextServer (+9 more)

### Community 45 - "eventos/page.tsx"
Cohesion: 0.21
Nodes (12): HomePage(), metadata, portals, virtues, CalendarSection(), CalendarSkeleton(), CalendarViews(), SectionHeading() (+4 more)

### Community 46 - "assessments.ts"
Cohesion: 0.23
Nodes (15): POST(), Classificacao das questoes (manual, tipo, area, dificuldade), optionalText(), validateAssessmentDefinition(), validateAssessmentQuestion(), ValidationResult, isAssessmentDifficulty(), isAssessmentQuestionCount() (+7 more)

### Community 47 - "reset/route.ts"
Cohesion: 0.16
Nodes (20): NO_STORE, POST(), NO_STORE, POST(), NO_STORE, POST(), metadata, ResetPasswordPage() (+12 more)

### Community 48 - "Teste storage Instagram"
Cohesion: 0.18
Nodes (9): assert, { createHash }, fixture(), fs, load(), post, { test }, ts (+1 more)

### Community 49 - "ref_node_fs"
Cohesion: 0.09
Nodes (17): apply, body, dir, subjects, outDir, render(), siteTemplates, templates (+9 more)

### Community 50 - "MemberHomeView.tsx"
Cohesion: 0.16
Nodes (16): AnswerBadge(), day(), MemberHomeView(), month(), time(), UpcomingActivity, dayLabel(), shortWhen() (+8 more)

### Community 51 - "instagram-apify.ts"
Cohesion: 0.09
Nodes (37): GET(), isDateOnly(), maxDuration, POST(), runSync(), runtime, CRON_SECRET scheduled sync endpoint /api/admin/instagram/sync, FFmpeg video compression (50-250 MB to MP4 H.264/AAC) (+29 more)

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
Cohesion: 0.15
Nodes (11): typescript, fs, path, ts, assert, fs, moduleExports, now (+3 more)

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

### Community 61 - "ref_node_vm"
Cohesion: 0.13
Nodes (11): assert, exportsMap, fs, { test }, ts, vm, assert, fs (+3 more)

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
Cohesion: 0.09
Nodes (33): NO_STORE, POST(), NO_STORE, POST(), PATCH(), POST(), fields, GET() (+25 more)

### Community 67 - "Insignia.tsx"
Cohesion: 0.18
Nodes (24): AttendanceInsignias(), BuildInsignia(), GraduationInsignia(), GraduationInsignias(), Insignia(), RankInsignia(), Variant, InsigniaBadge() (+16 more)

### Community 68 - "Teste senha"
Cohesion: 0.25
Nodes (8): assert, fs, load(), setup(), { test }, ts, { validatePasswordChange }, vm

### Community 69 - "simulados/page.tsx"
Cohesion: 0.16
Nodes (22): AdminPage(), metadata, MemberActivitiesPage(), metadata, MemberDocumentsPage(), metadata, formatDate(), MemberAssessmentsPage() (+14 more)

### Community 70 - "callback/route.ts"
Cohesion: 0.14
Nodes (21): backToLogin(), GET(), giveBack(), relativeRedirect(), Supabase Site URL and Redirect URLs (/auth/callback), Redirect URL configuration (14.4), ActiveSnapshot, callbackFailureCode() (+13 more)

### Community 71 - "ref_node_assert"
Cohesion: 0.10
Nodes (15): assert, fs, { test }, ts, vm, assert, fs, moduleExports (+7 more)

### Community 72 - "DocumentManager.tsx"
Cohesion: 0.13
Nodes (15): accessLabel(), DocumentManager(), renderJoin(), renderRules(), newRule(), ruleLabel(), RulesState, Avatar() (+7 more)

### Community 73 - "SQL+doc: templates de conteudo"
Cohesion: 0.36
Nodes (5): content_templates_kind_name_key, content_templates_updated_at, public.content_templates, public.sync_profile_email(), sync_profile_email

### Community 74 - "types.ts"
Cohesion: 0.11
Nodes (20): trackNames, adminRoleOptions, documentAudienceOptions, GraduationFields, graduationLabels, memberKindLabels, memberKindOptions, rankShortLabels (+12 more)

### Community 82 - "account-email.test.cjs"
Cohesion: 0.22
Nodes (8): assert, fs, load(), recovery, setup(), { test }, ts, vm

### Community 91 - "assessment-self-guard.test.cjs"
Cohesion: 0.20
Nodes (6): assert, fs, params, { test }, ts, vm

### Community 93 - "notes/[id]/route.ts"
Cohesion: 0.09
Nodes (26): Context, DELETE(), fail(), loadNote(), PATCH(), runtime, POST(), runtime (+18 more)

### Community 94 - "MembersSection.tsx"
Cohesion: 0.14
Nodes (19): Chip(), Medal(), MemberFilters(), optionLabel(), Props, ChipOption, highestGraduation(), rankGroups (+11 more)

### Community 95 - "assessments.ts"
Cohesion: 0.10
Nodes (36): PATCH(), POST(), shuffled(), DELETE(), PATCH(), POST(), dynamic, GET() (+28 more)

### Community 96 - "password-recovery.test.cjs"
Cohesion: 0.18
Nodes (13): assert, fs, load(), now, recovery, requestRoute(), resetRoute(), run() (+5 more)

### Community 97 - "seo.test.cjs"
Cohesion: 0.25
Nodes (6): assert, fs, seo, { test }, ts, vm

### Community 98 - "proxy.ts"
Cohesion: 0.24
Nodes (9): SUPABASE_COOKIE_OPTIONS, updateSession(), isSupabaseConfigured(), canonicalHost, cloudflareVisitorScheme(), config, httpsRedirect(), proxy() (+1 more)

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

### Community 105 - "[token]/route.ts"
Cohesion: 0.20
Nodes (17): POST(), CandidateContext, candidatePayload(), expireOrSubmitIfNeeded(), GET(), getContext(), getDeadline(), PATCH() (+9 more)

### Community 106 - "1. Texto em português"
Cohesion: 0.20
Nodes (9): 1. Texto em português, 2. Assinatura: SPF, DKIM e DMARC, 3. Frase de segurança (prova dentro do e-mail), 4. E-mails enviados pelo site (cadastro), Conferir se ficou assinado, Configurar, E-mails (autenticação, cadastro e assinatura), Projeto hospedado (teste) (+1 more)

### Community 110 - "SettingsSection.tsx"
Cohesion: 0.12
Nodes (15): rankOptions, saveNotes(), settingsKey, SettingsSection(), SettingsTab, tabs, icons, lifetime (+7 more)

### Community 111 - "eventos/page.tsx"
Cohesion: 0.14
Nodes (12): anchors, EventKind, EventsPage(), externalEvents, hostedOptions, internalEvents, metadata, revalidate (+4 more)

### Community 112 - "MemberThemeProvider.tsx"
Cohesion: 0.23
Nodes (12): MemberStyleToggle(), options, MemberThemeContext, MemberThemeContextValue, MemberThemeProvider(), useMemberTheme(), effectiveMemberTheme(), isMemberStyle() (+4 more)

### Community 113 - "AuthShell"
Cohesion: 0.23
Nodes (9): metadata, RegisterPage(), ForgotPasswordPage(), metadata, AuthShell(), authTabs, ForgotPasswordForm(), handleSubmit() (+1 more)

### Community 114 - "013_admin_authorization_hardening.sql"
Cohesion: 0.52
Nodes (6): admin_audit_log_occurred_at_idx, admin_audit_log_target_idx, audit_invites, audit_user_admin_roles, public.admin_audit_log, public.log_admin_audit()

### Community 115 - "Header.tsx"
Cohesion: 0.18
Nodes (11): initialsOf(), SavedAccounts(), enter(), forget(), Header(), signOut(), switchAccount(), HeaderAccount (+3 more)

### Community 117 - "prepare-build-emblems.mjs"
Cohesion: 0.25
Nodes (6): npm run prepare:emblems script, public/images/builds (served webp output), BUILD_KEYS, done, EXTENSIONS, missing

### Community 118 - "MediaGallery.tsx"
Cohesion: 0.40
Nodes (3): GalleryItem, MediaGallery(), noopSubscribe()

## Knowledge Gaps
- **5 isolated node(s):** `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)`, `Supabase project creation`, `Post-publication SEO checklist (Search Console, Lighthouse)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 766 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `anotacoes/page.tsx`, `membro/page.tsx`, `package.json`, `membro/layout.tsx`, `Midias publicas`, `createAdminClient`, `Troca de contas`, `@supabase/supabase-js`, `PageHero`, `AdminDashboard.tsx`, `Registro e instrumentacao`, `sobre/page.tsx`, `ProfileEditDialog.tsx`, `jsonApiFetch`, `tournaments.ts`, `app/layout.tsx`, `react`, `seo.ts`, `types.ts`, `assessments.ts`, `MembersSection.tsx`, `components/CalendarSection.tsx`, `eventos/page.tsx`, `assessments.ts`, `reset/route.ts`, `MemberHomeView.tsx`, `instagram-apify.ts`, `Insignia.tsx`, `simulados/page.tsx`, `DocumentManager.tsx`, `notes/[id]/route.ts`, `assessments.ts`, `proxy.ts`, `next.config.ts`, `[token]/route.ts`, `eventos/page.tsx`, `AuthShell`, `Header.tsx`?**
  _High betweenness centrality (0.218) - this node is a cross-community bridge._
- **What connects `Test cleanup`, `Member birthdays calendar (migration 008)`, `Content templates for posts and activities (migration 021)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `check-migrations.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.10541310541310542 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `anotacoes/page.tsx`, `AssessmentCreateForm.tsx`, `package.json`, `site-nav.ts`, `membro/layout.tsx`, `Midias publicas`, `LogsViewer.tsx`, `PageHero`, `AdminDashboard.tsx`, `MediaSection.tsx`, `member-notes.ts`, `BuildEmblem.tsx`, `security-phrase/route.ts`, `ProfileEditDialog.tsx`, `MemberQueue.tsx`, `jsonApiFetch`, `TournamentSection.tsx`, `tournaments.ts`, `AttendancePanel.tsx`, `app/layout.tsx`, `Admin de avaliacoes (acoes)`, `sections/CalendarSection.tsx`, `types.ts`, `assessments.ts`, `MembersSection.tsx`, `components/CalendarSection.tsx`, `eventos/page.tsx`, `MemberHomeView.tsx`, `Insignia.tsx`, `simulados/page.tsx`, `DocumentManager.tsx`, `types.ts`, `MembersSection.tsx`, `SettingsSection.tsx`, `MemberThemeProvider.tsx`, `AuthShell`, `Header.tsx`, `MediaGallery.tsx`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Should `AssessmentCreateForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `typescript` to `package.json`, `security-phrase.test.cjs`, `Teste login Google`, `Teste de fluxo de perfil`, `Teste storage Instagram`, `Teste cofre de contas`, `Teste app-log`, `tournaments.test.cjs`, `Teste mapas de jogos`, `Teste anotacoes`, `Teste filtros de membros`, `Teste estilo do membro`, `ref_node_vm`, `attendance-share.test.cjs`, `content-templates.test.cjs`, `email-templates.test.cjs`, `Teste titulos Instagram`, `Teste senha`, `ref_node_assert`, `account-email.test.cjs`, `assessment-self-guard.test.cjs`, `password-recovery.test.cjs`, `seo.test.cjs`, `build-emblem.test.cjs`, `https-redirect.test.cjs`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05142857142857143 - nodes in this community are weakly interconnected._