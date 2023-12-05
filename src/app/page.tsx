import SideStackerGame from '@/components/sideStackerGame'

export default function Home() {
  return (
    <>
      <main className="flex flex-col min-h-screen items-center justify-center bg-black text-white">
        <header className="flex justify-center py-12 -mt-12">
          <h1 className="text-6xl">Side-Stacker</h1>
        </header>
        <SideStackerGame />
      </main>
    </>
  )
}
