import { Execom } from '@/components/execom'
import { Events } from '@/components/events'
import { Hero } from '@/components/hero'
import { Join } from '@/components/join'
import { Navbar } from '@/components/navbar'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <Events />
      <Execom />
      <Join />
    </main>
  )
}
