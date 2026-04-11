import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    // Check if user exists
    let user = await User.findOne({ username: username.toLowerCase() });

    // Seed users if DB is empty for convenience
    if (!user) {
      if (username.toLowerCase() === "tushig" && password === "0326") {
        user = await User.create({ username: "tushig", password: "0326" });
      } else if (username.toLowerCase() === "anujin" && password === "0911") {
        user = await User.create({ username: "anujin", password: "0911" });
      }
    }

    if (user && user.password === password) {
      return NextResponse.json({ success: true, username: user.username });
    }

    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  } catch (err: unknown) {
    console.error("Login Error:", err);
    const error = err as Error;
    return NextResponse.json({ 
      error: "Login failed", 
      details: error.message 
    }, { status: 500 });
  }
}
