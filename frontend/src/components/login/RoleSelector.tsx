"use client";

import clsx from "clsx";
import { UserIcon, ShieldCheckIcon, WrenchIcon } from "lucide-react";
import type { UserRole } from "@/types/auth";

const ROLES: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  {
    value: "user",
    label: "User",
    icon: UserIcon,
    description: "Library member",
  },
  {
    value: "admin",
    label: "Admin",
    icon: ShieldCheckIcon,
    description: "System administrator",
  },
  {
    value: "operator",
    label: "Operator",
    icon: WrenchIcon,
    description: "Booth operator",
  },
];

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {ROLES.map(({ value: role, label, icon: Icon, description }) => {
        const active = value === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={clsx(
              "flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              active
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
            aria-pressed={active}
          >
            <Icon
              className={clsx(
                "h-5 w-5",
                active ? "text-indigo-500" : "text-gray-400"
              )}
              aria-hidden="true"
            />
            <span>{label}</span>
            <span
              className={clsx(
                "text-[10px] font-normal",
                active ? "text-indigo-500" : "text-gray-400"
              )}
            >
              {description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
