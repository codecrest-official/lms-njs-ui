import type { OrganizationSubscription } from "./types";

interface SubscriptionsTabProps {
  subscriptions: OrganizationSubscription[];
}

export function SubscriptionsTab({ subscriptions }: SubscriptionsTabProps) {
  return (
    <section className="mt-5 space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Subscription</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {subscriptions.map((sub, idx) => (
            <div key={idx} className="rounded-xl border border-indigo-300 bg-indigo-50 p-4">
              <h3 className="font-semibold text-indigo-900">{sub.name}</h3>
              <div className="mt-3 space-y-2 text-sm text-indigo-800">
                <p>
                  Max Users: <span className="font-semibold">{sub.maxUsers.toLocaleString()}</span>
                </p>
                <p>
                  Books per User: <span className="font-semibold">{sub.maxBooks}</span>
                </p>
                <p>
                  Cost: <span className="font-semibold">{sub.cost}</span>
                </p>
                <p>
                  Status: <span className="font-semibold text-emerald-700">{sub.status}</span>
                </p>
                <p>
                  Renewal Date: <span className="font-semibold">{sub.renewDate}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
