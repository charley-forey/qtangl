"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { ccFlags } from "@/lib/cc-feature-flags";
import { deleteDashboardJson, fetchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type FindingComment = {
  id: string;
  findingId: string;
  scanId?: string | null;
  author: string;
  body: string;
  mentions: string[];
  createdAt: string;
  updatedAt?: string | null;
};

type CommentListResponse = {
  findingId: string;
  comments: FindingComment[];
  total: number;
};

function parseMentions(body: string): string[] {
  const matches = body.match(/@[\w.-]+/g) ?? [];
  return Array.from(new Set(matches.map((m) => m.slice(1))));
}

export default function FindingCommentsThread({
  findingId,
  scanId,
  canWrite = true,
}: {
  findingId: string;
  scanId?: string | null;
  canWrite?: boolean;
}) {
  const [comments, setComments] = useState<FindingComment[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ccFlags.comments || !findingId) return;
    void fetchDashboardJson<CommentListResponse>(`/tenant/findings/${encodeURIComponent(findingId)}/comments`)
      .then((data) => setComments(data.comments))
      .catch(() => setComments([]));
  }, [findingId]);

  if (!ccFlags.comments) return null;

  async function submit() {
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    try {
      const q = scanId ? `?scan_id=${encodeURIComponent(scanId)}` : "";
      const data = await postDashboardJson<CommentListResponse>(
        `/tenant/findings/${encodeURIComponent(findingId)}/comments${q}`,
        { body, mentions: parseMentions(body) }
      );
      setComments(data.comments);
      setDraft("");
      trackDashboardEvent({ event: "cc_comment_added", properties: { findingId } });
    } catch {
      /* best-effort */
    } finally {
      setBusy(false);
    }
  }

  async function remove(commentId: string) {
    try {
      await deleteDashboardJson(
        `/tenant/findings/${encodeURIComponent(findingId)}/comments/${encodeURIComponent(commentId)}`
      );
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      trackDashboardEvent({ event: "cc_comment_deleted", properties: { findingId } });
    } catch {
      /* best-effort */
    }
  }

  return (
    <Card tone="ghost" className="space-y-3 border border-[var(--border-subtle)]">
      <Eyebrow>Discussion</Eyebrow>
      <ul className="space-y-2">
        {comments.length === 0 ? (
          <li className="text-xs text-[var(--color-gray-500)]">No comments yet.</li>
        ) : (
          comments.map((comment) => (
            <li key={comment.id} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{comment.author}</span>
                <span className="text-[10px] text-[var(--color-gray-500)]">{comment.createdAt.slice(0, 16).replace("T", " ")}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[var(--color-gray-300)]">{comment.body}</p>
              {canWrite ? (
                <button
                  type="button"
                  className="mt-1 text-[10px] text-red-300 hover:underline"
                  onClick={() => void remove(comment.id)}
                >
                  Delete
                </button>
              ) : null}
            </li>
          ))
        )}
      </ul>
      {canWrite ? (
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment… use @name to mention"
            rows={2}
            className="min-w-0 flex-1 rounded-lg border border-[var(--border-subtle)] bg-black/60 px-3 py-2 text-xs text-white"
          />
          <Button type="button" size="sm" disabled={busy || !draft.trim()} onClick={() => void submit()}>
            {busy ? "…" : "Post"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
