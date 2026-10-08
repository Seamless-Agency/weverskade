"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Menu from "@/components/Menu";
import { usePageNavigation } from "@/hooks/usePageNavigation";

type NavTheme = "dark" | "light" | "green" | "blue" | "brown";

const themes: Record<NavTheme, { bg: string; text: string }> = {
  dark: { bg: "transparent", text: "#F7F5F0" },
  light: { bg: "#F7F5F0", text: "#1D1F1A" },
  green: { bg: "#848F71", text: "#F7F5F0" },
  blue: { bg: "#717F8B", text: "#F7F5F0" },
  brown: { bg: "#9A755D", text: "#1D1F1A" },
};

function detectTheme(): NavTheme {
  const sections =
    document.querySelectorAll<HTMLElement>("[data-nav-theme]");
  let current: NavTheme = "dark";
  for (const section of sections) {
    // De snapshot-kloon van een lopende page transition telt niet mee.
    if (section.closest("[data-page-snapshot]")) continue;
    if (section.getBoundingClientRect().top <= 60) {
      // Alleen bekende thema's; de wonen-bij omgeving gebruikt dezelfde
      // attributen met extra waarden (bv. "white") voor haar eigen kop.
      const theme = section.dataset.navTheme;
      if (theme && theme in themes) current = theme as NavTheme;
    }
  }
  return current;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  // De wonen-bij omgeving (wonenbij.weverskade.com) heeft zijn eigen header.
  const isStudio =
    pathname?.startsWith("/studio") || pathname?.startsWith("/wonenbij");
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const navigate = usePageNavigation();
  const pendingLogoHref = useRef<string | null>(null);

  // When menu closes after a logo click, navigate after a short delay
  // so the menu close animation plays first.
  useEffect(() => {
    if (!menuOpen && pendingLogoHref.current) {
      const href = pendingLogoHref.current;
      pendingLogoHref.current = null;

      // Capture old page DOM before navigating and attach the clone to
      // <body> immediately. Keeping a live copy in the DOM means decoded
      // image bitmaps survive React's unmount of the originals.
      // Remove any stale snapshot from a still-in-flight previous nav.
      document.querySelectorAll("[data-page-snapshot]").forEach((n) => n.remove());
      const container = document.querySelector("[data-page-content]");
      if (container) {
        const clone = container.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-page-snapshot", "");
        clone.style.cssText = `position:fixed;top:${-window.scrollY}px;left:0;right:0;margin:0;z-index:0;pointer-events:none;`;
        document.body.appendChild(clone);
        window.__pageSnapshot = {
          node: clone,
          scrollY: window.scrollY,
        };
      }

      window.dispatchEvent(new CustomEvent("nav-hide"));

      const t = setTimeout(() => {
        router.push(href);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [menuOpen, router]);

  const [navVisible, setNavVisible] = useState(true);
  const [theme, setTheme] = useState<NavTheme>("dark");
  const [skipBgTransition, setSkipBgTransition] = useState(false);
  const lastScrollY = useRef(0);
  const transitioning = useRef(false);

  // On initial load, if a Hero flagged that the nav should start hidden,
  // hide it before first paint and schedule the entrance animation.
  useLayoutEffect(() => {
    if (window.__navInitialHidden) {
      window.__navInitialHidden = false;
      setNavVisible(false);
      transitioning.current = true;
    }
  }, []);

  // Page transition events
  useEffect(() => {
    const handleNavHide = () => {
      setNavVisible(false);
    };
    const handleStart = () => {
      transitioning.current = true;
    };
    const handleEnd = () => {
      lastScrollY.current = 0;
      setSkipBgTransition(true);
      // Wait for DOM to settle after PageTransition switches to idle layout
      requestAnimationFrame(() => {
        setTheme(detectTheme());
        requestAnimationFrame(() => {
          setNavVisible(true);
          // Only now re-enable scroll handler — navbar is visible with correct theme
          transitioning.current = false;
          requestAnimationFrame(() => {
            setSkipBgTransition(false);
          });
        });
      });
    };
    window.addEventListener("nav-hide", handleNavHide);
    window.addEventListener("page-transition-start", handleStart);
    window.addEventListener("page-transition-end", handleEnd);
    return () => {
      window.removeEventListener("nav-hide", handleNavHide);
      window.removeEventListener("page-transition-start", handleStart);
      window.removeEventListener("page-transition-end", handleEnd);
    };
  }, []);

  // Reset on route change
  useEffect(() => {
    lastScrollY.current = 0;
    // Don't force navbar visible during page transition — it will
    // be shown by page-transition-end with the correct theme
    if (!transitioning.current) {
      setNavVisible(true);
      const raf = requestAnimationFrame(() => {
        setTheme(detectTheme());
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [pathname]);

  // Scroll handler
  useEffect(() => {
    function update() {
      if (transitioning.current) return;

      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      if (y <= 0) {
        setNavVisible(true);
      } else if (Math.abs(delta) > 5) {
        setNavVisible(delta < 0);
      }

      lastScrollY.current = y;
      setTheme(detectTheme());
    }

    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const isVisible = navVisible || menuOpen;
  const { bg, text } = themes[theme];
  const activeText = menuOpen ? "#F7F5F0" : text;

  if (isStudio) return null;

  return (
    <>
    <nav
      data-main-nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        color: activeText,
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        transition:
          "transform 0.4s cubic-bezier(0.4, 0, 0, 1), color 0.3s ease",
      }}
    >
      {/* Sliding background — synced with blue panel */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: bg,
          transform: menuOpen ? "translateY(-100%)" : "translateY(0)",
          transition: skipBgTransition
            ? "none"
            : menuOpen
              ? "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.05s, background-color 0.3s ease"
              : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s, background-color 0.3s ease",
        }}
      />

      {/* Header bar */}
      <div className="relative flex justify-between items-center pt-[1.979vw] pr-[1.944vw] pb-[1.979vw] pl-[2.431vw] max-md:pt-5 max-md:pr-4 max-md:pb-2.5 max-md:pl-4">
        <a
          href="/"
          onClick={(e) => {
            if (menuOpen) {
              e.preventDefault();
              if (pathname === "/") {
                closeMenu();
              } else {
                pendingLogoHref.current = "/";
                closeMenu();
              }
            } else {
              navigate(e, "/");
            }
          }}
          className="block w-[18.889vw] h-[2.445vw] shrink-0 max-md:w-[44vw] max-md:h-auto"
          aria-label="Weverskade home"
        >
          <svg
            viewBox="0 0 344 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
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
        </a>

        <button
          className="flex items-center gap-[0.556vw] p-0 shrink-0 cursor-pointer bg-transparent border-none transition-opacity duration-200 ease-in-out hover:opacity-70 max-md:gap-[1.5vw]"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="font-body font-medium text-[0.972vw] leading-none tracking-[-0.04em] max-md:text-[13px]">
            Menu
          </span>
          <svg
            viewBox="0 0 59 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[3.606vw] h-[3.056vw] max-md:w-[8.4vw] max-md:h-[7.12vw]"
          >
            <path
              d="M8.0437 28.4972L24.78 43.6251H51.2907V36.0911H24.78L8.0437 20.9632V28.4972Z"
              fill="currentColor"
            />
            <path
              d="M8.0437 5.81535V13.3493H34.5544L51.2907 28.4972V20.9432L34.5544 5.81535H8.0437Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

    </nav>
    <Menu isOpen={menuOpen} onClose={closeMenu} />
  </>
  );
}
