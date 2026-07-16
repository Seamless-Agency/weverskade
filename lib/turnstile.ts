const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 10_000;

// Foutcodes die op onze eigen configuratie of op Cloudflare wijzen in plaats van
// op de bezoeker. Die mogen een echte aanvraag niet kosten, dus laten we door.
const INFRASTRUCTURE_ERRORS = new Set([
  "missing-input-secret",
  "invalid-input-secret",
  "bad-request",
  "internal-error",
]);

type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export type TurnstileVerdict =
  | { allowed: true; reason: "verified" | "skipped" | "unavailable" }
  | { allowed: false; reason: "missing-token" | "rejected"; errorCodes: string[] };

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || undefined;
}

/**
 * Controleert een Turnstile-token bij Cloudflare.
 *
 * Bewust fail-open: is Cloudflare onbereikbaar of onze eigen sleutel verkeerd,
 * dan laten we de inzending door en loggen we het. Een storing buiten de
 * bezoeker om mag geen echte aanvraag blokkeren. Alleen een token dat Cloudflare
 * actief afkeurt (of dat helemaal ontbreekt) leidt tot een weigering.
 */
export async function verifyTurnstile(
  token: string,
  remoteIp: string | undefined
): Promise<TurnstileVerdict> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { allowed: true, reason: "skipped" };
  }

  if (!token) {
    return { allowed: false, reason: "missing-token", errorCodes: [] };
  }

  const body = new URLSearchParams({ secret, response: token });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  let response: Response;

  try {
    response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Turnstile siteverify onbereikbaar — inzending doorgelaten", error);
    return { allowed: true, reason: "unavailable" };
  }

  if (!response.ok) {
    console.error(
      `Turnstile siteverify gaf HTTP ${response.status} — inzending doorgelaten`
    );
    return { allowed: true, reason: "unavailable" };
  }

  const result = (await response
    .json()
    .catch(() => null)) as SiteverifyResponse | null;

  if (!result) {
    console.error(
      "Turnstile siteverify gaf een onleesbaar antwoord — inzending doorgelaten"
    );
    return { allowed: true, reason: "unavailable" };
  }

  if (result.success) {
    return { allowed: true, reason: "verified" };
  }

  const errorCodes = result["error-codes"] ?? [];

  if (errorCodes.some((code) => INFRASTRUCTURE_ERRORS.has(code))) {
    console.error(
      `Turnstile verkeerd geconfigureerd (${errorCodes.join(", ")}) — inzending doorgelaten`
    );
    return { allowed: true, reason: "unavailable" };
  }

  return { allowed: false, reason: "rejected", errorCodes };
}
