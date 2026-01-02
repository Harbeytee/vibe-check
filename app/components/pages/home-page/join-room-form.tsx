import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Input } from "../../ui/input";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "../../ui/button";
import { Mode } from "@/types/types";
import JoinMethodToggle from "./join-method-toggle";
import useHandleJoinRoom from "./hooks/useHandleJoinRoom";

export default function JoinRoomForm({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
}) {
  const {
    handleScan,
    scanning,
    setError,
    setRoomCode,
    joinMethod,
    playerName,
    setPlayerName,
    error,
    setJoinMethod,
    setScanning,
    roomCode,
    handleJoin,
    goBack,
  } = useHandleJoinRoom(setMode);

  if (mode === "join")
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <h2 className="font-display font-bold text-2xl mb-4">Join a Room</h2>

        <JoinMethodToggle
          joinMethod={joinMethod}
          setJoinMethod={setJoinMethod}
          setScanning={setScanning}
        />

        <Input
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => {
            setPlayerName(e.target.value);
            setError("");
          }}
          autoFocus
        />

        <AnimatePresence mode="wait">
          {joinMethod === "code" ? (
            <motion.div
              key="code-input"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Input
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError("");
                }}
                className="font-mono tracking-widest text-center text-lg"
                maxLength={6}
              />
            </motion.div>
          ) : (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden bg-card border-2 border-primary/30">
                <div className="aspect-square max-h-64 w-full">
                  {scanning && (
                    <Scanner
                      onScan={handleScan}
                      onError={(error) => console.log(error)}
                      constraints={{ facingMode: "environment" }}
                      styles={{
                        container: {
                          width: "100%",
                          height: "100%",
                          borderRadius: "1rem",
                        },
                        video: {
                          borderRadius: "1rem",
                        },
                      }}
                    />
                  )}
                </div>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-primary/50 rounded-lg" />
                  <div className="absolute top-8 left-8 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-8 right-8 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-8 left-8 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-8 right-8 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-3">
                Point your camera at the QR code
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {roomCode && joinMethod === "scan" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-success/20 border border-success/30 rounded-lg"
          >
            <p className="text-success text-sm">
              Code scanned:{" "}
              <span className="font-mono font-bold">{roomCode}</span>
            </p>
          </motion.div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex gap-3">
          <Button variant="ghost" onClick={goBack}>
            Back
          </Button>
          <Button
            variant="glow"
            className="flex-1"
            onClick={() => handleJoin()}
            disabled={!roomCode && joinMethod === "code"}
          >
            Join Room
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
}
