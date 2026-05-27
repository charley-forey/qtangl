import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: string;
    url?: string;
    category?: string;
    notes?: string;
  };

  if (!body.title?.trim() || !body.url?.trim() || !body.notes?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.LEARN_SUBMIT_REPO ?? "qtangl/qtangl";

  if (token && repo.includes("/")) {
    const [owner, name] = repo.split("/", 2);
    const issueBody = [
      "## Library submission",
      "",
      `- **Project:** ${body.title}`,
      `- **URL:** ${body.url}`,
      `- **Suggested category:** ${body.category || "unspecified"}`,
      "",
      body.notes,
    ].join("\n");

    const response = await fetch(`https://api.github.com/repos/${owner}/${name}/issues`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "qtangl-learn-submit",
      },
      body: JSON.stringify({
        title: `[Learn submit] ${body.title}`,
        body: issueBody,
        labels: ["learn-submission"],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "GitHub issue creation failed" }, { status: 502 });
    }

    const payload = (await response.json()) as { html_url: string };
    return NextResponse.json({ ok: true, issueUrl: payload.html_url });
  }

  console.info("[learn-submit]", body);
  return NextResponse.json({ ok: true, stored: "log" });
}
