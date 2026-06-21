"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  CreditCardIcon,
  LogOutIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import { ActivityTab } from "./ActivityTab";
import { AddUserModal } from "./AddUserModal";
import { BooksTab } from "./BooksTab";
import { BulkUploadModal } from "./BulkUploadModal";
import { NotificationModal } from "./NotificationModal";
import { OverviewTab } from "./OverviewTab";
import { SubscriptionsTab } from "./SubscriptionsTab";
import type {
  BorrowingActivityItem,
  BorrowingTrendData,
  GraphPeriod,
  ManagedUser,
  OrganizationSubscription,
  OrgBooth,
  OrgStats,
  OrgTab,
  OverdueUser,
} from "./types";
import { UsersTab } from "./UsersTab";

type BulkTarget = "users" | "books";

interface OrgAdminDashboardProps {
  orgStats: OrgStats;
  orgTab: OrgTab;
  setOrgTab: (tab: OrgTab) => void;
  graphPeriod: GraphPeriod;
  setGraphPeriod: (period: GraphPeriod) => void;
  booths: OrgBooth[];
  borrowingActivity: BorrowingActivityItem[];
  overdueUsers: OverdueUser[];
  users: ManagedUser[];
  subscriptions: OrganizationSubscription[];
  borrowingTrendData: BorrowingTrendData;
  userStatuses: Record<number, string>;
  setUserStatuses: (value: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => void;
  showUserModal: boolean;
  setShowUserModal: (show: boolean) => void;
  showNotificationModal: boolean;
  setShowNotificationModal: (show: boolean) => void;
  showBulkUpload: boolean;
  setShowBulkUpload: (show: boolean) => void;
  newUserEmail: string;
  setNewUserEmail: (value: string) => void;
  selectedUsersForRemoval: Set<number>;
  setSelectedUsersForRemoval: (ids: Set<number>) => void;
  bulkUserFile: File | null;
  setBulkUserFile: (file: File | null) => void;
  onLogout: () => void;
}

const tabIcons: Record<OrgTab, React.ComponentType<{ className?: string }>> = {
  overview: BarChart3Icon,
  books: BookOpenIcon,
  activity: BellIcon,
  subscriptions: CreditCardIcon,
  users: UsersIcon,
};

export function OrgAdminDashboard({
  orgStats,
  orgTab,
  setOrgTab,
  graphPeriod,
  setGraphPeriod,
  booths,
  borrowingActivity,
  overdueUsers,
  users,
  subscriptions,
  borrowingTrendData,
  userStatuses,
  setUserStatuses,
  showUserModal,
  setShowUserModal,
  showNotificationModal,
  setShowNotificationModal,
  showBulkUpload,
  setShowBulkUpload,
  newUserEmail,
  setNewUserEmail,
  selectedUsersForRemoval,
  setSelectedUsersForRemoval,
  bulkUserFile,
  setBulkUserFile,
  onLogout,
}: OrgAdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkTarget, setBulkTarget] = useState<BulkTarget>("users");

