import { Analytics } from "@vercel/analytics/react";
import { Component } from "react";
import GlobalError from "next/dist/client/components/error-boundary";
import { log } from "next-axiom/dist/logger";
import Head from "next/head";
import { getSandpackCssText } from "@codesandbox/sandpack-react";

import "./globals.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    log.error(error.message, { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <GlobalError />;
    }

    return this.props.children;
  }
}

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>react-pdf playground</title>

        <link rel="icon" type="image/svg" href="/favicon.svg" />
        <meta
          name="keywords"
          content="react pdf playground with interactive debugger"
        />

        <style
          dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
          id="sandpack"
          key="sandpack-css"
        />
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
        <Analytics />
      </ErrorBoundary>
    </>
  );
}

export default MyApp;
