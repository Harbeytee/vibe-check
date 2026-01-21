"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error("App error:", error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="text-center max-w-md">
        <span className="text-6xl mb-6 block">😵</span>

        <h1 className="font-display font-bold text-3xl mb-2">
          Oops! Something went wrong
        </h1>

        <p className="text-muted-foreground mb-8">
          Don&apos;t worry, it happens to the best of us. Try refreshing or head
          back home.
        </p>

        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={() => (window.location.href = "/")}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>

          <Button variant="glow" onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
