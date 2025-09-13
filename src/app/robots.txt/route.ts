export function GET() {
  const content = `User-Agent: *\nAllow: /\nSitemap: https://fascinantedigital.com/sitemap.xml`;
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
