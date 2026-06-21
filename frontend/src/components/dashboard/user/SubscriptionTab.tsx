import { BookmarkCheckIcon } from "lucide-react";
import type { SubscriptionPlan } from "./types";

interface CurrentSubscription {
  planName: string;
  subscriberType: string;
  subscriberId: number;
  startDate: string;
  endDate: string;
  renewalDate: string;
  autoRenew: boolean;
}

interface SubscriptionTabProps {
  currentSubscription: CurrentSubscription;
  subscriptionPlans: SubscriptionPlan[];
  formatDate: (value: string) => string;
}

export function SubscriptionTab({ currentSubscription, subscriptionPlans, formatDate }: SubscriptionTabProps) {
  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Current Subscription</h2>
        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p>
            Plan: <span className="font-semibold">{currentSubscription.planName}</span>
          </p>
          <p>Subscriber type: {currentSubscription.subscriberType}</p>
          <p>
            Period: {formatDate(currentSubscription.startDate)} - {formatDate(currentSubscription.endDate)}
          </p>
          <p>Renewal date: {formatDate(currentSubscription.renewalDate)}</p>
          <p>Auto renew: {currentSubscription.autoRenew ? "Enabled" : "Disabled"}</p>
          <p className="text-xs text-gray-500">Source: Subscriptions.csv seed data</p>
        </div>
      </article>

      <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Available Plans (from CSV)</h2>
        <div className="mt-4 space-y-3">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-gray-800">{plan.name}</h3>
                <span className="text-sm font-semibold text-indigo-700">INR {plan.costPerYearInr}/year</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
              <p className="mt-1 text-xs text-gray-500">Max users: {plan.maxUsersAllowed}</p>
              <p className="mt-1 text-xs text-gray-500">Max books per user: {plan.maxBooksPerUser}</p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white"
              >
                <BookmarkCheckIcon className="h-4 w-4" />
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
