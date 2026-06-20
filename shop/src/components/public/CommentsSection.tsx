"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";

type Comment = { id: string; authorName: string; text: string; createdAt: string };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function CommentsSection({
  postId,
  allowComments,
  initialComments,
}: {
  postId: string;
  allowComments: boolean;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-bold text-[#1e2833]">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>

      <div className="mt-5 space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-100">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold text-gray-900">{c.authorName}</p>
              <p className="text-xs text-gray-400">{formatDate(c.createdAt)}</p>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-gray-700">{c.text}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-gray-500">Be the first to comment.</p>}
      </div>

      {allowComments ? (
        <div className="mt-8">
          <h3 className="mb-3 font-semibold text-[#1e2833]">Leave a comment</h3>
          <CommentForm postId={postId} onAdded={(c) => setComments((prev) => [...prev, c])} />
        </div>
      ) : (
        <p className="mt-8 text-sm text-gray-400">Comments are closed for this post.</p>
      )}
    </div>
  );
}
