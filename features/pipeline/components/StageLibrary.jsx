import React from "react";
import {
  FileText,
  Sparkles,
  ClipboardList,
  Code2,
  Video,
  Cpu,
  Users,
  UserCheck,
  ShieldCheck,
  Award,
} from "lucide-react";
import { STAGE_LIBRARY } from "../constants/stageLibrary";

const ICON_MAP = {
  FileText,
  Sparkles,
  ClipboardList,
  Code2,
  Video,
  Cpu,
  Users,
  UserCheck,
  ShieldCheck,
  Award,
};

export default function StageLibrary({ onAddStage }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
          Stage Library
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Click to append</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {STAGE_LIBRARY.map((item) => {
          const Icon = ICON_MAP[item.icon] || FileText;
          return (
            <button
              key={item.key}
              onClick={() => onAddStage(item)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-dark-amethyst-50 hover:border-dark-amethyst-200 border border-transparent transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 bg-gray-100 group-hover:bg-dark-amethyst-100 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-4 h-4 text-dark-amethyst-600 " />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-dark-amethyst-900 leading-tight transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
