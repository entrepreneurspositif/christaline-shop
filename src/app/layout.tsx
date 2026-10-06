import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import PixelManager from "@/components/PixelManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Christaline Shop • Précommandes Shein & Temu au Bénin | Devis & Suivi Colis",
  description: "Passez vos commandes sur Shein et Temu facilement au Bénin. Obtenez votre ticket officiel, consultez votre devis en FCFA et suivez votre colis en temps réel. Voie aérienne (au plus 1 mois) ou maritime (2 à 3 mois). WhatsApp : 0154072488.",
  keywords: ["Christaline Shop", "Shein Bénin", "Temu Bénin", "précommande", "devis", "suivi colis", "Cotonou", "Bénin", "Calavi", "Mobile Money"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-stone-900 selection:bg-rose-500 selection:text-white">
        <SettingsProvider>
          <PixelManager />
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
