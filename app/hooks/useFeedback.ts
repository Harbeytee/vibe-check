import { Toast } from "@/context/toast-context";
import config from "@/lib/config";
import { useState } from "react";

type FeedbackType = "bug" | "suggestion";

export default function useFeedback() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const apiBase = config.socketUrl;
    if (!apiBase) {
      Toast.error("Feedback API is not configured");
      return;
    }

    console.log(apiBase);

    setSending(true);
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, "")}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: name.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Toast.error(data.error || "Failed to send feedback");
        setSending(false);
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setName("");
        setMessage("");
      }, 1800);
    } catch (err) {
      const isNetwork =
        err instanceof TypeError &&
        (err.message.includes("fetch") || err.message.includes("network"));
      Toast.error(
        isNetwork
          ? "Could not reach server. Check that the API is running and NEXT_PUBLIC_SOCKET_URL is correct."
          : "Failed to send feedback"
      );
    } finally {
      setSending(false);
    }
  };
  return {
    handleSubmit,
    open,
    setType,
    submitted,
    sending,
    setOpen,
    type,
    setName,
    setMessage,
    message,
    name,
  };
}
