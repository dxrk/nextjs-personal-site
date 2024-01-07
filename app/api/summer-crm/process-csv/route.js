import { NextResponse } from "next/server";
import multer from "multer";
import { processCSVInBackground } from "../Airtable";
import fields from "../fields.json";

import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const getMongoCollection = async (collectionName) => {
  await client.connect();
  const database = client.db("bbyo");
  const collection = database.collection(collectionName);
  return collection;
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

    // Create buffer from file, which is a File object, not a Buffer object
    const buffer = Buffer.from(await file.arrayBuffer());

    const collection = await getMongoCollection("storage");
    processCSVInBackground(buffer, fields, collection);

    return NextResponse.json({ message: "Processing started..." });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}
