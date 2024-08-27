"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ExecsUtilPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">BBYO Execs Utilities</h1>
      <div className="flex flex-col space-y-4">
        <Link href="/bbyo-utils/execs/movement-launch">
          <Button className="w-full">Movement Launch</Button>
        </Link>
        <Link href="/bbyo-utils/execs/room-checks">
          <Button className="w-full">Room Checks</Button>
        </Link>
        <Link href="/bbyo/execs-map.png">
          <Button className="w-full">Marriott Hotel Map</Button>
        </Link>
      </div>
    </div>
  );
};

export default ExecsUtilPage;
