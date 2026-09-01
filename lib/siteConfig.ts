/**
 * Centrale plek voor de canonieke hosts.
 *
 * BESLUIT (Robin, 01-09): de wonen-bij omgeving krijgt het subdomein
 * wonenbij.weverskade.com als leidende URL. De middleware rewrite't dat
 * subdomein naar de /wonenbij-routes; canonicals en sitemap wijzen naar de
 * subdomein-vorm zodat Google één host indexeert.
 */
export const SITE_URL = "https://www.weverskade.com";
export const WONENBIJ_URL = "https://wonenbij.weverskade.com";

/**
 * Canonieke absolute URL voor een wonen-bij pad ("" of "/taanschuurkade").
 * Let op: op het subdomein bestaat het pad zónder /wonenbij-prefix.
 */
export function wonenbijUrl(pad = ""): string {
  return `${WONENBIJ_URL}${pad}`;
}
