"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OrgAdminDashboard } from "@/components/dashboard/org-admin/OrgAdminDashboard";
import { AppAdminDashboard } from "@/components/dashboard/app-admin/AppAdminDashboard";
import { AccessTab } from "@/components/dashboard/user/AccessTab";
import { AdminOperatorWorkspace } from "@/components/dashboard/user/AdminOperatorWorkspace";
import { BooksTab as UserBooksTab } from "@/components/dashboard/user/BooksTab";
import { BoothTab } from "@/components/dashboard/user/BoothTab";
import { ProfileTab } from "@/components/dashboard/user/ProfileTab";
import { SubscriptionTab } from "@/components/dashboard/user/SubscriptionTab";
import { UserDashboardLayout } from "@/components/dashboard/user/UserDashboardLayout";
import type {
  BorrowingActivityItem,
  BorrowingTrendData,
  ManagedUser,
  OrganizationSubscription,
  OrgBooth,
  OrgStats,
  OrgTab,
} from "@/components/dashboard/org-admin/types";
import type {
  ActiveLock,
  BoothBook,
  BorrowHistoryItem,
  BorrowedBook,
  SubscriptionPlan,
  UserBooth,
  UserDashboardTab,
  UserProfile,
} from "@/components/dashboard/user/types";
import type { AuthProfile, UserRole } from "@/types/auth";

type DashboardTab = UserDashboardTab;

const borrowedBooks: BorrowedBook[] = [
  {
    id: 1,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    borrowedDate: "2026-05-20",
    dueDate: "2026-06-20",
    boothName: "Infosys Hinjewadi Library Kiosk",
  },
  {
    id: 2,
    title: "Malgudi Days",
    author: "R. K. Narayan",
    borrowedDate: "2026-05-28",
    dueDate: "2026-06-25",
    boothName: "Infosys Hinjewadi Library Kiosk",
  },
  {
    id: 3,
    title: "The Blue Umbrella",
    author: "Ruskin Bond",
    borrowedDate: "2026-06-10",
    dueDate: "2026-06-28",
    boothName: "TCS Talawade Employee Library Booth",
  },
];

const borrowHistory: BorrowHistoryItem[] = [
  {
    id: 11,
    title: "The Guide",
    borrowedDate: "2026-04-01",
    returnedDate: "2026-04-20",
    boothName: "Infosys Hinjewadi Library Kiosk",
  },
  {
    id: 12,
    title: "Train to Pakistan",
    borrowedDate: "2026-04-22",
    returnedDate: "2026-05-15",
    boothName: "Tata Motors Plant Library Kiosk",
  },
  {
    id: 13,
    title: "Yayati",
    borrowedDate: "2026-05-01",
    returnedDate: "2026-05-25",
    boothName: "Infosys Hinjewadi Library Kiosk",
  },
];

const subscriptionPlans: SubscriptionPlan[] = [
  { id: 1, name: "Basic", level: "organization", description: "Entry-level plan for organizations", maxUsersAllowed: 10, maxBooksPerUser: 1, costPerYearInr: 99, subscriptionDurationId: 4 },
  { id: 2, name: "Standard", level: "organization", description: "Mid-tier plan for organizations", maxUsersAllowed: 50, maxBooksPerUser: 2, costPerYearInr: 299, subscriptionDurationId: 4 },
  { id: 3, name: "Premium", level: "organization", description: "Advanced plan for organizations", maxUsersAllowed: 200, maxBooksPerUser: 3, costPerYearInr: 799, subscriptionDurationId: 4 },
  { id: 4, name: "Enterprise", level: "organization", description: "Unlimited plan for organizations", maxUsersAllowed: 999999, maxBooksPerUser: 5, costPerYearInr: 1999, subscriptionDurationId: 4 },
];

const currentSubscription = {
  planName: "Enterprise",
  subscriberType: "organization",
  subscriberId: 1,
  startDate: "2025-01-01",
  endDate: "2026-01-01",
  renewalDate: "2026-01-01",
  autoRenew: true,
};

