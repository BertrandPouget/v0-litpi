import type { Chore, ChoreHistory } from "../types"

export async function getChores(): Promise<Chore[]> {
  const response = await fetch("/api/chores")
  if (!response.ok) {
    throw new Error("Failed to fetch chores")
  }
  const data = await response.json()
  return data.chores
}

export async function getChoresHistory(): Promise<ChoreHistory[]> {
  const response = await fetch("/api/chores")
  if (!response.ok) {
    throw new Error("Failed to fetch chores history")
  }
  const data = await response.json()
  return data.history
}

export async function addChore(person: string, choreIds: string[]): Promise<void> {
  const response = await fetch("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ person, choreIds }),
  })

  if (!response.ok) {
    throw new Error("Failed to add chore")
  }
}

export async function deleteChoreHistory(historyId: string): Promise<{
  updatedChores: Chore[]
  updatedHistory: ChoreHistory[]
}> {
  const response = await fetch("/api/chores/history", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ historyId }),
  })

  if (!response.ok) {
    throw new Error("Failed to delete chore history")
  }

  return response.json()
}
