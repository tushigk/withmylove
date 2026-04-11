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

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const username = searchParams.get("username");

    if (!id || !username) {
      return NextResponse.json({ error: "Missing id or username" }, { status: 400 });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.uploader !== username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Photo.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}

