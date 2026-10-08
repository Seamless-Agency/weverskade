"use client";

import { useEffect, useRef, useState } from "react";

interface GebouwMapProps {
  lat: number;
  lng: number;
  projectName: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function GebouwMap({ lat, lng, projectName }: GebouwMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // If no API key, show a styled placeholder
    if (!GOOGLE_MAPS_API_KEY) {
      setMapLoaded(true);
      return;
    }

    const scriptId = "google-maps-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          // Global: fully desaturated, lightened
          { featureType: "all", elementType: "all", stylers: [{ saturation: -100 }] },
          // Landscape: warm beige matching #F7F5F0
          { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: "#eeebe4" }] },
          { featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [{ color: "#eae7e0" }] },
          // Water: very light cool gray
          { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#dcdad4" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#b0aea8" }] },
          // Roads: white fills, no outlines
          { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
          { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
          { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
          // Road labels: subtle gray
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#b5b3ad" }] },
          { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#eeebe4" }, { weight: 3 }] },
          // Neighborhood / area labels: medium gray, uppercase feel
          { featureType: "administrative.neighborhood", elementType: "labels.text.fill", stylers: [{ color: "#9a9892" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#6b6964" }] },
          { featureType: "administrative.locality", elementType: "labels.text.stroke", stylers: [{ color: "#eeebe4" }, { weight: 3 }] },
          // POI: hide icons, subtle labels
          { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e5e2db" }] },
          { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#b5b3ad" }] },
          { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#e2e0d8" }] },
          // Transit: hide
          { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
        ],
      });

      // Custom green marker overlay
      class GreenMarkerOverlay extends window.google.maps.OverlayView {
        private div: HTMLDivElement | null = null;
        private position: google.maps.LatLng;
        private label: string;

        constructor(position: google.maps.LatLng, label: string) {
          super();
          this.position = position;
          this.label = label;
        }

        onAdd() {
          this.div = document.createElement("div");
          this.div.style.position = "absolute";
          this.div.style.cursor = "default";
          // Scale marker ~30% smaller on mobile so the label doesn't dominate
          // the compact map view. Matches the `max-md:text-[17px]` placeholder.
          const isMobile =
            typeof window !== "undefined" &&
            window.matchMedia("(max-width: 768px)").matches;
          const fontSize = isMobile ? 17 : 24;
          const padY = isMobile ? 7 : 10;
          const padX = isMobile ? 17 : 24;
          const pinSize = isMobile ? 15 : 22;
          const pinOffset = isMobile ? 9 : 13;
          const letterSpacing = isMobile ? -0.34 : -0.48;
          // position:relative + z-index op het label: de geroteerde pin-ruit
          // is een latere sibling met eigen stacking context en zou anders
          // óver de labeltekst heen schilderen (zelfde valkuil als bij de
          // eerdere statische kaartmarker).
          this.div.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)">
              <div style="position:relative;z-index:1;background:#848F71;padding:${padY}px ${padX}px;font-family:var(--font-heading),serif;font-size:${fontSize}px;color:#F7F5F0;white-space:nowrap;letter-spacing:${letterSpacing}px">${this.label}</div>
              <div style="width:${pinSize}px;height:${pinSize}px;background:#848F71;transform:rotate(45deg);margin-top:-${pinOffset}px"></div>
            </div>
          `;
          const panes = this.getPanes();
          panes?.overlayMouseTarget.appendChild(this.div);
        }

        draw() {
          if (!this.div) return;
          const projection = this.getProjection();
          const point = projection.fromLatLngToDivPixel(this.position);
          if (point) {
            this.div.style.left = point.x + "px";
            this.div.style.top = point.y + "px";
          }
        }

        onRemove() {
          this.div?.parentNode?.removeChild(this.div);
          this.div = null;
        }
      }

      const overlay = new GreenMarkerOverlay(
        new window.google.maps.LatLng(lat, lng),
        projectName
      );
      overlay.setMap(map);

      setMapLoaded(true);
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else if (window.google) {
      initMap();
    } else {
      script.addEventListener("load", initMap);
    }
  }, [lat, lng, projectName]);

  // Placeholder when no API key
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="relative w-full h-full bg-[#e8e5dd] overflow-hidden">
        {/* Styled map placeholder with streets pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, #fff 1px, transparent 1px),
            linear-gradient(180deg, #fff 1px, transparent 1px)
          `,
          backgroundSize: "80px 60px",
          opacity: 0.3,
        }} />
        {/* Green marker */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center z-10">
          <div className="relative z-10 bg-green px-[1.667vw] py-[0.694vw] max-md:px-6 max-md:py-2.5">
            <span className="font-heading font-normal text-[1.667vw] text-off-white tracking-[-0.033vw] whitespace-nowrap max-md:text-[17px] max-md:tracking-[-0.34px]">
              {projectName}
            </span>
          </div>
          <div className="w-[1.528vw] h-[1.528vw] bg-green rotate-45 -mt-[0.903vw] max-md:w-[22px] max-md:h-[22px] max-md:-mt-[13px]" />
        </div>
        {/* Weverskade icon watermark */}
        <div className="absolute top-[1.389vw] right-[1.389vw] opacity-20 max-md:top-3 max-md:right-3">
          <svg width="40" height="40" viewBox="0 0 59 50" fill="none">
            <path d="M29.5 0L59 50H0L29.5 0Z" fill="#848F71"/>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ opacity: mapLoaded ? 1 : 0, transition: "opacity 0.5s" }}
    />
  );
}
