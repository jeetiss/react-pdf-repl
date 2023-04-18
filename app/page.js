import Repl from "./repl";

export async function generateMetadata({ searchParams }) {
  const cpCode = searchParams && searchParams.cp_code;
  const gzCode = searchParams && searchParams.gz_code;

  const ogUrl = new URL("https://react-pdf-repl.vercel.app/api/og");

  if (cpCode) {
    ogUrl.searchParams.append("cp_code", cpCode);
  } else if (gzCode) {
    ogUrl.searchParams.append("gz_code", gzCode);
  }

  /** @type {import('next').Metadata} */
  const metadata = {
    title: "PDF repl",
    description: "Create and debug PDF files with react",
    keywords: [
      "PDF",
      "create PDF in browser",
      "@react-pdf/renderer",
      "react-pdf",
      "pdf repl",
    ],
    robots: "index, follow",
    referrer: "origin",
    icons: "/favicon.svg",
    openGraph: {
      type: "website",
      url: "https://react-pdf-repl.vercel.app/",
      title: "PDF repl",
      description: "Create and debug PDF files with react",
      images: [
        {
          url: ogUrl.toString(),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "PDF repl",
      description: "Create and debug PDF files with react",
      creator: "Dmitry Ivakhnenko <jeetiss@ya.ru>",
      images: ogUrl.toString(),
    },
    alternates: { canonical: "https://react-pdf-repl.vercel.app/" },
    verification: {
      google: "2bziNAAYpAHDvCHHUiSzPFk2dEtXm4kLetSFMyAJuyU",
      yandex: "36d69e4ea21041e0",
    },
  };

  return metadata;
}

export default function Component(props) {
  return <Repl {...props} />;
}
