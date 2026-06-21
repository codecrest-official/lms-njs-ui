import type { UserProfile } from "./types";

interface ProfileTabProps {
  userProfile: UserProfile;
  formatDate: (value: string) => string;
}

export function ProfileTab({ userProfile, formatDate }: ProfileTabProps) {
  return (
    <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">Profile Details</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Full Name</p>
          <p className="font-medium text-gray-800">{userProfile.fullName}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Username</p>
          <p className="font-medium text-gray-800">{userProfile.username}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
          <p className="font-medium text-gray-800">{userProfile.email}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
          <p className="font-medium text-gray-800">{userProfile.phone}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Organization</p>
          <p className="font-medium text-gray-800">{userProfile.organization}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Member Since</p>
          <p className="font-medium text-gray-800">{formatDate(userProfile.memberSince)}</p>
        </div>
      </div>
    </section>
  );
}
