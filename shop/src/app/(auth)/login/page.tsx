import { LoginForm } from "@/components/auth/LoginForm";
import { Wrench } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Shop Manager</span>
          </div>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
