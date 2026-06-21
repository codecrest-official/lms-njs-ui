export type OrgTab = "overview" | "books" | "activity" | "subscriptions" | "users";
export type GraphPeriod = "daily" | "weekly" | "monthly";

export interface OrgStats {
  totalUsers: number;
  activeLoans: number;
  totalBooks: number;
  borrowingRate: string;
  subscriptionStatus: string;
  organizationName: string;
  totalBooths: number;
}

export interface OrgBooth {
  id: number;
  name: string;
  location: string;
  status: "online" | "maintenance";
}

export interface BorrowingActivityItem {
  user: string;
  book: string;
  action: "borrowed" | "returned" | "overdue";
  date: string;
  booth: string;
}

export interface OverdueUser {
  user: string;
  days: number;
}

export interface ManagedUser {
  id: number;
  name: string;
  role: string;
  email: string;
  joinDate: string;
}

export interface OrganizationSubscription {
  name: string;
  maxUsers: number;
  maxBooks: number;
  cost: string;
  status: string;
  renewDate: string;
}

export interface TrendPoint {
  label: string;
  activeUsers: number;
}

export interface BorrowingTrendData {
  daily: TrendPoint[];
  weekly: TrendPoint[];
  monthly: TrendPoint[];
}
