import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import { AppShell } from "@/components/app-shell";
import { isMailConfigured } from "@/lib/env";
import { getConnectionMode } from "@/lib/repairshopr";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "RepairShopr Revenue Console",
  description: "An email-first Next.js CRM workspace for RepairShopr operators.",
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
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell mode={mode} mailReady={mailReady}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
