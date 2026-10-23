import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// 一場練習中的單則訊息（內嵌在 Conversation 裡）
const messageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
    // 這則使用者訊息是否套用了某個糾錯建議（對應 Correction._id）
    appliedCorrectionId: { type: Schema.Types.ObjectId, ref: "Correction" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// 一場完整的練習對話
const conversationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "" },
    // 練習情境，例如 "餐廳點餐"、"工作面試"
    scenario: { type: String, default: "" },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    messages: { type: [messageSchema], default: [] },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

export type ConversationDoc = InferSchemaType<typeof conversationSchema>;

export const Conversation: Model<ConversationDoc> =
  models.Conversation || model("Conversation", conversationSchema);
