export const GITHUB_REPO = "afaqulislam/tasksnap-ai";

export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

export const ALLOWED_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export const MAX_IMAGE_MB = MAX_IMAGE_BYTES / (1024 * 1024);

export const MAX_IMAGE_DIMENSION = 1024;