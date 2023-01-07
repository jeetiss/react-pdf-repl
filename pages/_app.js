import { Analytics } from "@vercel/analytics/react";
import { Component } from "react";
import GlobalError from "next/dist/client/components/error-boundary";
import { log } from "next-axiom";

import "../styles/globals.css";
import "../styles/mosaic.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    log.error('error', { error, errorInfo });
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
    <ErrorBoundary>
      <Component {...pageProps} />
      <Analytics />
    </ErrorBoundary>
  );
}

export default MyApp;
