// TODO: Figure out error when going on to home page

"use client";

import { CardHeader, CardContent, Card } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toolsData } from "./toolsData";

export default function Home(this: any) {
  return (
    <main className="container mx-auto p-6 select-none">
      <Card className="bg-gray-100 shadow-lg rounded-lg px-6 py-4">
        <CardHeader className="mb-4">
          <div className="flex items-center">
            <Image
              src="/bbyo-logo.png"
              alt="BBYO Logo"
              width={40}
              height={40}
            />
            <h2 className="text-3xl font-bold text-gray-800 px-4">
              FY24 BBYO Utilities
            </h2>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 ">
          <div className="container mx-auto py-8 px-4 md:px-6">
            <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {toolsData.map((tool) => (
                <li key={tool.route}>
                  <Link href={tool.route}>
                    <div className="group block p-4 rounded-lg bg-white shadow-md dark:bg-gray-900 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                      <h3 className="text-lg font-semibold mb-2">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
