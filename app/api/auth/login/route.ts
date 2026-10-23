import { createSession, verifyPassword } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "請填寫 Email 和密碼" }, { status: 400 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ email });
    // 不透露是帳號不存在還是密碼錯誤
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return Response.json({ error: "Email 或密碼錯誤" }, { status: 401 });
    }

    await createSession(user._id.toString());
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "登入失敗，請稍後再試" }, { status: 500 });
  }
}
