import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models";

export async function GET() {
  try {
    await dbConnect();
    const messages = await Message.find({}).sort({ createdAt: -1 });
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const message = await Message.create(data);
    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 400 });
  }
}
