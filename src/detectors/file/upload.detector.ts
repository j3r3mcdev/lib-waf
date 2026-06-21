import { WafDetector } from "../../core/types";

const DANGEROUS_EXT = [
  ".php",
  ".jsp",
  ".asp",
  ".exe",
  ".sh",
  ".bat",
  ".cmd",
  ".py",
];

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadDetector: WafDetector = {
  name: "upload-detector",

  async run(ctx) {
    const req = ctx.request;

    if (!req.files || req.files.length === 0) return [];

    const findings = [];

    for (const file of req.files) {
      const { originalname, size } = file;

      if (size > MAX_UPLOAD_SIZE) {
        findings.push({
          detector: "upload-detector",
          severity: 5,
          message: `Fichier trop volumineux (${size} bytes)`,
          meta: { file: originalname, size },
        });
      }

      const lower = originalname.toLowerCase();
      if (DANGEROUS_EXT.some((ext) => lower.endsWith(ext))) {
        findings.push({
          detector: "upload-detector",
          severity: 5,
          message: `Extension dangereuse détectée : ${originalname}`,
          meta: { file: originalname },
        });
      }
    }

    return findings;
  },
};
