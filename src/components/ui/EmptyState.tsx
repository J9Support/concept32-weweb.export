"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl p-12 text-center"
      style={{ backgroundColor: "#F5F7FA" }}
    >
      {icon && (
        <div className="mb-4 text-gray-400">{icon}</div>
      )}

      <h3
        className="text-lg font-semibold"
        style={{ color: "#1A1A2E" }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="mt-2 max-w-sm text-sm"
          style={{ color: "#6B7280" }}
        >
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#2E75B6" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
