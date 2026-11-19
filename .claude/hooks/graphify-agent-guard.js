#!/usr/bin/env node
// PreToolUse hook (matcher: Agent). Nudges subagents to use the graphify graph
// instead of re-exploring the repo: never blocks, only prepends a short
// graphify preamble to the subagent prompt (updatedInput).
// No-op when graphify-out/graph.json does not exist.
const fs = require("fs");
const path = require("path");

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return; // never break the session over a bad payload
  }

  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  if (!fs.existsSync(path.join(root, "graphify-out", "graph.json"))) return;

  const ti = input.tool_input || {};
  const prompt = typeof ti.prompt === "string" ? ti.prompt : "";

  const howTo = [
    "This repo has a graphify knowledge graph in graphify-out/. Prefer it as a starting point before broad Grep/Glob/Read sweeps (skip it if the task is a specific file/symbol you already know):",
    "  1. Read graphify-out/GRAPH_REPORT.md (god nodes, communities).",
    '  2. graphify query "<question>"   (add --budget N for more output)',
    '     graphify explain "<node>"  |  graphify path "<A>" "<B>"  |  graphify affected "<node>"',
    "  3. Only then Read/Grep the specific files the graph points to, to confirm details.",
  ].join("\n");

  const marker = "[graphify-preamble]";
  if (prompt.includes(marker)) return;

  out({
    hookEventName: "PreToolUse",
    permissionDecision: "allow",
    permissionDecisionReason: "graphify preamble added to subagent prompt",
    updatedInput: { ...ti, prompt: `${marker}\n${howTo}\n\n${prompt}` },
  });
});

function out(hookSpecificOutput) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput }));
}
