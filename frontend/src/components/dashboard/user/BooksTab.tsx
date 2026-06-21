import clsx from "clsx";
import { HistoryIcon } from "lucide-react";
import { BookRequestPanel } from "@/components/dashboard/shared/BookRequestPanel";
import type { BorrowHistoryItem, BorrowedBook } from "./types";

interface BooksTabProps {
  maxBooksAllowed: number;
  borrowedCount: number;
  availableToBorrow: number;
  reminderDaysBefore: number;
  showHistory: boolean;
  borrowedBooks: BorrowedBook[];
  borrowHistory: BorrowHistoryItem[];
  onReminderChange: (days: number) => void;
  onToggleHistory: () => void;
  formatDate: (value: string) => string;
  daysUntil: (value: string) => number;
  getBookStatusColor: (
    borrowedDate: string,
    dueDate: string,
    daysLeft: number
  ) => { bg: string; border: string; badge: string };
}

export function BooksTab({
  maxBooksAllowed,
  borrowedCount,
  availableToBorrow,
  reminderDaysBefore,
  showHistory,
  borrowedBooks,
  borrowHistory,
  onReminderChange,
  onToggleHistory,
  formatDate,
  daysUntil,
  getBookStatusColor,
}: BooksTabProps) {
  return (
    <section className="mt-5 space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">Allowed Borrow Limit</p>
          <p className="mt-1 text-3xl font-bold text-indigo-700">{maxBooksAllowed}</p>
          <p className="mt-1 text-xs text-gray-500">Books per subscription</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">Currently Borrowed</p>
          <p className="mt-1 text-3xl font-bold text-violet-700">{borrowedCount}</p>
          <p className="mt-1 text-xs text-gray-500">Active loans</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">Available to Borrow</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{availableToBorrow}</p>
          <p className="mt-1 text-xs text-gray-500">Remaining capacity</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Currently Borrowed Books</h2>
          <div className="flex items-center gap-3">
            <label htmlFor="reminderDays" className="text-sm text-gray-600">
              Reminder before due date
            </label>
            <select
              id="reminderDays"
              value={reminderDaysBefore}
              onChange={(event) => onReminderChange(Number(event.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700"
            >
              <option value={1}>1 day</option>
              <option value={2}>2 days</option>
              <option value={3}>3 days</option>
              <option value={5}>5 days</option>
              <option value={7}>7 days</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {borrowedBooks.map((book) => {
            const daysLeft = daysUntil(book.dueDate);
            const reminderDate = new Date(book.dueDate);
            reminderDate.setDate(reminderDate.getDate() - reminderDaysBefore);
            const statusColor = getBookStatusColor(book.borrowedDate, book.dueDate, daysLeft);

            return (
              <article key={book.id} className={clsx("rounded-xl border p-4 transition-colors", statusColor.bg, statusColor.border)}>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="mt-1 text-xs text-gray-500">Borrowed at {book.boothName}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-700">
                      Due: <span className="font-semibold">{formatDate(book.dueDate)}</span>
                    </p>
                    <p className="text-gray-600">Reminder date: {formatDate(reminderDate.toISOString())}</p>
                    <p className={clsx("inline-block rounded-full px-3 py-1 text-xs font-medium", statusColor.badge)}>
                      {daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <button
          type="button"
          onClick={onToggleHistory}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white"
        >
          <HistoryIcon className="h-4 w-4" />
          {showHistory ? "Hide Borrowing History" : "View Borrowing History"}
        </button>

        {showHistory && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="py-2">Book</th>
                  <th className="py-2">Borrowed</th>
                  <th className="py-2">Returned</th>
                  <th className="py-2">Booth</th>
                </tr>
              </thead>
              <tbody>
                {borrowHistory.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 text-gray-700">
                    <td className="py-2">{row.title}</td>
                    <td className="py-2">{formatDate(row.borrowedDate)}</td>
                    <td className="py-2">{formatDate(row.returnedDate)}</td>
                    <td className="py-2">{row.boothName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BookRequestPanel
        requestedBy="Organization User"
        contextLabel="Could not find a book? Submit a specific request for your organization admin to review."
      />
    </section>
  );
}
