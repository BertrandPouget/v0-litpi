import type { Debt, DebtHistory } from "../types"

export async function getDebts(): Promise<Debt[]> {
  const response = await fetch("/api/debts")
  if (!response.ok) {
    throw new Error("Failed to fetch debts")
  }
  const data = await response.json()
  return data.debts
}

export async function getDebtsHistory(): Promise<DebtHistory[]> {
  const response = await fetch("/api/debts")
  if (!response.ok) {
    throw new Error("Failed to fetch debts history")
  }
  const data = await response.json()
  return data.history
}

export async function addDebt(
  creditor: string,
  amount: number,
  debtors: string[],
  reason: string,
): Promise<{
  updatedDebts: Debt[]
  newHistoryEntry: DebtHistory
}> {
  const response = await fetch("/api/debts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ creditor, amount, debtors, reason }),
  })

  if (!response.ok) {
    throw new Error("Failed to add debt")
  }
  return response.json()
}
