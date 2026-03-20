"use client";

import { ReactNode } from "react";

interface Tab {
  key: string;
  label: string;
  icon?: ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 min-w-max bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                whitespace-nowrap transition-colors duration-200
                ${
                  isActive
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }
              `}
              style={isActive ? { backgroundColor: "#1B3A5C" } : undefined}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
