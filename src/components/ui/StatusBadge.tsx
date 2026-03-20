"use client";

interface StatusBadgeProps {
  status: string;
}

const colorMap: Record<string, { bg: string; text: string }> = {
  Active: { bg: "#DBEAFE", text: "#1E40AF" },
  "In Progress": { bg: "#DBEAFE", text: "#1E40AF" },
  Completed: { bg: "#D1FAE5", text: "#065F46" },
  Done: { bg: "#D1FAE5", text: "#065F46" },
  Pending: { bg: "#FEF3C7", text: "#92400E" },
  Cancelled: { bg: "#FEE2E2", text: "#991B1B" },
};

const defaultColor = { bg: "#F3F4F6", text: "#4B5563" };

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = colorMap[status] ?? defaultColor;

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
