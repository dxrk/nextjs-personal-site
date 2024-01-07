import { NextResponse } from "next/server";
const { connectToDatabase } = require("@/lib/connectToDatabase");

const getMongoCollection = async (collectionName) => {
  const { client } = await connectToDatabase();
  const database = client.db("bbyo");
  const collection = database.collection(collectionName);
  return collection;
};

const saveToMongo = async (collection, data) => {
  await collection.updateOne(
    { _id: new ObjectId(process.env.OBJECT_ID) },
    { $set: data },
    { upsert: true }
  );
};

export async function POST(request) {
  try {
    const collection = await getMongoCollection("storage");

    const body = await request.json();
    await saveToMongo(collection, body);
    return NextResponse.json(
      { message: "Storage updated successfully!" },
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
