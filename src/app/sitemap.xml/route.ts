export async function GET() {
  const baseUrl = "https://fascinantedigital.com";
  // Puedes agregar más rutas aquí si lo deseas
  const urls = [""];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) =>
      `<url><loc>${baseUrl}/${path}</loc><lastmod>${new Date().toISOString()}</lastmod></url>`,
  )
  .join("")}
</urlset>`;
  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
