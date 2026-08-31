/**
 * Centrale plek voor de canonieke host. Als de wonen-bij omgeving ooit een
 * eigen leidende host krijgt (wonenbij.weverskade.com als apart project),
 * hoeft alleen dit bestand te wijzigen.
 */
export const SITE_URL = "https://www.weverskade.com";

/** Canonieke absolute URL voor een wonen-bij pad ("" of "/taanschuurkade"). */
export function wonenbijUrl(pad = ""): string {
  return `${SITE_URL}/wonenbij${pad}`;
}
