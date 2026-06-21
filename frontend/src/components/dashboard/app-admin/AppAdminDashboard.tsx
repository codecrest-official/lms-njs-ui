"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  BarChart3Icon,
  BellIcon,
  BookCopyIcon,
  BookOpenIcon,
  BoxesIcon,
  ClipboardListIcon,
  CreditCardIcon,
  FileClockIcon,
  LogOutIcon,
  PlusIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserCog2Icon,
  UsersIcon,
} from "lucide-react";
import organizationsModel from "@/data/model/organizations.json";
import subscriptionsModel from "@/data/model/subscriptions.json";
import subscriptionPlansModel from "@/data/model/subscriptionPlans.json";
import subscriptionEventTypesModel from "@/data/model/subscriptionEventTypes.json";
import usersModel from "@/data/model/users.json";
import userTypesModel from "@/data/model/userTypes.json";
import boothMasterModel from "@/data/model/boothMaster.json";
import hardwareInventoryModel from "@/data/model/hardwareInventory.json";
import inventoryItemTypesModel from "@/data/model/inventoryItemTypes.json";
import boothStatusModel from "@/data/model/boothStatus.json";

type AdminTab =
  | "overview"
  | "organizations"
  | "sales"
  | "subscriptions"
  | "users"
  | "operators"
  | "booths"
  | "inventory"
  | "procurement"
  | "audit";

type DataTab = Exclude<AdminTab, "overview">;
type RowValue = string | number;
type DataRow = Record<string, RowValue>;

type TabConfig = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  addLabel: string;
  allowAdd?: boolean;
  searchPlaceholder: string;
  columns: Array<{ key: string; label: string }>;
  rows: DataRow[];
  addFields: Array<{ key: string; label: string; placeholder: string; type?: "text" | "number" | "email" | "date" }>;
  mapFormToRow: (form: Record<string, string>, nextId: number) => DataRow;
};

interface AppAdminDashboardProps {
  onLogout: () => void;
}

const tabOrder: AdminTab[] = [
  "overview",
  "organizations",
  "sales",
  "subscriptions",
  "users",
  "operators",
  "booths",
  "inventory",
  "procurement",
  "audit",
];

const tabLabels: Record<AdminTab, string> = {
  overview: "Dashboard",
  organizations: "Organizations",
  sales: "Sales",
  subscriptions: "Subscriptions",
  users: "Users",
  operators: "Operators",
  booths: "Booths",
  inventory: "Inventory",
  procurement: "Procurement",
  audit: "Audit",
};

const tabIcons: Record<AdminTab, React.ComponentType<{ className?: string }>> = {
  overview: BarChart3Icon,
  organizations: ClipboardListIcon,
  sales: ShoppingCartIcon,
  subscriptions: CreditCardIcon,
  users: UsersIcon,
  operators: UserCog2Icon,
  booths: BookOpenIcon,
  inventory: BoxesIcon,
  procurement: ShoppingCartIcon,
  audit: FileClockIcon,
};

type OrganizationCsv = {
  Organization_name: string;
  Organization_code: string;
  contact_email: string;
  contact_phone: string;
  address: string;
};

type SubscriptionCsv = {
  subscription_plan_id: string;
  subscriber_type: string;
  subscriber_id: string;
  subscription_event_type_id: string;
  start_date: string;
  end_date: string;
  renewal_date: string;
  is_auto_renew: string;
  created_date: string;
  last_modified_date: string;
};

type SubscriptionPlanCsv = {
  SubscriptionPlan_name: string;
  subscription_level: string;
  description: string;
  max_users_allowed: string;
  max_books_per_user: string;
  subscription_cost: string;
  subscription_duration_id: string;
};

type UserCsv = {
  User_guid: string;
  username: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  user_type_id: string;
  organization_id: string;
  created_date: string;
  is_active: string;
};

type UserTypeCsv = {
  UserTypes_name: string;
};

type SubscriptionEventTypeCsv = {
  SubscriptionEventType_name: string;
};

type BoothCsv = {
  Booth_name: string;
  location_name: string;
  booth_status_id: string;
  total_book_capacity: string;
  current_book_count: string;
  organization_id: string;
};

type HardwareInventoryCsv = {
  serial_number: string;
  inventory_item_type_id: string;
  model: string;
  warranty_expiry_date: string;
  installed_at_booth_id: string;
  firmware_version: string;
  condition: string;
};

type InventoryItemTypeCsv = {
  InventoryItemType_name: string;
};

type BoothStatusCsv = {
  BoothStatus_name: string;
};

const csvOrganizations = organizationsModel as OrganizationCsv[];
const csvSubscriptions = subscriptionsModel as SubscriptionCsv[];
const csvPlans = subscriptionPlansModel as SubscriptionPlanCsv[];
const csvUsers = usersModel as UserCsv[];
const csvUserTypes = userTypesModel as UserTypeCsv[];
const csvEventTypes = subscriptionEventTypesModel as SubscriptionEventTypeCsv[];
const csvBooths = boothMasterModel as BoothCsv[];
const csvHardwareInventory = hardwareInventoryModel as HardwareInventoryCsv[];
const csvInventoryItemTypes = inventoryItemTypesModel as InventoryItemTypeCsv[];
const csvBoothStatuses = boothStatusModel as BoothStatusCsv[];

const orgById = new Map<number, OrganizationCsv>(csvOrganizations.map((org, index) => [index + 1, org]));
const planById = new Map<number, SubscriptionPlanCsv>(csvPlans.map((plan, index) => [index + 1, plan]));
const userTypeById = new Map<number, string>(csvUserTypes.map((type, index) => [index + 1, type.UserTypes_name]));
const eventTypeById = new Map<number, string>(csvEventTypes.map((type, index) => [index + 1, type.SubscriptionEventType_name]));
const boothStatusById = new Map<number, string>(csvBoothStatuses.map((status, index) => [index + 1, status.BoothStatus_name]));
const inventoryItemTypeById = new Map<number, string>(csvInventoryItemTypes.map((itemType, index) => [index + 1, itemType.InventoryItemType_name]));

