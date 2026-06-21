import type { OverdueUser } from "./types";

interface NotificationModalProps {
  open: boolean;
  overdueUsers: OverdueUser[];
  onClose: () => void;
  onSend: () => void;
}

export function NotificationModal({ open, overdueUsers, onClose, onSend }: NotificationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">Send Notification to Overdue Users</h3>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Users</label>
            <div className="space-y-2">
              {overdueUsers.map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="text-sm text-gray-700">
                    {item.user} ({item.days} days overdue)
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              rows={3}
              placeholder="Enter notification message..."
              defaultValue="Please return the borrowed book at your earliest convenience."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
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
            onClick={onSend}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
}
