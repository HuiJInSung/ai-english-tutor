import Link from "next/link";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";
import type { CurrentUser } from "@/lib/auth";

const navLinks = [
  { href: "/practice", label: "開始練習" },
  { href: "/history", label: "練習紀錄" },
  { href: "/corrections", label: "糾錯紀錄" },
];

export default function AppHeader({ user }: { user: CurrentUser }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        <Logo href="/practice" />
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden text-sm sm:inline">{user.name}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
