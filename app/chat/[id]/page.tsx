import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import ChatRoom from "@/components/ChatRoom";
import { requireUser } from "@/lib/auth";
import { getFeedbackByMessage } from "@/lib/corrections";
import { connectDB } from "@/lib/mongodb";
import { getScenario } from "@/lib/scenarios";
import { Conversation } from "@/models/Conversation";

export default function ChatPage({ params }: PageProps<"/chat/[id]">) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">載入中…</p>}>
      <ChatLoader params={params} />
    </Suspense>
  );
}

async function ChatLoader({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await connectDB();
  // 只找得到自己的對話，別人的一律當作不存在
  const conversation = await Conversation.findOne({ _id: id, userId: user.id }).lean();
  const scenario = conversation && getScenario(conversation.scenario);
  if (!conversation || !scenario) notFound();

  const messages = conversation.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      id: m._id.toString(),
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const feedback = await getFeedbackByMessage(user.id, id);

  return (
    <ChatRoom
      conversationId={id}
      scenarioName={scenario.name}
      scenarioEmoji={scenario.emoji}
      initialMessages={messages}
      initialFeedback={feedback}
    />
  );
}
