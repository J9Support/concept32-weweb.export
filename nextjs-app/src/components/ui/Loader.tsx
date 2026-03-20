"use client";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-12 h-12 border-4",
};

export function Loader({ size = "md", className = "" }: LoaderProps) {
  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full animate-spin
        border-gray-200 ${className}
      `}
      style={{ borderTopColor: "#1B3A5C" }}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Loader;
