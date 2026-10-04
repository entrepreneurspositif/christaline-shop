import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Christaline Shop • Précommandes Shein, Temu & Alibaba | Devis & Suivi Colis",
  description: "Passez vos commandes sur Shein, Temu et Alibaba facilement. Obtenez votre ticket officiel, consultez votre devis en FCFA et suivez votre colis en temps réel. Livraison 7 à 12 jours ouvrables. WhatsApp : 0154072488.",
  keywords: ["Christaline Shop", "Shein", "Temu", "Alibaba", "précommande", "devis", "suivi colis", "Cotonou", "Bénin", "Calavi", "Mobile Money"],
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
        {children}
      </body>
    </html>
  );
}
