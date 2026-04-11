import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Mood } from "@/models";

export async function GET() {
  try {
    await dbConnect();
    // Fetch moods sorted by newest first. Limit higher to ensure we find user's latest.
    const moods = await Mood.find({}).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json(moods);
  } catch {
    return NextResponse.json({ error: "Failed to fetch moods" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Check if user already set mood today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const existingMood = await Mood.findOne({
      user: data.user,
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    if (existingMood) {
      return NextResponse.json({ error: "Already set mood today" }, { status: 400 });
    }

    const mood = await Mood.create(data);
    return NextResponse.json(mood, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to log mood" }, { status: 400 });
  }
}
