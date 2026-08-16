import dynamic from "next/dynamic";
import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import LoadingScreen from "@/app/components/LoadingScreen";

const CustomScrollbar = dynamic(
  () => import("@/app/components/CustomScrollbar"),
);
const Join = dynamic(() =>
  import("@/app/components/JoinUs").then((mod) => mod.Join),
);
const Events = dynamic(() => import("@/app/components/Events"));
const Execom = dynamic(() => import("@/app/components/Execom"));
const Footer = dynamic(() => import("@/app/components/Footer"));

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      <LoadingScreen />
      <CustomScrollbar />
      <Navbar />
      <Hero />
      <Join />
      <Events />
      <Execom />
      <Footer />
    </main>
  );
}
