import { NextRequest, NextResponse } from "next/server";
import { generateSvg, generateJpg } from "./GenerateCharters"; // Adjust the path accordingly
import { promises as fs } from "fs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { memberList, charter, chapter, community } = body;
    if (
      memberList === "" ||
      charter === "" ||
      chapter === "" ||
      community === "" ||
      !memberList ||
      !charter ||
      !chapter ||
      !community
    ) {
      return NextResponse.json(
        { message: "Please fill out all fields." },
        { status: 403 }
      );
    }
    const svg = generateSvg(memberList, chapter, community, charter);
    const jpg = await generateJpg(svg, charter, chapter, process.cwd());

    // Read the file content
    const pathname = process.cwd() + `/public/${jpg}`;
    const fileContent = await fs.readFile(pathname);

    return new NextResponse(new Blob([fileContent], { type: "image/jpeg" }), {
      status: 200,
      headers: new Headers({
        "content-disposition": `attachment; filename=${jpg}`,
        "content-type": "image/jpeg",
      }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Internal Server Error", error: e },
      { status: 500 }
    );
  }
}
