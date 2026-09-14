import { ImageResponse } from "next/og";

// Apple touch icon — iOS adds rounded corners automatically, so we render a
// full-bleed green square with the Weverskade-beeldmerk centered. Dit is
// dezelfde glyph als de menuknop in de Navbar en app/icon.svg.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const GREEN = "#848F71";
const OFF_WHITE = "#F7F5F0";

// Beeldmerk-paden overgenomen uit de Navbar-menuknop (viewBox 0 0 59 50).
// De viewBox hieronder sluit precies om de twee balken (x 8.04–51.29,
// y 5.82–43.63), zodat het merk optisch gecentreerd staat.
const MARK_PATHS = [
  "M8.0437 28.4972L24.78 43.6251H51.2907V36.0911H24.78L8.0437 20.9632V28.4972Z",
  "M8.0437 5.81535V13.3493H34.5544L51.2907 28.4972V20.9432L34.5544 5.81535H8.0437Z",
];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: GREEN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="118"
          height="103"
          viewBox="8.0437 5.81535 43.247 37.80975"
        >
          {MARK_PATHS.map((d) => (
            <path key={d} fill={OFF_WHITE} d={d} />
          ))}
        </svg>
      </div>
    ),
    { ...size }
  );
}
