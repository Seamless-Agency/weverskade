"use client";

import { useState } from "react";
import type { FaqItem } from "@/data/wonenbij";
import { ChevronIcon } from "@/components/wonenbij/icons";
import {
  EASE,
  Reveal,
  RevealGroup,
  RevealLine,
  RevealWords,
} from "@/components/wonenbij/motion";

/**
 * Veelgestelde vragen - accordion met chevron per rij, eerste rij open.
 * Figma: off-white band, titel op x=260 (191 onder de bandtop), label "FAQ" op
 * x=34 (18 onder de titeltop), accordion op x=268 breed 906. Dichte rij:
 * lijn → vraag 22, vraag → lijn 44. Open: vraag → antwoord 40, antwoord → lijn 44.
 * (De eerdere 79 was een meetfout: in het frame staan de vragen op twee regels,
 * waardoor er een hele regelhoogte werd meegemeten. Een dichte rij is in het
 * ontwerp 3,69x de regelhoogte hoog; met 44 klopt dat, en sluit de rij onder de
 * vraag even ver af als onder het antwoord.)
 */
export default function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items.length) return null;

  return (
    <section id="faq" className="bg-off-white pt-[13.264vw] pb-[12.153vw] max-lg:py-14" data-nav-theme="light">
      <div className="relative px-[2.361vw] max-lg:px-5">
        <Reveal
          as="p"
          className="absolute left-[2.361vw] top-[1.25vw] font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-black max-lg:static max-lg:text-[17px] max-lg:leading-[22px]"
        >
          FAQ
        </Reveal>
        <div className="pl-[15.694vw] max-lg:pl-0 max-lg:mt-3">
          <h2 className="font-heading font-normal text-[5.556vw] leading-[6.847vw] tracking-[-0.111vw] text-off-black max-lg:text-[34px] max-lg:leading-[1.1] max-lg:tracking-[-0.68px]">
            <RevealWords text="Veelgestelde vragen" />
          </h2>

          <div className="mt-[4.028vw] ml-[0.556vw] w-[62.917vw] max-lg:ml-0 max-lg:mt-8 max-lg:w-full">
            {/* De borders blijven (transparant) voor exact dezelfde layout;
                de zichtbare lijnen tekenen zichzelf via RevealLine. */}
            {items.map((item, i) => {
              const open = openIndex === i;
              return (
                <RevealGroup
                  key={item.vraag}
                  className={`relative border-t border-transparent ${
                    i === items.length - 1 ? "border-b" : ""
                  }`}
                >
                  <RevealLine className="absolute inset-x-0 top-[-1px] h-px bg-off-black/40" />
                  {i === items.length - 1 ? (
                    <RevealLine
                      delay={0.15}
                      className="absolute inset-x-0 bottom-[-1px] h-px bg-off-black/40"
                    />
                  ) : null}
                  <Reveal
                    as="button"
                    delay={0.1}
                    y={16}
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    className={`w-full flex items-start justify-between gap-[2vw] pt-[1.528vw] cursor-pointer bg-transparent border-none p-0 text-left max-lg:py-4 max-lg:gap-4 ${
                      open ? "pb-0" : "pb-[3.056vw]"
                    }`}
                  >
                    <span className="font-body font-medium text-[2.292vw] leading-[2.66vw] text-off-black max-lg:text-[19px] max-lg:leading-[1.15]">
                      {item.vraag}
                    </span>
                    <ChevronIcon
                      className={`shrink-0 mt-[0.81vw] mr-[0.972vw] w-[2.083vw] h-auto text-off-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-lg:mt-1 max-lg:mr-0 max-lg:w-[20px] ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </Reveal>
                  <div
                    className="grid"
                    style={{
                      gridTemplateRows: open ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <div className="overflow-hidden">
                      <p
                        className="mt-[2.757vw] pb-[3.056vw] max-w-[59.375vw] font-body font-medium text-[1.319vw] leading-[2.153vw] tracking-[-0.026vw] text-off-black max-lg:mt-0 max-lg:pb-5 max-lg:max-w-none max-lg:text-[15px] max-lg:leading-[23px]"
                        style={{
                          opacity: open ? 1 : 0,
                          transform: open ? "translateY(0)" : "translateY(8px)",
                          transition: `opacity 0.5s ${EASE} ${open ? "0.1s" : "0s"}, transform 0.5s ${EASE} ${open ? "0.1s" : "0s"}`,
                        }}
                      >
                        {item.antwoord}
                      </p>
                    </div>
                  </div>
                </RevealGroup>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
