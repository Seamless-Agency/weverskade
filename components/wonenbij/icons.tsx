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

/* ─── Social-logo's (monochroom, currentColor) ─────────────────────── */

export function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
    </svg>
  );
}

export function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z" />
    </svg>
  );
}
