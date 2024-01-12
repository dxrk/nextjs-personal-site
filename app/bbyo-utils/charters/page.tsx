"use client";

import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import Link from "next/link";

export default function ChartersUtil() {
  const [form, setForm] = useState({
    charterType: "Permanent",
    order: "AZA",
    names: "",
    chapterName: "",
    communityName: "",
  });

  const { toast } = useToast();

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const { order, names, communityName, charterType, chapterName } = form;
    generateCharter(order, names, communityName, charterType, chapterName);
  };

  async function generateCharter(
    order: string,
    memberList: string,
    community: string,
    charter: string,
    chapter: string
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
      const res = await fetch(
        "https://bbyo-utils-server-53df6626a01b.herokuapp.com/api/charters/generate-charter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberList,
            chapter,
            community,
            charter: charterType,
          }),
        }
      );

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
        const a = document.createElement("a");
        a.href = url;
        a.download = `${chapter}-${charter}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
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
              <Button
                name="generate"
                className="w-full py-2 px-4 text-center uppercase rounded bg-black text-white focus:outline-none"
                type="submit"
              >
                Generate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
