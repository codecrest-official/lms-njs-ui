interface BulkUploadModalProps {
  open: boolean;
  file: File | null;
  entityLabel?: "users" | "books";
  onFileChange: (file: File | null) => void;
  onClose: () => void;
  onProcess: () => void;
}

export function BulkUploadModal({ open, file, entityLabel = "users", onFileChange, onClose, onProcess }: BulkUploadModalProps) {
  if (!open) return null;

  const singularEntity = entityLabel === "books" ? "book" : "user";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">{`Bulk ${entityLabel === "books" ? "Book" : "User"} Operations`}</h3>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Operation</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-gray-200 hover:bg-gray-50">
                <input type="radio" name="operation" defaultChecked className="cursor-pointer" />
                <span className="text-sm text-gray-700">{`Add ${entityLabel} from CSV`}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-gray-200 hover:bg-gray-50">
                <input type="radio" name="operation" className="cursor-pointer" />
                <span className="text-sm text-gray-700">{`Remove ${entityLabel} from CSV`}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-600 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={(event) => onFileChange(event.target.files?.[0] || null)}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <p className="text-sm font-medium text-gray-700">Click to upload CSV</p>
                <p className="text-xs text-gray-500 mt-1">
                  {entityLabel === "books" ? "Expected columns: isbn, title, author, quantity" : "Expected columns: email, name, joinDate"}
                </p>
                {file && <p className="text-xs text-emerald-600 mt-2 font-medium">{`\u2713 ${file.name}`}</p>}
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onProcess}
            disabled={!file}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {`Process ${singularEntity} file`}
          </button>
        </div>
      </div>
    </div>
  );
}
