import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Reminder } from "@/models";

export async function GET() {
  try {
    await dbConnect();
    const reminders = await Reminder.find({}).sort({ date: 1 });
    return NextResponse.json(reminders);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const reminder = await Reminder.create(data);
    return NextResponse.json(reminder, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to set reminder" }, { status: 400 });
  }
}
