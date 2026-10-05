import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";

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
    icon: "/favicon.ico",
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
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
