import { NextResponse } from "next/server";
const {
  getMongoCollection,
  fetchFromMongo,
  saveToMongo,
} = require("../MongoDB");

export async function POST() {
  const collection = await getMongoCollection("storage");
  const storageFile = await fetchFromMongo(collection);

  try {
    await saveToMongo(collection, {
      lastTotal: storageFile.lastTotal,
      updatedRecords: [],
      newRecords: [],
      totalChecked: 0,
      finishedChecking: false,
    });

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
