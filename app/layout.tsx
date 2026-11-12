import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phim Lậu — Xem phim trực tuyến",
  description: "Khám phá phim mới, phim bộ và phim lẻ.",
  applicationName: "Phim Lậu",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Phim Lậu" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#090812" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>
      <svg aria-hidden="true" width="1" height="1" viewBox="0 0 1 1" style={{position:"fixed",left:"-2px",top:"-2px",width:"1px",height:"1px",overflow:"visible",pointerEvents:"none"}}>
        <filter id="liquid-text-refraction" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.032" numOctaves="2" seed="11" result="glassNoise" />
          <feDisplacementMap in="SourceGraphic" in2="glassNoise" scale="5.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {children}
    </body></html>;
}
