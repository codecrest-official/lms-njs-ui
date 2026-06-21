import { useState } from "react";
import { BookPlusIcon, SendIcon } from "lucide-react";

interface RequestItem {
  id: number;
  title: string;
  author: string;
  language: string;
  priority: "low" | "normal" | "high";
  notes: string;
  requestedBy: string;
  requestedAt: string;
  status: "Pending Review";
}

interface BookRequestPanelProps {
  requestedBy: string;
  contextLabel: string;
}

export function BookRequestPanel({ requestedBy, contextLabel }: BookRequestPanelProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [language, setLanguage] = useState("English");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);

  const submitRequest = () => {
    const normalizedTitle = title.trim();
    const normalizedAuthor = author.trim();

    if (!normalizedTitle || !normalizedAuthor) {
      setMessage("Book title and author are required.");
      return;
    }

    setRequests((prev) => [
      {
        id: prev.length + 1,
        title: normalizedTitle,
        author: normalizedAuthor,
        language,
        priority,
        notes: notes.trim(),
        requestedBy,
        requestedAt: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        status: "Pending Review",
      },
      ...prev,
    ]);

    setTitle("");
    setAuthor("");
    setLanguage("English");
    setPriority("normal");
    setNotes("");
    setMessage("Request submitted successfully.");
  };

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-2">
        <BookPlusIcon className="h-5 w-5 text-indigo-700" />
        <h3 className="text-lg font-semibold text-gray-800">Request a Specific Book</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600">{contextLabel}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Book title"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black"
        />
        <input
          type="text"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Author"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black"
        />
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        >
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Marathi">Marathi</option>
          <option value="Bengali">Bengali</option>
          <option value="Tamil">Tamil</option>
          <option value="Telugu">Telugu</option>
          <option value="Kannada">Kannada</option>
          <option value="Malayalam">Malayalam</option>
          <option value="Gujarati">Gujarati</option>
          <option value="Punjabi">Punjabi</option>
          <option value="Odia">Odia</option>
          <option value="Urdu">Urdu</option>
        </select>
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as "low" | "normal" | "high")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        >
          <option value="low">Low priority</option>
          <option value="normal">Normal priority</option>
          <option value="high">High priority</option>
        </select>
      </div>

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Optional notes (edition, publisher, why needed)"
        className="mt-3 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black"
      />

      <button
        type="button"
        onClick={submitRequest}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white"
      >
        <SendIcon className="h-4 w-4" />
        Submit Request
      </button>

      {message && (
        <p className={"mt-2 text-sm " + (message.includes("success") ? "text-emerald-700" : "text-rose-600")}>{message}</p>
      )}

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700">Recent Requests</h4>
        <div className="mt-2 space-y-2">
          {requests.length > 0 ? (
            requests.map((request) => (
              <div key={request.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-gray-800">{request.title} - {request.author}</p>
                  <span className="inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                    {request.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Requested by {request.requestedBy} on {request.requestedAt}</p>
                <p className="text-xs text-gray-500">Language: {request.language} | Priority: {request.priority}</p>
                {request.notes && <p className="mt-1 text-xs text-gray-600">Notes: {request.notes}</p>}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No requests submitted yet.</p>
          )}
        </div>
      </div>
    </article>
  );
}
