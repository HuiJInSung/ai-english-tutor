import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// 針對使用者某一則訊息的糾錯 / 建議
const correctionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    // 被糾錯的那則訊息（Conversation.messages 裡的 _id）
    messageId: { type: Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      enum: ["grammar", "vocabulary", "spelling", "expression", "other"],
      default: "grammar",
    },
    originalText: { type: String, required: true },
    correctedText: { type: String, required: true },
    explanation: { type: String, default: "" },
    // 其他更自然的說法
    alternatives: { type: [String], default: [] },
    // 文法糾錯的每個錯誤點
    issues: {
      type: [
        {
          _id: false,
          original: String,
          corrected: String,
          explanation: String,
        },
      ],
      default: [],
    },

    // 使用者是否採用了這個建議
    applied: { type: Boolean, default: false },
    appliedAt: { type: Date },
    // 採用後重新送出的那則訊息
    appliedMessageId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

export type CorrectionDoc = InferSchemaType<typeof correctionSchema>;

export const Correction: Model<CorrectionDoc> =
  models.Correction || model("Correction", correctionSchema);
