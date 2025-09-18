import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthWrapper } from "@/components/auth/AuthWrapper"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarProvider>
    </AuthWrapper>
  )
}
