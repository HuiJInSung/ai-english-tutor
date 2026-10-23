import { Suspense } from "react";
import AppHeader from "@/components/AppHeader";
import ScenarioPicker from "@/components/ScenarioPicker";
import { requireUser } from "@/lib/auth";

export default function PracticePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PracticeContent />
    </Suspense>
  );
}

async function PracticeContent() {
  const user = await requireUser();

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:py-16">
        <p className="font-serif text-lg italic text-accent">Hello, {user.name}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">今天想練習哪個場景？</h1>
        <p className="mt-3 text-muted">選一個場景，AI 會換上對應的角色，先開口問你第一句。</p>
        <ScenarioPicker />
      </main>
    </>
  );
}

function PageLoading() {
  return <p className="p-10 text-center text-muted">載入中…</p>;
}
