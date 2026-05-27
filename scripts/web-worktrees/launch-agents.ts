import { Agent, CursorAgentError } from "@cursor/sdk";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type AgentSpec = {
  id: string;
  branch: string;
  worktreePath: string;
  port: number;
};

type RunSummary = {
  id: string;
  branch: string;
  status: string;
  commitSha: string;
  error?: string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..", "..");
const contract = readFileSync(join(scriptDir, "AGENT_CONTRACT.md"), "utf8").trim();
const apiKey = process.env.CURSOR_API_KEY?.trim();

if (!apiKey) {
  throw new Error("CURSOR_API_KEY is required to launch SDK agents.");
}

const specs: AgentSpec[] = [
  { id: "styling", branch: "web/styling", worktreePath: resolve(repoRoot, "..", "qtangl-web-styling"), port: 3001 },
  { id: "components", branch: "web/components", worktreePath: resolve(repoRoot, "..", "qtangl-web-components"), port: 3002 },
  { id: "design", branch: "web/design", worktreePath: resolve(repoRoot, "..", "qtangl-web-design"), port: 3003 },
  { id: "ux-structure", branch: "web/ux-structure", worktreePath: resolve(repoRoot, "..", "qtangl-web-ux-structure"), port: 3004 },
  { id: "interactions", branch: "web/interactions", worktreePath: resolve(repoRoot, "..", "qtangl-web-interactions"), port: 3005 },
  { id: "copy", branch: "web/copy", worktreePath: resolve(repoRoot, "..", "qtangl-web-copy"), port: 3006 },
];

function git(args: string[], cwd: string): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function buildPrompt(spec: AgentSpec): string {
  const mission = readFileSync(join(scriptDir, "prompts", `${spec.id}.md`), "utf8").trim();

  return [
    contract,
    "",
    "---",
    "",
    mission,
    "",
    "## Working instructions",
    "",
    `- You are running in the worktree for branch \`${spec.branch}\`.`,
    `- The web dev server port reserved for this worktree is ${spec.port}.`,
    "- When you finish your code changes, run `npm run lint` and `npm run build` from `web/`.",
    `- Commit your work on this branch with a message in the form \`web(${spec.id}): <summary>\`.`,
    "- Do not merge into `main`.",
  ].join("\n");
}

async function runAgent(spec: AgentSpec): Promise<RunSummary> {
  const prompt = buildPrompt(spec);

  try {
    console.log(`Launching ${spec.id} in ${spec.worktreePath}`);
    const result = await Agent.prompt(prompt, {
      apiKey,
      model: { id: "composer-2.5" },
      local: { cwd: spec.worktreePath },
    });

    const commitSha = git(["rev-parse", "HEAD"], spec.worktreePath);
    return {
      id: spec.id,
      branch: spec.branch,
      status: result.status,
      commitSha,
    };
  }
  catch (error) {
    if (error instanceof CursorAgentError) {
      return {
        id: spec.id,
        branch: spec.branch,
        status: "startup_error",
        commitSha: "n/a",
        error: `${error.message} (retryable=${String(error.isRetryable)})`,
      };
    }

    return {
      id: spec.id,
      branch: spec.branch,
      status: "error",
      commitSha: "n/a",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const results = await Promise.all(specs.map(runAgent));

console.log("");
console.table(results);

const failures = results.filter((result) => result.status !== "finished");
if (failures.length > 0) {
  process.exitCode = 2;
}
