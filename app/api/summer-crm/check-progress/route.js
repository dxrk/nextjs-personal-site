import { NextResponse } from "next/server";
const { getMongoCollection, fetchFromMongo } = require("../MongoDB");

export async function GET() {
  const collection = await getMongoCollection("storage");
  let storageFile = await fetchFromMongo(collection);

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
    if (storageFile.totalChanges === 0) {
      return NextResponse.json(
        {
          message: "Airtable checked successfully",
          totalRecords: storageFile.lastTotal,
          totalChecked: storageFile.totalChecked,
          finishedChecking: false,
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        message: "Airtable processed successfully",
        updatedRecords: storageFile.updatedRecords,
        newRecords: storageFile.newRecords,
        totalRecords: storageFile.lastTotal,
        totalChanges:
          storageFile.updatedRecords.length + storageFile.newRecords.length,
        finishedChecking: true,
      },
      { status: 200 }
    );
  }
}
