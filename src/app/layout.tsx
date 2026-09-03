import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

// El prototipo pide Bodoni 72 y Avenir Next, que solo existen en dispositivos
// Apple. Estas son sus equivalentes web y ya venían cargadas en el propio
// prototipo, así que la app se ve igual en Android y en Windows.
const editorial = Playfair_Display({
  subsets: ["latin"],
  variable: "--fuente-editorial",
});

const interfaz = DM_Sans({
  subsets: ["latin"],
  variable: "--fuente-interfaz",
});

export const metadata: Metadata = {
  title: {
    default: "Discucharlas",
    template: "%s · Discucharlas",
  },
  description:
    "El hogar digital de nuestro club de escucha y conversación. Proponemos, votamos, nos encontramos y guardamos la memoria de cada discucharla.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Discucharlas",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icono.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Discucharlas",
    description:
      "Un club privado de escucha y conversación sobre podcasts. Proponer, votar, encontrarnos y recordar.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#F6F0E5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={`${editorial.variable} ${interfaz.variable}`}>
      <body>{children}</body>
    </html>
  );
}
