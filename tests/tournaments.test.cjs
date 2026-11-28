const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, crypto, Date, Request, Response, URL,
    require: (name) => name in mocks ? mocks[name] : require(name),
  });
  return exports;
}

const model = load("lib/tournaments.ts");
const ids = (items) => Array.from(items);

function opened(count, settings = {}) {
  const state = model.newTournament({
    title: "Torneio de teste", description: "", rules: "", format: "mata_mata",
    opensAt: null, closesAt: null, fightsPerActivity: 1, leagueNames: [],
    qualifiersPerLeague: 1, thirdPlace: true, firstActivityId: null, ...settings,
  });
  state.status = "inscricoes";
  state.entries = Array.from({ length: count }, (_, i) => ({ id: `membro-${i}`, nickname: `Integrante ${i}`, registered: true }));
  return { state, approved: new Set(state.entries.map((entry) => entry.id)) };
}

function complete(state, match, kind = "vitoria", winnerId = match.participantIds[0]) {
  if (!match.activityId) model.scheduleTournamentMatch(state, match.id, crypto.randomUUID());
  model.recordTournamentResult(state, match.id, { kind, winnerId: kind === "empate" ? null : winnerId, note: "" });
}

test("a inscrição exige convite, respeita o prazo e pode ser cancelada", () => {
  const { state } = opened(2);
  const member = state.entries[0];
  assert.throws(() => model.setTournamentRegistration(state, "sem-convite", true), { status: 403 });
  assert.equal(model.setTournamentRegistration(state, member.id, false), true);
  assert.equal(model.setTournamentRegistration(state, member.id, false), false);
  assert.equal(model.setTournamentRegistration(state, member.id, true), true);
  state.settings.closesAt = "2020-01-01T00:00:00Z";
  assert.throws(() => model.setTournamentRegistration(state, member.id, false), { status: 409 });
  assert.equal(member.registered, true);
});

test("só inscritos aprovados entram no sorteio, que fica bloqueado após o fechamento", () => {
  const { state, approved } = opened(5);
  const unapproved = state.entries[3].id;
  approved.delete(unapproved);
  state.entries[4].registered = false;
  model.closeTournamentRegistration(state, approved);
  const matches = state.matches.filter((match) => match.round === 1);
  const participants = new Set(matches.flatMap((match) => ids(match.participantIds)).filter(Boolean));
  assert.equal(participants.size, 3);
  assert.equal(participants.has(unapproved), false);
  assert.equal(matches.filter((match) => match.result?.kind === "vaga_livre").length, 1);
  assert.throws(() => model.closeTournamentRegistration(state, approved), { status: 409 });
});

for (const size of [2, 3, 4, 5, 8, 9, 17]) {
  test(`mata-mata com ${size} inscritos resolve fases e pódio, inclusive vagas livres`, () => {
    const { state, approved } = opened(size);
    model.closeTournamentRegistration(state, approved);
    assert.ok(state.matches.filter((match) => match.round > 1).every((match) => !model.tournamentMatchIsReady(state, match)));
    let round = 1;
    while (state.status === "em_andamento" && round <= state.matches.length) {
      const available = state.matches.filter((match) => model.tournamentMatchIsReady(state, match));
      assert.ok(available.length);
      for (const match of available) complete(state, match);
      round++;
    }
    assert.equal(state.status, "concluido");
    assert.equal(state.matches.filter((match) => match.stage === "mata_mata" && match.result.kind === "vitoria").length, size - 1);
    const podium = model.tournamentPodium(state);
    assert.equal(podium.length, size === 2 ? 2 : 3);
    assert.equal(new Set(podium).size, podium.length);
  });
}

test("distribuição de lutas obedece ao limite em cada atividade e reagendamento libera a vaga", () => {
  const { state, approved } = opened(8, { format: "ligas", leagueNames: ["Água", "Fogo"] });
  model.closeTournamentRegistration(state, approved);
  assert.equal(model.distributeTournamentMatches(state, "atividade-a"), 4);
  assert.equal(model.distributeTournamentMatches(state, "atividade-a"), 0);
  const fight = state.matches.find((match) => match.activityId);
  const overlap = state.matches.find((match) => !match.activityId && match.participantIds.some((id) => fight.participantIds.includes(id)));
  assert.throws(() => model.scheduleTournamentMatch(state, overlap.id, "atividade-a"), { status: 409 });
  model.postponeTournamentMatch(state, fight.id);
  assert.equal(fight.activityId, null);
  assert.equal(fight.postponed, true);
  model.scheduleTournamentMatch(state, fight.id, "atividade-b");
  assert.equal(fight.activityId, "atividade-b");
  assert.equal(fight.postponed, false);
  state.settings.fightsPerActivity = 2;
  assert.ok(model.distributeTournamentMatches(state, "atividade-a") > 0);
});

