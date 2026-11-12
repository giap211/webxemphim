import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XemPhim — Xem phim trực tuyến",
  description: "Khám phá phim mới, phim bộ và phim lẻ.",
  applicationName: "XemPhim",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "XemPhim" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#090812" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>
      {children}
    </body></html>;
}
