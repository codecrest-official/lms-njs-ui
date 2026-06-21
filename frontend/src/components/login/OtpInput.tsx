"use client";

import { useRef, KeyboardEvent, ClipboardEvent } from "react";
import clsx from "clsx";

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

const OTP_LENGTH = 6;

export default function OtpInput({ value, onChange, error, disabled }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(OTP_LENGTH, "").split("").slice(0, OTP_LENGTH);

  const updateDigit = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").trimEnd());
  };

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    updateDigit(index, char);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        updateDigit(index, "");
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        updateDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        One-Time Password
      </label>

      <div className="flex gap-2 justify-between" role="group" aria-label="OTP digits">
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[i] || ""}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            onFocus={(e) => e.target.select()}
            aria-label={`OTP digit ${i + 1}`}
            className={clsx(
              "h-12 w-full rounded-lg border text-center text-lg font-semibold",
              "shadow-sm transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              "dark:bg-gray-800 dark:text-gray-100",
              digits[i]
                ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-300 bg-white dark:border-gray-600",
              error && "border-red-400",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
