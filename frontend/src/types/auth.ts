export type UserRole = "user" | "admin" | "operator" | "org_admin";

export type UsernameType = "userid" | "phone" | "email";

export type AuthMode = "password" | "otp";

export interface LoginFormValues {
  usernameType: UsernameType;
  username: string;
  password?: string;
  otp?: string;
}

export interface AuthProfile {
  primaryRole: UserRole;
  allowedRoles: UserRole[];
  activeRole: UserRole;
}

export interface OtpState {
  sent: boolean;
  verified: boolean;
  countdown: number;
}
