import clsx from "clsx";
import {
  BookOpenIcon,
  CreditCardIcon,
  LogOutIcon,
  MapPinIcon,
  QrCodeIcon,
  UserCircle2Icon,
} from "lucide-react";
import type { ElementType, ReactNode } from "react";
import type { UserDashboardTab, UserProfile } from "./types";

interface UserDashboardLayoutProps {
  activeTab: UserDashboardTab;
  onTabChange: (tab: UserDashboardTab) => void;
  onLogout: () => void;
  userProfile: UserProfile;
  children: ReactNode;
}

const TABS: { id: UserDashboardTab; label: string; icon: ElementType }[] = [
  { id: "access", label: "Booth Access", icon: QrCodeIcon },
  { id: "books", label: "Books", icon: BookOpenIcon },
  { id: "subscription", label: "Subscription", icon: CreditCardIcon },
  { id: "profile", label: "Profile", icon: UserCircle2Icon },
  { id: "booth", label: "Booth", icon: MapPinIcon },
];

export function UserDashboardLayout({
  activeTab,
  onTabChange,
  onLogout,
  userProfile,
  children,
}: UserDashboardLayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 text-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Library Dashboard</h1>
                <p className="text-sm text-indigo-100">
                  Welcome {userProfile.fullName}. Track your books, subscriptions, profile, and booth access.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/30"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <nav className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-200 md:grid-cols-5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={clsx(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                activeTab === id
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {children}
      </div>
    </main>
  );
}
