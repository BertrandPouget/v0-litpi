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

export async function GET() {
  try {
    const file = await github.getFile("data/chores.csv")
    const { chores, history } = parseChoresFromCSV(file.content)

    return NextResponse.json({ chores, history })
  } catch (error) {
    console.error("Error fetching chores:", error)
    return NextResponse.json({ error: "Failed to fetch chores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { person, choreIds } = await request.json()

    if (!person || !choreIds || !Array.isArray(choreIds)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Get current data
    const file = await github.getFile("data/chores.csv")
    const { chores, history } = parseChoresFromCSV(file.content)

    // Update chores counts
    choreIds.forEach((choreId) => {
      const choreIndex = chores.findIndex((c) => c.id === choreId)
      if (choreIndex !== -1) {
        const chore = chores[choreIndex]
        if (person === "andrea" || person === "marco" || person === "martino") {
          chores[choreIndex] = {
            ...chore,
            [person]: (chore[person as keyof typeof chore] as number) + 1,
          }
        }
      }
    })

    // Get chore names for history
    const choreNames = choreIds
      .map((id) => chores.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ")

    // Add to history with current date and time - INSERT AT THE BEGINNING
    const now = new Date()
    const dateStr = now.toLocaleDateString("it-IT")
    const timeStr = now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
    const newHistoryEntry: ChoreHistory = {
      id: Date.now().toString(),
      person,
      date: `${dateStr}, ${timeStr}`,
      tasks: choreNames,
    }

    // Insert new entry at the beginning of history array
    const updatedHistory = [newHistoryEntry, ...history]

    // Convert back to CSV and save
    const csvContent = choresToCSV(chores, updatedHistory)
    await github.updateFile("data/chores.csv", csvContent, `Update chores for ${person}`, file.sha)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing chore update:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
