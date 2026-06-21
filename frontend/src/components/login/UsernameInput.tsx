"use client";

import { AtSignIcon, PhoneIcon, UserIcon, XCircleIcon } from "lucide-react";
import clsx from "clsx";
import { detectUsernameType } from "@/lib/validators";
import type { UsernameType } from "@/types/auth";

interface UsernameInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

const TYPE_META: Record<
  UsernameType,
  { icon: React.ElementType; hint: string; color: string }
> = {
  userid: {
    icon: UserIcon,
    hint: "User ID",
    color: "text-violet-500",
  },
  phone: {
    icon: PhoneIcon,
    hint: "Phone number",
    color: "text-emerald-500",
  },
  email: {
    icon: AtSignIcon,
    hint: "Email address",
    color: "text-sky-500",
  },
};

export default function UsernameInput({
  value,
  onChange,
  error,
  disabled,
}: UsernameInputProps) {
  const detectedType = detectUsernameType(value) as UsernameType | null;

  const meta = detectedType ? TYPE_META[detectedType] : null;
  const Icon = meta?.icon ?? UserIcon;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="username"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Username
      </label>

      <div className="relative">
        {/* Leading icon */}
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <Icon
            className={clsx("h-4 w-4 transition-colors", meta?.color ?? "text-gray-400")}
            aria-hidden="true"
          />
        </span>

        <input
          id="username"
          type="text"
          autoComplete="username"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="User ID / Phone / Email"
          className={clsx(
            "block w-full rounded-lg border bg-white py-2.5 pl-9 pr-9 text-sm text-gray-900 shadow-sm placeholder:text-gray-400",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            "dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-300 dark:border-gray-600"
          )}
          aria-describedby={error ? "username-error" : "username-hint"}
          aria-invalid={!!error}
        />

        {/* Clear button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label="Clear username"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Detected type badge */}
      {detectedType && !error && (
        <p
          id="username-hint"
          className={clsx("text-xs font-medium", meta?.color)}
        >
          Detected: {meta?.hint}
          {detectedType === "email" && (
            <span className="ml-1 text-gray-400 font-normal">
              (Gmail or corporate email accepted)
            </span>
          )}
        </p>
      )}

      {error && (
        <p id="username-error" role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
