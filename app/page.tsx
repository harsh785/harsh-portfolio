"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Achievements from "@/components/Achievements";
import InteractiveTerminal from "@/components/InteractiveTerminal";
import Contact from "@/components/Contact";
import GameSection from "@/components/GameSection";
import BootSequence from "@/components/BootSequence";
import CursorGlow from "@/components/CursorGlow";

export default function Home() {
  const [booted, setBooted] = useState(false);

  return (
    <>
      <CursorGlow />
      <BootSequence onDone={() => setBooted(true)} />
      {booted && (
        <>
          <Navbar />
          <main>
            <Hero />
            <About />
            <Experience />
            <InteractiveTerminal />
            <Skills />
            <Achievements />
            <GameSection />
            <Contact />
          </main>
        </>
      )}
    </>
  );
}
