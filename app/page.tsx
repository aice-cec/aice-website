import Image from "next/image";
import Navbar from "@/app/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 select-none relative">
      <Navbar />
      <div className="flex flex-col items-center text-center max-w-md pt-20">
        <div className="mb-8 p-4">
          <Image
            src="/logos/aice_logo.png"
            alt="AICE Logo"
            width={160}
            height={160}
            priority
            className="w-32 sm:w-40 h-auto object-contain"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-medium tracking-widest uppercase mb-3 text-white">
          Under Construction
        </h1>

        <p className="text-sm text-zinc-400 font-light tracking-wide">
          Something new is coming soon. Stay tuned.
        </p>
      </div>
    </main>
  );
}