  const normalizedSearch = searchQuery.toLowerCase().trim();
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          !normalizedSearch ||
          user.name.toLowerCase().includes(normalizedSearch) ||
          user.email.toLowerCase().includes(normalizedSearch)
      ),
    [users, normalizedSearch]
  );

  const filteredActivity = useMemo(
    () =>
      borrowingActivity.filter(
        (item) =>
          !normalizedSearch ||
          item.user.toLowerCase().includes(normalizedSearch) ||
          item.book.toLowerCase().includes(normalizedSearch) ||
          item.booth.toLowerCase().includes(normalizedSearch)
      ),
    [borrowingActivity, normalizedSearch]
  );

  const trendData = borrowingTrendData[graphPeriod];
  const maxValue = Math.max(...trendData.map((point) => point.activeUsers), 1);
  const activeUsersCount = Object.values(userStatuses).filter((status) => status === "Active").length;
  const distinctUsersCount = new Set(borrowingActivity.map((item) => item.user)).size;

  const handleToggleUser = (id: number, enabled: boolean) => {
    setUserStatuses((prev) => ({
      ...prev,
      [id]: enabled ? "Active" : "Inactive",
    }));
  };

  const handleEnableAll = () => {
    const next = users.reduce<Record<number, string>>((acc, user) => {
      acc[user.id] = "Active";
      return acc;
    }, {});
    setUserStatuses(next);
  };

  const handleDisableAll = () => {
    const next = users.reduce<Record<number, string>>((acc, user) => {
      acc[user.id] = "Inactive";
      return acc;
    }, {});
    setUserStatuses(next);
  };

  const handleOpenAddUser = () => {
    setSelectedUsersForRemoval(new Set());
    setShowUserModal(true);
  };

  const handleRequestRemoveUser = (id: number) => {
    setSelectedUsersForRemoval(new Set([id]));
    setShowUserModal(true);
  };

  const handleConfirmUser = () => {
    if (selectedUsersForRemoval.size > 0) {
      setUserStatuses((prev) => {
        const next = { ...prev };
        for (const id of selectedUsersForRemoval) {
          next[id] = "Inactive";
        }
        return next;
      });
    }
    setSelectedUsersForRemoval(new Set());
    setNewUserEmail("");
    setShowUserModal(false);
  };

  const handleOpenBulkUpload = (target: BulkTarget) => {
    setBulkTarget(target);
    setShowBulkUpload(true);
  };

  const handleCloseBulkUpload = () => {
    setShowBulkUpload(false);
    setBulkUserFile(null);
  };

  const handleProcessBulk = () => {
    setShowBulkUpload(false);
    setBulkUserFile(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white p-6 overflow-y-auto">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
            <BookOpenIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Library Booth</p>
            <p className="text-xs text-gray-500">Org Admin</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, books, booths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="mb-8 space-y-2">
          {(["overview", "books", "activity", "subscriptions", "users"] as OrgTab[]).map((tab) => {
            const Icon = tabIcons[tab];
            return (
              <button
                key={tab}
                onClick={() => setOrgTab(tab)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  orgTab === tab
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab === "overview" ? "Dashboard" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Organization: {orgStats.organizationName}</p>
            </div>

            <div className="flex items-center gap-4">
              <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100 transition-colors">
                <BellIcon className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 rounded-full bg-gray-100 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white">
                  OA
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Org Admin</p>
                  <p className="text-xs text-gray-500">{orgStats.organizationName}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {orgTab === "overview" && (
            <OverviewTab
              orgStats={orgStats}
              booths={booths}
              overdueUsers={overdueUsers}
              graphPeriod={graphPeriod}
              trendData={trendData}
              maxValue={maxValue}
              activeUsersCount={activeUsersCount}
              distinctUsersCount={distinctUsersCount}
              onNavigate={setOrgTab}
              onGraphPeriodChange={setGraphPeriod}
              onOpenNotificationModal={() => setShowNotificationModal(true)}
              borrowingActivity={filteredActivity}
            />
          )}
          {orgTab === "books" && (
            <BooksTab borrowingActivity={filteredActivity} onOpenBulkUpload={() => handleOpenBulkUpload("books")} />
          )}
          {orgTab === "activity" && <ActivityTab borrowingActivity={filteredActivity} />}
          {orgTab === "subscriptions" && <SubscriptionsTab subscriptions={subscriptions} />}
          {orgTab === "users" && (
            <UsersTab
              users={filteredUsers}
              userStatuses={userStatuses}
              onToggleUser={handleToggleUser}
              onEnableAll={handleEnableAll}
              onDisableAll={handleDisableAll}
              onOpenBulkUpload={() => handleOpenBulkUpload("users")}
              onOpenAddUser={handleOpenAddUser}
              onRequestRemoveUser={handleRequestRemoveUser}
            />
          )}
        </div>
      </div>

      <AddUserModal
        open={showUserModal}
        selectedUsersForRemoval={selectedUsersForRemoval}
        users={users}
        newUserEmail={newUserEmail}
        onEmailChange={setNewUserEmail}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUsersForRemoval(new Set());
        }}
        onConfirm={handleConfirmUser}
      />

      <NotificationModal
        open={showNotificationModal}
        overdueUsers={overdueUsers}
        onClose={() => setShowNotificationModal(false)}
        onSend={() => setShowNotificationModal(false)}
      />

      <BulkUploadModal
        open={showBulkUpload}
        file={bulkUserFile}
        onFileChange={setBulkUserFile}
        onClose={handleCloseBulkUpload}
        onProcess={handleProcessBulk}
        entityLabel={bulkTarget}
      />
    </main>
  );
}
