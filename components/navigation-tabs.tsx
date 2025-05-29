"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChoresTab } from "@/components/tabs/chores-tab"
import { ShoppingTab } from "@/components/tabs/shopping-tab"
import { DebtsTab } from "@/components/tabs/debts-tab"
import { DropletIcon, ListIcon as ListTaskIcon, PiggyBankIcon } from "lucide-react"

export function NavigationTabs() {
  const [activeTab, setActiveTab] = useState("pulizie")

  return (
    <Tabs defaultValue="pulizie" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-6 w-full h-14 p-1">
        <TabsTrigger value="pulizie" className="flex flex-col items-center justify-center gap-1 h-full">
          <DropletIcon className="h-4 w-4" />
          <span className="text-xs">Pulizie</span>
        </TabsTrigger>
        <TabsTrigger value="spesa" className="flex flex-col items-center justify-center gap-1 h-full">
          <ListTaskIcon className="h-4 w-4" />
          <span className="text-xs">Spesa</span>
        </TabsTrigger>
        <TabsTrigger value="debiti" className="flex flex-col items-center justify-center gap-1 h-full">
          <PiggyBankIcon className="h-4 w-4" />
          <span className="text-xs">Debiti</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pulizie">
        <ChoresTab />
      </TabsContent>
      <TabsContent value="spesa">
        <ShoppingTab />
      </TabsContent>
      <TabsContent value="debiti">
        <DebtsTab />
      </TabsContent>
    </Tabs>
  )
}
