"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { addChore, getChores, getChoresHistory, deleteChoreHistory } from "@/lib/api/chores"
import type { Chore, ChoreHistory } from "@/lib/types"
import Cookies from "js-cookie"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2Icon } from "lucide-react"

export function ChoresTab() {
  const [chores, setChores] = useState<Chore[]>([])
  const [history, setHistory] = useState<ChoreHistory[]>([])
  const [selectedChores, setSelectedChores] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null)
  const { toast } = useToast()
  const character = Cookies.get("character")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [choresData, historyData] = await Promise.all([getChores(), getChoresHistory()])
        setChores(choresData)
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

  const handleChoreToggle = (choreId: string) => {
    setSelectedChores((prev) => (prev.includes(choreId) ? prev.filter((id) => id !== choreId) : [...prev, choreId]))
  }

  const handleSubmit = async () => {
    if (!character || selectedChores.length === 0) return

    setSubmitting(true)
    try {
      await addChore(character, selectedChores)

      // Refresh data
      const [choresData, historyData] = await Promise.all([getChores(), getChoresHistory()])
      setChores(choresData)
      setHistory(historyData)
      setSelectedChores([])

      toast({
        title: "Compiti aggiornati",
        description: `${selectedChores.length} compito${selectedChores.length > 1 ? "i" : ""} registrato${selectedChores.length > 1 ? "i" : ""} con successo`,
      })
    } catch (error) {
      console.error("Error submitting chores:", error)
      toast({
        title: "Errore",
        description: "Impossibile aggiornare i compiti",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (historyId: string) => {
    setHistoryToDelete(historyId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!historyToDelete) return

    setSubmitting(true)
    try {
      const { updatedChores, updatedHistory } = await deleteChoreHistory(historyToDelete)

      // Update local state
      setChores(updatedChores)
      setHistory(updatedHistory)

      toast({
        title: "Voce eliminata",
        description: "La voce dello storico è stata eliminata con successo",
      })
    } catch (error) {
      console.error("Error deleting history:", error)
      toast({
        title: "Errore",
        description: "Impossibile eliminare la voce dello storico",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
      setDeleteDialogOpen(false)
      setHistoryToDelete(null)
    }
  }

  // Calculate rankings
  const calculateRankings = () => {
    if (chores.length === 0) return []

    const points = {
      andrea: 0,
      marco: 0,
      martino: 0,
    }

    chores.forEach((chore) => {
      points.andrea += chore.andrea * chore.value
      points.marco += chore.marco * chore.value
      points.martino += chore.martino * chore.value
    })

    return Object.entries(points)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
  }

  const rankings = calculateRankings()

  return (
    <div className="space-y-6">
      <Card className="card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">🏆 Classifica</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {rankings.map((person, index) => {
                let medal = ""
                if (index === 0) medal = "🥇"
                else if (index === 1) medal = "🥈"
                else if (index === 2) medal = "🥉"

                return (
                  <div key={person.name} className="ranking-item">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{medal}</span>
                      <span className="capitalize font-medium">{person.name}</span>
                    </div>
                    <div className="text-lg font-bold">{Math.round(person.score)} punti</div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">✅ Aggiornamento</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Seleziona i compiti completati</label>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {chores.map((chore) => (
                      <div key={chore.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                        <Checkbox
                          id={`chore-${chore.id}`}
                          checked={selectedChores.includes(chore.id)}
                          onCheckedChange={() => handleChoreToggle(chore.id)}
                          disabled={submitting}
                        />
                        <label
                          htmlFor={`chore-${chore.id}`}
                          className="text-base font-medium leading-none flex-1 cursor-pointer"
                        >
                          {chore.name}
                        </label>
                        <span className="text-sm text-muted-foreground font-medium">{Math.round(chore.value)} pt</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={selectedChores.length === 0 || submitting}
                className="w-full h-12 text-lg"
              >
                {submitting
                  ? "Aggiornamento..."
                  : `Conferma ${selectedChores.length > 0 ? `(${selectedChores.length})` : ""}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            📋 Storico
            <span className="text-xs text-muted-foreground ml-2">(clicca per eliminare)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-3">
                {history.length > 0 ? (
                  history.slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      className="history-item group cursor-pointer"
                      onClick={() => handleDeleteClick(entry.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">{entry.date}</div>
                          <div className="font-medium capitalize">{entry.person}</div>
                          <div className="text-sm mt-1">{entry.tasks}</div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2Icon className="h-4 w-4 text-destructive" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Nessuna attività registrata</div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">📊 Tabella Completa</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <ScrollArea className="h-[250px] pr-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Compito</th>
                      <th className="text-center p-2 font-medium w-16">Val.</th>
                      <th className="text-center p-2 font-medium w-12">A</th>
                      <th className="text-center p-2 font-medium w-12">M</th>
                      <th className="text-center p-2 font-medium w-12">Mt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chores.map((chore, index) => (
                      <tr key={chore.id} className={`border-b ${index % 2 === 0 ? "bg-muted/20" : ""}`}>
                        <td className="p-2 text-sm">{chore.name}</td>
                        <td className="p-2 text-center text-sm">{Math.round(chore.value)}</td>
                        <td className="p-2 text-center text-sm">{chore.andrea}</td>
                        <td className="p-2 text-center text-sm">{chore.marco}</td>
                        <td className="p-2 text-center text-sm">{chore.martino}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa voce dallo storico? Questa azione rimuoverà anche i punti associati a
              questa attività.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
