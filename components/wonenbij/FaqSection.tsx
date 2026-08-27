"use client";

import { useState } from "react";
import type { FaqItem } from "@/data/wonenbij";
import { ChevronIcon } from "@/components/wonenbij/icons";

/** Veelgestelde vragen - accordion met chevron per rij, eerste rij open. */
export default function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items.length) return null;

  return (
    <section id="faq" className="bg-off-white py-[9.028vw] max-md:py-14" data-nav-theme="light">
      <div className="grid grid-cols-12 gap-x-[1.389vw] px-[2.431vw] max-md:grid-cols-1 max-md:px-5 max-md:gap-y-6">
        <p className="col-span-2 font-body font-medium text-[1.389vw] leading-[1.2] text-off-black max-md:text-[17px]">
          FAQ
        </p>
        <div className="col-span-9">
          <h2 className="font-heading font-normal text-[5.556vw] leading-none tracking-[-0.111vw] text-off-black max-md:text-[34px] max-md:tracking-[-0.68px]">
            Veelgestelde vragen
          </h2>

          <div className="mt-[6.944vw] max-md:mt-8">
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
                    className="w-full flex items-center justify-between gap-[2vw] py-[1.875vw] cursor-pointer bg-transparent border-none p-0 text-left max-md:py-4 max-md:gap-4"
                  >
                    <span className="font-body font-medium text-[2.292vw] leading-[1.15] text-off-black max-md:text-[19px]">
                      {item.vraag}
                    </span>
                    <ChevronIcon
                      className={`shrink-0 w-[2.083vw] h-auto text-off-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-md:w-[20px] ${
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
                      <p className="pb-[2.292vw] max-w-[59.375vw] font-body font-medium text-[1.319vw] leading-[2.153vw] tracking-[-0.026vw] text-off-black max-md:pb-5 max-md:max-w-none max-md:text-[15px] max-md:leading-[23px]">
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
