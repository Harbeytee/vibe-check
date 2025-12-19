import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

export default function CopyButton({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    // toast({
    //   title: "Copied!",
    //   description: "Room code copied to clipboard",
    // });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      className="w-full justify-start gap-3"
    >
      {copied ? (
        <>
          <Check className="w-5 h-5 text-green-500" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-5 h-5" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
