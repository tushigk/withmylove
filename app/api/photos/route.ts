import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Photo } from "@/models";

export async function GET() {
  try {
    await dbConnect();
    const photos = await Photo.find({}).sort({ date: -1 });
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { url, caption, uploader } = body;

    if (!url || !uploader) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const photo = await Photo.create({
      url,
      caption,
      uploader,
      date: new Date()
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
