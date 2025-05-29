import { NextResponse } from "next/server"
import { GitHubAPI } from "@/lib/github"
import { parseCSV, arrayToCSV } from "@/lib/csv-utils"
import type { Debt, DebtHistory } from "@/lib/types"

const github = new GitHubAPI()

function parseDebtsFromCSV(csvContent: string): { debts: Debt[]; history: DebtHistory[] } {
  const rows = parseCSV(csvContent)
  if (rows.length === 0) return { debts: [], history: [] }

  const debts: Debt[] = []
  const history: DebtHistory[] = []

  // Parse all rows starting from row 1 (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]

    // Check if this row has debt balance data (Persona and Bilancio filled)
    if (row[0] && row[0].trim() && row[1] && row[1].trim()) {
      debts.push({
        person: row[0].trim().toLowerCase(),
        balance: Number.parseFloat(row[1].replace(",", ".")) || 0,
      })
    }

    // Check if this row has history data (columns 3, 4, 5, 6, 7: Creditore, Soldi, Debitori, Data, Causale)
    if (
      row[3] &&
      row[3].trim() && // Creditore
      row[4] &&
      row[4].trim() && // Soldi
      row[5] &&
      row[5].trim() && // Debitori
      row[6] &&
      row[6].trim() && // Data
      row[7] &&
      row[7].trim() // Causale
    ) {
      history.push({
        id: i.toString(),
        creditor: row[3].trim().toLowerCase(),
        amount: Number.parseFloat(row[4].replace(",", ".")) || 0,
        debtors: row[5].split(",").map((d) => d.trim().toLowerCase()),
        date: row[6].trim(),
        reason: row[7].trim(),
      })
    }
  }

  return { debts, history }
}

function debtsToCSV(debts: Debt[], history: DebtHistory[]): string {
  const rows: string[][] = []

  // Headers
  rows.push(["Persona", "Bilancio", "", "Creditore", "Soldi", "Debitori", "Data", "Causale"])

  // Determine the maximum number of rows needed
  const maxRows = Math.max(debts.length, history.length)

  // Fill rows with both debts and history data
  for (let i = 0; i < maxRows; i++) {
    const row = ["", "", "", "", "", "", "", ""]

    // Add debt balance data if available
    if (i < debts.length) {
      const debt = debts[i]
      row[0] = debt.person.charAt(0).toUpperCase() + debt.person.slice(1)
      row[1] = debt.balance.toString().replace(".", ",")
    }

    // Add history data if available
    if (i < history.length) {
      const entry = history[i]
      row[3] = entry.creditor.charAt(0).toUpperCase() + entry.creditor.slice(1)
      row[4] = entry.amount.toString().replace(".", ",")
      row[5] = entry.debtors.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")
      row[6] = entry.date
      row[7] = entry.reason
    }

    rows.push(row)
  }

  return arrayToCSV(rows)
}

export async function GET() {
  try {
    const file = await github.getFile("data/debts.csv")
    const { debts, history } = parseDebtsFromCSV(file.content)

    return NextResponse.json({ debts, history })
  } catch (error) {
    console.error("Error fetching debts:", error)
    return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { creditor, amount, debtors, reason } = await request.json()

    if (!creditor || !amount || !debtors || !Array.isArray(debtors) || debtors.length === 0 || !reason) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Get current data
    const file = await github.getFile("data/debts.csv")
    const { debts, history } = parseDebtsFromCSV(file.content)

    // Calculate individual debt amount
    const debtPerPerson = amount / debtors.length

    // Update balances
    const creditorIndex = debts.findIndex((d) => d.person === creditor.toLowerCase())
    if (creditorIndex !== -1) {
      debts[creditorIndex] = {
        ...debts[creditorIndex],
        balance: debts[creditorIndex].balance + amount,
      }
    }

    debtors.forEach((debtor: string) => {
      const debtorIndex = debts.findIndex((d) => d.person === debtor.toLowerCase())
      if (debtorIndex !== -1) {
        debts[debtorIndex] = {
          ...debts[debtorIndex],
          balance: debts[debtorIndex].balance - debtPerPerson,
        }
      }
    })

    // Add to history with current date and time - INSERT AT THE BEGINNING
    const now = new Date()
    const dateStr = now.toLocaleDateString("it-IT")
    const timeStr = now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
    const newHistoryEntry: DebtHistory = {
      id: Date.now().toString(),
      creditor: creditor.toLowerCase(),
      amount,
      debtors: debtors.map((d: string) => d.toLowerCase()),
      date: `${dateStr}, ${timeStr}`,
      reason,
    }

    // Insert new entry at the beginning of history array
    const updatedHistory = [newHistoryEntry, ...history]

    // Convert back to CSV and save
    const csvContent = debtsToCSV(debts, updatedHistory)
    await github.updateFile("data/debts.csv", csvContent, `Add debt: ${creditor} paid ${amount}€`, file.sha)

    return NextResponse.json({
      success: true,
      updatedDebts: debts,
      newHistoryEntry,
    })
  } catch (error) {
    console.error("Error processing debt update:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