const formatSubscriptionStatus = (eventTypeId: string) => {
  const raw = eventTypeById.get(Number(eventTypeId)) || "pending";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const formatFullName = (user: UserCsv) => {
  return [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ");
};

const modelSubscriptions = csvSubscriptions
  .filter((sub) => sub.subscriber_type.toLowerCase() === "organization")
  .map((sub, index) => {
    const orgId = Number(sub.subscriber_id);
    const planId = Number(sub.subscription_plan_id);
    const organization = orgById.get(orgId);
    const plan = planById.get(planId);
    const orgUsersCount = csvUsers.filter(
      (user) => Number(user.organization_id || 0) === orgId && Number(user.user_type_id || 0) === 3
    ).length;

    return {
      id: index + 1,
      plan: plan?.SubscriptionPlan_name || `Plan ${planId}`,
      tenant: organization?.Organization_name || `Organization ${orgId}`,
      users: orgUsersCount,
      maxBooks: Number(plan?.max_books_per_user || 0),
      status: formatSubscriptionStatus(sub.subscription_event_type_id),
      renewDate: sub.renewal_date,
      maxUsersAllowed: Number(plan?.max_users_allowed || 0),
      subscriptionCost: Number(plan?.subscription_cost || 0),
      planLevel: plan?.subscription_level || "organization",
      orgId,
      createdDate: sub.created_date,
    };
  });

const modelOrganizations = modelSubscriptions.map((sub) => ({
  id: sub.orgId,
  organization: sub.tenant,
  plan: sub.plan,
  seatsUsed: sub.users,
  seatsTotal: sub.maxUsersAllowed,
  status: sub.status,
  renewal: sub.renewDate,
  orgSalesInr: sub.subscriptionCost,
}));

const modelUsers = csvUsers
  .filter((user) => Number(user.user_type_id || 0) === 3)
  .map((user, index) => ({
    id: index + 1,
    name: formatFullName(user),
    email: user.email,
    role: userTypeById.get(Number(user.user_type_id || 0)) || "user",
    org: orgById.get(Number(user.organization_id || 0))?.Organization_name || "Unassigned",
    status: user.is_active === "1" ? "Active" : "Inactive",
    subscriptionType: "Organization",
    individualPlan: "-",
    individualSpendInr: 0,
  }));

const modelOperators = csvUsers
  .filter((user) => Number(user.user_type_id || 0) === 2)
  .map((user, index) => ({
    id: index + 1,
    name: formatFullName(user),
    booth: orgById.get(Number(user.organization_id || 0))?.Organization_name || "Unassigned",
    shift: "General",
    status: user.is_active === "1" ? "Online" : "Offline",
  }));

const modelBooths = csvBooths.map((booth, index) => ({
  id: index + 1,
  name: booth.Booth_name,
  location: booth.location_name,
  books: Number(booth.current_book_count || 0),
  capacity: Number(booth.total_book_capacity || 0),
  organization: orgById.get(Number(booth.organization_id || 0))?.Organization_name || "Unassigned",
  status: (() => {
    const raw = boothStatusById.get(Number(booth.booth_status_id || 0)) || "offline";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })(),
}));

const modelBoothHardwareRows = csvHardwareInventory
  .filter((item) => Number(item.installed_at_booth_id || 0) > 0)
  .map((item) => {
    const booth = modelBooths.find((candidate) => candidate.id === Number(item.installed_at_booth_id));
    const typeName = inventoryItemTypeById.get(Number(item.inventory_item_type_id || 0)) || "unknown";
    return {
      booth: booth?.name || `Booth ${item.installed_at_booth_id}`,
      serial: item.serial_number,
      type: typeName.replace("_", " "),
      model: item.model,
      firmware: item.firmware_version || "-",
      condition: item.condition || "-",
      warrantyExpiry: item.warranty_expiry_date || "-",
    };
  });

const initialRows: Record<DataTab, DataRow[]> = {
  organizations: modelOrganizations,
  sales: [],
  subscriptions: modelSubscriptions,
  users: modelUsers,
  operators: modelOperators,
  booths: modelBooths,
  inventory: [
    { id: 1, type: "Book", item: "Atomic Habits", quantity: 44, threshold: 10, status: "Healthy" },
    { id: 2, type: "RFID Tag", item: "HF Tag Batch A12", quantity: 78, threshold: 100, status: "Low Stock" },
    { id: 3, type: "Scanner", item: "Handheld RFID Scanner", quantity: 9, threshold: 5, status: "Healthy" },
  ],
  procurement: [
    { id: 1, po: "PO-2201", vendor: "BookHub", item: "Clean Code", qty: 120, status: "Pending" },
    { id: 2, po: "PO-2202", vendor: "RFIDKart", item: "RFID Tag Stock", qty: 900, status: "Completed" },
  ],
  audit: [
    { id: 1, category: "BookCheckout", actor: "Rahul Verma", action: "Borrowed Atomic Habits", timestamp: "2026-06-21 09:42" },
    { id: 2, category: "Subscription", actor: "Admin", action: "Activated Enterprise Plan", timestamp: "2026-06-21 10:10" },
  ],
};

const tabConfigs: Record<DataTab, TabConfig> = {
  organizations: {
    title: "Organization Management",
    subtitle: "Manage organizations that opted for subscriptions",
    icon: ClipboardListIcon,
    addLabel: "Add Organization",
    searchPlaceholder: "Search organization, plan, status...",
    columns: [
      { key: "id", label: "ID" },
      { key: "organization", label: "Organization" },
      { key: "plan", label: "Plan" },
      { key: "seatsUsed", label: "Active Users" },
      { key: "seatsTotal", label: "Total Users" },
      { key: "status", label: "Status" },
      { key: "renewal", label: "Renewal" },
      { key: "orgSalesInr", label: "Sales (INR)" },
    ],
    rows: initialRows.organizations,
    addFields: [
      { key: "organization", label: "Organization", placeholder: "New Organization" },
      { key: "plan", label: "Plan", placeholder: "Enterprise" },
      { key: "seatsUsed", label: "Active Users", placeholder: "0", type: "number" },
      { key: "seatsTotal", label: "Total Users", placeholder: "100", type: "number" },
      { key: "status", label: "Status", placeholder: "Active" },
      { key: "renewal", label: "Renewal", placeholder: "2026-12-31", type: "date" },
      { key: "orgSalesInr", label: "Sales (INR)", placeholder: "0", type: "number" },
    ],
    mapFormToRow: (form, nextId) => ({
      id: nextId,
      organization: form.organization || "Organization",
      plan: form.plan || "Standard",
      seatsUsed: Number(form.seatsUsed || 0),
      seatsTotal: Number(form.seatsTotal || 0),
      status: form.status || "Active",
      renewal: form.renewal || "-",
      orgSalesInr: Number(form.orgSalesInr || 0),
    }),
  },
  sales: {
    title: "Sales Insights",
    subtitle: "Track sales at organization and user subscription level",
    icon: ShoppingCartIcon,
    addLabel: "",
    allowAdd: false,
    searchPlaceholder: "Search organization or user sales...",
    columns: [],
    rows: initialRows.sales,
    addFields: [],
    mapFormToRow: (_form, nextId) => ({ id: nextId }),
  },
  subscriptions: {
    title: "Subscription Management",
    subtitle: "Manage organization plans and renewals",
    icon: CreditCardIcon,
    addLabel: "Add Subscription",
    searchPlaceholder: "Search plan, organization, status...",
    columns: [
      { key: "id", label: "ID" },
      { key: "plan", label: "Plan" },
      { key: "tenant", label: "Organization" },
      { key: "users", label: "Users" },
      { key: "maxBooks", label: "Books/User" },
      { key: "status", label: "Status" },
      { key: "renewDate", label: "Renewal" },
    ],
    rows: initialRows.subscriptions,
    addFields: [
      { key: "plan", label: "Plan Name", placeholder: "Enterprise" },
      { key: "tenant", label: "Organization", placeholder: "Infosys" },
      { key: "users", label: "Users", placeholder: "200", type: "number" },
      { key: "maxBooks", label: "Books per User", placeholder: "3", type: "number" },
      { key: "status", label: "Status", placeholder: "Active" },
      { key: "renewDate", label: "Renew Date", placeholder: "2026-12-31", type: "date" },
    ],
    mapFormToRow: (form, nextId) => ({
      id: nextId,
      plan: form.plan || "Custom",
      tenant: form.tenant || "Org",
      users: Number(form.users || 0),
      maxBooks: Number(form.maxBooks || 1),
      status: form.status || "Pending",
      renewDate: form.renewDate || "-",
    }),
  },
  users: {
    title: "User Management",
    subtitle: "Manage users by organization and individual subscriptions",
    icon: UsersIcon,
    addLabel: "Add User",
    searchPlaceholder: "Search user, email, org, subscription...",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "org", label: "Organization" },
      { key: "subscriptionType", label: "Subscription Type" },
      { key: "individualPlan", label: "Individual Plan" },
      { key: "status", label: "Status" },
    ],
    rows: initialRows.users,
    addFields: [
      { key: "name", label: "Name", placeholder: "Rahul Verma" },
      { key: "email", label: "Email", placeholder: "user@company.com", type: "email" },
      { key: "role", label: "Role", placeholder: "Member" },
      { key: "org", label: "Organization", placeholder: "Infosys" },
      { key: "subscriptionType", label: "Subscription Type", placeholder: "Organization / Individual" },
      { key: "individualPlan", label: "Individual Plan", placeholder: "Basic Individual" },
      { key: "individualSpendInr", label: "Individual Spend (INR)", placeholder: "0", type: "number" },
      { key: "status", label: "Status", placeholder: "Active" },
    ],
    mapFormToRow: (form, nextId) => ({
      id: nextId,
      name: form.name || "New User",
      email: form.email || "-",
      role: form.role || "Member",
      org: form.org || "-",
      subscriptionType: form.subscriptionType || "Organization",
      individualPlan: form.subscriptionType === "Individual" ? form.individualPlan || "Basic Individual" : "-",
      individualSpendInr: form.subscriptionType === "Individual" ? Number(form.individualSpendInr || 99) : 0,
      status: form.status || "Active",
    }),
  },
  operators: {
    title: "Operator Management",
    subtitle: "Track operator assignment and availability",
    icon: UserCog2Icon,
    addLabel: "Add Operator",
    searchPlaceholder: "Search operator, booth, status...",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "booth", label: "Booth" },
      { key: "shift", label: "Shift" },
      { key: "status", label: "Status" },
    ],
    rows: initialRows.operators,
    addFields: [
      { key: "name", label: "Operator Name", placeholder: "Operator C" },
      { key: "booth", label: "Booth", placeholder: "Mumbai Hub" },
      { key: "shift", label: "Shift", placeholder: "Night" },
      { key: "status", label: "Status", placeholder: "Online" },
    ],
    mapFormToRow: (form, nextId) => ({
      id: nextId,
      name: form.name || "Operator",
      booth: form.booth || "-",
      shift: form.shift || "General",
      status: form.status || "Offline",
    }),
  },
  booths: {
    title: "Booth Management",
    subtitle: "Manage booths and review hardware installed per booth",
    icon: BookOpenIcon,
    addLabel: "Add Booth",
    searchPlaceholder: "Search booth, location, status...",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Booth" },
      { key: "location", label: "Location" },
      { key: "books", label: "Books" },
      { key: "capacity", label: "Capacity" },
      { key: "organization", label: "Organization" },
      { key: "status", label: "Status" },
    ],
    rows: initialRows.booths,
    addFields: [
      { key: "name", label: "Booth Name", placeholder: "Bangalore Branch" },
      { key: "location", label: "Location", placeholder: "Whitefield" },
      { key: "books", label: "Books", placeholder: "80", type: "number" },
      { key: "capacity", label: "Capacity", placeholder: "120", type: "number" },
      { key: "organization", label: "Organization", placeholder: "Infosys Limited" },
      { key: "status", label: "Status", placeholder: "Online" },
    ],
    mapFormToRow: (form, nextId) => ({
      id: nextId,
      name: form.name || "Booth",
      location: form.location || "-",
      books: Number(form.books || 0),
      capacity: Number(form.capacity || 0),
      organization: form.organization || "Unassigned",
      status: form.status || "Online",
    }),
  },
  inventory: {
    title: "Inventory Management",
    subtitle: "Manage books and hardware stock in one place",
    icon: BoxesIcon,
    addLabel: "Add Inventory Item",
    searchPlaceholder: "Search item, type, stock status...",
    columns: [
      { key: "id", label: "ID" },
      { key: "type", label: "Type" },
      { key: "item", label: "Item" },
      { key: "quantity", label: "Qty" },
      { key: "threshold", label: "Threshold" },
      { key: "status", label: "Status" },
    ],
    rows: initialRows.inventory,
    addFields: [
      { key: "type", label: "Type", placeholder: "Book / RFID Tag / Scanner" },
      { key: "item", label: "Item Name", placeholder: "New inventory item" },
      { key: "quantity", label: "Quantity", placeholder: "100", type: "number" },
      { key: "threshold", label: "Threshold", placeholder: "20", type: "number" },
      { key: "status", label: "Status", placeholder: "Healthy" },
    ],
    mapFormToRow: (form, nextId) => ({
      id: nextId,
      type: form.type || "Book",
      item: form.item || "-",
      quantity: Number(form.quantity || 0),
      threshold: Number(form.threshold || 0),
      status: form.status || "Healthy",
    }),
  },
  procurement: {
    title: "Procurement",
    subtitle: "Track purchase orders and vendor fulfillment",
    icon: ShoppingCartIcon,
    addLabel: "Create Purchase Order",
    searchPlaceholder: "Search PO, vendor, status...",
    columns: [
      { key: "id", label: "ID" },
      { key: "po", label: "PO Number" },
      { key: "vendor", label: "Vendor" },
      { key: "item", label: "Item" },
      { key: "qty", label: "Quantity" },
      { key: "status", label: "Status" },
    ],
    rows: initialRows.procurement,
    addFields: [
      { key: "po", label: "PO Number", placeholder: "PO-2203" },
      { key: "vendor", label: "Vendor", placeholder: "BookHub" },
      { key: "item", label: "Item", placeholder: "Book title / hardware" },
      { key: "qty", label: "Quantity", placeholder: "80", type: "number" },
      { key: "status", label: "Status", placeholder: "Pending" },
    ],
    mapFormToRow: (form, nextId) => ({
      id: nextId,
      po: form.po || `PO-${2200 + nextId}`,
      vendor: form.vendor || "Vendor",
      item: form.item || "-",
      qty: Number(form.qty || 0),
      status: form.status || "Pending",
    }),
  },
  audit: {
    title: "Audit Logs",
    subtitle: "Inspect operational and compliance activity",
    icon: FileClockIcon,
    addLabel: "",
    allowAdd: false,
    searchPlaceholder: "Search actor, category, action...",
    columns: [
      { key: "id", label: "ID" },
      { key: "category", label: "Category" },
      { key: "actor", label: "Actor" },
      { key: "action", label: "Action" },
      { key: "timestamp", label: "Timestamp" },
    ],
    rows: initialRows.audit,
    addFields: [
      { key: "category", label: "Category", placeholder: "BookCheckout" },
      { key: "actor", label: "Actor", placeholder: "System" },
      { key: "action", label: "Action", placeholder: "Performed operation" },
      { key: "timestamp", label: "Timestamp", placeholder: "2026-06-21 12:00" },
    ],
    mapFormToRow: (form, nextId) => ({
      id: nextId,
      category: form.category || "General",
      actor: form.actor || "System",
      action: form.action || "Logged event",
      timestamp: form.timestamp || "-",
    }),
  },
};

