"use client";

import Link from "next/link";
import type { Project } from "@/lib/types/database";
import { ProgressDonut } from "@/components/ui/ProgressDonut";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Folder } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  href?: string;
}

export function ProjectCard({ project, href }: ProjectCardProps) {
  const linkHref = href || `/project-details/${project.id}`;

  return (
    <Link href={linkHref} className="block group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt={project.name || "Project"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-primary/5">
              <Folder size={48} className="text-brand-primary/30" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-primary truncate">
                {project.name || "Untitled Project"}
              </h3>
              {project.description && (
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
              {project.step_name && (
                <p className="text-xs text-brand-accent mt-2 font-medium">
                  {project.step_name}
                </p>
              )}
            </div>
            <ProgressDonut progress={project.progress || 0} size={56} strokeWidth={6} />
          </div>
        </div>
      </div>
    </Link>
  );
}
