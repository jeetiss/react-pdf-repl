import { GlobalSandpackStyles } from "./global-styles";

export const metadata = {
  title: "Sandpack",
  description: "react-pdf/renderer with sandpack",
};

export default function RootLayout(props) {
  return <GlobalSandpackStyles>{props.children}</GlobalSandpackStyles>;
}
