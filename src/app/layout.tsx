import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";

import { AppShell } from "@/components/app-shell";
import { isMailConfigured } from "@/lib/env";
import { getConnectionMode } from "@/lib/repairshopr";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CRM Automation Console",
  description: "A protected CRM and billing workspace for RepairShopr operators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mode = getConnectionMode();
  const mailReady = isMailConfigured();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ClerkProvider>
          <AppShell mode={mode} mailReady={mailReady}>
            {children}
          </AppShell>
        </ClerkProvider>
      </body>
    </html>
  );
}
