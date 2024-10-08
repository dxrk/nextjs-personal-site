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
  className?: string;
  isSmall?: boolean;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

const LaunchItem: React.FC<LaunchItemProps> = ({
  value,
  color,
  footer,
  className = "",
  isSmall = false,
}) => {
  const formattedValue = formatNumber(value);

  return (
    <div>
      <motion.div
        className={`${color} text-black ${
          isSmall ? "p-2" : "p-4"
        } rounded-lg ${className}`}
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
            className={`font-bold mb-1 text-center ${
              isSmall ? "text-lg" : "text-4xl"
            }`}
          >
            {formattedValue}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      {footer && (
        <div
          className={`text-center font-semibold mt-1 ${
            isSmall ? "text-xs" : "text-xl"
          }`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

const StatisticsSection: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="bg-blue-800 rounded-lg p-4 h-full">
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <h3 className="text-xl font-semibold mb-2">Graduation Year</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(data?.cventData?.gradYearData || {}).map(
              ([year, value], index) => (
                <LaunchItem
                  key={year}
                  footer={year}
                  value={value as number}
                  color={
                    index === 0
                      ? "bg-green-400"
                      : index === 1
                      ? "bg-yellow-400"
                      : index === 2
                      ? "bg-red-400"
                      : index === 3
                      ? "bg-cyan-400"
                      : "bg-purple-400"
                  }
                  isSmall={true}
                />
              )
            )}
          </div>
        </div>
        <div className="col-span-1">
          <h3 className="text-xl font-semibold mb-2">Order</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(data?.cventData?.orderData || {}).map(
              ([order, value], index) => (
                <LaunchItem
                  key={order}
                  footer={order}
                  value={value as number}
                  color={
                    order === "BBYO"
                      ? "bg-purple-400"
                      : order === "AZA"
                      ? "bg-blue-400"
                      : "bg-red-400"
                  }
                  isSmall={true}
                  className={order === "BBYO" ? "col-span-2" : ""}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ICLaunch() {
  const [data, setData] = useState({
    cventData: {
      totalRegistrants: 0,
      registrantsData: [],
      gradYearData: { 2025: 0, 2026: 0, 2027: 0, 2028: 0, 2029: 0 },
      orderData: { AZA: 0, BBG: 0, BBYO: 0 },
    },
    waitlistData: 0,
    analyticsData: { activeUsers: "0", pageViews: "0" },
  });
  const wsRef = useRef<WebSocket | null>(null);
  const [showLiveFeed, setShowLiveFeed] = useState(true);

  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket("wss://ic-launch-ws.onrender.com");
      // wsRef.current = new WebSocket("ws://localhost:8080");

      wsRef.current.onopen = () => {
        console.log("Connected to WebSocket");
        // Start pinging only when the connection is open
        const pingInterval = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send("ping");
          }
        }, 5000);
        // Clear the interval if the connection is closed
        if (wsRef.current) {
          wsRef.current.onclose = () => {
            console.log("Disconnected from WebSocket");
            clearInterval(pingInterval);
            // Attempt to reconnect after a delay
            setTimeout(connectWebSocket, 10000);
          };
        }
      };

      wsRef.current.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        setData(newData);
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 10000);
      };
    };

    connectWebSocket();

    const interval = setInterval(() => {
      setShowLiveFeed((prev) => !prev);
    }, 10000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(interval);
    };
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  let recentRegistrations: any[] = [];

  if (!data || !data.cventData || data.cventData.registrantsData.length === 0) {
    recentRegistrations = [];
  } else {
    // Get the 50 most recent registrations
    recentRegistrations = data.cventData.registrantsData
      .sort(
        (a: { timestamp: string }, b: { timestamp: string }) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 50);
  }

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
              value={data?.cventData?.totalRegistrants ?? 0}
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
                value={parseInt(data?.analyticsData?.pageViews ?? "0")}
                color="bg-red-400"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl text-purple-400 font-bold mb-4">
                Active Users*
              </h2>
              <LaunchItem
                footer="Total"
                value={parseInt(data?.analyticsData?.activeUsers ?? "0")}
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
              value={data?.waitlistData ?? 0}
              color="bg-yellow-400"
            />
          </div>
          <div className="text-sm text-gray-300">
            * Analytics for the last 10 minutes.
          </div>
        </div>

        <div className="col-span-3 h-full">
          <AnimatePresence mode="wait">
            {showLiveFeed ? (
              <motion.div
                key="liveFeed"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
                className="h-full"
              >
                <LiveFeed registrations={recentRegistrations} />
              </motion.div>
            ) : (
              <motion.div
                key="statistics"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
                className="h-full"
              >
                <StatisticsSection data={data} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
