import clsx from "clsx";
import type { BorrowingActivityItem, BorrowingTrendData, OrgBooth, OrgStats, OverdueUser, GraphPeriod } from "./types";

interface OverviewTabProps {
  orgStats: OrgStats;
  booths: OrgBooth[];
  overdueUsers: OverdueUser[];
  graphPeriod: GraphPeriod;
  trendData: BorrowingTrendData[GraphPeriod];
  maxValue: number;
  activeUsersCount: number;
  distinctUsersCount: number;
  onNavigate: (tab: "books" | "activity" | "users") => void;
  onGraphPeriodChange: (period: GraphPeriod) => void;
  onOpenNotificationModal: () => void;
  borrowingActivity: BorrowingActivityItem[];
}

export function OverviewTab({
  orgStats,
  booths,
  overdueUsers,
  graphPeriod,
  trendData,
  maxValue,
  activeUsersCount,
  distinctUsersCount,
  onNavigate,
  onGraphPeriodChange,
  onOpenNotificationModal,
}: OverviewTabProps) {
  return (
    <section className="mt-5 space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <button
          type="button"
          onClick={() => onNavigate("users")}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow cursor-pointer text-left"
        >
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-indigo-700">{orgStats.totalUsers}</p>
          <p className="mt-1 text-xs text-gray-500">{activeUsersCount} active</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("books")}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow cursor-pointer text-left"
        >
          <p className="text-sm text-gray-600">Active Loans</p>
          <p className="mt-2 text-3xl font-bold text-violet-700">{orgStats.activeLoans}</p>
          <p className="mt-1 text-xs text-gray-500">{distinctUsersCount} distinct users</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("books")}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow cursor-pointer text-left"
        >
          <p className="text-sm text-gray-600">Total Books</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{orgStats.totalBooks}</p>
          <p className="mt-1 text-xs text-gray-500">In catalog</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("activity")}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow cursor-pointer text-left"
        >
          <p className="text-sm text-gray-600">Borrowing Rate</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{orgStats.borrowingRate}</p>
          <p className="mt-1 text-xs text-gray-500">Of active users</p>
        </button>
        <button type="button" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 cursor-default text-left">
          <p className="text-sm text-gray-600">Total Booths</p>
          <p className="mt-2 text-3xl font-bold text-rose-700">{orgStats.totalBooths}</p>
          <p className="mt-1 text-xs text-gray-500">Locations</p>
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Borrowing Activity Trend</h2>
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as GraphPeriod[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => onGraphPeriodChange(period)}
                className={clsx(
                  "rounded-lg px-3 py-1 text-sm font-medium transition-colors",
                  graphPeriod === period ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full h-64 p-4">
          <svg viewBox="0 0 800 200" className="w-full h-full">
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="60" y1={y} x2="800" y2={y} stroke="#e5e7eb" strokeWidth="1" />
            ))}

            <line x1="60" y1="0" x2="60" y2="190" stroke="#374151" strokeWidth="2" />
            <line x1="60" y1="190" x2="800" y2="190" stroke="#374151" strokeWidth="2" />

            {[0, 5, 10, 15, 20, 25].map((val, idx) => (
              <text key={`y-${idx}`} x="45" y={190 - idx * 38} fontSize="12" fill="#6b7280" textAnchor="end">
                {val}
              </text>
            ))}

            <polyline
              points={trendData
                .map((data, idx) => {
                  const x = 60 + (idx / Math.max(trendData.length - 1, 1)) * 730;
                  const y = 190 - (data.activeUsers / Math.max(maxValue, 1)) * 190;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {trendData.map((data, idx) => {
              const x = 60 + (idx / Math.max(trendData.length - 1, 1)) * 730;
              const y = 190 - (data.activeUsers / Math.max(maxValue, 1)) * 190;
              return <circle key={`dot-${idx}`} cx={x} cy={y} r="4" fill="#4f46e5" />;
            })}

            {trendData.map((data, idx) => {
              const x = 60 + (idx / Math.max(trendData.length - 1, 1)) * 730;
              return (
                <text key={`x-${idx}`} x={x} y="210" fontSize="12" fill="#6b7280" textAnchor="middle">
                  {data.label}
                </text>
              );
            })}
          </svg>
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center">Active distinct users borrowing books</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Organization Booths</h3>
          <div className="space-y-2">
            {booths.map((booth) => (
              <div key={booth.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div>
                  <p className="font-medium text-gray-800">{booth.name}</p>
                  <p className="text-xs text-gray-500">{booth.location}</p>
                </div>
                <span
                  className={clsx(
                    "inline-block rounded-full px-2 py-1 text-xs font-medium",
                    booth.status === "online" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {booth.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Overdue Books</h3>
            <button
              type="button"
              onClick={onOpenNotificationModal}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700"
            >
              Send Notification
            </button>
          </div>
          <div className="space-y-2">
            {overdueUsers.length > 0 ? (
              overdueUsers.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <p className="font-medium text-rose-900">{item.user}</p>
                  <p className="text-xs text-rose-700">{item.days} days overdue</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No overdue books</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
