import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Journal } from "@/models";

export async function GET() {
  try {
    await dbConnect();
    const entries = await Journal.find({}).sort({ date: -1 });
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const entry = await Journal.create(data);
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 400 });
  }
}
