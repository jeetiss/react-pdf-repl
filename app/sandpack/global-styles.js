"use client";

import { getSandpackCssText } from "@codesandbox/sandpack-react";
import { useServerInsertedHTML } from "next/navigation";

export const GlobalSandpackStyles = ({ children }) => {
  useServerInsertedHTML(() => {
    return (
      <style
        id="sandpack"
        dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
      />
    );
  });

  return <>{children}</>;
};
