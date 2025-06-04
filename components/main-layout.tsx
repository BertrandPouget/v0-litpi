"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useRouter, usePathname } from "next/navigation"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)

    // Funzione per leggere il cookie
    const readCharacterCookie = () => {
      const character = document.cookie
        .split("; ")
        .find((row) => row.startsWith("character="))
        ?.split("=")[1]
      setSelectedCharacter(character || null)
    }

    readCharacterCookie()

    // Aggiungi un listener per i cambiamenti di pathname
    const interval = setInterval(readCharacterCookie, 1000)

    return () => clearInterval(interval)
  }, [pathname])

  const handleProfileClick = () => {
    // Rimuovi il cookie del personaggio selezionato
    document.cookie = "character=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setSelectedCharacter(null)
    // Torna alla home page
    router.push("/")
  }

  const isDashboard = pathname.includes("/dashboard")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50">
      {/* Posizionamento assoluto per i bottoni */}
      {isDashboard && selectedCharacter && mounted && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-full overflow-hidden p-0 border-2"
            style={{
              backgroundImage: `url(/images/${selectedCharacter}.png)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            aria-label={`Logout da ${selectedCharacter}`}
          >
            <span className="sr-only">Torna alla selezione personaggio</span>
          </Button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10">
        {mounted && (
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
      </div>

      <main>{children}</main>
      <Toaster />
    </div>
  )
}
