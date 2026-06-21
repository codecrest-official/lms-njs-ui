import clsx from "clsx";
import { useMemo, useState } from "react";
import { Clock3Icon, LocateFixedIcon, LockKeyholeIcon } from "lucide-react";
import type { BoothBook, UserBooth } from "./types";

interface BoothDistanceItem {
  booth: UserBooth;
  distanceKm: number | null;
}

interface BoothTabProps {
  accessibleBooths: UserBooth[];
  boothBooksByBoothId: Record<number, BoothBook[]>;
  boothsWithDistance: BoothDistanceItem[];
  selectedBoothId: number;
  selectedBoothBooks: BoothBook[];
  locationError: string | null;
  lockError: string | null;
  detectingLocation: boolean;
  nearestBooth: UserBooth | undefined;
  hasCurrentLocation: boolean;
  onDetectLocation: () => void;
  onSelectBooth: (boothId: number) => void;
  getLockRemaining: (bookId: number) => number;
  onLockBook: (bookId: number) => void;
}

export function BoothTab({
  accessibleBooths,
  boothBooksByBoothId,
  boothsWithDistance,
  selectedBoothId,
  selectedBoothBooks,
  locationError,
  lockError,
  detectingLocation,
  nearestBooth,
  hasCurrentLocation,
  onDetectLocation,
  onSelectBooth,
  getLockRemaining,
  onLockBook,
}: BoothTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const searchableResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    const boothNameMap = new Map(accessibleBooths.map((booth) => [booth.id, booth.name]));
    const rows: Array<{ boothId: number; boothName: string; book: BoothBook }> = [];

    for (const booth of accessibleBooths) {
      const books = boothBooksByBoothId[booth.id] ?? [];
      for (const book of books) {
        const haystack = `${book.title} ${book.author}`.toLowerCase();
        if (haystack.includes(query)) {
          rows.push({
            boothId: booth.id,
            boothName: boothNameMap.get(booth.id) ?? "Unknown booth",
            book,
          });
        }
      }
    }

    return rows;
  }, [accessibleBooths, boothBooksByBoothId, searchTerm]);

  const matchingBoothIds = useMemo(() => {
    return new Set(searchableResults.map((result) => result.boothId));
  }, [searchableResults]);

  const matchCount = matchingBoothIds.size;

  return (
    <section className="mt-5 space-y-4">
      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Search Book Across Accessible Booths</h2>
        <p className="mt-1 text-sm text-gray-600">
          Search by title or author, view booth-wise availability, and lock from the matching booth.
        </p>
        <p className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
          Booth visibility is filtered by your subscription. Organization subscribers only see their organization's booths, while individual subscribers only see public booths.
        </p>

        <div className="mt-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search books (e.g. Malgudi, Austen)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {searchTerm.trim() !== "" && (
          <div className="mt-4 space-y-3">
            {matchCount > 0 && (
              <p className="text-sm text-emerald-700">
                Found in <span className="font-semibold">{matchCount}</span> booth{matchCount > 1 ? "s" : ""}. Matching booths are highlighted below.
              </p>
            )}
            {searchableResults.length > 0 ? (
              searchableResults.map(({ boothId, boothName, book }) => {
                const remaining = getLockRemaining(book.id);
                const isLocked = remaining > 0;

                return (
                  <div key={`${boothId}-${book.id}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{book.title}</p>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <p className="text-xs text-gray-500">Booth: {boothName}</p>
                        <p className="text-xs text-gray-500">Available copies: {book.availableCopies}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectBooth(boothId)}
                          className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                        >
                          Choose Booth
                        </button>
                        <button
                          type="button"
                          disabled={isLocked || book.availableCopies <= 0}
                          onClick={() => {
                            onSelectBooth(boothId);
                            onLockBook(book.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <LockKeyholeIcon className="h-4 w-4" />
                          {book.availableCopies <= 0 ? "Unavailable" : isLocked ? "Already Locked" : "Lock for 30 min"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No books matched your search in accessible booths.</p>
            )}
          </div>
        )}
      </article>

      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Find Nearest Booth</h2>
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={detectingLocation}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
          >
            <LocateFixedIcon className="h-4 w-4" />
            {detectingLocation ? "Detecting location..." : "Use My Location"}
          </button>
        </div>

        {locationError && <p className="mt-3 text-sm text-rose-600">{locationError}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Selected booth
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Search match booth
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-gray-600">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            Normal booth
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {boothsWithDistance.map(({ booth, distanceKm }) => (
            <button
              key={booth.id}
              type="button"
              onClick={() => onSelectBooth(booth.id)}
              className={clsx(
                "rounded-xl border p-4 text-left transition-colors",
                selectedBoothId === booth.id
                  ? "border-indigo-500 bg-indigo-50"
                  : matchingBoothIds.has(booth.id)
                  ? "border-emerald-400 bg-emerald-50 hover:bg-emerald-100"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              )}
            >
              <p className="font-medium text-gray-800">{booth.name}</p>
              <p className="text-sm text-gray-600">{booth.locationName}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="rounded-full bg-white px-2 py-1 text-gray-700 capitalize">{booth.status}</span>
                {matchingBoothIds.has(booth.id) && (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-700">Match</span>
                )}
                <span className="text-gray-600">
                  {distanceKm !== null ? `${distanceKm.toFixed(2)} km` : "Distance unavailable"}
                </span>
              </div>
            </button>
          ))}
        </div>

        {nearestBooth && hasCurrentLocation && (
          <p className="mt-3 text-sm text-emerald-700">
            Nearest booth: <span className="font-semibold">{nearestBooth.name}</span>
          </p>
        )}
      </article>

      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Books Available At Selected Booth</h3>
        {lockError && <p className="mt-2 text-sm text-rose-600">{lockError}</p>}
        <div className="mt-4 space-y-3">
          {selectedBoothBooks.map((book) => {
            const remaining = getLockRemaining(book.id);
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            const isLocked = remaining > 0;

            return (
              <div
                key={book.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">{book.title}</p>
                  <p className="text-sm text-gray-600">{book.author}</p>
                  <p className="text-xs text-gray-500">Available copies: {book.availableCopies}</p>
                </div>

                <div className="flex items-center gap-2">
                  {isLocked ? (
                    <p className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800">
                      <Clock3Icon className="h-4 w-4" />
                      Locked for {mins}:{String(secs).padStart(2, "0")}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onLockBook(book.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white"
                    >
                      <LockKeyholeIcon className="h-4 w-4" />
                      Lock for 30 min
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
