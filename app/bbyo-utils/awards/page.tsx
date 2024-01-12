"use client";

import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { JSX, SVGProps, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import * as FileSaver from "file-saver";
import csv from "csv-parser";
import streamifier from "streamifier";
import { PDFDocument } from "pdf-lib";

declare const jsPDF: any;

export default function CRMUtil(this: any) {
  const { toast } = useToast();

  const [showProccessCSV, setShowProcessCSV] = useState(false);
  const [progress, setProgress] = useState(0);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const parseCSVBuffer = function (buffer: any) {
    return new Promise((resolve, reject) => {
      const results: any = [];

      // Using streamifier to create a readable stream from the buffer
      const stream = streamifier.createReadStream(buffer).pipe(csv());

      stream
        .on("data", (data: any) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (error: any) => reject(error));
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setShowProcessCSV(!!file);

    if (file) {
      setCsvFile(file);
      toast({
        variant: "default",
        title: `File Uploaded`,
        description: `${file.name} was uploaded successfully.`,
      });
    } else {
      return;
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await fetch("/awards-template.csv");
      const blob = await res.blob();
      FileSaver.saveAs(blob, "awards-template.csv");
      toast({
        variant: "default",
        title: "Template Downloaded",
        description: "Template was downloaded successfully.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error downloading the template.",
      });
    }
  };

  const processCSV = async () => {
    try {
      if (!csvFile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please upload a CSV file.",
        });
      }

      toast({
        variant: "default",
        title: "Processing CSV...",
        description: "Starting process, loading records (Might take a minute).",
      });

      const button = document.getElementsByName(
        "processCSV"
      )[0] as HTMLButtonElement;
      button.disabled = true;

      // parse csv file
      const buffer = csvFile ? Buffer.from(await csvFile.arrayBuffer()) : null;
      if (!buffer) throw new Error("Error parsing CSV.");

      const parsedCSV = (await parseCSVBuffer(buffer)) as any | null;
      if (!parsedCSV) throw new Error("Error parsing CSV.");

      // Alphabetize by Name
      parsedCSV.sort((a: any, b: any) =>
        a["Name"] > b["Name"] ? 1 : b["Name"] > a["Name"] ? -1 : 0
      );

      const images = [];
      setProgress(0);

      for (let i = 0; i < parsedCSV.length; i++) {
        const res = await fetch(
          "https://bbyo-utils-server-53df6626a01b.herokuapp.com/api/awards/generate-award",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: parsedCSV[i]["Name"],
              award: parsedCSV[i]["Award Type"],
              chapter: parsedCSV[i]["Chapter"],
              community: parsedCSV[i]["Community"],
            }),
          }
        );

        const image = await res.blob();
        images.push(image);

        setProgress((i / parsedCSV.length) * 100);
      }

      setProgress(95);

      // create multi page pdf of images
      const pdfDoc = await PDFDocument.create();

      // iterate through the images and add each one as a new page to the PDF
      for (const imageBlob of images) {
        // first convert the image blob to array buffer
        const imageBytes = await imageBlob.arrayBuffer();
        const image = await pdfDoc.embedJpg(imageBytes);
        const page = pdfDoc.addPage([3300, 2550]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: page.getWidth(),
          height: page.getHeight(),
        });
      }

      // save the PDF as a blob
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

      // optionally, you can download the PDF
      FileSaver.saveAs(pdfBlob, "awards.pdf");

      setProgress(100);
      toast({
        variant: "default",
        title: "Success",
        description: "Your awards have been generated.",
      });

      button.disabled = false;
    } catch (e) {
      console.log(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error processing the CSV.",
      });
    }
  };

  return (
    <main className="container mx-auto p-6 select-none">
      <Card className="bg-white shadow-lg rounded-lg px-6 py-4">
        <CardHeader className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/bbyo-logo.png"
                alt="BBYO Logo"
                width={40}
                height={40}
              />
              <h2 className="text-3xl font-bold text-gray-800 px-4">
                Awards Generation Utility
              </h2>
            </div>
            <Link href="/bbyo-utils">
              <Button>Back</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <h3 className="text font-bold text-gray-800 py-2">
              Make sure the file is a CSV file (not XLXS) before uploading.
            </h3>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={downloadTemplate}>
              Download Template
            </Button>
            <div className="grid w-full items-center gap-1.5">
              {/* <Label htmlFor="csvfile">CSV File</Label> */}
              <Input
                accept=".csv"
                id="csvfile"
                type="file"
                onChange={handleFileChange}
              />
            </div>
          </div>
          {showProccessCSV && (
            <div>
              <Button
                name="processCSV"
                className="w-full bg-blue-500 text-white"
                variant="default"
                onClick={processCSV}
              >
                Generate Awards
                <BarChartIcon className="ml-2 h-4 w-4" />
              </Button>
              <div className="relative pt-1 mt-3">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function BarChartIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}
