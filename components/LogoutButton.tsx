"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-full border border-line px-3 py-1.5 text-sm text-muted transition hover:border-ink/30 hover:text-ink"
    >
      登出
    </button>
  );
}
