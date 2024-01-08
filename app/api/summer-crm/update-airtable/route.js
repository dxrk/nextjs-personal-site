import { NextResponse } from "next/server";
import storageFile from "@/app/api/storage.json";
import { getTable } from "../Airtable";

export async function POST(request) {
  try {
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
