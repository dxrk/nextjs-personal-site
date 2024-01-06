// pages/api/charters/summer-crm/process-csv/route.js

import { NextResponse } from "next/server";
import multer from "multer";
import { processCSVInBackground } from "../Airtable";
import fields from "../fields.json";

const upload = multer();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("csv");
    upload.single("csv")(request, {}, async (err) => {
      if (err) {
        console.error("Error:", err);
        return NextResponse.json(
          { message: "Upload failed", error: err },
          { status: 500 }
        );
      }
    });

    processCSVInBackground(file, fields);

    return NextResponse.json({ message: "Processing started..." });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}
