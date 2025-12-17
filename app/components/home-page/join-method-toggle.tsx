import { Camera, Keyboard } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export default function JoinMethodToggle({
  joinMethod,
  setJoinMethod,
  setScanning,
}: {
  joinMethod: "code" | "scan";
  setJoinMethod: Dispatch<SetStateAction<"code" | "scan">>;
  setScanning: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex gap-2 p-1 bg-muted/50 rounded-xl mb-4">
      <button
        onClick={() => {
          setJoinMethod("code");
          setScanning(false);
        }}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
          joinMethod === "code"
            ? "bg-card text-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Keyboard className="w-4 h-4" />
        Enter Code
      </button>
      <button
        onClick={() => {
          setJoinMethod("scan");
          setScanning(true);
        }}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
          joinMethod === "scan"
            ? "bg-card text-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Camera className="w-4 h-4" />
        Scan QR
      </button>
    </div>
  );
}
