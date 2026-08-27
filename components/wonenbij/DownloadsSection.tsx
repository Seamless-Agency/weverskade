"use client";

import type { DownloadItem } from "@/data/wonenbij";

/** Groene band met downloadpills (brochures en documenten). */
export default function DownloadsSection({ items }: { items: DownloadItem[] }) {
  if (!items.length) return null;

  return (
    // Figma: titel 103 onder de bandtop (x=267), pills 48 onder de titel,
    // 46 hoog met 14 tussenruimte, 165 wit onder de pills
    <section
      id="downloads"
      className="bg-green pt-[7.153vw] pb-[11.458vw] max-lg:py-14"
      data-nav-theme="green"
    >
      <div className="pl-[18.542vw] pr-[2.431vw] max-lg:px-5">
        <h2 className="font-heading font-normal text-[4.653vw] leading-[5.736vw] tracking-[-0.093vw] text-off-white max-lg:text-[36px] max-lg:leading-[1.1] max-lg:tracking-[-0.72px]">
          Downloads
        </h2>
        <div className="mt-[3.333vw] flex flex-wrap gap-[0.972vw] max-lg:mt-8 max-lg:gap-3">
          {items.map((item) => (
            <a
              key={item.titel}
              href={item.url}
              target={item.url !== "#" ? "_blank" : undefined}
              rel={item.url !== "#" ? "noopener noreferrer" : undefined}
              className="inline-flex items-center h-[3.194vw] bg-off-white text-off-black no-underline rounded-full px-[2.222vw] font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] hover:opacity-80 transition-opacity duration-200 max-lg:h-auto max-lg:px-6 max-lg:py-3 max-lg:text-[15px] max-lg:leading-normal"
            >
              {item.titel}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
