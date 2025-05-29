"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getDebts, getDebtsHistory, addDebt } from "@/lib/api/debts"
import type { Debt, DebtHistory } from "@/lib/types"
import Cookies from "js-cookie"

export function DebtsTab() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [history, setHistory] = useState<DebtHistory[]>([])
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [selectedDebtors, setSelectedDebtors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const character = Cookies.get("character")

  const fighters = ["andrea", "marco", "martino"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [debtsData, historyData] = await Promise.all([getDebts(), getDebtsHistory()])
        setDebts(debtsData)
        setHistory(historyData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleDebtorToggle = (debtorId: string) => {
    setSelectedDebtors((prev) => (prev.includes(debtorId) ? prev.filter((id) => id !== debtorId) : [...prev, debtorId]))
  }

  const handleSubmit = async () => {
    if (!character || selectedDebtors.length === 0 || !amount || !reason) return

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Errore",
        description: "Inserisci un importo valido",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const result = await addDebt(character, amountValue, selectedDebtors, reason)

      // Update local state
      setDebts(result.updatedDebts)
      setHistory([result.newHistoryEntry, ...history])

      // Reset form
      setAmount("")
      setReason("")
      setSelectedDebtors([])

      toast({
        title: "Debito registrato",
        description: "Il pagamento è stato registrato con successo",
      })
    } catch (error) {
      console.error("Error submitting debt:", error)
      toast({
        title: "Errore",
        description: "Impossibile registrare il pagamento",
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
          <CardTitle className="flex items-center gap-2 text-base font-medium">💰 Saldi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {debts.map((debt) => {
                const isPositive = debt.balance >= 0
                return (
                  <Card
                    key={debt.person}
                    className={`bg-card/50 ${isPositive ? "border-green-500/30" : "border-red-500/30"}`}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="text-lg font-medium capitalize">{debt.person}</div>
                      <div className={`text-xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? "+" : ""}
                        {debt.balance.toFixed(2)}€
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">💸 Nuovo Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Quanto hai pagato?</label>
                <Input
                  type="number"
                  placeholder="Importo in €"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={submitting}
                  min="0.01"
                  step="0.01"
                  className="h-12 text-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Causale</label>
                <Input
                  placeholder="Descrivi il pagamento..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={submitting}
                  className="h-12 text-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Per chi hai pagato? (incluso te stesso)</label>
                <div className="space-y-3">
                  {fighters.map((fighter) => (
                    <div key={fighter} className="flex items-center space-x-3 p-3 rounded-lg border">
                      <Checkbox
                        id={`debtor-${fighter}`}
                        checked={selectedDebtors.includes(fighter)}
                        onCheckedChange={() => handleDebtorToggle(fighter)}
                        disabled={submitting}
                      />
                      <label
                        htmlFor={`debtor-${fighter}`}
                        className="text-base font-medium leading-none capitalize flex-1"
                      >
                        {fighter} {fighter === character && "(tu)"}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!amount || !reason || selectedDebtors.length === 0 || submitting}
                className="w-full h-12 text-lg"
              >
                {submitting ? "Registrazione..." : "Registra Pagamento"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">📈 Storico Transazioni</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {history.length > 0 ? (
                  history.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="history-item">
                      <div className="text-sm text-muted-foreground mb-1">{entry.date}</div>
                      <div className="font-medium">
                        <span className="text-green-600 font-semibold capitalize">{entry.creditor}</span> ha pagato{" "}
                        <span className="font-bold">{entry.amount.toFixed(2)}€</span>
                      </div>
                      <div className="text-sm mt-1">
                        <span className="font-medium">Causale:</span> <span className="italic">{entry.reason}</span>
                      </div>
                      <div className="text-sm mt-1">
                        <span className="font-medium">Per:</span>{" "}
                        <span className="text-red-600 font-semibold capitalize">
                          {entry.debtors.length === 3 ? "Tutti" : entry.debtors.join(", ")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Nessuna transazione registrata</div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
