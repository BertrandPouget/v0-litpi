export function parseCSV(csvContent: string): string[][] {
  if (!csvContent.trim()) return []

  const lines = csvContent.split("\n").filter((line) => line.trim())
  const result: string[][] = []

  for (const line of lines) {
    const row: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        row.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    row.push(current.trim())
    result.push(row)
  }

  return result
}

export function arrayToCSV(data: string[][]): string {
  return data
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma or quotes
          if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        })
        .join(","),
    )
    .join("\n")
}

export function objectArrayToCSV<T extends Record<string, any>>(data: T[], headers: string[]): string {
  const rows = [headers]

  data.forEach((item) => {
    const row = headers.map((header) => {
      const value = item[header] || ""
      return String(value)
    })
    rows.push(row)
  })

  return arrayToCSV(rows)
}
