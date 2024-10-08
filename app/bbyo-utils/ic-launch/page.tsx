"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import LiveFeed from "./LiveFeed";

interface LaunchItemProps {
  header?: string;
  value: number;
  color: string;
  footer?: string;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

const LaunchItem: React.FC<LaunchItemProps> = ({ value, color, footer }) => {
  const formattedValue = formatNumber(value);

  return (
    <div>
      <motion.div
        className={`${color} text-black p-4 rounded-lg`}
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

export default function ICLaunch() {
  const [data, setData] = useState({
    cventData: { totalRegistrants: 0, registrantsData: [] },
    waitlistData: 0,
    analyticsData: { activeUsers: "0", pageViews: "0" },
  });
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    wsRef.current = new WebSocket("wss://ic-launch-ws.onrender.com");

    wsRef.current.onopen = () => {
      console.log("Connected to WebSocket");
    };

    wsRef.current.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onclose = (event) => {
      console.log("Disconnected from WebSocket", event.code, event.reason);
      setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendPing = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("ping");
    }
  };

  useEffect(() => {
    const pingInterval = setInterval(sendPing, 20000);

    return () => {
      clearInterval(pingInterval);
    };
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get the 50 most recent registrations
  const recentRegistrations = data.cventData.registrantsData
    .sort(
      (a: { timestamp: string }, b: { timestamp: string }) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 50);

  return (
    <div className="bg-blue-700 text-white p-8 font-sans min-h-screen">
      <div className="flex justify-between items-start mb-16">
        <h1 className="text-4xl font-bold">
          BBYO International Convention 2025 Launch
        </h1>
        <div className="flex items-center space-x-2">
          <Image
            src={"/bbyo-100.png"}
            width={180}
            height={180}
            alt="BBYO Logo"
          />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-8">
        <div className="col-span-4 space-y-8">
          <div>
            <h2 className="text-3xl text-green-400 font-bold mb-4">
              Registrations
            </h2>
            <LaunchItem
              footer="Total"
              value={data.cventData.totalRegistrants}
              color="bg-green-400"
            />
          </div>
          <div className="flex flex-row gap-4 justify-between">
            <div className="flex-1">
              <h2 className="text-3xl text-red-400 font-bold mb-4">
                Page Views*
              </h2>
              <LaunchItem
                footer="Total"
                value={parseInt(data.analyticsData.pageViews)}
                color="bg-red-400"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl text-purple-400 font-bold mb-4">
                Active Users*
              </h2>
              <LaunchItem
                footer="Total"
                value={parseInt(data.analyticsData.activeUsers)}
                color="bg-purple-400"
              />
            </div>
          </div>
          <div>
            <h2 className="text-3xl text-yellow-400 font-bold mb-4">
              Waitlist Registrations
            </h2>
            <LaunchItem
              footer="Total"
              value={data.waitlistData}
              color="bg-yellow-400"
            />
          </div>
          <div className="text-sm text-gray-300">
            * Analytics for the last 5 minutes.
          </div>
        </div>

        <div className="col-span-3">
          <LiveFeed registrations={recentRegistrations} />
        </div>
      </div>
    </div>
  );
}
