import { ReactNode } from "react";

type ToastType = "success" | "error";

interface CustomToastProps {
  message: ReactNode;
  variant: ToastType;
}

export const CustomToast = ({ message, variant }: CustomToastProps) => {
  const toastStyles = {
    success: {
      background: "bg-green-600",
      color: "text-white",
      icon: "check-circle-filled",
    },
    error: {
      background: "bg-red-500",
      color: "text-white",
      icon: "error-triangle-filled",
    },
  };
  const { background, color, icon } = toastStyles[variant];

  return (
    <div
      className={`flex items-center gap-4 ${background} rounded-[12px] h-[72px] px-6 shadow-md`}
    >
      <p className={color}>{message}</p>
    </div>
  );
};
