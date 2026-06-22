import { WafDetector } from "../../core/types";

const DEFAULT_ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "application/pdf",
  "text/plain",
];

export const mimeDetector: WafDetector = {
  name: "mime-detector",

  async run(ctx) {
    const req = ctx.request;

    const rawContentType = req.headers?.["content-type"];
    if (!rawContentType) return [];

    const contentType = Array.isArray(rawContentType)
      ? rawContentType[0]
      : rawContentType;

    const mime = contentType.split(";")[0].trim();

    if (!DEFAULT_ALLOWED_MIME.includes(mime)) {
      return [
        {
          detector: "mime-detector",
          severity: 4,
          message: `MIME type interdit : ${mime}`,
          meta: { mime, allowed: DEFAULT_ALLOWED_MIME },
        },
      ];
    }

    return [];
  },
};
