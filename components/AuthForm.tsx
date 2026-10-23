"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

type Props = { mode: "login" | "register" };

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/practice");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "發生錯誤");
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-line bg-canvas px-4 py-3 outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-accent/10";

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/20 via-accent-2/10 to-transparent blur-3xl"
      />
      <header className="relative mx-auto w-full max-w-6xl px-5 py-5">
        <Logo />
      </header>

      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-20">
        <div className="rounded-3xl border border-line bg-surface p-8 shadow-2xl shadow-black/5">
          <p className="font-serif text-lg italic text-accent">{isRegister ? "Welcome" : "Welcome back"}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {isRegister ? "建立你的帳號" : "登入繼續練習"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isRegister ? "註冊後就能開始跟 AI 用英文對話。" : "你的練習紀錄和糾錯紀錄都在這裡等你。"}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {isRegister && (
              <label className="block">
                <span className="text-sm font-medium">名稱</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="怎麼稱呼你？"
                  required
                />
              </label>
            )}
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">密碼</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder={isRegister ? "至少 8 個字元" : "輸入密碼"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={isRegister ? 8 : undefined}
                required
              />
            </label>

            {error && (
              <p className="rounded-xl border border-bad/20 bg-bad/5 px-4 py-3 text-sm text-bad">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-2 py-3.5 font-medium text-white shadow-lg shadow-accent/25 transition hover:shadow-xl hover:shadow-accent/30 disabled:opacity-60"
            >
              {submitting ? "處理中…" : isRegister ? "註冊並開始練習" : "登入"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {isRegister ? "已經有帳號？" : "還沒有帳號？"}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-medium text-accent hover:underline"
          >
            {isRegister ? "登入" : "免費註冊"}
          </Link>
        </p>
      </main>
    </div>
  );
}
