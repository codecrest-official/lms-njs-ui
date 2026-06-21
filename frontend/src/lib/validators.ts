import { z } from "zod";

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const CORPORATE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(?!gmail\.com|yahoo\.com|hotmail\.com|outlook\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile
const USERID_REGEX = /^[a-zA-Z0-9._-]{4,30}$/;

export function detectUsernameType(value: string): "userid" | "phone" | "email" | null {
  if (!value) return null;
  if (/^[0-9]{10}$/.test(value)) return "phone";
  if (value.includes("@")) return "email";
  return "userid";
}

export function validateEmail(email: string): boolean {
  return GMAIL_REGEX.test(email) || CORPORATE_EMAIL_REGEX.test(email);
}

export const loginSchema = z
  .object({
    authMode: z.enum(["password", "otp"]),
    username: z.string().min(1, "Username is required").refine((val) => {
      const type = detectUsernameType(val);
      if (type === "email") return validateEmail(val);
      if (type === "phone") return PHONE_REGEX.test(val);
      if (type === "userid") return USERID_REGEX.test(val);
      return false;
    }, "Enter a valid User ID, 10-digit phone, or Gmail / corporate email"),
    password: z.string().optional(),
    otp: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.authMode === "password") {
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must be at least 6 characters",
          path: ["password"],
        });
      }
    } else {
      if (!data.otp || data.otp.length !== 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the 6-digit OTP",
          path: ["otp"],
        });
      }
    }
  });

export type LoginSchema = z.infer<typeof loginSchema>;