test("ligas equilibradas e todos contra todos sem confrontos duplicados", () => {
  const { state, approved } = opened(7, { format: "ligas", leagueNames: ["Água", "Fogo"] });
  model.closeTournamentRegistration(state, approved);
  assert.deepEqual(ids(state.leagues).map((league) => league.participantIds.length), [4, 3]);
  assert.equal(state.matches.length, 9);
  assert.equal(new Set(state.matches.map((match) => ids(match.participantIds).sort().join("/"))).size, 9);
});

test("empates em ligas pontuam, geram desempate nas vagas e liberam o mata-mata", () => {
  const { state, approved } = opened(6, { format: "ligas", leagueNames: ["Água", "Terra"] });
  model.closeTournamentRegistration(state, approved);
  for (const match of state.matches.filter((match) => match.stage === "liga")) complete(state, match, "empate");
  assert.equal(state.matches.filter((match) => match.stage === "mata_mata").length, 0);
  assert.ok(model.tournamentStandings(state, 0).every((row) => row.points === 2 && row.draws === 2));

  while (state.matches.some((match) => match.stage === "desempate" && !match.result)) {
    for (const match of state.matches.filter((item) => item.stage === "desempate" && !item.result)) complete(state, match, "wo");
  }
  assert.equal(state.matches.filter((match) => match.stage === "desempate").length, 4);
  const final = state.matches.find((match) => match.stage === "mata_mata");
  assert.ok(final && model.tournamentMatchIsReady(state, final));
  assert.equal(state.qualifiedIds.length, 2);
  model.scheduleTournamentMatch(state, final.id, "atividade-final");
  assert.throws(() => model.recordTournamentResult(state, final.id, { kind: "empate", winnerId: null, note: "" }), /vencedor/);
  complete(state, final);
  assert.equal(state.status, "concluido");
});

test("a fase final cruza ligas distintas e os resultados por W.O. valem três pontos", () => {
  const { state, approved } = opened(8, { format: "ligas", leagueNames: ["Olimpo", "Asgard"], qualifiersPerLeague: 2 });
  model.closeTournamentRegistration(state, approved);
  for (const match of state.matches.filter((item) => item.stage === "liga")) {
    const league = state.leagues[match.leagueIndex].participantIds;
    const winner = ids(match.participantIds).sort((a, b) => league.indexOf(a) - league.indexOf(b))[0];
    complete(state, match, "wo", winner);
  }
  assert.deepEqual(ids(model.tournamentStandings(state, 0)).map((entry) => entry.points), [9, 6, 3, 0]);
  const semifinal = state.matches.filter((match) => match.stage === "mata_mata" && match.round === 1);
  assert.equal(semifinal.length, 2);
  assert.ok(semifinal.every((match) => state.leagues.every((league) => match.participantIds.filter((id) => league.participantIds.includes(id)).length === 1)));
});

test("as rotas administrativas de torneio rejeitam requisições sem o papel de Atividades antes de acessar o banco", async () => {
  const guards = [];
  const route = load("app/api/admin/tournaments/route.ts", {
    "next/server": { NextResponse: Response },
    "@/lib/admin-audit": {},
    "@/lib/admin-auth": { requireAdmin: async (roles) => { guards.push(ids(roles)); return null; } },
    "@/lib/api-guard": { isSameOriginRequest: () => true },
    "@/lib/supabase/admin": { createAdminClient: () => assert.fail("Banco acessado antes da autorização") },
    "@/lib/tournament-server": {},
    "@/lib/tournaments": model,
  });
  for (const method of ["GET", "POST", "PATCH"]) {
    assert.equal((await route[method](new Request("https://dk.test/api/admin/tournaments", { method }))).status, 403);
  }
  assert.deepEqual(guards, [["atividades"], ["atividades"], ["atividades"]]);
});

