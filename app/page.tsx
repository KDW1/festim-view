"use client"
import PythonCodeEditor from "@/components/PythonCodeEditor";
import PythonConsole, { ConsoleArg } from "@/components/PythonConsole";
import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import TrameVisualizer from "@/components/TrameVisualizer";
import { presetSimulations } from "@/utils/simulations";


export default function Home() {
  const [args, setArgs] = useState<ConsoleArg[]>([])
  const updateArgs = (newArgs: ConsoleArg[]) => {
    setArgs(args => [...args, ...(newArgs.filter(el => el.message))])
  }
  return (
    <div className="h-screen bg-blue-300 px-16 py-8">
      <main className="relative h-full overflow-y-clip mx-auto flex flex-row gap-4">
        <PythonCodeEditor args={args} updateArgs={updateArgs} />
        <div className="w-1/2 flex flex-col gap-4">
        <div className="flex h-4/5">
          <TrameVisualizer simulation={presetSimulations[0]} />
        </div>
          <PythonConsole args={args} />
        </div>
      </main>
    </div>
  );
}
