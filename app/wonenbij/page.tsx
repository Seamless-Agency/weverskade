import WonenBijLanding from "@/components/wonenbij/WonenBijLanding";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  WONENBIJ_LANDING_PROJECTS_QUERY,
  FOOTER_QUERY,
} from "@/sanity/lib/queries";
import { sanityImageUrl } from "@/sanity/lib/helpers";
import { wonenbijNaam } from "@/lib/wonenbijData";
import {
  demoAanbod,
  demoLandingProjecten,
  type AanbodKaart,
  type LandingProjectKaart,
} from "@/data/wonenbij";

export const metadata = {
  title: "Wonen bij Weverskade",
  description:
    "Van stedelijke appartementen tot woonconcepten met extra service: kwaliteit, gebruiksgemak en een prettige leefomgeving staan centraal binnen de projecten van Weverskade.",
};

export default async function WonenBijHome() {
  const [projectsData, footerData] = await Promise.all([
    sanityFetch<any[]>({
      query: WONENBIJ_LANDING_PROJECTS_QUERY,
      tags: ["project"],
    }),
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
  ]);

  let projecten: LandingProjectKaart[] = demoLandingProjecten;
  let aanbod: AanbodKaart[] = demoAanbod();

  if (projectsData?.length) {
    projecten = projectsData.map((p: any) => ({
      slug: p.slug ?? "",
      // CMS-namen zijn "Naam - Plaats"; de kaart toont de plaats al apart.
      naam: wonenbijNaam(p.name ?? "", p.location),
      plaats: p.location ?? "",
      image: sanityImageUrl(p.portfolioImage, "/images/wonenbij/vogelvlucht.jpg"),
      // Transitie: showInWonen telt mee zolang wonenBijEnabled nog niet
      // door de redactie wordt gebruikt (zie WONENBIJ_PROJECT_BY_SLUG_QUERY).
      heeftWonenBijPagina: Boolean(p.wonenBijEnabled || p.showInWonen),
    }));

    const sanityAanbod: AanbodKaart[] = projectsData.flatMap((p: any) =>
      (p.woningTypes ?? [])
        .filter((t: any) => t?.naam && t?.slug)
        .map((t: any) => ({
          projectSlug: p.slug ?? "",
          projectNaam: p.name ?? "",
          plaats: p.location ?? "",
          typeSlug: t.slug,
          typeNaam: t.naam,
          status: t.status ?? "inschrijven",
          prijsVan: t.prijsVan ?? 0,
          slaapkamers: t.slaapkamers ?? 0,
          oppervlakte: t.oppervlakte ?? 0,
          foto: t.foto ?? "/images/wonenbij/aanbod-card.png",
        }))
    );
    if (sanityAanbod.length) {
      aanbod = sanityAanbod;
    }
  }

  const footerProps = footerData
    ? {
        companyName: footerData.companyName,
        address: footerData.address,
        postalCode: footerData.postalCode,
        country: footerData.country,
        phone: footerData.phone,
        email: footerData.email,
        links: footerData.links,
      }
    : undefined;

  return (
    <>
      <WonenBijLanding data={{ projecten, aanbod }} />
      <FooterReveal>
        <Footer bg="bg-green" data={footerProps} />
      </FooterReveal>
    </>
  );
}
