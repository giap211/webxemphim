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
  return <html lang="vi"><body>{children}</body></html>;
}
