import Repl from "./repl";

export async function generateMetadata({ searchParams }) {
  const code = searchParams && searchParams.cp_code;

  const ogUrl = new URL("https://react-pdf-repl.vercel.app/api/og");

  if (code) {
    ogUrl.searchParams.append("cp_code", code);
  }

  /** @type {import('next').Metadata} */
  const metadata = {
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
      title: "react-pdf-repl",
      description: "playground with interactive debugger",
      siteName: "react-pdf-repl",
      images: [
        {
          url: ogUrl.toString(),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "https://react-pdf-repl.vercel.app/",
      title: "react-pdf-repl",
      description: "playground with interactive debugger",
      creator: "Dmitry Ivakhnenko <jeetiss@ya.ru>",
      images: ogUrl.toString(),
    },
    alternates: { canonical: "https://react-pdf-repl.vercel.app/" },
  };

  return metadata;
}

export default function Component(props) {
  return <Repl {...props} />;
}
