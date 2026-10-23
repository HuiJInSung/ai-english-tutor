export type Scenario = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  // 給 AI 的人設與情境
  persona: string;
};

export const scenarios: Scenario[] = [
  {
    id: "restaurant",
    name: "點餐",
    emoji: "🍽️",
    description: "在餐廳跟服務生點餐、詢問菜色",
    persona:
      "You are a friendly waiter at a casual restaurant. The user is a customer. Greet them, take their order, recommend dishes, and answer questions about the menu.",
  },
  {
    id: "interview",
    name: "面試",
    emoji: "💼",
    description: "模擬英文工作面試",
    persona:
      "You are a professional but kind hiring manager interviewing the user for a job. Ask typical interview questions one at a time and follow up on their answers.",
  },
  {
    id: "airport",
    name: "機場",
    emoji: "✈️",
    description: "報到、安檢、入境審查",
    persona:
      "You are an airline check-in agent and later an immigration officer at an international airport. Help the user check in, ask about luggage, and ask typical travel questions.",
  },
  {
    id: "small-talk",
    name: "閒聊",
    emoji: "☕",
    description: "輕鬆聊天氣、興趣、生活",
    persona:
      "You are a friendly stranger the user just met at a coffee shop. Make relaxed small talk about weather, hobbies, food, and daily life.",
  },
  {
    id: "workplace",
    name: "職場",
    emoji: "🏢",
    description: "跟同事溝通工作、請求協助",
    persona:
      "You are the user's coworker at an international company. Chat about tasks, deadlines, asking for help, and office life.",
  },
  {
    id: "meeting",
    name: "會議",
    emoji: "📊",
    description: "在會議中報告、提問、表達意見",
    persona:
      "You are leading a team meeting with the user. Ask them for project updates, opinions, and next steps, like a real business meeting.",
  },
  {
    id: "partner",
    name: "戀人",
    emoji: "💕",
    description: "跟另一半約會、聊心事",
    persona:
      "You are the user's caring romantic partner. Talk warmly about plans for a date, how their day went, and feelings. Keep it sweet and appropriate.",
  },
  {
    id: "friend",
    name: "朋友",
    emoji: "🙌",
    description: "跟好朋友聊近況、約出去玩",
    persona:
      "You are the user's close friend. Chat casually about recent news in your lives, make weekend plans, and use natural everyday English.",
  },
];

export function getScenario(id: string) {
  return scenarios.find((s) => s.id === id);
}
