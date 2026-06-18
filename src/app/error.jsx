"use client";

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-xl rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-xl font-semibold text-red-300">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-300">
          {error?.message || "A client-side API call failed or the page could not render."}
        </p>
        <button
          className="mt-4 rounded-md bg-white px-4 py-2 text-slate-900"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
