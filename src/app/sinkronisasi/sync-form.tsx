"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { runExcelSync, type SyncActionState } from "./actions";

const initialState: SyncActionState = {
  status: "idle",
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {pending ? "Menyinkronkan..." : "Sinkronkan dari Excel"}
    </button>
  );
}

export function SyncForm() {
  const [state, formAction] = useActionState(runExcelSync, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <SubmitButton />
      {state.status !== "idle" ? (
        <p
          className={`rounded-[1rem] px-4 py-3 text-sm leading-7 ${
            state.status === "success"
              ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
              : "bg-rose-50 text-rose-900 ring-1 ring-rose-200"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
