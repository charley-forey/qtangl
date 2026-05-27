import { llmsTxtContent } from "@/lib/seo";

export function GET() {
  return new Response(llmsTxtContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
