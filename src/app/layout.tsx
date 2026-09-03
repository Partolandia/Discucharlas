import type { Metadata, Viewport } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";

// Tipografías PROVISIONALES: el documento maestro deja pendientes los nombres
// definitivos. La dirección sí está fijada: serif editorial + sans humanista.
const editorial = Fraunces({
  subsets: ["latin"],
  variable: "--fuente-editorial",
  axes: ["SOFT", "WONK", "opsz"],
});

const interfaz = Work_Sans({
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
  themeColor: "#FBF6EE",
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
