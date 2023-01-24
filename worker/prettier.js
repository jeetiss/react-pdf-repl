import prettier from "prettier";
import parserEspree from "prettier/parser-espree";

self.addEventListener("message", (e) => {
  const { code } = e.data;

  const formattedCode = prettier.format(code, {
    parser: "espree",
    plugins: [parserEspree],
  });

  self.postMessage({ code: formattedCode });
});
