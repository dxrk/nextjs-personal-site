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

const fetchFromMongo = async (collection) => {
  const document = await collection.findOne({
    _id: new ObjectId(process.env.OBJECT_ID),
  });
  return document;
};

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
