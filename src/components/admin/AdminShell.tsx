"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ToastProvider from "@/components/admin/ToastProvider";

const AdminShellContext = createContext<{ openSidebar: () => void }>({
  openSidebar: () => {},
});

export function useAdminShell() {
  return useContext(AdminShellContext);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  const content = isLogin ? (
    <ToastProvider>{children}</ToastProvider>
  ) : (
    <ToastProvider>
      <div className="flex min-h-screen bg-black text-zinc-100">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminShellContext.Provider
            value={{ openSidebar: () => setSidebarOpen(true) }}
          >
            {children}
          </AdminShellContext.Provider>
        </div>
      </div>
    </ToastProvider>
  );

  return (
    <SessionProvider basePath="/api/auth" refetchOnWindowFocus={false}>
      {content}
    </SessionProvider>
  );
}
