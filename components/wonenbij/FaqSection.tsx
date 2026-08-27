"use client";

import { useState } from "react";
import type { FaqItem } from "@/data/wonenbij";
import { ChevronIcon } from "@/components/wonenbij/icons";

/**
 * Veelgestelde vragen - accordion met chevron per rij, eerste rij open.
 * Figma: off-white band, titel op x=260 (191 onder de bandtop), label "FAQ" op
 * x=34 (18 onder de titeltop), accordion op x=268 breed 906. Dichte rij:
 * lijn → vraag 22, vraag → lijn 79. Open: vraag → antwoord 40, antwoord → lijn 44.
 */
export default function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items.length) return null;

  return (
    <section id="faq" className="bg-off-white pt-[13.264vw] pb-[12.153vw] max-md:py-14" data-nav-theme="light">
      <div className="relative px-[2.361vw] max-md:px-5">
        <p className="absolute left-[2.361vw] top-[1.25vw] font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-black max-md:static max-md:text-[17px]">
          FAQ
        </p>
        <div className="pl-[15.694vw] max-md:pl-0 max-md:mt-3">
          <h2 className="font-heading font-normal text-[5.556vw] leading-[6.847vw] tracking-[-0.111vw] text-off-black max-md:text-[34px] max-md:leading-none max-md:tracking-[-0.68px]">
            Veelgestelde vragen
          </h2>

          <div className="mt-[4.028vw] ml-[0.556vw] w-[62.917vw] max-md:ml-0 max-md:mt-8 max-md:w-full">
            {items.map((item, i) => {
              const open = openIndex === i;
              return (
                <div
                  key={item.vraag}
                  className={`border-t border-off-black/40 ${
                    i === items.length - 1 ? "border-b" : ""
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    className={`w-full flex items-start justify-between gap-[2vw] pt-[1.528vw] cursor-pointer bg-transparent border-none p-0 text-left max-md:py-4 max-md:gap-4 ${
                      open ? "pb-0" : "pb-[5.486vw]"
                    }`}
                  >
                    <span className="font-body font-medium text-[2.292vw] leading-[2.66vw] text-off-black max-md:text-[19px] max-md:leading-[1.15]">
                      {item.vraag}
                    </span>
                    <ChevronIcon
                      className={`shrink-0 mt-[0.81vw] mr-[0.972vw] w-[2.083vw] h-auto text-off-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-md:mt-1 max-md:mr-0 max-md:w-[20px] ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className="grid"
                    style={{
                      gridTemplateRows: open ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-[2.757vw] pb-[3.056vw] max-w-[59.375vw] font-body font-medium text-[1.319vw] leading-[2.153vw] tracking-[-0.026vw] text-off-black max-md:mt-0 max-md:pb-5 max-md:max-w-none max-md:text-[15px] max-md:leading-[23px]">
                        {item.antwoord}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
