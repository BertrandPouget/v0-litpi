"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getShoppingList, addShoppingItem, removeShoppingItems, clearShoppingList } from "@/lib/api/shopping"
import type { ShoppingItem } from "@/lib/types"
import { Trash2Icon, PlusIcon } from "lucide-react"

export function ShoppingTab() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getShoppingList()
        setItems(data)
      } catch (error) {
        console.error("Error fetching shopping list:", error)
        toast({
          title: "Errore",
          description: "Impossibile caricare la lista della spesa",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleAddItem = async () => {
    if (!newItem.trim()) return

    setSubmitting(true)
    try {
      const addedItem = await addShoppingItem(newItem.trim())
      setItems((prev) => [addedItem, ...prev])
      setNewItem("")

      toast({
        title: "Elemento aggiunto",
        description: "Elemento aggiunto alla lista della spesa",
      })
    } catch (error) {
      console.error("Error adding item:", error)
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'elemento",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveItems = async () => {
    if (selectedItems.length === 0) return

    setSubmitting(true)
    try {
      await removeShoppingItems(selectedItems)
      setItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)))
      setSelectedItems([])

      toast({
        title: "Elementi rimossi",
        description: "Gli elementi selezionati sono stati rimossi dalla lista",
      })
    } catch (error) {
      console.error("Error removing items:", error)
      toast({
        title: "Errore",
        description: "Impossibile rimuovere gli elementi",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClearList = async () => {
    if (items.length === 0) return

    setSubmitting(true)
    try {
      await clearShoppingList()
      setItems([])
      setSelectedItems([])

      toast({
        title: "Lista svuotata",
        description: "La lista della spesa è stata svuotata",
      })
    } catch (error) {
      console.error("Error clearing list:", error)
      toast({
        title: "Errore",
        description: "Impossibile svuotare la lista",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">➕ Aggiungi Elemento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input
              placeholder="Nuovo elemento..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem()
              }}
              disabled={submitting}
              className="h-12 text-lg"
            />
            <Button onClick={handleAddItem} disabled={!newItem.trim() || submitting} className="w-full h-12 text-lg">
              <PlusIcon className="mr-2 h-5 w-5" />
              Aggiungi
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">🛒 Lista della Spesa</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              {items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="shopping-item">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleItemToggle(item.id)}
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {item.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">La lista della spesa è vuota</div>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card className="card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">🗑️ Gestione Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 text-lg"
                onClick={handleRemoveItems}
                disabled={selectedItems.length === 0 || submitting}
              >
                Rimuovi selezionati ({selectedItems.length})
              </Button>

              <Button
                variant="destructive"
                className="w-full h-12 text-lg"
                onClick={handleClearList}
                disabled={items.length === 0 || submitting}
              >
                <Trash2Icon className="mr-2 h-5 w-5" />
                Svuota lista
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
