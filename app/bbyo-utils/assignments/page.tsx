"use client";

import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { JSX, SVGProps, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import * as FileSaver from "file-saver";
import { Separator } from "@/components/ui/separator";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { ArrowUpDown } from "lucide-react";

const API_URL = "https://bbyo-utils-server-53df6626a01b.herokuapp.com";
// const API_URL = "http://localhost:8080";

export type Assignment = {
  name: string;
  program: string;
};

export const columns: ColumnDef<Assignment>[] = [
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "name",
  },
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Program
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "program",
  },
];

export default function CRMUtil(this: any) {
  const { toast } = useToast();

  const [showProccessCSV, setShowProcessCSV] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [overrideTotalSpots, setOverrideTotalSpots] = useState(NaN);
  const [excludeChars, setExcludeChars] = useState(0);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

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

  const resetState = () => {
    // Reset state
    setCsvFile(null);
    setShowProcessCSV(false);

    // Reset file input
    const fileInput = document.getElementById("csvfile") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }

    // Reset assignments
    setAssignments([]);

    // Reset override total spots
    setOverrideTotalSpots(NaN);
    setExcludeChars(0);
  };

  const downloadTemplate = async () => {
    try {
      const res = await fetch("/assignments-template.csv");
      const blob = await res.blob();
      FileSaver.saveAs(blob, "assignments-template.csv");
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
        return;
      }

      // Display toast indicating CSV processing has started
      toast({
        variant: "default",
        title: "Processing CSV...",
        description: "Starting process, loading CSV file.",
      });

      setAssignments([]);

      // Disable the process button during processing
      const button = document.getElementsByName(
        "processCSV"
      )[0] as HTMLButtonElement;
      button.disabled = true;

      const formData = new FormData();
      formData.append("csv", csvFile as Blob);
      formData.append("excludeChars", excludeChars.toString());
      formData.append("overrideTotalSpots", overrideTotalSpots.toString());

      const res = await fetch(
        API_URL + "/api/assignments/generate-assignments",
        {
          method: "POST",
          body: formData,
        }
      );

      let data = await res.json();

      if (res.status !== 200) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message,
        });
        return;
      }

      setAssignments(data);

      toast({
        variant: "default",
        title: "Success",
        description: "Your assignments have been generated.",
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

  const downloadCsv = async () => {
    // create csv file
    let csv = "Name,Program\n";
    assignments.forEach((assignment) => {
      csv += `${assignment.name},${assignment.program}\n`;
    });

    const res = new Blob([csv], { type: "text/csv" });

    FileSaver.saveAs(res, "assignments.csv");

    toast({
      variant: "default",
      title: "CSV Downloaded",
      description: "CSV file was downloaded successfully.",
    });

    resetState();
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
                Assignments Utility
              </h2>
            </div>
            <Link href="/bbyo-utils">
              <Button>Back</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-600">
              The CSV file should begin with the{" "}
              <strong>Name/Indentifer</strong> first, followed by the{" "}
              <strong>Preferences</strong> in order from highest to lowest. This
              utility can only handle one program at a time. <br />{" "}
              <strong>
                <u>
                  Make sure the file is a CSV file (not XLXS) before uploading.
                </u>
              </strong>
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={downloadTemplate}>
              Download Template
            </Button>
            <div className="grid w-full items-center gap-1.5">
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
              <Separator className="mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                <strong>Override Total Spots</strong> will override the total
                number of spots per program.{" "}
                <u>
                  If left blank, the utility will evenly distribute the spots
                  for each program.
                </u>
                <br /> <strong>Exclude Characters</strong> will exclude the
                first <i>n</i> characters from program names. For example, if
                the programs are formatted with their preference number, for
                example,{" "}
                <i>
                  &quot;<u>3:</u> How to Represent Your Community/Chapter&quot;
                </i>
                , you can exclude the first 3 characters to remove the
                preference number, leaving it as{" "}
                <i>&quot;How to Represent Your Community/Chapter&quot;</i>.
              </p>
              <div className="flex flex-row gap-4 text-xs text-center items-center">
                <label htmlFor="override">Overide Total Spots</label>
                <Input
                  className="w-24"
                  id="override"
                  type="number"
                  defaultValue={NaN}
                  min={1}
                  onChange={(e) => setOverrideTotalSpots(+e.target.value)}
                />
                <label htmlFor="exclude">Exclude Characters</label>
                <Input
                  className="w-24"
                  id="exclude"
                  type="number"
                  defaultValue={0}
                  min={0}
                  onChange={(e) => setExcludeChars(+e.target.value)}
                />
                <Button
                  name="processCSV"
                  className="w-full bg-green-500 text-white"
                  variant="default"
                  onClick={processCSV}
                >
                  Generate Assignments for {csvFile?.name}
                  <BarChartIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {assignments.length > 0 && (
            <div>
              <Separator className="mb-4" />
              <div className="container mx-auto max-h-[36rem] overflow-y-auto">
                <DataTable columns={columns} data={assignments} />
              </div>
              <Separator className="mt-4" />
              <Button
                className="w-full bg-blue-500 text-white mt-4"
                onClick={async () => {
                  downloadCsv();
                }}
              >
                Download
              </Button>
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
