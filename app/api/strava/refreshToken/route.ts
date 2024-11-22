import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next/types";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
  });
}
