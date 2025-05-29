// Chores types
export interface Chore {
  id: string
  name: string
  value: number
  andrea: number
  marco: number
  martino: number
}

export interface ChoreHistory {
  id: string
  person: string
  date: string
  tasks: string
}

// Shopping types
export interface ShoppingItem {
  id: string
  name: string
}

// Debts types
export interface Debt {
  person: string
  balance: number
}

export interface DebtHistory {
  id: string
  creditor: string
  amount: number
  debtors: string[]
  date: string
  reason: string
}

// CSV Row types for parsing
export interface ChoreCSVRow {
  Compito: string
  Valore: string
  Andrea: string
  Marco: string
  Martino: string
  "": string
  Persona?: string
  Quando?: string
  Cosa?: string
}

export interface ShoppingCSVRow {
  Spesa: string
}

export interface DebtCSVRow {
  Persona?: string
  Bilancio?: string
  "": string
  Creditore?: string
  Soldi?: string
  Debitori?: string
  Data?: string
  Causale?: string
}
