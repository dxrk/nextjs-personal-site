import { NextResponse } from "next/server";
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

const saveToMongo = async (collection, data) => {
  await collection.updateOne(
    { _id: new ObjectId(process.env.OBJECT_ID) },
    { $set: data },
    { upsert: true }
  );
};

const fetchFromMongo = async (collection) => {
  const document = await collection.findOne({
    _id: new ObjectId(process.env.OBJECT_ID),
  });
  return document;
};

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
