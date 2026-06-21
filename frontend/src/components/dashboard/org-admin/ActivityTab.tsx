import clsx from "clsx";
import type { BorrowingActivityItem } from "./types";

interface ActivityTabProps {
  borrowingActivity: BorrowingActivityItem[];
}

export function ActivityTab({ borrowingActivity }: ActivityTabProps) {
  return (
    <section className="mt-5 space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {borrowingActivity.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div>
                <p className="font-medium text-gray-800">{item.user}</p>
                <p className="text-sm text-gray-600">
                  {item.action === "overdue" ? "Overdue return:" : `${item.action}:`} {item.book}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={clsx(
                    "inline-block rounded-full px-2 py-1 text-xs font-medium",
                    item.action === "borrowed"
                      ? "bg-blue-100 text-blue-700"
                      : item.action === "returned"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                  )}
                >
                  {item.action}
                </span>
                <p className="mt-1 text-xs text-gray-500">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
