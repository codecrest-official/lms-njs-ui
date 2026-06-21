import type { BorrowingActivityItem } from "./types";
import { BookRequestPanel } from "@/components/dashboard/shared/BookRequestPanel";

interface BooksTabProps {
  borrowingActivity: BorrowingActivityItem[];
  onOpenBulkUpload: () => void;
}

export function BooksTab({ borrowingActivity, onOpenBulkUpload }: BooksTabProps) {
  return (
    <section className="mt-5 space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Borrowed Books Tracking</h2>
          <button
            type="button"
            onClick={onOpenBulkUpload}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
          >
            Bulk Add / Remove Books
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2">User</th>
                <th className="py-2">Book</th>
                <th className="py-2">Booth</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {borrowingActivity
                .filter((item) => item.action === "borrowed")
                .map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 text-gray-700 hover:bg-gray-50">
                    <td className="py-3">{item.user}</td>
                    <td className="py-3">{item.book}</td>
                    <td className="py-3 text-xs text-gray-500">{item.booth}</td>
                    <td className="py-3">
                      <span className="inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <BookRequestPanel
        requestedBy="Organization Admin"
        contextLabel="Send procurement requests for specific books needed by your organization members."
      />
    </section>
  );
}
