import type { UserRole } from "@/types/auth";

export type UserDashboardTab = "access" | "books" | "subscription" | "profile" | "booth";

export interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  borrowedDate: string;
  dueDate: string;
  boothName: string;
}

export interface BorrowHistoryItem {
  id: number;
  title: string;
  borrowedDate: string;
  returnedDate: string;
  boothName: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  level: "organization" | "user";
  description: string;
  maxUsersAllowed: number;
  maxBooksPerUser: number;
  costPerYearInr: number;
  subscriptionDurationId: number;
}

export interface UserBooth {
  id: number;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  status: "online" | "offline" | "maintenance";
}

export interface BoothBook {
  id: number;
  title: string;
  author: string;
  availableCopies: number;
}

export interface BoothBookSearchResult {
  boothId: number;
  boothName: string;
  boothStatus: UserBooth["status"];
  book: BoothBook;
}

export interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  organization: string;
  memberSince: string;
}

export interface ActiveLock {
  boothId: number;
  bookId: number;
  expiresAt: number;
}
