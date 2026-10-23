import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import Logo from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";
import { scenarios } from "@/lib/scenarios";

export default function LandingPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden">
      {/* 背景光暈 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/25 via-accent-2/15 to-transparent blur-3xl"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <Suspense fallback={<NavActions loggedIn={false} />}>
          <NavActionsWithUser />
        </Suspense>
      </header>

      <main className="relative z-10">
        <Hero />
        <ScenarioStrip />
        <HowItWorks />
        <Features />
        <FinalCta />
      </main>

      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row">
          <Logo />
          <p>在真實情境裡，把英文說出口。</p>
        </div>
      </footer>
    </div>
  );
}

async function NavActionsWithUser() {
  await connection();
  const user = await getCurrentUser();
  return <NavActions loggedIn={Boolean(user)} />;
}

function NavActions({ loggedIn }: { loggedIn: boolean }) {
  if (loggedIn) {
    return (
      <Link
        href="/practice"
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition hover:opacity-85"
      >
        進入練習 →
      </Link>
    );
  }
  return (
    <nav className="flex items-center gap-2">
      <Link href="/login" className="rounded-full px-4 py-2.5 text-sm font-medium text-muted transition hover:text-ink">
        登入
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition hover:opacity-85"
      >
        免費註冊
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur">
          <span className="size-1.5 rounded-full bg-good" />
          8 種真實情境 · AI 即時陪練
        </p>
        <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Speak English
          <br />
          <span className="italic text-accent">like you mean it.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          跟 AI 角色扮演，在點餐、面試、機場、會議裡開口說英文。
          每一句話都能一鍵糾正文法、看到更道地的完整說法，練過的一切都幫你記下來。
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-7 py-3.5 font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
          >
            免費註冊，開始練習
          </Link>
          <Link href="/login" className="rounded-full px-5 py-3.5 font-medium text-ink transition hover:bg-surface-2">
            我已經有帳號
          </Link>
        </div>
      </div>

      <ChatPreview />
    </section>
  );
}

// 產品畫面示意（靜態）
function ChatPreview() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/10 to-accent-2/10 blur-xl" />
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl shadow-black/5">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="grid size-10 place-items-center rounded-2xl bg-surface-2 text-xl">🍽️</span>
          <div>
            <p className="text-sm font-semibold">點餐</p>
            <p className="text-xs text-muted">AI 扮演餐廳服務生</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-good">
            <span className="size-1.5 rounded-full bg-good" /> 對話中
          </span>
        </div>
        <div className="space-y-4 p-5">
          <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-surface-2 px-4 py-3 text-[15px]">
            Hi there! Welcome in. Are you ready to order, or would you like a few more minutes?
          </div>
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-to-br from-accent to-accent-2 px-4 py-3 text-[15px] text-white">
            I want a table for two and what is your recommend?
          </div>
          <div className="ml-auto max-w-[85%] rounded-2xl border border-line bg-warn-soft/60 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-warn">文法糾正</p>
            <p className="mt-2">
              what is your <span className="text-bad line-through">recommend</span>{" "}
              <span className="font-semibold text-good">recommendation</span>?
            </p>
            <p className="mt-1 text-xs text-muted">recommend 是動詞，這裡要用名詞 recommendation。</p>
          </div>
          <div className="ml-auto max-w-[85%] rounded-2xl border border-line bg-good-soft/60 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-good">更好的說法</p>
            <p className="mt-2 font-medium">“Could we get a table for two, please? What do you recommend?”</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioStrip() {
  return (
    <section className="border-y border-line bg-surface/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <p className="text-center text-sm text-muted">從生活到職場，挑一個場景就能開始</p>
        <ul className="mt-6 flex flex-wrap justify-center gap-3">
          {scenarios.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm shadow-sm"
            >
              <span className="text-lg">{s.emoji}</span>
              {s.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const steps = [
  { title: "選一個場景", body: "點餐、面試、機場、戀人……AI 會換上對應的角色，先開口問你第一句。" },
  { title: "用英文回答", body: "像真的在對話一樣回覆，AI 會依你的內容接話，讓對話一直延續下去。" },
  { title: "一鍵變得更好", body: "在自己的句子下方按「糾正文法」或「更好的完整回答」，立刻知道下次怎麼說。" },
];

function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24">
      <SectionTitle eyebrow="How it works" title="三個步驟，把英文說出口" />
      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-3xl border border-line bg-surface p-7">
            <span className="font-serif text-5xl italic text-accent">0{i + 1}</span>
            <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const features = [
  {
    icon: "✏️",
    title: "精準的文法糾正",
    body: "標出每一個錯誤，告訴你錯在哪、為什麼，用繁體中文解釋，一看就懂。",
    tone: "bg-warn-soft",
  },
  {
    icon: "💡",
    title: "更道地的完整回答",
    body: "把你想說的話，改寫成母語者會說的版本，再多給你兩種不同說法。",
    tone: "bg-good-soft",
  },
  {
    icon: "📚",
    title: "練過的都會留下",
    body: "每一場對話和糾錯都存在你的帳號裡，隨時回來複習，只有你自己看得到。",
    tone: "bg-accent-soft",
  },
];

function Features() {
  return (
    <section className="bg-surface-2/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-24">
        <SectionTitle eyebrow="Why it works" title="不只是聊天，是有回饋的練習" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-3xl border border-line bg-surface p-7">
              <span className={`grid size-12 place-items-center rounded-2xl text-2xl ${f.tone}`}>{f.icon}</span>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-center text-canvas sm:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-gradient-to-br from-accent to-accent-2 opacity-40 blur-3xl"
        />
        <h2 className="relative font-serif text-4xl leading-tight sm:text-5xl">
          今天，就說出第一句。
        </h2>
        <p className="relative mx-auto mt-4 max-w-md opacity-70">註冊只要 30 秒，馬上開始你的第一場英文對話。</p>
        <Link
          href="/register"
          className="relative mt-8 inline-block rounded-full bg-canvas px-8 py-3.5 font-medium text-ink transition hover:-translate-y-0.5"
        >
          免費註冊
        </Link>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="font-serif text-lg italic text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}