function getStatusTone(status: string): string {
  const normalized = status.toLowerCase();
  if (["active", "online", "completed", "healthy"].some((key) => normalized.includes(key))) return "bg-emerald-100 text-emerald-700";
  if (["pending", "maintenance", "low stock"].some((key) => normalized.includes(key))) return "bg-amber-100 text-amber-700";
  if (["inactive", "offline", "cancelled"].some((key) => normalized.includes(key))) return "bg-rose-100 text-rose-700";
  return "bg-gray-100 text-gray-700";
}

export function AppAdminDashboard({ onLogout }: AppAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTarget, setBulkTarget] = useState<"users" | "inventory">("users");
  const [bulkOperation, setBulkOperation] = useState<"add" | "remove">("add");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkMessage, setBulkMessage] = useState<string>("");
  const [bulkToast, setBulkToast] = useState<{ text: string; tone: "success" | "warning" } | null>(null);
  const [rowsByTab, setRowsByTab] = useState<Record<DataTab, DataRow[]>>({
    organizations: initialRows.organizations,
    sales: initialRows.sales,
    subscriptions: initialRows.subscriptions,
    users: initialRows.users,
    operators: initialRows.operators,
    booths: initialRows.booths,
    inventory: initialRows.inventory,
    procurement: initialRows.procurement,
    audit: initialRows.audit,
  });
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const currentDataTab = activeTab === "overview" ? null : activeTab;
  const currentConfig = currentDataTab ? tabConfigs[currentDataTab] : null;

  const filteredRows = useMemo(() => {
    if (!currentDataTab || !currentConfig) return [];
    const q = searchQuery.toLowerCase().trim();
    const allRows = rowsByTab[currentDataTab] ?? [];
    if (!q) return allRows;
    return allRows.filter((row) =>
      currentConfig.columns.some((column) => String(row[column.key] ?? "").toLowerCase().includes(q))
    );
  }, [currentDataTab, currentConfig, rowsByTab, searchQuery]);

  const groupedUsers = useMemo(() => {
    if (currentDataTab !== "users") return [] as Array<{ organization: string; users: DataRow[] }>;
    const groups = new Map<string, DataRow[]>();
    filteredRows.forEach((row) => {
      const orgName = String(row.org ?? "Unassigned");
      const existing = groups.get(orgName) ?? [];
      groups.set(orgName, [...existing, row]);
    });
    return Array.from(groups.entries()).map(([organization, users]) => ({ organization, users }));
  }, [currentDataTab, filteredRows]);

  const organizationSalesRows = useMemo(() => {
    return rowsByTab.organizations.map((row) => ({
      organization: String(row.organization ?? "-"),
      plan: String(row.plan ?? "-"),
      activeSeats: `${String(row.seatsUsed ?? 0)} / ${String(row.seatsTotal ?? 0)}`,
      revenue: Number(row.orgSalesInr ?? 0),
      status: String(row.status ?? "-") as string,
    }));
  }, [rowsByTab.organizations]);

  const userSalesRows = useMemo(() => {
    return rowsByTab.users
      .filter((row) => String(row.subscriptionType ?? "Organization") === "Individual")
      .map((row) => ({
        name: String(row.name ?? "-"),
        org: String(row.org ?? "-"),
        plan: String(row.individualPlan ?? "-"),
        revenue: Number(row.individualSpendInr ?? 0),
      }));
  }, [rowsByTab.users]);

  const totalOrgSales = useMemo(
    () => organizationSalesRows.reduce((sum, row) => sum + row.revenue, 0),
    [organizationSalesRows]
  );

  const totalUserSales = useMemo(
    () => userSalesRows.reduce((sum, row) => sum + row.revenue, 0),
    [userSalesRows]
  );

  const groupedOrganizationsBySubscription = useMemo(() => {
    if (currentDataTab !== "organizations") return [] as Array<{ subscriptionType: string; rows: DataRow[] }>;
    const groups = new Map<string, DataRow[]>();
    filteredRows.forEach((row) => {
      const typeName = String(row.plan || "Unknown Plan");
      const existing = groups.get(typeName) ?? [];
      groups.set(typeName, [...existing, row]);
    });
    return Array.from(groups.entries()).map(([subscriptionType, rows]) => ({ subscriptionType, rows }));
  }, [currentDataTab, filteredRows]);

  const filteredBoothHardwareRows = useMemo(() => {
    if (currentDataTab !== "booths") return modelBoothHardwareRows;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return modelBoothHardwareRows;
    return modelBoothHardwareRows.filter((row) =>
      [row.booth, row.serial, row.type, row.model, row.condition].some((value) =>
        String(value).toLowerCase().includes(q)
      )
    );
  }, [currentDataTab, searchQuery]);

  const overviewMetrics = useMemo(() => {
    const activeSubscribedOrganizations = rowsByTab.organizations.filter((row) => {
      const status = String(row.status || "").toLowerCase();
      return status.includes("active") || status.includes("renewed") || status.includes("reactivated");
    }).length;

    const lowStockItems = rowsByTab.inventory.filter((row) =>
      String(row.status || "").toLowerCase().includes("low stock")
    ).length;

    const activeUsers = rowsByTab.users.filter((row) => String(row.status || "").toLowerCase() === "active").length;

    return [
      {
        label: "Active Organizations with Subscriptions",
        value: activeSubscribedOrganizations.toLocaleString(),
        trend: "From active subscription records",
        tone: "indigo",
        target: "organizations" as AdminTab,
      },
      {
        label: "Low Stock Items",
        value: lowStockItems.toLocaleString(),
        trend: "Needs replenishment",
        tone: "amber",
        target: "inventory" as AdminTab,
      },
      {
        label: "Active Users",
        value: activeUsers.toLocaleString(),
        trend: "Across subscribed organizations",
        tone: "emerald",
        target: "users" as AdminTab,
      },
      {
        label: "Platform Uptime",
        value: "99.8%",
        trend: "+0.3% this month",
        tone: "violet",
        target: "audit" as AdminTab,
      },
    ];
  }, [rowsByTab.organizations, rowsByTab.inventory, rowsByTab.users]);

  const updateUserIndividualSubscription = (id: number, enabled: boolean) => {
    setRowsByTab((prev) => ({
      ...prev,
      users: prev.users.map((row) => {
        if (Number(row.id) !== id) return row;
        return {
          ...row,
          subscriptionType: enabled ? "Individual" : "Organization",
          individualPlan: enabled ? String(row.individualPlan && row.individualPlan !== "-" ? row.individualPlan : "Basic Individual") : "-",
          individualSpendInr: enabled ? Number(row.individualSpendInr || 99) : 0,
        };
      }),
    }));
  };

  const updateUserIndividualPlan = (id: number, plan: string) => {
    const spendByPlan: Record<string, number> = {
      "Basic Individual": 99,
      "Premium Individual": 499,
      "Pro Individual": 899,
    };
    setRowsByTab((prev) => ({
      ...prev,
      users: prev.users.map((row) => {
        if (Number(row.id) !== id) return row;
        return {
          ...row,
          subscriptionType: "Individual",
          individualPlan: plan,
          individualSpendInr: spendByPlan[plan] ?? 99,
        };
      }),
    }));
  };

  const navigateToTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  const onAddRow = (event: FormEvent) => {
    event.preventDefault();
    if (!currentDataTab || !currentConfig) return;

    setRowsByTab((prev) => {
      const currentRows = prev[currentDataTab];
      const nextId = currentRows.reduce((max, row) => Math.max(max, Number(row.id ?? 0)), 0) + 1;
      const newRow = currentConfig.mapFormToRow(formValues, nextId);
      return {
        ...prev,
        [currentDataTab]: [newRow, ...currentRows],
      };
    });

    setFormValues({});
    setShowAddModal(false);
  };

  const onOpenBulk = (target: "users" | "inventory") => {
    setBulkTarget(target);
    setBulkOperation("add");
    setBulkFile(null);
    setBulkMessage("");
    setShowBulkModal(true);
  };

  const onCloseBulk = () => {
    setShowBulkModal(false);
    setBulkFile(null);
    setBulkMessage("");
  };

  useEffect(() => {
    if (!bulkToast) return;
    const timeoutId = window.setTimeout(() => setBulkToast(null), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [bulkToast]);

  const parseCsvRows = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        row.push(cell.trim());
        cell = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") {
          i += 1;
        }
        if (cell.length > 0 || row.length > 0) {
          row.push(cell.trim());
          rows.push(row);
          row = [];
          cell = "";
        }
        continue;
      }

      cell += char;
    }

    if (cell.length > 0 || row.length > 0) {
      row.push(cell.trim());
      rows.push(row);
    }

    return rows.filter((r) => r.some((value) => value.length > 0));
  };

  const onProcessBulk = async () => {
    if (!bulkFile) return;

    const text = await bulkFile.text();
    const parsedRows = parseCsvRows(text);
    if (parsedRows.length < 2) {
      setBulkMessage("CSV must include a header row and at least one data row.");
      return;
    }

    const headers = parsedRows[0].map((header) => header.toLowerCase().trim());
    const dataRows = parsedRows.slice(1);
    let summary = "";
    let toastTone: "success" | "warning" = "success";

    if (bulkTarget === "users") {
      setRowsByTab((prev) => {
        const current = prev.users;

        if (bulkOperation === "add") {
          const mapped = dataRows
            .map((cells) => {
              const rec = Object.fromEntries(headers.map((h, idx) => [h, cells[idx] ?? ""]));
              return rec;
            })
            .filter((rec) => rec.email || rec.name)
            .map((rec, idx) => {
              const nextId = current.reduce((max, row) => Math.max(max, Number(row.id ?? 0)), 0) + idx + 1;
              return {
                id: nextId,
                name: rec.name || "New User",
                email: rec.email || "-",
                role: rec.role || "Member",
                org: rec.org || rec.organization || "-",
                status: rec.status || "Active",
              } as DataRow;
            });

          const replacedCount = current.filter((row) => {
            const email = String(row.email ?? "").toLowerCase();
            return mapped.some((newRow) => String(newRow.email ?? "").toLowerCase() === email);
          }).length;

          const skippedCount = Math.max(0, dataRows.length - mapped.length);
          summary = `Added ${mapped.length} users${replacedCount > 0 ? `, replaced ${replacedCount} duplicates` : ""}${skippedCount > 0 ? `, skipped ${skippedCount} invalid rows` : ""}.`;
          toastTone = mapped.length > 0 ? "success" : "warning";

          const dedupedExisting = current.filter((row) => {
            const email = String(row.email ?? "").toLowerCase();
            return !mapped.some((newRow) => String(newRow.email ?? "").toLowerCase() === email);
          });

          return { ...prev, users: [...mapped, ...dedupedExisting] };
        }

        const removeKeys = new Set(
          dataRows
            .map((cells) => {
              const rec = Object.fromEntries(headers.map((h, idx) => [h, cells[idx] ?? ""]));
              return (rec.email || rec.name || "").toLowerCase();
            })
            .filter(Boolean)
        );

        const filtered = current.filter((row) => {
          const email = String(row.email ?? "").toLowerCase();
          const name = String(row.name ?? "").toLowerCase();
          return !removeKeys.has(email) && !removeKeys.has(name);
        });

        const removedCount = current.length - filtered.length;
        const notFoundCount = Math.max(0, removeKeys.size - removedCount);
        summary = `Removed ${removedCount} users${notFoundCount > 0 ? `, ${notFoundCount} not found` : ""}.`;
        toastTone = removedCount > 0 ? "success" : "warning";

        return { ...prev, users: filtered };
      });
    }

    if (bulkTarget === "inventory") {
      setRowsByTab((prev) => {
        const current = prev.inventory;

        if (bulkOperation === "add") {
          const mapped = dataRows
            .map((cells) => {
              const rec = Object.fromEntries(headers.map((h, idx) => [h, cells[idx] ?? ""]));
              return rec;
            })
            .filter((rec) => rec.item)
            .map((rec, idx) => {
              const quantity = Number(rec.quantity || 0);
              const threshold = Number(rec.threshold || 0);
              const nextId = current.reduce((max, row) => Math.max(max, Number(row.id ?? 0)), 0) + idx + 1;
              return {
                id: nextId,
                type: rec.type || "Book",
                item: rec.item,
                quantity,
                threshold,
                status: rec.status || (quantity <= threshold ? "Low Stock" : "Healthy"),
              } as DataRow;
            });

          const replacedCount = current.filter((row) => {
            const item = String(row.item ?? "").toLowerCase();
            return mapped.some((newRow) => String(newRow.item ?? "").toLowerCase() === item);
          }).length;

          const skippedCount = Math.max(0, dataRows.length - mapped.length);
          summary = `Added ${mapped.length} inventory items${replacedCount > 0 ? `, replaced ${replacedCount} duplicates` : ""}${skippedCount > 0 ? `, skipped ${skippedCount} invalid rows` : ""}.`;
          toastTone = mapped.length > 0 ? "success" : "warning";

          const dedupedExisting = current.filter((row) => {
            const item = String(row.item ?? "").toLowerCase();
            return !mapped.some((newRow) => String(newRow.item ?? "").toLowerCase() === item);
          });

          return { ...prev, inventory: [...mapped, ...dedupedExisting] };
        }

        const removeItems = new Set(
          dataRows
            .map((cells) => {
              const rec = Object.fromEntries(headers.map((h, idx) => [h, cells[idx] ?? ""]));
              return (rec.item || "").toLowerCase();
            })
            .filter(Boolean)
        );

        const filtered = current.filter((row) => !removeItems.has(String(row.item ?? "").toLowerCase()));
        const removedCount = current.length - filtered.length;
        const notFoundCount = Math.max(0, removeItems.size - removedCount);
        summary = `Removed ${removedCount} inventory items${notFoundCount > 0 ? `, ${notFoundCount} not found` : ""}.`;
        toastTone = removedCount > 0 ? "success" : "warning";
        return { ...prev, inventory: filtered };
      });
    }

    setShowBulkModal(false);
    setBulkFile(null);
    setBulkMessage("");
    setBulkToast({
      text: summary || "Bulk operation finished.",
      tone: toastTone,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100">
      <aside className="fixed left-0 top-0 h-screen w-64 overflow-y-auto border-r border-gray-200 bg-white p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
            <BookCopyIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Library Booth</p>
            <p className="text-xs text-gray-500">Platform Admin</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={currentConfig?.searchPlaceholder ?? "Search dashboard..."}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <nav className="mb-8 space-y-2">
          {tabOrder.map((tab) => {
            const Icon = tabIcons[tab];
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery("");
                }}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {tabLabels[tab]}
              </button>
            );
          })}
        </nav>

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <div className="ml-64 flex min-h-screen flex-col">
        <header className="border-b border-gray-200 bg-white px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{activeTab === "overview" ? "Dashboard" : currentConfig?.title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {activeTab === "overview"
                  ? "Platform-wide control center for library operations"
                  : currentConfig?.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {currentDataTab && currentConfig && currentConfig.allowAdd !== false && (
                <>
                  {(currentDataTab === "users" || currentDataTab === "inventory") && (
                    <button
                      type="button"
                      onClick={() => onOpenBulk(currentDataTab === "users" ? "users" : "inventory")}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                    >
                      Bulk Add / Remove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
                  >
                    <PlusIcon className="h-4 w-4" />
                    {currentConfig.addLabel}
                  </button>
                </>
              )}
              <button className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100">
                <BellIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 rounded-full bg-gray-100 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white">
                  AA
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">Platform</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <section>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {overviewMetrics.map((metric) => {
                    const colorClasses = {
                      indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
                      violet: "bg-violet-50 text-violet-700 border-violet-200",
                      emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      amber: "bg-amber-50 text-amber-700 border-amber-200",
                    };
                    return (
                      <button
                        key={metric.label}
                        type="button"
                        onClick={() => navigateToTab(metric.target)}
                        className={clsx(
                          "rounded-lg border p-5 text-left transition hover:shadow-md",
                          colorClasses[metric.tone as keyof typeof colorClasses]
                        )}
                      >
                        <p className="text-xs font-medium opacity-75">{metric.label}</p>
                        <p className="mt-2 text-2xl font-bold">{metric.value}</p>
                        <p className="mt-1 text-xs font-medium">{metric.trend} this month • View details</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigateToTab("sales")}
                  className="rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
                >
                  <h3 className="mb-4 text-lg font-bold text-gray-900">Checkout Statistics</h3>
                  <div className="flex h-64 items-end gap-2">
                    {[65, 78, 55, 44, 48, 41, 49, 35, 50, 42, 58, 30].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t bg-gradient-to-t from-indigo-600 to-violet-500 opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-medium text-indigo-700">Open Sales details</p>
                </button>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <button
                    type="button"
                    onClick={() => navigateToTab("audit")}
                    className="mb-4 text-left text-lg font-bold text-gray-900"
                  >
                    System Overview
                  </button>
                  <div className="space-y-4">
                    {[
                      { label: "Database Usage", value: "78%", target: "inventory" as AdminTab },
                      { label: "API Response Time", value: "125ms", target: "audit" as AdminTab },
                      { label: "System Uptime", value: "99.8%", target: "audit" as AdminTab },
                    ].map((row) => (
                      <button
                        key={row.label}
                        type="button"
                        onClick={() => navigateToTab(row.target)}
                        className="w-full rounded-lg p-1 text-left transition hover:bg-gray-50"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-600">{row.label}</p>
                          <p className="text-sm font-bold text-gray-900">{row.value}</p>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" style={{ width: row.value }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {currentDataTab === "sales" && (
            <section className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5">
                  <p className="text-sm text-indigo-700">Organization Sales</p>
                  <p className="mt-2 text-3xl font-bold text-indigo-800">INR {totalOrgSales.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-sm text-emerald-700">Individual User Sales</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-800">INR {totalUserSales.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Sales by Organization</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-600">
                          <th className="py-2 pr-3">Organization</th>
                          <th className="py-2 pr-3">Plan</th>
                          <th className="py-2 pr-3">Active Users / Total Users</th>
                          <th className="py-2 pr-3">Revenue (INR)</th>
                          <th className="py-2 pr-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {organizationSalesRows.map((row) => (
                          <tr key={row.organization} className="border-b border-gray-100 text-gray-700">
                            <td className="py-3 pr-3">{row.organization}</td>
                            <td className="py-3 pr-3">{row.plan}</td>
                            <td className="py-3 pr-3">{row.activeSeats}</td>
                            <td className="py-3 pr-3">{row.revenue.toLocaleString()}</td>
                            <td className="py-3 pr-3">
                              <span className={clsx("inline-flex rounded-full px-2 py-1 text-xs font-medium", getStatusTone(row.status))}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Sales by Individual Subscribers</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-600">
                          <th className="py-2 pr-3">User</th>
                          <th className="py-2 pr-3">Organization</th>
                          <th className="py-2 pr-3">Plan</th>
                          <th className="py-2 pr-3">Revenue (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userSalesRows.length > 0 ? (
                          userSalesRows.map((row) => (
                            <tr key={`${row.name}-${row.org}`} className="border-b border-gray-100 text-gray-700">
                              <td className="py-3 pr-3">{row.name}</td>
                              <td className="py-3 pr-3">{row.org}</td>
                              <td className="py-3 pr-3">{row.plan}</td>
                              <td className="py-3 pr-3">{row.revenue.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="py-4 text-sm text-gray-500" colSpan={4}>
                              No individual subscriptions yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {currentDataTab === "organizations" && currentConfig && (
            <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Organizations grouped by Subscription Type</h2>
                  <p className="text-sm text-gray-600">{filteredRows.length} organizations in current view</p>
                </div>
                {currentConfig.allowAdd !== false && (
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:opacity-95"
                  >
                    <PlusIcon className="h-3 w-3" />
                    {currentConfig.addLabel}
                  </button>
                )}
              </div>

              {groupedOrganizationsBySubscription.map((group) => (
                <div key={group.subscriptionType} className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 text-base font-semibold text-gray-900">{group.subscriptionType}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-600">
                          <th className="py-2 pr-3">Organization</th>
                          <th className="py-2 pr-3">Active Users</th>
                          <th className="py-2 pr-3">Total Users</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">Renewal</th>
                          <th className="py-2 pr-3">Sales (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row) => (
                          <tr key={String(row.id)} className="border-b border-gray-100 text-gray-700">
                            <td className="py-3 pr-3">{String(row.organization ?? "-")}</td>
                            <td className="py-3 pr-3">{String(row.seatsUsed ?? "0")}</td>
                            <td className="py-3 pr-3">{String(row.seatsTotal ?? "0")}</td>
                            <td className="py-3 pr-3">
                              <span className={clsx("inline-flex rounded-full px-2 py-1 text-xs font-medium", getStatusTone(String(row.status ?? "")))}>
                                {String(row.status ?? "-")}
                              </span>
                            </td>
                            <td className="py-3 pr-3">{String(row.renewal ?? "-")}</td>
                            <td className="py-3 pr-3">{Number(row.orgSalesInr ?? 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          )}

          {currentDataTab === "booths" && currentConfig && (
            <section className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Booth Details</h2>
                    <p className="text-sm text-gray-600">{filteredRows.length} booths</p>
                  </div>
                  {currentConfig.allowAdd !== false && (
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:opacity-95"
                    >
                      <PlusIcon className="h-3 w-3" />
                      {currentConfig.addLabel}
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-600">
                        {currentConfig.columns.map((column) => (
                          <th key={column.key} className="py-2 pr-3 font-medium">
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row) => (
                        <tr key={String(row.id)} className="border-b border-gray-100 text-gray-700 hover:bg-gray-50/70">
                          {currentConfig.columns.map((column) => {
                            const value = row[column.key];
                            const isStatus = column.key === "status";
                            return (
                              <td key={`${row.id}-${column.key}`} className="py-3 pr-3 align-top">
                                {isStatus ? (
                                  <span className={clsx("inline-flex rounded-full px-2 py-1 text-xs font-medium", getStatusTone(String(value ?? "")))}>
                                    {String(value ?? "-")}
                                  </span>
                                ) : (
                                  <span>{String(value ?? "-")}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Hardware Installed per Booth</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1080px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-600">
                        <th className="py-2 pr-3">Booth</th>
                        <th className="py-2 pr-3">Serial Number</th>
                        <th className="py-2 pr-3">Hardware Type</th>
                        <th className="py-2 pr-3">Model</th>
                        <th className="py-2 pr-3">Firmware</th>
                        <th className="py-2 pr-3">Condition</th>
                        <th className="py-2 pr-3">Warranty Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBoothHardwareRows.map((row, index) => (
                        <tr key={`${row.serial}-${index}`} className="border-b border-gray-100 text-gray-700">
                          <td className="py-3 pr-3">{row.booth}</td>
                          <td className="py-3 pr-3">{row.serial}</td>
                          <td className="py-3 pr-3">{row.type}</td>
                          <td className="py-3 pr-3">{row.model}</td>
                          <td className="py-3 pr-3">{row.firmware}</td>
                          <td className="py-3 pr-3">{row.condition}</td>
                          <td className="py-3 pr-3">{row.warrantyExpiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {currentDataTab === "users" && currentConfig && (
            <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Users by Organization</h2>
                  <p className="text-sm text-gray-600">{filteredRows.length} users in current view</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenBulk("users")}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                  >
                    Bulk Add / Remove
                  </button>
                  {currentConfig.allowAdd !== false && (
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:opacity-95"
                    >
                      <PlusIcon className="h-3 w-3" />
                      {currentConfig.addLabel}
                    </button>
                  )}
                </div>
              </div>

              {groupedUsers.map((group) => (
                <div key={group.organization} className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 text-base font-semibold text-gray-900">{group.organization}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-600">
                          <th className="py-2 pr-3">Name</th>
                          <th className="py-2 pr-3">Email</th>
                          <th className="py-2 pr-3">Role</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">Subscription Type</th>
                          <th className="py-2 pr-3">Individual Plan</th>
                          <th className="py-2 pr-3">Spend (INR)</th>
                          <th className="py-2 pr-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.users.map((user) => {
                          const isIndividual = String(user.subscriptionType ?? "Organization") === "Individual";
                          return (
                            <tr key={String(user.id)} className="border-b border-gray-100 text-gray-700">
                              <td className="py-3 pr-3">{String(user.name ?? "-")}</td>
                              <td className="py-3 pr-3">{String(user.email ?? "-")}</td>
                              <td className="py-3 pr-3">{String(user.role ?? "-")}</td>
                              <td className="py-3 pr-3">
                                <span className={clsx("inline-flex rounded-full px-2 py-1 text-xs font-medium", getStatusTone(String(user.status ?? "")))}>
                                  {String(user.status ?? "-")}
                                </span>
                              </td>
                              <td className="py-3 pr-3">
                                <span className={clsx(
                                  "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                                  isIndividual ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"
                                )}>
                                  {isIndividual ? "Individual" : "Organization"}
                                </span>
                              </td>
                              <td className="py-3 pr-3">
                                {isIndividual ? (
                                  <select
                                    value={String(user.individualPlan ?? "Basic Individual")}
                                    onChange={(event) => updateUserIndividualPlan(Number(user.id), event.target.value)}
                                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
                                  >
                                    <option>Basic Individual</option>
                                    <option>Premium Individual</option>
                                    <option>Pro Individual</option>
                                  </select>
                                ) : (
                                  <span className="text-xs text-gray-500">-</span>
                                )}
                              </td>
                              <td className="py-3 pr-3">{Number(user.individualSpendInr ?? 0).toLocaleString()}</td>
                              <td className="py-3 pr-3">
                                <button
                                  type="button"
                                  onClick={() => updateUserIndividualSubscription(Number(user.id), !isIndividual)}
                                  className={clsx(
                                    "rounded-lg px-2 py-1 text-xs font-medium",
                                    isIndividual ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                                  )}
                                >
                                  {isIndividual ? "Move to Org Plan" : "Enable Individual Plan"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          )}

          {currentDataTab && currentConfig && currentDataTab !== "users" && currentDataTab !== "sales" && currentDataTab !== "organizations" && currentDataTab !== "booths" && (
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{currentConfig.title}</h2>
                  <p className="text-sm text-gray-600">{filteredRows.length} records</p>
                </div>
                <div className="flex items-center gap-2">
                  {currentDataTab === "inventory" && (
                    <button
                      type="button"
                      onClick={() => onOpenBulk("inventory")}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                    >
                      Bulk Add / Remove
                    </button>
                  )}
                  {currentConfig.allowAdd !== false && (
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:opacity-95"
                    >
                      <PlusIcon className="h-3 w-3" />
                      {currentConfig.addLabel}
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-600">
                      {currentConfig.columns.map((column) => (
                        <th key={column.key} className="py-2 pr-3 font-medium">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={String(row.id)} className="border-b border-gray-100 text-gray-700 hover:bg-gray-50/70">
                        {currentConfig.columns.map((column) => {
                          const value = row[column.key];
                          const isStatus = column.key === "status";
                          return (
                            <td key={`${row.id}-${column.key}`} className="py-3 pr-3 align-top">
                              {isStatus ? (
                                <span className={clsx("inline-flex rounded-full px-2 py-1 text-xs font-medium", getStatusTone(String(value ?? "")))}>
                                  {String(value ?? "-")}
                                </span>
                              ) : (
                                <span>{String(value ?? "-")}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>

      {showAddModal && currentDataTab && currentConfig && currentConfig.allowAdd !== false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">{currentConfig.addLabel}</h3>
            </div>
            <form onSubmit={onAddRow} className="space-y-4 px-6 py-5">
              <div className="grid gap-3 md:grid-cols-2">
                {currentConfig.addFields.map((field) => (
                  <label key={field.key} className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs font-medium text-gray-600">{field.label}</span>
                    <input
                      type={field.type ?? "text"}
                      value={formValues[field.key] ?? ""}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormValues({});
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {bulkTarget === "users" ? "Bulk User Operations" : "Bulk Inventory Operations"}
              </h3>
            </div>

            <div className="space-y-4 px-6 py-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Select Operation</label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 p-2 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="bulk-op"
                      checked={bulkOperation === "add"}
                      onChange={() => setBulkOperation("add")}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      {bulkTarget === "users" ? "Add users from CSV" : "Add inventory items from CSV"}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 p-2 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="bulk-op"
                      checked={bulkOperation === "remove"}
                      onChange={() => setBulkOperation("remove")}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      {bulkTarget === "users" ? "Remove users from CSV" : "Remove inventory items from CSV"}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Upload CSV File</label>
                <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-indigo-600">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(event) => setBulkFile(event.target.files?.[0] || null)}
                    className="hidden"
                    id="app-admin-bulk-upload"
                  />
                  <label htmlFor="app-admin-bulk-upload" className="cursor-pointer">
                    <p className="text-sm font-medium text-gray-700">Click to upload CSV</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {bulkTarget === "users"
                        ? "Expected columns: email, name, role, org"
                        : "Expected columns: type, item, quantity, threshold"}
                    </p>
                    {bulkFile && <p className="mt-2 text-xs font-medium text-emerald-600">{`\u2713 ${bulkFile.name}`}</p>}
                  </label>
                </div>
              </div>

              {bulkMessage && <p className="text-xs font-medium text-rose-600">{bulkMessage}</p>}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={onCloseBulk}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onProcessBulk}
                disabled={!bulkFile}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Process File
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkToast && (
        <div className="fixed right-6 top-6 z-[60] w-full max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={clsx("text-sm font-semibold", bulkToast.tone === "success" ? "text-emerald-700" : "text-amber-700")}>
                {bulkToast.tone === "success" ? "Bulk Update Complete" : "Bulk Update Finished"}
              </p>
              <p className="mt-1 text-sm text-gray-700">{bulkToast.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setBulkToast(null)}
              className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
