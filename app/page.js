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
    title: "react-pdf repl",
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
      title: "react-pdf repl",
      description: "playground with interactive debugger",
      images: [
        {
          url: ogUrl.toString(),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "react-pdf repl",
      description: "playground with interactive debugger",
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
