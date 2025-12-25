import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";
import { AuthProvider } from "@/context/AuthContext";
import { ExchangeRateProvider } from "@/context/ExchangeRateContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wingx Stock",
  description: "Sistema de control de inventario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <AuthProvider>
          <ExchangeRateProvider>
            <Shell>{children}</Shell>
          </ExchangeRateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
