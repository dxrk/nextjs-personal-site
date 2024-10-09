import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Registration {
  fullName: string;
  region: string;
  timestamp: string;
}

interface LiveFeedProps {
  registrations: Registration[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ registrations }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [registrations]);

  return (
    <div className="bg-blue-800 p-4 rounded-lg overflow-hidden h-[600px]">
      <h2 className="text-2xl font-bold mb-4">Live Registrations</h2>
      <div
        ref={scrollRef}
        className="space-y-2 overflow-y-auto h-[calc(100%-2rem)] pr-2 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {registrations.map((registration, index) => (
            <motion.div
              key={`${registration.fullName}-${registration.timestamp}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 1,
                delay: index * 0.1,
              }}
              className="bg-blue-700 p-3 rounded shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="font-semibold">{registration.fullName}</div>
              <div className="text-sm text-blue-300">{registration.region}</div>
              <div className="text-xs text-blue-400">
                {new Date(registration.timestamp).toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveFeed;
