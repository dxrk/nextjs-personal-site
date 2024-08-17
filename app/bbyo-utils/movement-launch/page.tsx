"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { google } from "googleapis";
import { getSheetData } from "./gs-action";

interface LaunchItemProps {
  header?: string;
  value: number;
  color: string;
  footer?: string;
}

interface SheetsData {
  delegates: number;
  awards: number;
  iln: number;
  isf: number;
  cltc: number;
  iltc: number;
  kallah: number;
  ilsi: number;
}

const LaunchItem: React.FC<LaunchItemProps> = ({ value, color, footer }) => {
  const formattedValue = footer === "Total" ? `$${value}` : value.toString();

  return (
    <div>
      <motion.div
        className={`${color} text-black p-4 rounded`}
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="text-4xl font-bold mb-1 text-center"
          >
            {formattedValue}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      {footer && (
        <div className="text-center text-xl font-semibold mt-2">{footer}</div>
      )}
    </div>
  );
};

export default function MovementLaunch() {
  const [data, setData] = useState<SheetsData>({
    delegates: 0,
    awards: 0,
    iln: 0,
    isf: 0,
    cltc: 0,
    iltc: 0,
    kallah: 0,
    ilsi: 0,
  });

  useEffect(() => {
    async function getLaunchData() {
      try {
        const data = await getSheetData();

        if (data && data.data && data.data[0]) {
          setData({
            delegates: parseInt(data.data[0][0]),
            awards: parseInt(data.data[0][5]),
            iln: parseInt(data.data[0][6]),
            isf: parseInt(data.data[0][7]),
            cltc: parseInt(data.data[0][1]),
            iltc: parseInt(data.data[0][2]),
            kallah: parseInt(data.data[0][3]),
            ilsi: parseInt(data.data[0][4]),
          });
        } else {
          // Handle the case where data is undefined or  invalid
          setData({
            delegates: 0,
            awards: 0,
            iln: 0,
            isf: 0,
            cltc: 0,
            iltc: 0,
            kallah: 0,
            ilsi: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    // Initial fetch
    getLaunchData();

    // Fetch data every 15 seconds
    const intervalId = setInterval(getLaunchData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-blue-700 text-white p-8 font-sans min-h-screen">
      <div className="flex justify-between items-start mb-16">
        <h1 className="text-4xl font-bold">MOVEMENT LAUNCH TOTALS</h1>
        <div className="flex items-center space-x-2">
          <Image
            src={"/bbyo-100.png"}
            width={180}
            height={180}
            alt="BBYO Logo"
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-12">
        <div>
          <h2 className="text-3xl text-cyan-300 font-bold mb-4">IC 2024</h2>
          <LaunchItem
            footer="Delegates"
            value={data.delegates}
            color="bg-cyan-300"
          />
        </div>

        <div>
          <h2 className="text-3xl text-green-400 font-bold mb-4">LEADERSHIP</h2>
          <LaunchItem
            footer="Awards"
            value={data.awards}
            color="bg-green-400"
          />
        </div>
        <div className="mt-[52px]">
          <LaunchItem footer="ILN" value={data.iln} color="bg-green-400" />
        </div>

        <div>
          <h2 className="text-3xl text-red-400 font-bold mb-4">ISF</h2>
          <LaunchItem footer="Total" value={data.isf} color="bg-red-500" />
        </div>
      </div>

      <h2 className="text-3xl text-yellow-300 font-bold mb-4">
        SUMMER EXPERIENCES
      </h2>
      <div className="grid grid-cols-4 gap-4">
        <LaunchItem footer="CLTC" value={data.cltc} color="bg-yellow-300" />
        <LaunchItem footer="ILTC" value={data.iltc} color="bg-yellow-300" />
        <LaunchItem footer="Kallah" value={data.kallah} color="bg-yellow-300" />
        <LaunchItem footer="ILSI" value={data.ilsi} color="bg-yellow-300" />
      </div>
    </div>
  );
}