const userProfile: UserProfile = {
  username: "rahul.verma",
  fullName: "Rahul Singh Verma",
  email: "rahul.verma@infosys.com",
  phone: "+91-9876543230",
  role: "user",
  organization: "Infosys Limited - Pune DC",
  memberSince: "2023-06-15",
};

const initialBooths: UserBooth[] = [
  {
    id: 1,
    name: "Infosys Hinjewadi Library Kiosk",
    locationName: "Hinjewadi, Pune",
    latitude: 18.591845,
    longitude: 73.739856,
    status: "online",
    accessType: "organization",
    organizationName: "Infosys Limited - Pune DC",
  },
  {
    id: 2,
    name: "TCS Talawade Employee Library Booth",
    locationName: "Talawade, Pune",
    latitude: 18.653234,
    longitude: 73.769087,
    status: "online",
    accessType: "public",
  },
  {
    id: 3,
    name: "Tech Mahindra Smart Library Station",
    locationName: "Hinjewadi Phase 3, Pune",
    latitude: 18.596532,
    longitude: 73.734521,
    status: "maintenance",
    accessType: "public",
  },
  {
    id: 4,
    name: "Tata Motors Plant Library Kiosk",
    locationName: "Pimpri, Pune",
    latitude: 18.629847,
    longitude: 73.802345,
    status: "online",
    accessType: "organization",
    organizationName: "Tata Motors",
  },
];

