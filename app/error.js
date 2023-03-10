"use client";

import { log } from "next-axiom/dist/logger";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    log.error(error.message, { error });
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
