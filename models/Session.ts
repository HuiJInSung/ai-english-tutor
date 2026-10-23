import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// 登入狀態。cookie 裡放隨機 token，資料庫只存它的 SHA-256 雜湊
const sessionSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  // 過期後由 MongoDB TTL index 自動刪除
  expiresAt: { type: Date, required: true, expires: 0 },
});

export type SessionDoc = InferSchemaType<typeof sessionSchema>;

export const Session: Model<SessionDoc> =
  models.Session || model("Session", sessionSchema);
