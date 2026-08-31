"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div data-nav-theme="light">
      <section className="bg-off-white min-h-dvh flex flex-col justify-center px-[2.639vw] max-md:px-5">
        <p className="font-heading font-normal not-italic text-[1.389vw] leading-[1.2] text-off-black max-md:text-[15px]">
          Er ging iets mis
        </p>

        <h1 className="mt-[2.778vw] max-w-[64vw] font-body font-medium text-[4.028vw] leading-[4.097vw] tracking-[-0.04vw] text-off-black max-md:mt-6 max-md:max-w-none max-md:text-[28px] max-md:leading-[30px]">
          Deze pagina kon niet worden geladen.
        </h1>

        <div className="mt-[3.611vw] flex items-center gap-[2.5vw] max-md:mt-8 max-md:gap-6">
          <button
            onClick={reset}
            className="link-underline self-start bg-transparent border-none p-0 cursor-pointer font-body font-medium text-[1.389vw] leading-[1.2] text-off-black pb-[0.486vw] max-md:text-[17px] max-md:pb-1.5"
          >
            Probeer opnieuw
          </button>
          <Link
            href="/"
            className="link-underline self-start font-body font-medium text-[1.389vw] leading-[1.2] text-off-black pb-[0.486vw] max-md:text-[17px] max-md:pb-1.5"
          >
            Terug naar home
          </Link>
        </div>
      </section>
    </div>
  );
}
