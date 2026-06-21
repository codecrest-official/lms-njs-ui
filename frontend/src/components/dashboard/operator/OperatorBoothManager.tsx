import { MinusCircleIcon, PlusCircleIcon, WrenchIcon } from "lucide-react";
import type { BoothBook, UserBooth } from "@/components/dashboard/user/types";

interface OperatorBoothManagerProps {
  booth: UserBooth;
  books: BoothBook[];
  form: {
    title: string;
    author: string;
    availableCopies: number;
  };
  onFormChange: (next: { title: string; author: string; availableCopies: number }) => void;
  onAddBook: () => void;
  onRemoveBook: (bookId: number) => void;
  onUpdateStatus: (status: UserBooth["status"]) => void;
}

export function OperatorBoothManager({
  booth,
  books,
  form,
  onFormChange,
  onAddBook,
  onRemoveBook,
  onUpdateStatus,
}: OperatorBoothManagerProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Booth Status</h3>
        <p className="mt-1 text-sm text-gray-600">{booth.name}</p>
        <p className="text-sm text-gray-500">{booth.locationName}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["online", "maintenance", "offline"] as UserBooth["status"][]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onUpdateStatus(status)}
              className={
                booth.status === status
                  ? "rounded-lg border border-indigo-500 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700"
                  : "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              }
            >
              {status}
            </button>
          ))}
        </div>

        {booth.status === "maintenance" && (
          <button
            type="button"
            onClick={() => onUpdateStatus("online")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <WrenchIcon className="h-4 w-4" />
            Mark Booth Online
          </button>
        )}
      </article>

      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Add Book to Booth</h3>
        <div className="mt-4 grid gap-3">
          <input
            value={form.title}
            onChange={(event) => onFormChange({ ...form, title: event.target.value })}
            placeholder="Book title"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            value={form.author}
            onChange={(event) => onFormChange({ ...form, author: event.target.value })}
            placeholder="Author"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            value={form.availableCopies}
            onChange={(event) => onFormChange({ ...form, availableCopies: Number(event.target.value) || 1 })}
            placeholder="Available copies"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={onAddBook}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <PlusCircleIcon className="h-4 w-4" />
            Add Book
          </button>
        </div>
      </article>

      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800">Booth Inventory</h3>
        <div className="mt-4 space-y-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-gray-800">{book.title}</p>
                <p className="text-sm text-gray-600">{book.author}</p>
                <p className="text-xs text-gray-500">Available copies: {book.availableCopies}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveBook(book.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                <MinusCircleIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
          {books.length === 0 && <p className="text-sm text-gray-500">No books in this booth yet.</p>}
        </div>
      </article>
    </section>
  );
}
