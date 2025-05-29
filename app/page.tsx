import { CharacterSelection } from "@/components/character-selection"
import { MainLayout } from "@/components/main-layout"

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-6 px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-6 text-center font-cal-sans">LitpII</h1>
        <CharacterSelection />
      </div>
    </MainLayout>
  )
}
