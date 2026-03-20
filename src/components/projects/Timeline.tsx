"use client";

import type { ProjectStage } from "@/lib/types/database";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface TimelineProps {
  stages: ProjectStage[];
  currentStep?: number | null;
}

export function Timeline({ stages, currentStep }: TimelineProps) {
  if (!stages.length) {
    return (
      <p className="text-text-secondary text-sm text-center py-8">
        No timeline stages defined yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {stages.map((stage, index) => {
        const stageNum = stage.stage_number || index + 1;
        const isCompleted = stage.project_status === "Completed";
        const isCurrent =
          stage.project_status === "Active" ||
          stage.project_status === "In Progress" ||
          (currentStep !== null &&
            currentStep !== undefined &&
            stageNum === currentStep);
        const isPending = !isCompleted && !isCurrent;
        const isLast = index === stages.length - 1;

        return (
          <div key={stage.id} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "bg-green-100 text-green-600"
                    : isCurrent
                    ? "bg-brand-accent text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle size={18} />
                ) : isCurrent ? (
                  <Clock size={18} />
                ) : (
                  <Circle size={18} />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[40px] ${
                    isCompleted ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
              <div
                className={`rounded-lg p-4 ${
                  isCurrent
                    ? "bg-blue-50 border border-brand-accent/20"
                    : "bg-white border border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`font-medium ${
                      isCurrent ? "text-brand-primary" : "text-text-primary"
                    }`}
                  >
                    Stage {stageNum}: {stage.stage_name || "Unnamed"}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isCompleted
                        ? "bg-green-100 text-green-700"
                        : isCurrent
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {stage.project_status || "Pending"}
                  </span>
                </div>
                {stage.description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {stage.description}
                  </p>
                )}
                {stage.estimaed_days && (
                  <p className="text-xs text-text-secondary mt-2">
                    Estimated: {stage.estimaed_days} days
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
