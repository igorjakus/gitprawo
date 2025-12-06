import React from "react";

interface AISupportResponseProps {
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  date?: string;
}

export default function AISupportResponse({ message, variant = "info", date }: AISupportResponseProps) {
  let borderColor = "border-blue-400";
  let bgColor = "bg-blue-50";
  if (variant === "success") {
    borderColor = "border-green-400";
    bgColor = "bg-green-50";
  } else if (variant === "warning") {
    borderColor = "border-yellow-400";
    bgColor = "bg-yellow-50";
  } else if (variant === "error") {
    borderColor = "border-red-400";
    bgColor = "bg-red-50";
  }

  return (
    <div className={`p-4 rounded-lg border ${borderColor} ${bgColor} text-gray-800`}>
      <div>{message}</div>
      {date && (
        <div className="mt-2 text-xs text-gray-500">Wygenerowano: {date}</div>
      )}
    </div>
  );
}
