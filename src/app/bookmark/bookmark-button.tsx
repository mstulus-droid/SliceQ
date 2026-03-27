"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toggleBookmark, type BookmarkActionState } from "./actions";

type BookmarkButtonProps = {
  verseId: number;
  isBookmarked: boolean;
};

const initialState: BookmarkActionState = {
  status: "idle" as const,
  message: "",
};

function SubmitButton({ isBookmarked }: { isBookmarked: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        isBookmarked
          ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
          : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
      } disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {pending ? "Memproses..." : isBookmarked ? "Hapus bookmark" : "Simpan bookmark"}
    </button>
  );
}

export function BookmarkButton({ verseId, isBookmarked }: BookmarkButtonProps) {
  const [state, action] = useActionState(toggleBookmark, initialState);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="verseId" value={verseId} />
      <SubmitButton isBookmarked={isBookmarked} />
      {state.status !== "idle" ? (
        <p className="text-sm text-slate-600">{state.message}</p>
      ) : null}
    </form>
  );
}
