import { NextResponse } from "next/server";
import { getTable } from "../Airtable";
const { getMongoCollection, fetchFromMongo } = require("../MongoDB");

export async function POST(request) {
  try {
    const collection = await getMongoCollection("storage");
    const storageFile = await fetchFromMongo(collection);

    const body = await request.json();
    const records = body.records;
    const table = getTable();

    if (body.updated) {
      await table.update(records);
    }

    if (body.new) {
      await table.create(records);
    }

    return NextResponse.json({
      message: `Airtable updated successfully for ${records.length} records`,
      records,
      totalRecords: storageFile.lastTotal,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}
