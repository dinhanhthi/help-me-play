import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/Tooltip";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Help Me Play - Nintendo Switch Game Guides",
  description:
    "Learn how to play Nintendo Switch games with visual combo guides and video demonstrations",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased flex min-h-screen flex-col bg-background text-foreground`}
      >
        <I18nProvider>
          <TooltipProvider delayDuration={200}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </TooltipProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
