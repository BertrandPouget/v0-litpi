import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NavigationTabs } from "@/components/navigation-tabs"
import { MainLayout } from "@/components/main-layout"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const character = cookieStore.get("character")

  if (!character) {
    redirect("/")
  }

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center font-cal-sans">LitpII</h1>
        <NavigationTabs />
      </div>
    </MainLayout>
  )
}
