import { GlobalSandpackStyles } from "./global-styles";

/** @type {import('next').Metadata} */
export const metadata = {
  title: "Sandpack",
  description: "react-pdf/renderer with sandpack",
  robots: "noindex, nofollow",
};

export default function RootLayout(props) {
  return <GlobalSandpackStyles>{props.children}</GlobalSandpackStyles>;
}
