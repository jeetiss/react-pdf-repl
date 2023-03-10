import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

export const metadata = {
  title: "react-pdf playground",
  description: "react pdf playground with interactive debugger",
};

export default function RootLayout(props) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg" href="/favicon.svg" />
      </head>
      <body>
        {props.children}
        <Analytics />
      </body>
    </html>
  );
}
