import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Registration {
  fullName: string;
  region: string;
  timestamp: string;
}

interface LiveFeedProps {
  registrations: Registration[];
}

// TODO: Update the animation
const LiveFeed: React.FC<LiveFeedProps> = ({ registrations }) => {
  return (
    <div className="bg-blue-800 p-4 rounded-lg overflow-hidden h-[600px]">
      <h2 className="text-2xl font-bold mb-4">Live Registrations</h2>
      <div className="space-y-2 overflow-y-auto h-[calc(100%-2rem)]">
        <AnimatePresence initial={false}>
          {registrations.map((registration, index) => (
            <motion.div
              key={`${registration.fullName}-${registration.timestamp}`}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 1,
              }}
              className="bg-blue-700 p-3 rounded"
            >
              <div className="font-semibold">{registration.fullName}</div>
              <div className="text-sm text-blue-300">{registration.region}</div>
              <div className="text-xs text-blue-400">
                {new Date(registration.timestamp).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveFeed;
