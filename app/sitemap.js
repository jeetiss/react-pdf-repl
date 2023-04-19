export default async function sitemap() {
  return [""].map((route) => ({
    url: `https://react-pdf-repl.vercel.app${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));
}
