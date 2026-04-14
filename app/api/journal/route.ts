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
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const { id, title, content } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existingEntry = await Journal.findById(id);
    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Initialize history if it doesn't exist
    if (!existingEntry.history) {
      existingEntry.history = [];
    }

    // Push current state to history before updating
    existingEntry.history.push({
      title: existingEntry.title,
      content: existingEntry.content,
      editedAt: existingEntry.updatedAt || existingEntry.createdAt || new Date()
    });

    existingEntry.title = title;
    existingEntry.content = content;
    
    await existingEntry.save();
    return NextResponse.json(existingEntry);
  } catch (err: any) {
    console.error("Journal Update Error:", err);
    return NextResponse.json({ error: err.message || "Failed to update journal entry" }, { status: 400 });
  }
}
