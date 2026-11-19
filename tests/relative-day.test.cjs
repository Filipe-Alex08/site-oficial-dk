const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const moduleExports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/relative-day.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: moduleExports, Intl, Date, Math, Number });
const { calendarDaysBetween, relativeDayLabel } = moduleExports;

// 2026-11-18 22:00 em São Paulo (UTC-3) já é 19/11 em UTC: o dia certo é o de São Paulo.
const now = new Date("2026-11-19T01:00:00Z");

test("conta dias de calendário em São Paulo, não em horas", () => {
  assert.equal(calendarDaysBetween("2026-11-19T02:00:00Z", now), 0); // 23:00 de 18/11, ainda hoje
  assert.equal(calendarDaysBetween("2026-11-19T04:00:00Z", now), 1); // 01:00 de 19/11
  assert.equal(calendarDaysBetween("2026-11-21T15:00:00Z", now), 3);
});

test("rótulos em português", () => {
  assert.equal(relativeDayLabel("2026-11-19T02:00:00Z", now), "hoje");
  assert.equal(relativeDayLabel("2026-11-19T15:00:00Z", now), "amanhã");
  assert.equal(relativeDayLabel("2026-11-21T15:00:00Z", now), "em 3 dias");
});
