"use client"
import PythonCodeEditor from "@/components/PythonCodeEditor";
import PythonConsole, { ConsoleArg } from "@/components/PythonConsole";
import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import TrameVisualizer from "@/components/TrameVisualizer";


export default function Home() {
  const [args, setArgs] = useState<ConsoleArg[]>([])
  const updateArgs = (newArgs:ConsoleArg[]) => {
    setArgs(args=>[...args,...(newArgs.filter(el => el.message))])
  }
  return (
    <div className="h-screen bg-blue-300">
      <main className="px-16 py-8 h-full mx-auto flex flex-row gap-4">
        <div className="flex flex-col w-1/2 space-y-4 h-full">
        <PythonCodeEditor args={args} updateArgs={updateArgs} />
        <PythonConsole args={args}/>
        </div>
        <TrameVisualizer />
      </main>
    </div>
  );
}
