import { NextResponse } from "next/server"
import { GitHubAPI } from "@/lib/github"
import { parseCSV, arrayToCSV } from "@/lib/csv-utils"
import type { ShoppingItem } from "@/lib/types"

const github = new GitHubAPI()

function parseShoppingFromCSV(csvContent: string): ShoppingItem[] {
  const rows = parseCSV(csvContent)
  if (rows.length === 0) return []

  const items: ShoppingItem[] = []

  // Skip header row, parse data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row[0] && row[0].trim()) {
      // Has Spesa value
      items.push({
        id: i.toString(),
        name: row[0].trim(),
      })
    }
  }

  return items
}

function shoppingToCSV(items: ShoppingItem[]): string {
  const rows: string[][] = []

  // Headers
  rows.push(["Spesa"])

  // Items data
  items.forEach((item) => {
    rows.push([item.name])
  })

  return arrayToCSV(rows)
}

export async function GET() {
  try {
    const file = await github.getFile("data/shopping.csv")
    const items = parseShoppingFromCSV(file.content)

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching shopping list:", error)
    return NextResponse.json({ error: "Failed to fetch shopping list" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json()

    // Get current data
    const file = await github.getFile("data/shopping.csv")
    let items = parseShoppingFromCSV(file.content)

    switch (action) {
      case "add": {
        const { name } = data
        if (!name) {
          return NextResponse.json({ error: "Item name is required" }, { status: 400 })
        }

        const newItem: ShoppingItem = {
          id: Date.now().toString(),
          name,
        }

        items = [newItem, ...items]

        // Convert back to CSV and save
        const csvContent = shoppingToCSV(items)
        await github.updateFile("data/shopping.csv", csvContent, `Add shopping item: ${name}`, file.sha)

        return NextResponse.json(newItem)
      }

      case "remove": {
        const { itemIds } = data
        if (!itemIds || !Array.isArray(itemIds)) {
          return NextResponse.json({ error: "Item IDs are required" }, { status: 400 })
        }

        items = items.filter((item) => !itemIds.includes(item.id))

        // Convert back to CSV and save
        const csvContent = shoppingToCSV(items)
        await github.updateFile("data/shopping.csv", csvContent, `Remove shopping items`, file.sha)

        return NextResponse.json({ success: true })
      }

      case "clear": {
        items = []

        // Convert back to CSV and save
        const csvContent = shoppingToCSV(items)
        await github.updateFile("data/shopping.csv", csvContent, `Clear shopping list`, file.sha)

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing shopping list update:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
