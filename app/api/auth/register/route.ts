import { createSession, hashPassword } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return Response.json({ error: "請填寫名稱、Email 和密碼" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Email 格式不正確" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "密碼至少需要 8 個字元" }, { status: 400 });
  }

  try {
    await connectDB();

    if (await User.exists({ email })) {
      return Response.json({ error: "這個 Email 已經註冊過了" }, { status: 409 });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
    });
    await createSession(user._id.toString());

    return Response.json({ ok: true });
  } catch (err) {
    // 同時送出兩次註冊時，由 unique index 擋下
    if ((err as { code?: number }).code === 11000) {
      return Response.json({ error: "這個 Email 已經註冊過了" }, { status: 409 });
    }
    console.error(err);
    return Response.json({ error: "註冊失敗，請稍後再試" }, { status: 500 });
  }
}
