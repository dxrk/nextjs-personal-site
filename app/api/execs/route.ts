import { connectToMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection("execs");
    const execsData = await collection.find().toArray();

    // Convert MongoDB _id to string
    const formattedData = execsData.map((exec) => ({
      ...exec,
      _id: exec._id.toString(),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching from MongoDB:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { execId, fieldName, newStatus } = await request.json();
    const db = await connectToMongoDB();
    const collection = db.collection("execs");

    const result = await collection.updateOne(
      { _id: new ObjectId(execId) }, // Ensure ObjectId conversion
      { $set: { [fieldName]: newStatus } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No record was updated" },
        { status: 400 }
      );
    }

    const updatedRecord = await collection.findOne({
      _id: new ObjectId(execId),
    });

    return NextResponse.json({ success: true, updatedRecord });
  } catch (error) {
    console.error("Error updating MongoDB:", error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
