"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import {
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  SendIcon,
  CheckCircle2Icon,
} from "lucide-react";

import UsernameInput from "./UsernameInput";
import OtpInput from "./OtpInput";

import { loginSchema, type LoginSchema } from "@/lib/validators";
import type { UserRole, AuthMode, AuthProfile } from "@/types/auth";

const OTP_COOLDOWN = 30; // seconds

const DEMO_USERS: Record<
  string,
  {
    password: string;
    primaryRole: UserRole;
    allowedRoles: UserRole[];
  }
> = {
  "user.codecrest": {
    password: "demo@123",
    primaryRole: "user",
    allowedRoles: ["user"],
  },
  "admin.codecrest": {
    password: "demo@123",
    primaryRole: "admin",
    allowedRoles: ["admin", "operator"],
  },
  "operator.codecrest": {
    password: "demo@123",
    primaryRole: "operator",
    allowedRoles: ["operator"],
  },
  "usertype.codecrest": {
    password: "demo@123",
    primaryRole: "org_admin",
    allowedRoles: ["org_admin"],
  },
};

export default function LoginForm() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [authProfile, setAuthProfile] = useState<AuthProfile | null>(null);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      authMode: "password" as const,
      username: "",
      password: "",
    },
  });

  const usernameValue = useWatch({ control, name: "username" });

  const handleAuthModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    reset({
      authMode: mode,
      username: usernameValue ?? "",
      password: "",
      otp: "",
    });
    setOtpSent(false);
    setCountdown(0);
    setSubmitError(null);
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!usernameValue || countdown > 0) return;
    setOtpSending(true);
    setSubmitError(null);
    try {
      // TODO: replace with real API call
      await new Promise((res) => setTimeout(res, 1200));
      setOtpSent(true);
      setCountdown(OTP_COOLDOWN);
    } catch {
      setSubmitError("Failed to send OTP. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const onSubmit = async (data: LoginSchema) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // TODO: replace with real auth API call
      await new Promise((res) => setTimeout(res, 1500));

      const loginKey = data.username.trim().toLowerCase();
      const matchedUser = DEMO_USERS[loginKey];
      const submittedSecret = data.authMode === "password" ? data.password : data.otp;

      if (!matchedUser || submittedSecret !== matchedUser.password) {
        throw new Error("Invalid credentials");
      }

      const backendProfile: AuthProfile = {
        primaryRole: matchedUser.primaryRole,
        allowedRoles: matchedUser.allowedRoles,
        activeRole: matchedUser.primaryRole,
      };

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("authProfile", JSON.stringify(backendProfile));
      }
      setAuthProfile(backendProfile);
      console.log("Login payload:", data);
      console.log("Resolved auth profile:", backendProfile);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch {
      setSubmitError("Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authProfile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
        <CheckCircle2Icon className="h-14 w-14 text-emerald-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Login successful!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Role detected from backend.</p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Active role: <span className="capitalize">{authProfile.activeRole}</span>
        </p>

        {authProfile.primaryRole === "admin" && authProfile.allowedRoles.includes("operator") && (
          <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">
              Switch working role
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["admin", "operator"] as UserRole[]).map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => {
                    setAuthProfile((prev) => {
                      if (!prev) return prev;
                      const next = {
                        ...prev,
                        activeRole: roleOption,
                      };
                      if (typeof window !== "undefined") {
                        window.sessionStorage.setItem("authProfile", JSON.stringify(next));
                      }
                      return next;
                    });
                  }}
                  className={clsx(
                    "rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                    authProfile.activeRole === roleOption
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-200"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  {roleOption}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      {/* Username */}
      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <UsernameInput
            value={field.value}
            onChange={field.onChange}
            error={errors.username?.message}
            disabled={isSubmitting}
          />
        )}
      />

      {/* Auth mode toggle */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {(["password", "otp"] as AuthMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleAuthModeChange(mode)}
            className={clsx(
              "flex-1 rounded-md py-2 text-sm font-medium capitalize transition-all",
              authMode === mode
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            )}
          >
            {mode === "password" ? "Password" : "OTP"}
          </button>
        ))}
      </div>

      {/* Password field */}
      {authMode === "password" && (
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <div className="relative">
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...field}
                  className={clsx(
                    "block w-full rounded-lg border bg-white py-2.5 pl-3.5 pr-10 text-sm text-gray-900 shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                    "dark:bg-gray-800 dark:text-gray-100",
                    authMode === "password" && errors.password
                      ? "border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {authMode === "password" && errors.password && (
            <p role="alert" className="text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
          <div className="flex justify-end">
            <a
              href="#"
              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Forgot password?
            </a>
          </div>
        </div>
      )}

      {/* OTP field */}
      {authMode === "otp" && (
        <div className="space-y-4">
          {/* Send OTP button */}
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={!usernameValue || countdown > 0 || otpSending}
            className={clsx(
              "flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all",
              otpSent
                ? "border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-indigo-400 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300",
              (countdown > 0 || otpSending || !usernameValue) &&
                "opacity-60 cursor-not-allowed"
            )}
          >
            {otpSending ? (
              <LoaderCircleIcon className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
            {otpSending
              ? "Sending…"
              : otpSent
              ? countdown > 0
                ? `Resend OTP in ${countdown}s`
                : "Resend OTP"
              : "Send OTP"}
          </button>

          {/* OTP boxes — only visible after sending */}
          {otpSent && (
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <OtpInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={"otp" in errors ? errors.otp?.message : undefined}
                  disabled={isSubmitting}
                />
              )}
            />
          )}
        </div>
      )}

      {/* Global submit error */}
      {submitError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400"
        >
          {submitError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || (authMode === "otp" && !otpSent)}
        className={clsx(
          "flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md",
          "hover:bg-indigo-700 active:scale-[0.98] transition-all",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <>
            <LoaderCircleIcon className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </button>

    </form>
  );
}
