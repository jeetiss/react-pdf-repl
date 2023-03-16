import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

/** @type {import('next').Metadata} */
export const metadata = {
  title: "react-pdf playground",
  description: "react pdf playground with interactive debugger",
  keywords: [
    "PDF",
    "@react-pdf/renderer",
    "react-pdf",
    "debugger",
    "debug pdf",
  ],
  robots: "index, follow",
  referrer: "origin",
  icons: "/favicon.svg",
  openGraph: {
    type: "website",
    url: "https://react-pdf-repl.vercel.app/",
    title: "react-pdf playground",
    description: "react pdf playground with interactive debugger",
    siteName: "react-pdf-repl",
    images: [
      {
        url: "https://react-pdf-repl.vercel.app/og.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "https://react-pdf-repl.vercel.app/",
    creator: "Dmitry Ivakhnenko <jeetiss@ya.ru>",
    images: "https://react-pdf-repl.vercel.app/og.png",
  },
  alternates: { canonical: "https://react-pdf-repl.vercel.app/" },
};

export default function RootLayout(props) {
  return (
    <html lang="en">
      <body>
        {props.children}
        <Analytics />
      </body>
    </html>
  );
}
