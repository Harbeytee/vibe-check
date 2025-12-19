import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/copy-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share2 } from "lucide-react";

export default function ShareOptionsPopover({
  roomCode,
}: {
  roomCode: string;
}) {
  const shareUrl = `${window.location.origin}/join/${roomCode}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="glow" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Invite Link
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="center">
        <div className="space-y-4">
          <div className="text-center">
            <p className="font-medium text-sm mb-2">Share with friends</p>
          </div>

          {/* Copy Link */}
          <CopyButton text={shareUrl} label={"Copy Link"} />
          <CopyButton text={roomCode} label={`Copy Room Code (${roomCode})`} />

          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground mb-3 text-center">
              Share directly to
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start gap-2 h-10"
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      `Join my game! ${shareUrl}`
                    )}`,
                    "_blank"
                  )
                }
              >
                <span className="text-lg">💬</span>
                <span className="text-sm">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 h-10"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `Join my game! ${shareUrl}`
                    )}`,
                    "_blank"
                  )
                }
              >
                <span className="font-bold text-[#1DA1F2]">𝕏</span>
                <span className="text-sm">Twitter</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 h-10"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      shareUrl
                    )}`,
                    "_blank"
                  )
                }
              >
                <span className="font-bold text-[#1877F2]">f</span>
                <span className="text-sm">Facebook</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 h-10"
                onClick={() =>
                  window.open(
                    `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(
                      shareUrl
                    )}`,
                    "_blank"
                  )
                }
              >
                <span>👻</span>
                <span className="text-sm">Snapchat</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 h-10 col-span-2"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  //   toast({ title: "Link copied!", description: "Paste this link in TikTok to share" });
                }}
              >
                <span className="font-bold text-[#EE1D52]">♪</span>
                <span className="text-sm">TikTok (Copy Link)</span>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
