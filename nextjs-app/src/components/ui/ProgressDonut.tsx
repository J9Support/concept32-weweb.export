"use client";

interface ProgressDonutProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressDonut({
  progress,
  size = 80,
  strokeWidth = 8,
}: ProgressDonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;
  const arcColor = clamped >= 100 ? "#10B981" : "#2E75B6";

  return (
    <div className="inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <span
        className="absolute text-sm font-semibold"
        style={{ color: "#1A1A2E" }}
      >
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

export default ProgressDonut;
