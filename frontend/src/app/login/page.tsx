import type { Metadata } from "next";
import LoginForm from "@/components/login/LoginForm";
import { BookOpenIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | Library Booth Management System",
  description: "Sign in to the Library Booth Management System",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-8 text-white">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <BookOpenIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Library Booth</h1>
                <p className="text-xs text-indigo-200">Management System</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-indigo-100">
              Welcome back! Sign in to access your dashboard.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <LoginForm />
          </div>

        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
          &copy; {new Date().getFullYear()} Library Booth Management System. All rights reserved.
        </p>
      </div>
    </main>
  );
}
