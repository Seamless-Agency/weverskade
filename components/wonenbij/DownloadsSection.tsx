"use client";

import type { DownloadItem } from "@/data/wonenbij";

/** Groene band met downloadpills (brochures en documenten). */
export default function DownloadsSection({ items }: { items: DownloadItem[] }) {
  if (!items.length) return null;

  return (
    <section
      id="downloads"
      className="bg-green py-[7.153vw] max-md:py-14"
      data-nav-theme="green"
    >
      <div className="pl-[18.542vw] pr-[2.431vw] max-md:px-5">
        <h2 className="font-heading font-normal text-[4.653vw] leading-none tracking-[-0.093vw] text-off-white max-md:text-[36px] max-md:tracking-[-0.72px]">
          Downloads
        </h2>
        <div className="mt-[4.028vw] flex flex-wrap gap-[1.111vw] max-md:mt-8 max-md:gap-3">
          {items.map((item) => (
            <a
              key={item.titel}
              href={item.url}
              target={item.url !== "#" ? "_blank" : undefined}
              rel={item.url !== "#" ? "noopener noreferrer" : undefined}
              className="bg-off-white text-off-black no-underline rounded-full px-[2.222vw] py-[0.903vw] font-heading font-normal text-[1.181vw] tracking-[-0.024vw] hover:opacity-80 transition-opacity duration-200 max-md:px-6 max-md:py-3 max-md:text-[15px]"
            >
              {item.titel}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
