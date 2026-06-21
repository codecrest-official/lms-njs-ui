import clsx from "clsx";
import type { OrgTab } from "./types";

interface OrgAdminNavProps {
  orgTab: OrgTab;
  onTabChange: (tab: OrgTab) => void;
}

const ORG_TABS: { id: OrgTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "books", label: "Books" },
  { id: "activity", label: "Activity" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "users", label: "Users" },
];

export function OrgAdminNav({ orgTab, onTabChange }: OrgAdminNavProps) {
  return (
    <nav className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-200 md:grid-cols-5">
      {ORG_TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={clsx(
            "rounded-xl px-3 py-3 text-sm font-medium transition-colors",
            orgTab === id
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