test("membro suspenso é bloqueado antes de consultar qualquer inscrição", async () => {
  const route = load("app/api/member/tournaments/route.ts", {
    "next/server": { NextResponse: Response },
    "@/lib/api-guard": { isSameOriginRequest: () => true },
    "@/lib/supabase/admin": { createAdminClient: () => assert.fail("Banco acessado antes da autorização") },
    "@/lib/tournament-server": {},
    "@/lib/tournaments": model,
    "@/lib/viewer": { getMember: async () => ({ user: { id: "membro" }, profile: { status: "suspenso" } }) },
  });
  const response = await route.PATCH(new Request("https://dk.test/api/member/tournaments", { method: "PATCH" }));
  assert.equal(response.status, 403);
});

test("distribuição e primeira atividade recusam datas passadas, mas o vínculo manual as aceita", async () => {
  const server = load("lib/tournament-server.ts", {
    "next/server": { NextResponse: Response },
    "@/lib/tournaments": model,
  });
  const past = { id: crypto.randomUUID(), status: "confirmado", starts_at: "2020-01-01T00:00:00Z" };
  const admin = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: past, error: null }) }) }) }) };
  const { state, approved } = opened(4);
  const settings = { ...state.settings, firstActivityId: past.id };

  await assert.rejects(server.createTournament(admin, "adm", settings), { status: 409 });
  await assert.rejects(server.applyTournamentAction(admin, state, { action: "settings", settings }), { status: 409 });
  state.settings.firstActivityId = past.id;
  await server.applyTournamentAction(admin, state, { action: "settings", settings });

  model.closeTournamentRegistration(state, approved);
  await assert.rejects(server.applyTournamentAction(admin, state, { action: "distribute", activityId: past.id }), { status: 409 });
  const fight = state.matches.find((match) => model.tournamentMatchIsReady(state, match));
  await server.applyTournamentAction(admin, state, { action: "schedule", matchId: fight.id, activityId: past.id });
  assert.equal(fight.activityId, past.id);
});

test("o resumo do formulário bate com o que o sorteio realmente faz", () => {
  const leagues = (count) => ["Água", "Terra", "Fogo", "Ar"].slice(0, count);
  const cases = [
    { names: leagues(2), qualifiers: 1, third: "sem_vaga", extra: false, podium: 2 },
    { names: leagues(3), qualifiers: 1, third: "semifinal", extra: false, podium: 3 },
    { names: leagues(2), qualifiers: 2, third: "luta_extra", extra: true, podium: 3 },
    { names: leagues(4), qualifiers: 3, third: "luta_extra", extra: true, podium: 3 },
    { names: leagues(2), qualifiers: 2, thirdPlace: false, third: "nao_premiado", extra: false, podium: 2 },
  ];
  for (const item of cases) {
    const settings = { format: "ligas", leagueNames: item.names, qualifiersPerLeague: item.qualifiers, thirdPlace: item.thirdPlace ?? true };
    const outlook = model.tournamentDrawOutlook(settings);
    assert.equal(outlook.thirdPlace, item.third);
    assert.equal(outlook.finalists, item.names.length * item.qualifiers);

    const short = opened(outlook.minimumEntries - 1, settings);
    assert.throws(() => model.closeTournamentRegistration(short.state, short.approved), /insuficiente|pelo menos dois/);

    const { state, approved } = opened(outlook.minimumEntries, settings);
    model.closeTournamentRegistration(state, approved);
    for (let step = 0; state.status !== "concluido" && step < 500; step++) {
      complete(state, state.matches.find((match) => model.tournamentMatchIsReady(state, match)));
    }
    assert.equal(state.status, "concluido");
    assert.equal(state.qualifiedIds.length, outlook.finalists);
    assert.equal(state.matches.some((match) => match.stage === "terceiro_lugar"), item.extra);
    assert.equal(model.tournamentPodium(state).length, item.podium);
  }

  const knockout = { format: "mata_mata", leagueNames: [], qualifiersPerLeague: 1, thirdPlace: true };
  const outlook = model.tournamentDrawOutlook(knockout);
  assert.deepEqual([outlook.minimumEntries, outlook.finalists, outlook.thirdPlace], [2, null, "depende"]);
  for (const [count, extra] of [[3, false], [4, true]]) {
    const { state, approved } = opened(count, knockout);
    model.closeTournamentRegistration(state, approved);
    assert.equal(state.matches.some((match) => match.stage === "terceiro_lugar"), extra);
  }
});
