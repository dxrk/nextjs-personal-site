"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format, set } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import React from "react";

let html2pdf: (
  arg0: HTMLDivElement,
  arg1: {
    margin: number;
    filename: string;
    image: { type: string; quality: number };
    html2canvas: {
      scale: number;
      // Set border to 0 to remove the border
      border: number;
    };
    jsPDF: {
      unit: string;
      format: number[]; // Width and height in millimeters
      orientation: string;
    };
  }
) => Promise<any>;
if (typeof window !== "undefined") {
  html2pdf = require("html2pdf.js");
}

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://bbyo-utils-server-53df6626a01b.herokuapp.com"
    : "http://localhost:8080";

export default function ChartersUtil() {
  const [form, setForm] = useState({
    charterType: "Permanent",
    order: "AZA",
    names: "",
    chapterName: "",
    communityName: "",
    date: "",
  });

  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const [showPreview, setShowPreview] = useState(false);

  const [charterImage, setCharterImage] = useState("");

  const { toast } = useToast();

  const [override, setOverride] = useState({
    columns: NaN,
    yPosition: NaN,
    fontSize: NaN,
  });

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const { order, names, communityName, charterType, chapterName } = form;

    generateCharter(
      order,
      names,
      communityName,
      charterType,
      chapterName,
      date,
      override
    );
  };

  async function generateCharter(
    order: string,
    memberList: string,
    community: string,
    charter: string,
    chapter: string,
    date: Date | undefined,
    override?: { columns: number; yPosition: number; fontSize: number }
  ) {
    toast({
      title: "Generating Charter...",
      description: `Generating ${order} ${charter} charter for ${chapter}...`,
    });

    // block button from being pressed
    const button = document.getElementsByName(
      "generate"
    )[0] as HTMLButtonElement;
    button.disabled = true;

    const charterType = `${order} ${charter} Charter Template`;
    try {
      const res = await fetch(API_URL + "/api/charters/generate-charter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberList,
          chapter,
          community,
          charter: charterType,
          date,
          override,
        }),
      });

      if (res.status !== 200) {
        if (res.status === 204) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Please fill out all fields.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "There was an error generating your charter.",
          });
        }
      } else {
        toast({
          title: "Charter Generated!",
          description: "Your charter has been generated.",
        });

        const image = await res.blob();
        const url = URL.createObjectURL(image);

        // Convert the image to a PDF using html2pdf
        const containerDiv = document.createElement("div");
        const imgElement = document.createElement("img");
        imgElement.src = url;
        containerDiv.appendChild(imgElement);

        setShowPreview(true);
        setCharterImage(url);
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error generating your charter.",
      });
    }

    button.disabled = false;
  }

  async function downloadPdf(charterType: string) {
    if (html2pdf) {
      const containerDiv = document.createElement("div");
      const imgElement = document.createElement("img");
      let format = charterType.includes("Temporary")
        ? [255, 420.3]
        : [330, 510];
      toast({
        title: "Downloading Charter...",
        description: `Downloading ${form.chapterName} ${form.charterType} charter...`,
      });
      imgElement.src = charterImage;
      containerDiv.appendChild(imgElement);

      const pdfOptions = {
        margin: 0,
        filename: `${form.chapterName}-${form.charterType}.pdf`,
        image: { type: "png", quality: 1 },
        html2canvas: {
          scale: 1.2,
          // Set border to 0 to remove the border
          border: 0,
        },
        jsPDF: {
          unit: "mm",
          format,
          orientation: "portrait",
        },
      };

      html2pdf(containerDiv, pdfOptions);
    }
  }

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
                Automated Chapter Charters Utility
              </h2>
            </div>
            <Link href="/bbyo-utils">
              <Button>Back</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="charterType"
              >
                Charter Type:
              </label>
              <RadioGroup
                defaultValue="Permanent"
                onValueChange={(value) =>
                  setForm({ ...form, charterType: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Permanent" id="permanent-charter" />
                  <Label htmlFor="permanent-charter">Permanent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Temporary" id="temporary-charter" />
                  <Label htmlFor="temporary-charter">Temporary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Celebratory"
                    id="celebratory-charter"
                  />
                  <Label htmlFor="celebratory-charter">Celebratory</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="charterType"
              >
                Order:
              </label>
              <RadioGroup
                defaultValue="AZA"
                onValueChange={(value) => setForm({ ...form, order: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="AZA" id="aza-option" />
                  <Label htmlFor="aza-option">AZA</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BBG" id="bbg-option" />
                  <Label htmlFor="bbg-option">BBG</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BBYO" id="bbyo-option" />
                  <Label htmlFor="bbyo-option">BBYO</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="names"
              >
                Names:
              </label>
              <textarea
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                id="names"
                placeholder="Enter names..."
                rows={15}
                name="names"
                value={form.names}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="chapterName"
              >
                Chapter Name:
              </label>
              <input
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                id="chapterName"
                placeholder="Enter chapter name..."
                type="text"
                name="chapterName"
                value={form.chapterName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="communityName"
              >
                Community Name:
              </label>
              <input
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                id="communityName"
                placeholder="Enter community name..."
                type="text"
                name="communityName"
                value={form.communityName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="communityName"
              >
                Choose a Date:
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                    }}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* <Separator /> */}
            <div>
              <Button
                name="generate"
                className="w-full py-2 px-4 text-center uppercase rounded bg-black text-white focus:outline-none"
                type="submit"
              >
                Generate
              </Button>
            </div>
          </form>
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center">
                  Charter Preview
                </DialogTitle>
              </DialogHeader>
              <Separator className="" />
              <p className="flex text-center justify-center text-sm text-gray-500 p-2 select-none">
                Add microadjustments to the spacing on the charter before
                downloading. Y-Position correlates to the vertical position of
                the names. Columns correlates to the number of columns for the
                names. Font Size correlates to the size of the names.
              </p>
              <div className="flex space-x-4 justify-center items-center select-none">
                <Label htmlFor="y-position">Y-Position</Label>
                <Input
                  id="y-position"
                  type="number"
                  min={-1000}
                  max={1000}
                  defaultValue={0}
                  className="w-20"
                  onChange={(e) => {
                    setOverride((prev) => ({
                      ...prev,
                      yPosition: parseFloat(e.target.value),
                    }));
                  }}
                />

                <Label htmlFor="columns">Columns</Label>
                <Input
                  id="columns"
                  type="number"
                  min={1}
                  max={10}
                  className="w-20"
                  defaultValue={override.columns}
                  onChange={(e) => {
                    setOverride((prev) => ({
                      ...prev,
                      columns: parseInt(e.target.value),
                    }));
                  }}
                />

                <Label htmlFor="font-size">Font Size</Label>
                <Input
                  id="font-size"
                  type="number"
                  min={1}
                  max={100}
                  className="w-20"
                  defaultValue={override.fontSize}
                  onChange={(e) => {
                    setOverride((prev) => ({
                      ...prev,
                      fontSize: parseFloat(e.target.value),
                    }));
                  }}
                />
              </div>

              <div className="flex items-center justify-center p-3">
                <Image
                  src={charterImage}
                  alt="Charter Preview"
                  width={330}
                  height={510}
                />
              </div>
              <Separator className="m-2" />
              {/* button to regenerate */}
              <Button
                className="w-full mb-2"
                onClick={() =>
                  generateCharter(
                    form.order,
                    form.names,
                    form.communityName,
                    form.charterType,
                    form.chapterName,
                    date,
                    override
                  )
                }
              >
                Regenerate
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => downloadPdf(form.charterType)}
              >
                Download
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </main>
  );
}
