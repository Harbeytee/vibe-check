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
    },
    error: {
      background: "bg-red-500",
      color: "text-white",
    },
  };
  const { background, color } = toastStyles[variant];

  return (
    <div
      className={`flex items-center gap-4 ${background} rounded-[12px] py-3 px-5 shadow-md`}
    >
      <p className={color}>{message}</p>
    </div>
  );
};
