import { getCurrentUser, unauthorized } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { generateReply } from "@/lib/openai";
import { getScenario } from "@/lib/scenarios";
import { Conversation } from "@/models/Conversation";

// 建立一場新的練習，並由 AI 先問第一句
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { scenario: scenarioId } = await request.json();
  const scenario = getScenario(scenarioId);

  if (!scenario) {
    return Response.json({ error: "找不到這個練習場景" }, { status: 400 });
  }

  try {
    await connectDB();

    const conversation = new Conversation({
      userId: user.id,
      title: scenario.name,
      scenario: scenario.id,
    });
    const opening = await generateReply(scenario, conversation.level, []);
    conversation.messages.push({ role: "assistant", content: opening });
    await conversation.save();

    return Response.json({ conversationId: conversation._id.toString() });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "建立練習失敗，請稍後再試" }, { status: 500 });
  }
}
