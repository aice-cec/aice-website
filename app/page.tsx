import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import Events from "@/app/components/Events";
import { Join } from "@/app/components/JoinUs";
import Execom from "@/app/components/Execom";
import Footer from "@/app/components/Footer";
import LoadingScreen from "@/app/components/LoadingScreen";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      <LoadingScreen />
      <Navbar />
      <Hero />
      <Join />
      <Events />
      <Execom />
      <Footer />
    </main>
  );
}
