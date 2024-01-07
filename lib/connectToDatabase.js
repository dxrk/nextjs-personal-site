import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;
const options = {};
let client;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

export async function connectToDatabase() {
  try {
    if (client) {
      return client;
    }
    client = await new MongoClient(uri, options).connect();
    console.log("Connected to MongoDB");
    return { client };
  } catch (error) {
    console.error("Error:", error);
  }
}
