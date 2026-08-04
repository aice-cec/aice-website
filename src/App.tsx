import { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="app">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  )
}

export default App
