import { MainLayout } from "@/components/main-layout";
import { NavigationTabs } from "@/components/navigation-tabs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Dashboard() {
  // Recupera il cookie in modo asincrono
  const cookieStore = await cookies();
  const character = cookieStore.get("character")?.value;

  // Se non c'è il cookie, reindirizza alla home
  if (!character) {
    redirect("/");
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-md">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center font-cal-sans">
          LitpII
        </h1>
        <NavigationTabs />
      </div>
    </MainLayout>
  );
}
