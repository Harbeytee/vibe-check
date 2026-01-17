import { Check, Copy, QrCode, Share2, Users } from "lucide-react";
import { Button } from "../../ui/button";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { useState } from "react";
import ShareOptionsPopover from "./share-options-popover";

export default function InvitePlayers({ roomCode }: { roomCode: string }) {
  const [showQR, setShowQR] = useState(false);
  const shareUrl = `${window.location.origin}/lobby/${roomCode}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-effect rounded-2xl p-6 mb-6"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="font-display font-bold text-lg">Invite Players</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code - Always Visible */}
        <div className="flex flex-col items-center">
          <p className="text-muted-foreground text-sm mb-3 flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Show this to players
          </p>
          <div className="p-4 bg-foreground rounded-2xl shadow-lg">
            <QRCodeSVG value={shareUrl} size={160} />
          </div>
          <p className="text-muted-foreground text-xs mt-3 text-center">
            Players scan this to join your room
          </p>
        </div>

        {/* Share Options */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-muted-foreground text-sm mb-3">
            Or share the link
          </p>

          <ShareOptionsPopover roomCode={roomCode} />

          <p className="text-muted-foreground text-xs mt-3 text-center">
            Share this link with friends to invite them
          </p>
        </div>
      </div>
    </motion.div>
  );
}
