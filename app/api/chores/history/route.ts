import { NextResponse } from "next/server"
import { GitHubAPI } from "@/lib/github"
import { parseCSV, arrayToCSV } from "@/lib/csv-utils"
import type { Chore, ChoreHistory } from "@/lib/types"

const github = new GitHubAPI()

function parseChoresFromCSV(csvContent: string): { chores: Chore[]; history: ChoreHistory[] } {
  const rows = parseCSV(csvContent)
  if (rows.length === 0) return { chores: [], history: [] }

  const chores: Chore[] = []
  const history: ChoreHistory[] = []

  // Parse all rows starting from row 1 (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]

    // Check if this row has chore data (Compito and Valore filled)
    if (row[0] && row[0].trim() && row[1] && row[1].trim()) {
      chores.push({
        id: i.toString(),
        name: row[0].trim(),
        value: Number.parseFloat(row[1]) || 0,
        andrea: Number.parseInt(row[2]) || 0,
        marco: Number.parseInt(row[3]) || 0,
        martino: Number.parseInt(row[4]) || 0,
      })
    }

    // Check if this row has history data (columns 6, 7, 8: Persona, Quando, Cosa)
    if (row[6] && row[6].trim() && row[7] && row[7].trim() && row[8] && row[8].trim()) {
      history.push({
        id: i.toString(),
        person: row[6].trim(),
        date: row[7].trim(),
        tasks: row[8].trim(),
      })
    }
  }

  return { chores, history }
}

function choresToCSV(chores: Chore[], history: ChoreHistory[]): string {
  const rows: string[][] = []

  // Headers
  rows.push(["Compito", "Valore", "Andrea", "Marco", "Martino", "", "Persona", "Quando", "Cosa"])

  // Determine the maximum number of rows needed
  const maxRows = Math.max(chores.length, history.length)

  // Fill rows with both chores and history data
  for (let i = 0; i < maxRows; i++) {
    const row = ["", "", "", "", "", "", "", "", ""]

    // Add chore data if available
    if (i < chores.length) {
      const chore = chores[i]
      row[0] = chore.name
      row[1] = chore.value.toString()
      row[2] = chore.andrea.toString()
      row[3] = chore.marco.toString()
      row[4] = chore.martino.toString()
    }

    // Add history data if available
    if (i < history.length) {
      const entry = history[i]
      row[6] = entry.person
      row[7] = entry.date
      row[8] = entry.tasks
    }

    rows.push(row)
  }

  return arrayToCSV(rows)
}

export async function DELETE(request: Request) {
  try {
    const { historyId } = await request.json()

    if (!historyId) {
      return NextResponse.json({ error: "History ID is required" }, { status: 400 })
    }

    // Get current data
    const file = await github.getFile("data/chores.csv")
    const { chores, history } = parseChoresFromCSV(file.content)

    // Find the history entry to delete
    const historyIndex = history.findIndex((entry) => entry.id === historyId)
    if (historyIndex === -1) {
      return NextResponse.json({ error: "History entry not found" }, { status: 404 })
    }

    const historyEntry = history[historyIndex]
    const person = historyEntry.person.toLowerCase()
    const tasks = historyEntry.tasks.split(",").map((task) => task.trim())

    // Update chore counts
    tasks.forEach((taskName) => {
      const choreIndex = chores.findIndex((c) => c.name.toLowerCase() === taskName.toLowerCase())
      if (choreIndex !== -1) {
        const chore = chores[choreIndex]
        if (person === "andrea" && chore.andrea > 0) {
          chores[choreIndex] = { ...chore, andrea: chore.andrea - 1 }
        } else if (person === "marco" && chore.marco > 0) {
          chores[choreIndex] = { ...chore, marco: chore.marco - 1 }
        } else if (person === "martino" && chore.martino > 0) {
          chores[choreIndex] = { ...chore, martino: chore.martino - 1 }
        }
      }
    })

    // Remove the history entry
    history.splice(historyIndex, 1)

    // Convert back to CSV and save
    const csvContent = choresToCSV(chores, history)
    await github.updateFile("data/chores.csv", csvContent, `Delete history entry for ${historyEntry.person}`, file.sha)

    return NextResponse.json({ success: true, updatedChores: chores, updatedHistory: history })
  } catch (error) {
    console.error("Error deleting history entry:", error)
    return NextResponse.json({ error: "Failed to delete history entry" }, { status: 500 })
  }
}
