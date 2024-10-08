"use server";
import { google } from "googleapis";

export async function getSheetData() {
  const glAuth = await google.auth.getClient({
    projectId: "bbyo-intern",
    credentials: {
      type: "service_account",
      project_id: process.env.PROJECT_ID,
      private_key_id: process.env.PRIVATE_KEY_ID,
      private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
      client_email: process.env.CLIENT_EMAIL,
      universe_domain: "googleapis.com",
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const glSheets = google.sheets({ version: "v4", auth: glAuth });

  const data = await glSheets.spreadsheets.values.get({
    spreadsheetId: "1L87rbXZyFzgExutgkNRRC5lvlkijKBJToxe8GPtV0K0",
    range: "FY25 Community Tracking!B3:I3",
  });

  return { data: data.data.values };
}
