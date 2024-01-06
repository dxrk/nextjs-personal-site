import { NextResponse } from "next/server";
import storageFile from "@/app/api/storage.json";

export async function GET() {
  if (!storageFile.finishedChecking) {
    return NextResponse.json(
      {
        message: "Airtable checked successfully",
        totalRecords: storageFile.lastTotal,
        totalChecked: storageFile.totalChecked,
        finishedChecking: storageFile.finishedChecking,
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      {
        message: "Airtable processed successfully",
        updatedRecords: storageFile.updatedRecords,
        newRecords: storageFile.newRecords,
        totalRecords: storageFile.lastTotal,
        totalChanges: storageFile.totalChanges,
        finishedChecking: storageFile.finishedChecking,
      },
      { status: 200 }
    );
  }
}
