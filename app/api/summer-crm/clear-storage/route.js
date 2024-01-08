import { NextResponse } from "next/server";
import storageFile from "@/app/api/storage.json";

export async function POST() {
  try {
    storageFile.updatedRecords = [];
    storageFile.newRecords = [];
    storageFile.totalChanges = 0;
    storageFile.totalChecked = 0;
    storageFile.finishedChecking = false;
    fs.writeFileSync(
      process.cwd() + "/app/api/storage.json",
      JSON.stringify(storageFile)
    );

    return NextResponse.json(
      { message: "Storage cleared successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}
