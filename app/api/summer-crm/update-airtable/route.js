import { NextResponse } from "next/server";
import { getTable } from "@/lib/Airtable";
const { MongoClient, ServerApiVersion } = require("mongodb");
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

const fetchFromMongo = async (collection) => {
  return collection.find().toArray();
};

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
