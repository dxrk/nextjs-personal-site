import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "portfolio");
    const files = fs
      .readdirSync(dir)
      .filter((file) => /\.(png|jpe?g|svg|webp)$/i.test(file));
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error reading portfolio directory:", error);
    return NextResponse.json([], { status: 500 });
  }
}
