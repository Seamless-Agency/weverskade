/**
 * Vector-iconen uit de Figma-export (Weverskade | Seamless, 23 juli 2026),
 * met currentColor zodat ze op elke achtergrond meekleuren.
 */

/** Dunne lijnpijl naar rechts (Figma "Arrow 13"). Draai met className. */
export function PijlIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 22.75 11.05"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M22.5303 6.0533C22.8232 5.76041 22.8232 5.28553 22.5303 4.99264L17.7574 0.21967C17.4645 -0.0732231 16.9896 -0.0732231 16.6967 0.21967C16.4038 0.512564 16.4038 0.987437 16.6967 1.28033L20.9393 5.52297L16.6967 9.76561C16.4038 10.0585 16.4038 10.5334 16.6967 10.8263C16.9896 11.1192 17.4645 11.1192 17.7574 10.8263L22.5303 6.0533ZM0 5.52297V6.27297H22V5.52297V4.77297H0V5.52297Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Chevron omlaag (Figma "Vector 2"). Draai met className voor open-staat. */
export function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30.71 16.06"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M0.353553 0.353553L15.3536 15.3536L30.3536 0.353553"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** Het Weverskade-beeldmerk uit de hoofdnavigatie; dient daar (en hier) als menuknop. */
export function MenuMerkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 59 50" fill="none" className={className} aria-hidden>
      <path
        d="M8.0437 28.4972L24.78 43.6251H51.2907V36.0911H24.78L8.0437 20.9632V28.4972Z"
        fill="currentColor"
      />
      <path
        d="M8.0437 5.81535V13.3493H34.5544L51.2907 28.4972V20.9432L34.5544 5.81535H8.0437Z"
        fill="currentColor"
      />
    </svg>
  );
}
