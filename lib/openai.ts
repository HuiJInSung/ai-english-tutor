import type { Scenario } from "@/lib/scenarios";

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// 呼叫 OpenAI，要求回傳 JSON 物件並解析
async function callOpenAIJson<T>(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("請在 .env.local 設定 OPENAI_API_KEY");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API 錯誤 (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  return JSON.parse(content) as T;
}

function buildSystemPrompt(scenario: Scenario, level: string) {
  return `${scenario.persona}

You are helping a Taiwanese learner practice spoken English through role-play.
Rules:
- Stay in character and reply only in English.
- The learner's level is "${level}". Adjust vocabulary and sentence length to fit.
- Keep each reply short: 1-3 sentences.
- End every reply with a question so the conversation keeps going.
- Do not correct the learner's mistakes here; just respond naturally.
- Respond with a JSON object: {"reply": "<your reply>"}`;
}

// 依情境人設產生 AI 的下一句回應；history 為空時產生開場問題
export async function generateReply(
  scenario: Scenario,
  level: string,
  history: ChatMessage[]
): Promise<string> {
  const parsed = await callOpenAIJson<{ reply?: string }>([
    { role: "system", content: buildSystemPrompt(scenario, level) },
    ...(history.length > 0
      ? history
      : [{ role: "user" as const, content: "(Start the conversation with your first question.)" }]),
  ]);

  if (!parsed.reply) {
    throw new Error("OpenAI 回應格式不正確");
  }

  return parsed.reply.trim();
}

export type GrammarResult = {
  hasErrors: boolean;
  correctedText: string;
  issues: { original: string; corrected: string; explanation: string }[];
};

// 檢查使用者這句英文的文法
export async function checkGrammar(
  sentence: string,
  previousQuestion: string
): Promise<GrammarResult> {
  const result = await callOpenAIJson<GrammarResult>([
    {
      role: "system",
      content: `You are an English grammar teacher for Taiwanese learners.
Check the learner's sentence for grammar, spelling, word choice, and punctuation mistakes.
Only fix real mistakes; keep the learner's meaning and wording as much as possible.
Write every "explanation" in Traditional Chinese (繁體中文), short and easy to understand.
Respond with a JSON object:
{
  "hasErrors": boolean,
  "correctedText": "<the full corrected sentence, or the original if no errors>",
  "issues": [{"original": "<wrong part>", "corrected": "<fixed part>", "explanation": "<why>"}]
}`,
    },
    {
      role: "user",
      content: `The conversation partner asked: "${previousQuestion}"\nThe learner replied: "${sentence}"`,
    },
  ]);

  return {
    hasErrors: Boolean(result.hasErrors),
    correctedText: result.correctedText ?? sentence,
    issues: Array.isArray(result.issues) ? result.issues : [],
  };
}

export type BetterAnswerResult = {
  betterAnswer: string;
  alternatives: string[];
  explanation: string;
};

// 給使用者一個更完整、更自然的回答
export async function suggestBetterAnswer(
  scenario: Scenario,
  sentence: string,
  previousQuestion: string
): Promise<BetterAnswerResult> {
  const result = await callOpenAIJson<BetterAnswerResult>([
    {
      role: "system",
      content: `You are an English speaking coach for Taiwanese learners.
Scenario: ${scenario.persona}
Rewrite the learner's reply into a more complete, natural answer that a fluent speaker would say in this situation.
Keep the learner's original intention. The better answer should be 1-3 sentences.
Also give 2 other natural ways to say it.
Write "explanation" in Traditional Chinese (繁體中文), explaining what was improved and useful phrases to remember.
Respond with a JSON object:
{
  "betterAnswer": "<improved answer>",
  "alternatives": ["<another way>", "<another way>"],
  "explanation": "<why it is better>"
}`,
    },
    {
      role: "user",
      content: `The conversation partner asked: "${previousQuestion}"\nThe learner replied: "${sentence}"`,
    },
  ]);

  return {
    betterAnswer: result.betterAnswer ?? "",
    alternatives: Array.isArray(result.alternatives) ? result.alternatives : [],
    explanation: result.explanation ?? "",
  };
}
