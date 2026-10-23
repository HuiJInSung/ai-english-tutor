import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import type { BetterAnswerResult, GrammarResult } from "@/lib/openai";
import { Conversation } from "@/models/Conversation";
import { Correction, type CorrectionDoc } from "@/models/Correction";

// 前端顯示用：每則使用者訊息的文法糾錯與更好回答
export type MessageFeedback = {
  grammar?: GrammarResult;
  better?: BetterAnswerResult;
};

export function toGrammarResult(c: CorrectionDoc): GrammarResult {
  return {
    hasErrors: c.issues.length > 0,
    correctedText: c.correctedText,
    issues: c.issues.map((i) => ({
      original: i.original ?? "",
      corrected: i.corrected ?? "",
      explanation: i.explanation ?? "",
    })),
  };
}

export function toBetterAnswerResult(c: CorrectionDoc): BetterAnswerResult {
  return {
    betterAnswer: c.correctedText,
    alternatives: c.alternatives,
    explanation: c.explanation,
  };
}

// 找出使用者自己對話裡的那則訊息，以及它前面 AI 問的那句話
export async function findUserMessage(
  userId: string,
  conversationId: string,
  messageId: string
) {
  if (!isValidObjectId(conversationId) || !isValidObjectId(messageId)) return null;

  await connectDB();
  const conversation = await Conversation.findOne({ _id: conversationId, userId }).lean();
  if (!conversation) return null;

  const index = conversation.messages.findIndex((m) => m._id.toString() === messageId);
  const message = conversation.messages[index];
  if (!message || message.role !== "user") return null;

  const previousQuestion =
    conversation.messages
      .slice(0, index)
      .findLast((m) => m.role === "assistant")?.content ?? "";

  return { conversation, message, previousQuestion };
}

// 讀出整場練習已經產生過的回饋，依訊息 id 分組
export async function getFeedbackByMessage(userId: string, conversationId: string) {
  await connectDB();
  const corrections = await Correction.find({ userId, conversationId }).lean();

  const result: Record<string, MessageFeedback> = {};
  for (const c of corrections) {
    const key = c.messageId.toString();
    result[key] ??= {};
    if (c.type === "grammar") result[key].grammar = toGrammarResult(c);
    if (c.type === "expression") result[key].better = toBetterAnswerResult(c);
  }
  return result;
}
