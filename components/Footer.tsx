"use client";

import { useRef, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePageNavigation } from "@/hooks/usePageNavigation";

const navCol1 = [
  { label: "Home", href: "/" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Portefeuille", href: "/portefeuille" },
  { label: "Nieuws", href: "/nieuws" },
  { label: "Maatschappelijk", href: "/maatschappelijk" },
];

const navCol2 = [
  { label: "Werken bij", href: "/werken-bij" },
  { label: "Wonen bij", href: "/wonen-bij" },
  { label: "Contact", href: "/contact" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/weverskade" },
];

interface FooterData {
  companyName?: string;
  address?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  links?: { label: string; url: string }[];
}

const LINKEDIN_URL = "https://www.linkedin.com/company/weverskade";

function mapsHref(address: string, postalCode: string, country: string) {
  const query = [address, postalCode, country].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function Footer({
  bg = "bg-blue",
  data,
  mobielTot = "md",
}: {
  bg?: string;
  data?: FooterData;
  /**
   * Breakpoint waaronder de mobiele footer toont. De hoofdsite wisselt op
   * max-md; de wonen-bij omgeving zit op max-lg en geeft "lg" mee, anders
   * krijgen tablets (768-1023) daar de desktop-footer als microtekst in een
   * schermhoge band.
   */
  mobielTot?: "md" | "lg";
} = {}) {
  const totLg = mobielTot === "lg";
  const pathname = usePathname();
  const navigate = usePageNavigation();
  const dotRef = useRef<HTMLSpanElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  const positionDotAt = useCallback(
    (link: HTMLElement, animate: boolean) => {
      const dot = dotRef.current;
      const container = navContainerRef.current;
      if (!dot || !container) return;

      const containerRect = container.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const parsedLineHeight = parseFloat(getComputedStyle(link).lineHeight);
      const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : linkRect.height;
      const x = linkRect.left - containerRect.left;
      const y = linkRect.top - containerRect.top + lineHeight / 2;

      dot.style.transition = animate
        ? "transform 0.45s cubic-bezier(0.4, 0, 0, 1), opacity 0.2s ease"
        : "none";
      dot.style.transform = `translate(calc(${x}px - 0.972vw - 50%), calc(${y}px - 50%))`;
      dot.style.opacity = "1";
    },
    []
  );

  // Position dot at active link on mount and when pathname changes
  useEffect(() => {
    if (activeLinkRef.current) {
      positionDotAt(activeLinkRef.current, false);
    }
  }, [pathname, positionDotAt]);

  const moveDot = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      positionDotAt(e.currentTarget, true);
    },
    [positionDotAt]
  );

  const returnToActive = useCallback(() => {
    if (activeLinkRef.current) {
      positionDotAt(activeLinkRef.current, true);
    }
  }, [positionDotAt]);

  return (
    <footer
      className={`${bg} h-dvh flex flex-col justify-between pt-[4.028vw] pb-[3.333vw] pl-[2.639vw] pr-[2.431vw] ${
        totLg
          ? "max-lg:h-auto max-lg:pt-5 max-lg:pb-5 max-lg:px-5"
          : "max-md:h-auto max-md:pt-5 max-md:pb-5 max-md:px-5"
      }`}
    >
      {/* Desktop top content columns */}
      <div className={`flex ${totLg ? "max-lg:hidden" : "max-md:hidden"}`}>
        {/* Copyright column */}
        <div className="shrink-0 w-[31.944vw]">
          <p className="font-body font-medium text-[1.111vw] leading-[1.25vw] text-off-white">
            © {new Date().getFullYear()} | {data?.companyName ?? "Weverskade B.V."} |{" "}
            <a
              href="/privacybeleid"
              className="link-underline text-off-white pb-[0.208vw]"
              style={{ "--underline-h": "0.069vw" } as React.CSSProperties}
            >
              Privacy &amp; Disclaimer
            </a>
          </p>
        </div>

        {/* Nav columns with animated dot */}
        <div
          ref={navContainerRef}
          className="flex relative"
          onMouseLeave={returnToActive}
        >
          {/* Animated dot */}
          <span
            ref={dotRef}
            className="absolute w-[0.486vw] h-[0.486vw] rounded-full bg-off-white pointer-events-none"
            style={{ opacity: 0 }}
          />

          {/* Nav column 1 */}
          <div className="shrink-0 w-[16.389vw]">
            <nav className="font-body font-medium text-[1.181vw] leading-[1.458vw] text-off-white">
              {navCol1.map((item) => (
                <p key={item.label}>
                  <a
                    ref={pathname === item.href ? activeLinkRef : undefined}
                    href={item.href}
                    onClick={(e) => navigate(e, item.href)}
                    className="text-off-white no-underline hover:opacity-70 transition-opacity duration-200"
                    onMouseEnter={moveDot}
                  >
                    {item.label}
                  </a>
                </p>
              ))}
            </nav>
          </div>

          {/* Nav column 2 */}
          <div className="shrink-0 w-[16.389vw]">
            <nav className="font-body font-medium text-[1.181vw] leading-[1.458vw] text-off-white">
              {navCol2.map((item) => (
                <p key={item.label}>
                  <a
                    ref={pathname === item.href ? activeLinkRef : undefined}
                    href={item.href}
                    onClick={(e) => navigate(e, item.href)}
                    className="text-off-white no-underline hover:opacity-70 transition-opacity duration-200"
                    onMouseEnter={moveDot}
                  >
                    {item.label}
                  </a>
                </p>
              ))}
            </nav>
          </div>

          {/* Address column */}
          <div>
            <div className="font-body font-medium text-[1.181vw] leading-[1.458vw] text-off-white">
              {(() => {
                const address = data?.address ?? "Cornelis van der Lelylaan 4";
                const postalCode = data?.postalCode ?? "3147 PB Maassluis";
                const country = data?.country ?? "Netherlands";
                const phone = data?.phone ?? "+31(0)10 599 6300";
                const email = data?.email ?? "info@weverskade.com";
                return (
                  <>
                    <a
                      href={mapsHref(address, postalCode, country)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={moveDot}
                      className="block text-off-white no-underline hover:opacity-70 transition-opacity duration-200"
                    >
                      <p>{address}</p>
                      <p>{postalCode}</p>
                      <p>{country}</p>
                    </a>
                    <p>
                      <a
                        href={telHref(phone)}
                        onMouseEnter={moveDot}
                        className="text-off-white no-underline hover:opacity-70 transition-opacity duration-200"
                      >
                        {phone}
                      </a>
                    </p>
                    <p>
                      <a
                        href={`mailto:${email}`}
                        onMouseEnter={moveDot}
                        className="text-off-white no-underline hover:opacity-70 transition-opacity duration-200"
                      >
                        {email}
                      </a>
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile top content */}
      <div className={`hidden ${totLg ? "max-lg:block" : "max-md:block"}`}>
        {/* Copyright */}
        <p className="font-body font-medium text-[13px] leading-[18px] text-off-white">
          © {new Date().getFullYear()} | {data?.companyName ?? "Weverskade B.V."} |{" "}
          <a
            href="/privacybeleid"
            className="link-underline text-off-white pb-0.5"
            style={{ "--underline-h": "1px" } as React.CSSProperties}
          >
            Privacy &amp; Disclaimer
          </a>
        </p>

        {/* Two-column headings */}
        <div className="flex mt-16">
          <div className="flex-1">
            <p className="font-heading font-normal text-[17px] leading-normal text-off-white">
              Bezoek ons
            </p>
          </div>
          <div className="flex-1">
            <p className="font-heading font-normal text-[17px] leading-normal text-off-white">
              Neem contact op
            </p>
          </div>
        </div>

        {/* Two-column contact info */}
        <div className="flex mt-6">
          {(() => {
            const address = data?.address ?? "Cornelis van der Lelylaan 4";
            const postalCode = data?.postalCode ?? "3147 PB Maassluis";
            const country = data?.country ?? "Netherlands";
            const phone = data?.phone ?? "+31 (0)10 599 6300";
            const email = data?.email ?? "info@weverskade.com";
            return (
              <>
                <div className="flex-1 font-body font-medium text-[13px] leading-[20px] text-off-white">
                  <a
                    href={mapsHref(address, postalCode, country)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-off-white no-underline hover:opacity-70 transition-opacity duration-200"
                  >
                    <p>{address}</p>
                    <p>{postalCode}</p>
                    <p>{country}</p>
                  </a>
                </div>
                <div className="flex-1 font-body font-medium text-[13px] leading-[20px] text-off-white">
                  <p>
                    <a
                      href={telHref(phone)}
                      className="text-off-white no-underline hover:opacity-70 transition-opacity duration-200"
                    >
                      {phone}
                    </a>
                  </p>
                  <p>
                    <a
                      href={`mailto:${email}`}
                      className="text-off-white no-underline hover:opacity-70 transition-opacity duration-200"
                    >
                      {email}
                    </a>
                  </p>
                  <p>
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-off-white no-underline hover:opacity-70 transition-opacity duration-200"
                    >
                      Onze LinkedIn pagina
                    </a>
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Large wordmark */}
      <svg
        viewBox="0 0 340 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-[95.139vw] h-auto text-off-white ${
          totLg ? "max-lg:w-full max-lg:mt-16" : "max-md:w-full max-md:mt-16"
        }`}
      >
        <g transform="translate(0,0)">
          <path
            d="M53.8613 0L46.56 25.6671L44.3119 33.7945L41.8162 25.6671L34.0763 0H27.0244L19.2844 25.6671L16.7888 33.7945L14.5425 25.6671L7.23939 0H0L13.2319 43.0839H20.2219L27.8362 18.1493L30.5813 9.22704L33.2662 18.2117L40.8806 43.0839H47.8706L61.1025 0H53.8613Z"
            fill="currentColor"
          />
        </g>
        <g transform="translate(58.272,10.696)">
          <path
            d="M15.9168 5.19367C10.6743 5.19367 7.11561 8.43213 6.55495 13.7488H25.1531C24.9037 8.43213 21.3468 5.19367 15.9168 5.19367ZM0 16.4989C0 6.72111 6.49124 0 15.8531 0C25.215 0 31.7681 6.11156 31.7681 15.2174V15.401C31.7681 16.5631 31.6425 17.7839 31.5187 18.7018H6.55495C6.92994 24.5068 10.6743 27.9913 16.4156 27.9913C20.6606 27.9913 23.5312 26.0967 24.6543 22.7958H31.2693C29.7093 29.2727 24.1537 33.3061 16.29 33.3061C6.36563 33.3061 0 26.7062 0 16.5007"
            fill="currentColor"
          />
        </g>
        <g transform="translate(90.726,11.612)">
          <path
            d="M0 0H7.17931L13.17 15.6434L16.4156 24.1985L19.7231 15.6434L25.6519 0H32.8294L19.7231 31.4703H13.17L0 0Z"
            fill="currentColor"
          />
        </g>
        <g transform="translate(123.583,10.692)">
          <path
            d="M15.915 5.19741C10.6725 5.19741 7.11379 8.43588 6.55314 13.7525H25.1513C24.9019 8.43588 21.345 5.19741 15.915 5.19741ZM7.085e-06 16.5026C7.085e-06 6.72486 6.49125 0.00374886 15.8531 0.00374886C25.215 0.00374886 31.7681 6.11531 31.7681 15.2212V15.4047C31.7681 16.5668 31.6425 17.7877 31.5187 18.7056H6.55496C6.92994 24.5106 10.6743 27.995 16.4156 27.995C20.6606 27.995 23.5312 26.1004 24.6543 22.7996H31.2694C29.7094 29.2765 24.1538 33.3099 16.29 33.3099C6.36565 33.3099 7.085e-06 26.71 7.085e-06 16.5044"
            fill="currentColor"
          />
          <path
            d="M36.0659 0.919675H42.244V5.80856C43.5546 2.26532 46.8622 0.308341 50.6065 0.308341H52.1666V6.60348H50.8559C45.1765 6.60348 42.4297 10.0861 42.4297 15.4634V32.3918H36.0641V0.919675H36.0659Z"
            fill="currentColor"
          />
          <path
            d="M53.8813 22.2469H60.3725C60.7475 25.9131 63.8675 28.1125 68.4238 28.1125C72.4813 28.1125 75.1025 26.2802 75.1025 23.5283C75.1025 21.206 73.8538 20.1063 70.8594 19.6179L63.3706 18.3953C57.6912 17.4792 54.8825 14.5455 54.8825 9.77778C54.8825 3.91218 60.125 3.7392e-07 67.9887 3.7392e-07C75.8525 3.7392e-07 81.1569 4.03338 81.4081 10.4497H74.8549C74.5418 7.02767 71.8587 5.07247 67.6774 5.07247C63.8693 5.07247 61.3737 6.84409 61.3737 9.41062C61.3737 11.5494 62.6843 12.5885 65.8043 13.0768L73.2931 14.2995C78.785 15.155 81.5937 18.2723 81.5937 23.0988C81.5937 29.271 76.2275 33.3043 68.1125 33.3043C59.9975 33.3043 54.0706 28.9038 53.8831 22.2433"
            fill="currentColor"
          />
        </g>
        <g transform="translate(209.955,0)">
          <path
            d="M0 0V43.0839H6.36563V33.1831L11.4844 28.3548L21.9075 43.0839H29.2725L15.7894 24.0773L28.5844 11.6118H20.4712L6.36563 25.4835V0H0Z"
            fill="currentColor"
          />
        </g>
        <g transform="translate(239.477,0)">
          <path
            d="M21.2831 31.8999V27.0734C20.7225 27.6847 18.8493 28.2336 16.7269 28.6008L11.7338 29.5169C8.17504 30.1888 6.55313 31.6557 6.55313 34.2828C6.55313 37.2165 9.1744 38.744 12.6694 38.744C17.5369 38.744 21.2831 35.9332 21.2831 31.8999ZM0 34.527C0 28.722 4.18128 25.9113 9.54938 24.9934L17.4131 23.5872C19.9088 23.0988 21.2831 22.3645 21.2831 20.2257C21.2831 17.6592 19.0987 15.9482 14.9175 15.9482C11.1112 15.9482 7.80187 17.538 7.49059 21.2042H0.937466C1.31245 14.7879 7.30309 10.6939 14.8556 10.6939C23.7806 10.6939 27.6506 15.0944 27.6506 20.4717V35.6267C27.6506 37.5213 28.6499 38.072 29.8349 38.072C30.3956 38.072 31.0218 37.949 31.5206 37.8278V42.9003C30.5212 43.3281 29.0868 43.6952 27.2756 43.6952C24.5306 43.6952 22.2825 42.4726 21.5343 39.8454C19.9124 41.617 16.7906 44 11.2987 44C4.74557 44 0.00182209 40.4568 0.00182209 34.5288"
            fill="currentColor"
          />
          <path
            d="M59.193 27.3158C59.193 20.4717 55.0736 16.4383 49.5817 16.4383C43.5273 16.4383 39.9686 20.5323 39.9686 27.3158C39.9686 34.0992 43.5255 38.2538 49.5817 38.2538C55.1355 38.2538 59.193 34.1598 59.193 27.3158ZM33.4173 27.3158C33.4173 17.538 39.1586 10.6939 48.6461 10.6939C52.3286 10.6939 56.6973 12.3443 58.8198 15.7058V0H65.2492V43.0821H59.0073V38.744C56.8848 42.166 52.578 44 48.5223 44C39.4098 44 33.4192 37.0935 33.4192 27.3175"
            fill="currentColor"
          />
          <path
            d="M84.6719 15.8893C79.4294 15.8893 75.8707 19.1278 75.31 24.4444H93.9082C93.6588 19.1278 90.1019 15.8893 84.6719 15.8893ZM68.7551 27.1946C68.7551 17.4168 75.2463 10.6957 84.6082 10.6957C93.9701 10.6957 100.523 16.8072 100.523 25.9131V26.0967C100.523 27.2587 100.399 28.4796 100.274 29.3975H75.3082C75.6832 35.2025 79.4276 38.6869 85.1688 38.6869C89.412 38.6869 92.2844 36.7923 93.4076 33.4915H100.023C98.4626 39.9684 92.907 44.0018 85.0432 44.0018C75.1207 44.0018 68.7533 37.4019 68.7533 27.1963"
            fill="currentColor"
          />
        </g>
      </svg>
    </footer>
  );
}
