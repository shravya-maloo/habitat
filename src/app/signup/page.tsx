"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit} className="bubble-card pop-in w-full max-w-sm p-6 flex flex-col gap-4">
        <h1
          className="pixel-title text-xl text-center mb-1"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--berry), var(--coral), var(--sun), var(--leaf-dark), var(--sky), var(--grape))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          HABITAT
        </h1>
        <p className="text-center text-sm text-[var(--ink-soft)] font-semibold -mt-2">
          Plant your first farm
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="soft-outline rounded-2xl px-3 py-2 bg-[var(--bg)] outline-none focus:ring-2 focus:ring-[var(--leaf)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="soft-outline rounded-2xl px-3 py-2 bg-[var(--bg)] outline-none focus:ring-2 focus:ring-[var(--leaf)]"
          />
          <span className="text-[11px] text-[var(--ink-soft)]">At least 8 characters</span>
        </div>

        {error && <p className="text-sm text-[var(--berry)] font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bubble-btn py-2 text-sm disabled:opacity-60"
          style={{ background: "var(--sun)" }}
        >
          {submitting ? "Planting…" : "Create account"}
        </button>

        <p className="text-center text-sm text-[var(--ink-soft)]">
          Already have a farm?{" "}
          <Link href="/login" className="font-bold underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
