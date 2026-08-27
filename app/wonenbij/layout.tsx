import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wonen bij Weverskade",
};

/**
 * Layout van de wonen-bij omgeving. De hoofdnavigatie van weverskade.com
 * wordt hier verborgen: de Navbar rendert zichzelf al niet op /wonenbij-paden,
 * maar deze CSS voorkomt ook de flits vóór hydration in de statisch
 * gegenereerde HTML.
 */
export default function WonenBijLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        href="wonenbij-nav-hide"
        precedence="high"
        dangerouslySetInnerHTML={{
          __html: "nav[data-main-nav]{display:none !important}",
        }}
      />
      {children}
    </>
  );
}
