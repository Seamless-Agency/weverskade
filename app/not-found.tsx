import Link from "next/link";

export const metadata = {
  title: "Pagina niet gevonden | Weverskade",
};

export default function NotFound() {
  return (
    <div data-nav-theme="light">
      <section className="bg-off-white min-h-dvh flex flex-col justify-center px-[2.639vw] max-md:px-5">
        <p className="font-heading font-normal not-italic text-[1.389vw] leading-[1.2] text-off-black max-md:text-[15px]">
          404
        </p>

        <h1 className="mt-[2.778vw] max-w-[64vw] font-body font-medium text-[4.028vw] leading-[4.097vw] tracking-[-0.04vw] text-off-black max-md:mt-6 max-md:max-w-none max-md:text-[28px] max-md:leading-[30px]">
          Deze pagina bestaat niet of is verplaatst.
        </h1>

        <Link
          href="/"
          className="link-underline mt-[3.611vw] self-start font-body font-medium text-[1.389vw] leading-[1.2] text-off-black pb-[0.486vw] max-md:text-[17px] max-md:mt-8 max-md:pb-1.5"
        >
          Terug naar home
        </Link>
      </section>
    </div>
  );
}
