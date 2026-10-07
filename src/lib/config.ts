export const GITHUB_REPO = "afaqulislam/tasksnap-ai";

export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

// Deployed site (used for metadata/OG URLs).
export const SITE_URL = "https://tasksnapai-aui.vercel.app";

// Social profiles.
export const LINKEDIN_URL = "https://www.linkedin.com/in/afaqulislam";
export const X_HANDLE = "afaqulislam708";
export const X_URL = `https://x.com/${X_HANDLE}`;

export const ALLOWED_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export const MAX_IMAGE_MB = MAX_IMAGE_BYTES / (1024 * 1024);

export const MAX_IMAGE_DIMENSION = 1024;

export const MAX_TEXT_LENGTH = 8000;

// 8 MB image → ~11 MB of base64, plus the JSON envelope and OCR text.
export const MAX_REQUEST_BYTES = 12 * 1024 * 1024;

// Rate limit: analyses allowed per client IP within a rolling window.
export const RATE_LIMIT_MAX_REQUESTS = 10;

export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
