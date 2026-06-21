import clsx from "clsx";
import type { ManagedUser } from "./types";

interface AddUserModalProps {
  open: boolean;
  selectedUsersForRemoval: Set<number>;
  users: ManagedUser[];
  newUserEmail: string;
  onEmailChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function AddUserModal({
  open,
  selectedUsersForRemoval,
  users,
  newUserEmail,
  onEmailChange,
  onClose,
  onConfirm,
}: AddUserModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedUsersForRemoval.size > 0 ? "Remove User from Subscription" : "Add User to Subscription"}
          </h3>
        </div>

        <div className="px-6 py-4 space-y-4">
          {selectedUsersForRemoval.size > 0 ? (
            <>
              <p className="text-sm text-gray-600">Are you sure you want to remove this user from the subscription?</p>
              <p className="text-sm font-medium text-gray-800">
                {users.find((u) => selectedUsersForRemoval.has(u.id))?.name}
              </p>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Email</label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="user@company.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          )}
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
            onClick={onConfirm}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-medium text-white",
              selectedUsersForRemoval.size > 0 ? "bg-rose-600 hover:bg-rose-700" : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            {selectedUsersForRemoval.size > 0 ? "Remove User" : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}
