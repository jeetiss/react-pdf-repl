import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

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
