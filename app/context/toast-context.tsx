"use client";

import { CustomToast } from "@/components/ui/custom-toast";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ReactDOM from "react-dom";

type ToastType = "success" | "error";

type Toast = {
  id: string;
  message: React.ReactNode;
  type: ToastType;
};

type ToastContextType = {
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let externalShowToast: ToastContextType["showToast"] = () => {
  throw new Error("ToastProvider is not mounted yet.");
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [mounted, setMounted] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  externalShowToast = showToast;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {ReactDOM.createPortal(
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[150] space-y-2">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CustomToast message={toast.message} variant={toast.type} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const Toast = {
  success: (msg: React.ReactNode) =>
    externalShowToast({ message: msg, type: "success" }),
  error: (msg: React.ReactNode) =>
    externalShowToast({ message: msg, type: "error" }),
};
