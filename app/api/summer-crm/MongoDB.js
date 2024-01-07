import { MongoClient, ServerApiVersion } from "mongodb";

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
    { _id: new ObjectId("659ad33a22699e5f101fe687") },
    { $set: data },
    { upsert: true }
  );
};

const fetchFromMongo = async (collection) => {
  const document = await collection.findOne({
    _id: new ObjectId("659ad33a22699e5f101fe687"),
  });
  return document;
};

export default { getMongoCollection, saveToMongo, fetchFromMongo };
