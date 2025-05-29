import type { ShoppingItem } from "../types"

export async function getShoppingList(): Promise<ShoppingItem[]> {
  const response = await fetch("/api/shopping")
  if (!response.ok) {
    throw new Error("Failed to fetch shopping list")
  }
  return response.json()
}

export async function addShoppingItem(name: string): Promise<ShoppingItem> {
  const response = await fetch("/api/shopping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "add", data: { name } }),
  })

  if (!response.ok) {
    throw new Error("Failed to add shopping item")
  }
  return response.json()
}

export async function removeShoppingItems(itemIds: string[]): Promise<void> {
  const response = await fetch("/api/shopping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "remove", data: { itemIds } }),
  })

  if (!response.ok) {
    throw new Error("Failed to remove shopping items")
  }
}

export async function clearShoppingList(): Promise<void> {
  const response = await fetch("/api/shopping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "clear", data: {} }),
  })

  if (!response.ok) {
    throw new Error("Failed to clear shopping list")
  }
}
