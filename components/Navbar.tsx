"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/ui/mode-toggle"

export default function Navbar() {
  return (
    <header className="border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold">F1 Stats</Link>
        <ModeToggle />
      </div>
    </header>
  )
}
