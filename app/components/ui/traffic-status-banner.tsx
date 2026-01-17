"use client";

import { TrafficStatus } from "@/types/interface";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrafficStatusBannerProps {
  trafficStatus: TrafficStatus | null;
  onDismiss?: () => void;
}

export default function TrafficStatusBanner({
  trafficStatus,
  onDismiss,
}: TrafficStatusBannerProps) {
  if (!trafficStatus || trafficStatus.level === "normal") {
    return null;
  }

  const isCritical = trafficStatus.level === "critical";
  const bgColor = isCritical
    ? "bg-red-500/10 border-red-500/20"
    : "bg-yellow-500/10 border-yellow-500/20";
  const textColor = isCritical ? "text-red-400" : "text-yellow-400";
  const iconColor = isCritical ? "text-red-500" : "text-yellow-500";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${bgColor} border rounded-lg p-4 mb-4 flex items-start gap-3`}
      >
        <AlertTriangle className={`${iconColor} w-5 h-5 mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`${textColor} text-sm font-medium`}>
            {trafficStatus.message ||
              (isCritical
                ? "High traffic detected. Room creation temporarily paused."
                : "High traffic detected. Some delays may occur.")}
          </p>
          {!trafficStatus.roomCreationEnabled && (
            <p className="text-xs text-muted-foreground mt-1">
              Please try again in a few moments.
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
