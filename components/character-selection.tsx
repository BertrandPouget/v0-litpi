"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

const characters = [
  { id: "andrea", name: "Andrea", image: "/images/andrea.png" },
  { id: "marco", name: "Marco", image: "/images/marco.png" },
  { id: "martino", name: "Martino", image: "/images/martino.png" },
]

export function CharacterSelection() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const router = useRouter()

  const handleSelect = (characterId: string) => {
    setSelectedCharacter(characterId)
  }

  const handleContinue = () => {
    if (selectedCharacter) {
      Cookies.set("character", selectedCharacter, { expires: 7 })
      router.push("/dashboard")
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-card/80 backdrop-blur-sm border-2">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-center mb-6">👤 Seleziona il tuo personaggio</h2>
        <div className="space-y-4">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                selectedCharacter === character.id
                  ? "ring-4 ring-primary scale-105 shadow-xl"
                  : "hover:scale-105 hover:shadow-lg"
              }`}
              onClick={() => handleSelect(character.id)}
            >
              <div className="flex items-center p-4 bg-gradient-to-r from-background to-secondary/30">
                <div className="w-16 h-16 relative rounded-full overflow-hidden mr-4 flex-shrink-0">
                  <Image
                    src={character.image || "/placeholder.svg"}
                    alt={character.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold">{character.name}</span>
                </div>
                {selectedCharacter === character.id && (
                  <div className="bg-primary text-primary-foreground rounded-full p-2 ml-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedCharacter}
            className="w-full py-4 text-lg font-semibold"
          >
            {selectedCharacter
              ? `Continua come ${characters.find((c) => c.id === selectedCharacter)?.name}`
              : "Seleziona un personaggio"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
