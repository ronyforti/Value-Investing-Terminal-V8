/**
 * Utility functions for Gemini and external API key sanitization, masking, and validation.
 */

/**
 * Sanitizes an API key string:
 * - Strips leading/trailing whitespace, newlines, and carriage returns (CRLF)
 * - Repeatedly strips matching or unescaped outer quotes (double, single, escaped)
 * - Strips accidental 'Bearer ' prefix
 */
export function sanitizeApiKey(rawKey?: string | null): string {
  if (!rawKey || typeof rawKey !== "string") return "";
  // Strip non-printable ASCII control codes and invisible Unicode characters (zero-width spaces, BOM, joiners)
  let key = rawKey.replace(/[\x00-\x1F\x7F\u200B-\u200D\uFEFF]/g, "").trim();
  // Strip outer quotes repeatedly
  while ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  // Strip stray leading/trailing quotes or backslashes
  key = key.replace(/^["'\\]+/, '').replace(/["'\\]+$/, '').trim();
  // Strip 'Bearer ' if inadvertently copied
  if (key.startsWith("Bearer ")) {
    key = key.slice(7).trim();
  }
  // Strict regex extraction for standard Google Cloud API keys (AIza...)
  const aizaMatch = key.match(/AIza[a-zA-Z0-9_\-]{35}/);
  if (aizaMatch) return aizaMatch[0];
  return key;
}

/**
 * Masks an API key for safe terminal telemetry and UI display (e.g., "AIzaSy...ABCD (39 chars)").
 * Never outputs the complete secret key.
 */
export function maskApiKey(key?: string | null): string {
  const clean = sanitizeApiKey(key);
  if (!clean) return "EMPTY/MISSING";
  if (clean.length <= 8) return `[${clean.length} chars]`;
  return `${clean.slice(0, 6)}...${clean.slice(-4)} (${clean.length} chars)`;
}
