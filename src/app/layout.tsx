import type { Metadata, Viewport } from "next";
import { Geist_Mono, Gothic_A1 } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gothicA1 = Gothic_A1({
  variable: "--font-gothic-a1",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Traveria",
  description: "あなたのための京都を見つける観光支援アプリ。",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      className={`${gothicA1.variable} ${geistMono.variable} h-full antialiased`}
      lang="ja"
    >
      <body className="min-h-full flex flex-col"><PwaRegister />{children}</body>
    </html>
  );
}
