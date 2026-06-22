import { WafDetector, WafFinding } from "../../core/types";

type CommandPattern = {
  id: string;
  regex: RegExp;
  message: string;
  severity: number;
};

const COMMAND_PATTERNS: CommandPattern[] = [
  {
    id: "shell-metachar",
    regex: /(;|\|\||&&|`)/,
    message: "Caractères de shell potentiellement dangereux détectés",
    severity: 6,
  },
  {
    id: "subshell",
    regex: /\$\([^)]{1,80}\)/,
    message: "Subshell shell $(...) détecté",
    severity: 7,
  },
  {
    id: "unix-binaries",
    regex: /\b(cat|ls|id|whoami|uname|wget|curl)\b/i,
    message: "Binaire Unix potentiellement dangereux détecté",
    severity: 6,
  },
  {
    id: "windows-binaries",
    regex: /\b(cmd\.exe|powershell|powershell\.exe)\b/i,
    message: "Binaire Windows potentiellement dangereux détecté",
    severity: 7,
  },
  {
    id: "dangerous-rm",
    regex: /\brm\s+-rf\s+\/\b/i,
    message: "Commande rm -rf / détectée",
    severity: 9,
  },
];

function collectSources(ctx: any): string[] {
  const sources: string[] = [];

  const req = ctx.request || {};

  if (req.url) {
    sources.push(String(req.url));
  }

  if (req.query) {
    try {
      sources.push(JSON.stringify(req.query));
    } catch {
      // ignore
    }
  }

  if (req.body) {
    try {
      sources.push(
        typeof req.body === "string" ? req.body : JSON.stringify(req.body),
      );
    } catch {
      // ignore
    }
  }

  if (req.headers) {
    for (const value of Object.values(req.headers)) {
      if (value != null) {
        sources.push(String(value));
      }
    }
  }

  return sources;
}

export const commandInjectionDetector: WafDetector = {
  name: "command-detector",

  async run(ctx): Promise<WafFinding[]> {
    const findings: WafFinding[] = [];
    const sources = collectSources(ctx);

    if (!sources.length) {
      return findings;
    }

    for (const pattern of COMMAND_PATTERNS) {
      let matched = false;

      for (const source of sources) {
        if (pattern.regex.test(source)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        findings.push({
          detector: "command-detector",
          severity: pattern.severity,
          message: pattern.message,
          meta: {
            patternId: pattern.id,
          },
        });
      }
    }

    return findings;
  },
};
