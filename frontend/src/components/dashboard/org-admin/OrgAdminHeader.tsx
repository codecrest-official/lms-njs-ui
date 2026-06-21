import { LogOutIcon } from "lucide-react";

interface OrgAdminHeaderProps {
  organizationName: string;
  onLogout: () => void;
}

export function OrgAdminHeader({ organizationName, onLogout }: OrgAdminHeaderProps) {
  return (
    <header className="rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Organization Admin Dashboard</h1>
            <p className="text-sm text-indigo-100">
              Manage users, track borrowing activity, and oversee subscriptions for {organizationName}.
            </p>
          </div>
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
    </header>
  );
}
