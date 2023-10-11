import './globals.css'
import SideStackerGame from '@/components/sideStackerGame'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-8 items-center justify-center p-24 bg-black text-white">
      <SideStackerGame />
    </main>
  )
}