const initialBoothBooks: Record<number, BoothBook[]> = {
  1: [
    { id: 101, title: "Kosala", author: "Bhalchandra Nemade", availableCopies: 4 },
    { id: 102, title: "And Then There Were None", author: "Agatha Christie", availableCopies: 6 },
    { id: 103, title: "Malgudi Days", author: "R. K. Narayan", availableCopies: 2 },
  ],
  2: [
    { id: 201, title: "Great Expectations", author: "Charles Dickens", availableCopies: 3 },
    { id: 202, title: "The Guide", author: "R. K. Narayan", availableCopies: 5 },
  ],
  3: [
    { id: 301, title: "The Secret Seven", author: "Enid Blyton", availableCopies: 4 },
    { id: 302, title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", availableCopies: 1 },
  ],
  4: [
    { id: 401, title: "Mrityunjay", author: "Shivaji Sawant", availableCopies: 7 },
    { id: 402, title: "Train to Pakistan", author: "Khushwant Singh", availableCopies: 3 },
  ],
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function daysUntil(value: string): number {
  const now = new Date();
  const target = new Date(value);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getBookStatusColor(_borrowedDate: string, _dueDate: string, daysLeft: number) {
  if (daysLeft < 0) {
    return { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-700" };
  }
  if (daysLeft <= 3) {
    return { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" };
  }
  if (daysLeft <= 7) {
    return { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" };
  }
  return { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" };
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const aa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return earthKm * (2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)));
}

function parseBoothFromQr(qrValue: string, boothList: UserBooth[]): UserBooth | null {
  const parsedId = Number.parseInt(qrValue, 10);
  if (!Number.isNaN(parsedId)) {
    return boothList.find((booth) => booth.id === parsedId) ?? null;
  }

  const normalized = qrValue.toLowerCase();
  return boothList.find((booth) => normalized.includes(booth.locationName.toLowerCase()) || normalized.includes(booth.name.toLowerCase())) ?? null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("access");
  const [orgTab, setOrgTab] = useState<OrgTab>("overview");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [graphPeriod, setGraphPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [selectedUsersForRemoval, setSelectedUsersForRemoval] = useState<Set<number>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [activeLock, setActiveLock] = useState<ActiveLock | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastScannedBooth, setLastScannedBooth] = useState<UserBooth | null>(null);
  const [lastScannedQr, setLastScannedQr] = useState("");
  const [authenticatingBooth, setAuthenticatingBooth] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
  const [doorOpenUntil, setDoorOpenUntil] = useState<number | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [userStatuses, setUserStatuses] = useState<Record<number, string>>({ 1: "Active", 2: "Active", 3: "Active", 4: "Inactive", 5: "Active" });
  const [bulkUserFile, setBulkUserFile] = useState<File | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [boothCatalog, setBoothCatalog] = useState<UserBooth[]>(initialBooths);
  const [boothInventory, setBoothInventory] = useState<Record<number, BoothBook[]>>(initialBoothBooks);
  const [selectedBoothId, setSelectedBoothId] = useState<number>(0);
  const [nowTs] = useState<number>(0);

  const isInitialMount = useRef(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const currentTs = useMemo(() => (nowTs > 0 ? nowTs : new Date().getTime()), [nowTs]);
  const activeRole = profile?.activeRole ?? "user";
  const maxBooksAllowed = subscriptionPlans.find((plan) => plan.name === currentSubscription.planName)?.maxBooksPerUser ?? 1;
  const borrowedCount = borrowedBooks.length;
  const availableToBorrow = Math.max(0, maxBooksAllowed - borrowedCount);
  const isDoorOpen = doorOpenUntil !== null && doorOpenUntil > currentTs;
  const doorOpenSeconds = isDoorOpen ? Math.max(0, Math.ceil((doorOpenUntil - currentTs) / 1000)) : 0;

  const userOrganization = userProfile.organization.trim().toLowerCase();
  const visibleBooths = useMemo(() => {
    if (currentSubscription.subscriberType === "organization") {
      return boothCatalog.filter(
        (booth) =>
          booth.accessType === "organization" &&
          booth.organizationName?.trim().toLowerCase() === userOrganization
      );
    }

    return boothCatalog.filter((booth) => booth.accessType === "public");
  }, [boothCatalog, userOrganization]);

  const accessibleBooths = useMemo(
    () => visibleBooths.filter((booth) => booth.status === "online"),
    [visibleBooths]
  );

  const boothsWithDistance = useMemo(() => {
    if (!currentLocation) {
      return accessibleBooths.map((booth) => ({ booth, distanceKm: null as number | null }));
    }

    return accessibleBooths
      .map((booth) => ({ booth, distanceKm: haversineKm(currentLocation.lat, currentLocation.lng, booth.latitude, booth.longitude) }))
      .sort((a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER));
  }, [accessibleBooths, currentLocation]);

  const nearestBooth = boothsWithDistance[0]?.booth;
  const selectedBooth = accessibleBooths.find((booth) => booth.id === selectedBoothId) ?? null;
  const selectedBoothBooks = selectedBooth ? boothInventory[selectedBooth.id] ?? [] : [];

  useEffect(() => {
    if (accessibleBooths.length === 0) {
      if (selectedBoothId !== 0) {
        setSelectedBoothId(0);
      }
      return;
    }

    const hasSelected = accessibleBooths.some((booth) => booth.id === selectedBoothId);
    if (!hasSelected) {
      setSelectedBoothId(accessibleBooths[0].id);
    }
  }, [accessibleBooths, selectedBoothId]);

  const getLockRemaining = (bookId: number) => {
    if (!activeLock || activeLock.bookId !== bookId) return 0;
    return Math.max(0, Math.floor((activeLock.expiresAt - new Date().getTime()) / 1000));
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    try {
      const raw = window.sessionStorage.getItem("authProfile");
      const loaded = raw ? (JSON.parse(raw) as AuthProfile) : null;
      setProfile(loaded);
    } catch {
      setProfile(null);
    } finally {
      setHydrated(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isDoorOpen) return;
    const id = window.setInterval(() => {
      if (doorOpenUntil && doorOpenUntil <= new Date().getTime()) {
        setDoorOpenUntil(null);
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [isDoorOpen, doorOpenUntil]);

  const stopScanner = () => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScannerOpen(false);
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const handleQrAuth = (qrValue: string) => {
    setAuthenticatingBooth(true);
    setAccessError(null);
    setAccessMessage(null);
    setLastScannedQr(qrValue);

    const matchedBooth = parseBoothFromQr(qrValue, accessibleBooths);
    if (!matchedBooth) {
      setAccessGranted(false);
      setAccessError("Unrecognized booth QR. Please scan a valid booth QR code.");
      setAuthenticatingBooth(false);
      return;
    }

    setLastScannedBooth(matchedBooth);
    const canAccess = matchedBooth.status === "online";
    setAccessGranted(canAccess);

    if (!canAccess) {
      setAccessError("Booth is currently unavailable.");
      setAuthenticatingBooth(false);
      return;
    }

    setDoorOpenUntil(new Date().getTime() + 30_000);
    setAccessMessage(`Access granted to ${matchedBooth.name}. Door unlocked for 30 seconds.`);
    setAuthenticatingBooth(false);
  };

  const startScanner = async () => {
    try {
      setAccessError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScannerOpen(true);
      const detector = "BarcodeDetector" in window
        ? new (window as { BarcodeDetector: new (options: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector({ formats: ["qr_code"] })
        : null;

      const scanFrame = async () => {
        if (!videoRef.current || !scannerOpen) return;
        try {
          if (detector) {
            const barcodes = await detector.detect(videoRef.current);
            const qr = barcodes[0]?.rawValue;
            if (qr) {
              handleQrAuth(qr);
              stopScanner();
              return;
            }
          }
        } catch {
          // ignore per-frame detection errors
        }

        rafRef.current = window.setTimeout(() => {
          window.requestAnimationFrame(scanFrame);
        }, 600) as unknown as number;
      };

      window.requestAnimationFrame(scanFrame);
    } catch {
      setAccessError("Unable to access camera. Please check browser permissions.");
      stopScanner();
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setDetectingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setDetectingLocation(false);
      },
      () => {
        setLocationError("Unable to fetch current location.");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const lockBookFor30Min = (bookId: number) => {
    if (activeLock && activeLock.expiresAt > new Date().getTime() && activeLock.bookId !== bookId) {
      setLockError("Another book is already locked. Please wait for it to expire.");
      return;
    }

    setLockError(null);
    setActiveLock({ boothId: selectedBoothId, bookId, expiresAt: new Date().getTime() + 30 * 60 * 1000 });
  };

  const addBookToBooth = (boothId: number, title: string, author: string, availableCopies: number) => {
    const normalizedTitle = title.trim();
    const normalizedAuthor = author.trim();
    if (!normalizedTitle || !normalizedAuthor) return;

    setBoothInventory((prev) => {
      const nextId = Math.max(0, ...Object.values(prev).flat().map((book) => book.id)) + 1;
      const existing = prev[boothId] ?? [];
      return {
        ...prev,
        [boothId]: [...existing, { id: nextId, title: normalizedTitle, author: normalizedAuthor, availableCopies: Math.max(0, availableCopies) }],
      };
    });
  };

  const removeBookFromBooth = (boothId: number, bookId: number) => {
    setBoothInventory((prev) => ({
      ...prev,
      [boothId]: (prev[boothId] ?? []).filter((book) => book.id !== bookId),
    }));
    if (activeLock?.bookId === bookId) {
      setActiveLock(null);
    }
  };

  const updateBoothStatus = (boothId: number, status: UserBooth["status"]) => {
    setBoothCatalog((prev) => prev.map((booth) => (booth.id === boothId ? { ...booth, status } : booth)));
  };

  const switchAdminRole = (role: UserRole) => {
    if (!profile) return;
    if (!profile.allowedRoles.includes(role)) return;

    const updated = { ...profile, activeRole: role };
    setProfile(updated);
    window.sessionStorage.setItem("authProfile", JSON.stringify(updated));
  };

  const logout = () => {
    stopScanner();
    window.sessionStorage.removeItem("authProfile");
    router.push("/login");
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4 py-12">
        <div className="mx-auto flex max-w-2xl items-center justify-center rounded-2xl bg-white p-12 shadow-xl ring-1 ring-gray-200">
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </main>
    );
  }

  if (activeRole === "org_admin") {
    const orgStats: OrgStats = {
      totalUsers: 24,
      activeLoans: 47,
      totalBooks: 312,
      borrowingRate: "58%",
      subscriptionStatus: "Enterprise",
      organizationName: "Infosys Limited",
      totalBooths: 4,
    };

    const orgBooths: OrgBooth[] = [
      { id: 1, name: "Hinjewadi Kiosk", location: "Pune - Hinjewadi", status: "online" },
      { id: 2, name: "Talawade Booth", location: "Pune - Talawade", status: "online" },
      { id: 3, name: "Bangalore Branch", location: "Bangalore - Whitefield", status: "online" },
      { id: 4, name: "Mumbai Hub", location: "Mumbai - Kala Ghoda", status: "maintenance" },
    ];

    const borrowingActivity: BorrowingActivityItem[] = [
      { user: "Rahul Verma", book: "Pride and Prejudice", action: "borrowed", date: "2026-06-16", booth: "Hinjewadi Kiosk" },
      { user: "Priya Singh", book: "Malgudi Days", action: "returned", date: "2026-06-15", booth: "Hinjewadi Kiosk" },
      { user: "Amit Patel", book: "The Guide", action: "borrowed", date: "2026-06-15", booth: "Talawade Booth" },
      { user: "Neha Desai", book: "Train to Pakistan", action: "overdue", date: "2026-06-10", booth: "Hinjewadi Kiosk" },
      { user: "Vikram Kumar", book: "Yayati", action: "borrowed", date: "2026-06-14", booth: "Talawade Booth" },
    ];

    const overdueUsers = borrowingActivity.filter((item) => item.action === "overdue").map((item) => ({ user: item.user, days: 6 }));

    const userManagementData: ManagedUser[] = [
      { id: 1, name: "Rahul Singh Verma", role: "Member", email: "rahul.verma@infosys.com", joinDate: "2026-01-15" },
      { id: 2, name: "Priya Singh", role: "Member", email: "priya.singh@infosys.com", joinDate: "2026-02-20" },
      { id: 3, name: "Amit Patel", role: "Member", email: "amit.patel@infosys.com", joinDate: "2026-03-10" },
      { id: 4, name: "Neha Desai", role: "Member", email: "neha.desai@infosys.com", joinDate: "2025-12-05" },
      { id: 5, name: "Vikram Kumar", role: "Member", email: "vikram.kumar@infosys.com", joinDate: "2026-04-01" },
    ];

    const subscriptions: OrganizationSubscription[] = [
      { name: "Enterprise", maxUsers: 999999, maxBooks: 5, cost: "₹1,999/year", status: "Active", renewDate: "2026-12-31" },
    ];

    const borrowingTrendData: BorrowingTrendData = {
      daily: [
        { label: "Mon", activeUsers: 12 },
        { label: "Tue", activeUsers: 15 },
        { label: "Wed", activeUsers: 18 },
        { label: "Thu", activeUsers: 14 },
        { label: "Fri", activeUsers: 20 },
        { label: "Sat", activeUsers: 10 },
        { label: "Sun", activeUsers: 8 },
      ],
      weekly: [
        { label: "Week 1", activeUsers: 18 },
        { label: "Week 2", activeUsers: 22 },
        { label: "Week 3", activeUsers: 20 },
        { label: "Week 4", activeUsers: 24 },
      ],
      monthly: [
        { label: "Jan", activeUsers: 20 },
        { label: "Feb", activeUsers: 22 },
        { label: "Mar", activeUsers: 21 },
        { label: "Apr", activeUsers: 23 },
        { label: "May", activeUsers: 24 },
        { label: "Jun", activeUsers: 22 },
      ],
    };

    return (
      <OrgAdminDashboard
        orgStats={orgStats}
        orgTab={orgTab}
        setOrgTab={setOrgTab}
        graphPeriod={graphPeriod}
        setGraphPeriod={setGraphPeriod}
        booths={orgBooths}
        borrowingActivity={borrowingActivity}
        overdueUsers={overdueUsers}
        users={userManagementData}
        subscriptions={subscriptions}
        borrowingTrendData={borrowingTrendData}
        userStatuses={userStatuses}
        setUserStatuses={setUserStatuses}
        showUserModal={showUserModal}
        setShowUserModal={setShowUserModal}
        showNotificationModal={showNotificationModal}
        setShowNotificationModal={setShowNotificationModal}
        showBulkUpload={showBulkUpload}
        setShowBulkUpload={setShowBulkUpload}
        newUserEmail={newUserEmail}
        setNewUserEmail={setNewUserEmail}
        selectedUsersForRemoval={selectedUsersForRemoval}
        setSelectedUsersForRemoval={setSelectedUsersForRemoval}
        bulkUserFile={bulkUserFile}
        setBulkUserFile={setBulkUserFile}
        onLogout={logout}
      />
    );
  }

  if (activeRole === "admin") {
    return (
      <AppAdminDashboard
        onLogout={logout}
      />
    );
  }

  if (activeRole !== "user") {
    return (
      <AdminOperatorWorkspace
        activeRole={activeRole}
        canSwitch={false}
        booths={boothCatalog}
        boothBooksByBoothId={boothInventory}
        onSwitchRole={switchAdminRole}
        onSetBoothStatus={updateBoothStatus}
        onAddBookToBooth={addBookToBooth}
        onRemoveBookFromBooth={removeBookFromBooth}
        onLogout={logout}
      />
    );
  }

  return (
    <UserDashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={logout} userProfile={userProfile}>
      {activeTab === "access" && (
        <AccessTab
          scannerOpen={scannerOpen}
          authenticatingBooth={authenticatingBooth}
          accessError={accessError}
          accessMessage={accessMessage}
          lastScannedBooth={lastScannedBooth}
          lastScannedQr={lastScannedQr}
          isDoorOpen={isDoorOpen}
          doorOpenSeconds={doorOpenSeconds}
          accessGranted={accessGranted}
          videoRef={videoRef}
          onStartScanner={startScanner}
          onStopScanner={stopScanner}
        />
      )}

      {activeTab === "books" && (
        <UserBooksTab
          maxBooksAllowed={maxBooksAllowed}
          borrowedCount={borrowedCount}
          availableToBorrow={availableToBorrow}
          reminderDaysBefore={reminderDaysBefore}
          showHistory={showHistory}
          borrowedBooks={borrowedBooks}
          borrowHistory={borrowHistory}
          onReminderChange={setReminderDaysBefore}
          onToggleHistory={() => setShowHistory((value) => !value)}
          formatDate={formatDate}
          daysUntil={daysUntil}
          getBookStatusColor={getBookStatusColor}
        />
      )}

      {activeTab === "subscription" && (
        <SubscriptionTab
          currentSubscription={currentSubscription}
          subscriptionPlans={subscriptionPlans}
          formatDate={formatDate}
        />
      )}

      {activeTab === "profile" && <ProfileTab userProfile={userProfile} formatDate={formatDate} />}

      {activeTab === "booth" && (
        <BoothTab
          accessibleBooths={accessibleBooths}
          boothBooksByBoothId={boothInventory}
          boothsWithDistance={boothsWithDistance}
          selectedBoothId={selectedBoothId}
          selectedBoothBooks={selectedBoothBooks}
          locationError={locationError}
          lockError={lockError}
          detectingLocation={detectingLocation}
          nearestBooth={nearestBooth}
          hasCurrentLocation={currentLocation !== null}
          onDetectLocation={detectLocation}
          onSelectBooth={setSelectedBoothId}
          getLockRemaining={getLockRemaining}
          onLockBook={lockBookFor30Min}
        />
      )}
    </UserDashboardLayout>
  );
}
