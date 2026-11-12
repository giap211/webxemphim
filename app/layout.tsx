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
      <svg aria-hidden="true" width="0" height="0" style={{position:"absolute",width:0,height:0,overflow:"hidden"}}>
        <filter id="liquid-text-refraction" x="-8%" y="-12%" width="116%" height="124%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.025 0.04" numOctaves="2" seed="11" result="glassNoise" />
          <feDisplacementMap in="SourceGraphic" in2="glassNoise" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {children}
    </body></html>;
}
