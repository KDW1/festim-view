"use client"
import PythonCodeEditor from "@/components/PythonCodeEditor";
import PythonConsole, { ConsoleArg } from "@/components/PythonConsole";
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import TrameVisualizer from "@/components/TrameVisualizer";
import { FESTIMSetting, FESTIMSim, presetSimulations } from "@/utils/simulations";
type Dictionary = {
  [key: string]: any
}
export type Binding = {
  index: number,
  snippet: string,
  values: {
    [key: string]: any
  },
  recipe: string
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<"window" | "festim">("window")
  const [snippetOnly, setSnippetOnly] = useState<boolean>(true)
  const [bindings, setBindings] = useState<Binding[]>([]) // Bindings for selected simulations
  const [args, setArgs] = useState<ConsoleArg[]>([])
  const [currentSimulation, setCurrentSimulation] = useState<FESTIMSim | null>(presetSimulations[0])
  const updateArgs = (newArgs: ConsoleArg[]) => {
    setArgs(args => [...args, ...(newArgs.filter(el => el.message))])
  }

  const [pythonCode, setPythonCode] = useState<string>("")

  const updatePythonCode = (code: string) => {
    setPythonCode(code)
  }

  const parseRecipe = (indexedBinding: Binding) => {
    let recipe = indexedBinding.recipe
    let modifiedRecipe = recipe
    modifiedRecipe = recipe.replaceAll("{", "--{--").replaceAll("}", "--}--")
    let tokens = modifiedRecipe.split("--")

    console.log("Indexed Binding: ", indexedBinding)
    console.log(`Original: ${recipe}\nModified: ${modifiedRecipe}`)
    console.log("Tokens: ", tokens)

    const parse = (tokens: string[], start: number = 0) => {
      let out: string[] = []
      let currentIndex = start
      while (currentIndex < tokens.length) {
        let token = tokens[currentIndex]
        if (token == "{") {
          // let [followingTokens, nextIndex] = parse(tokens, currentIndex + 1) as [string[], number]
          currentIndex += 1 // Set to variable index
          let variableName = tokens[currentIndex]
          out.push(indexedBinding.values[variableName])
          currentIndex += 2 // Skip over the closing }
        } else {
          out.push(token)
          currentIndex += 1
        }
      }
      console.log("Out: ", out)
      return [out, currentIndex]
    }

    let [parsedTokens, next_index] = parse(tokens, 0) as [string[], number]
    console.log("Parsed Recipe: ", parsedTokens.join(""))
    return parsedTokens.join("")
  }

  const updateCodeWithIndexedBinding = (indexedBinding: Binding, exclusive: boolean) => {
    let parsedRecipe = parseRecipe(indexedBinding)
    indexedBinding.snippet = parsedRecipe
    if (exclusive) {
      setPythonCode(parsedRecipe)
    } else {
      let out = []
      for (let binding of bindings) {
        if (binding.snippet) out.push(binding.snippet)
      }
      setPythonCode(out.join("\n\n"))
    }
  }

  const updateBindings = (binding: string, index: number, value: any) => {
    let indexedBinding = bindings[index]
    console.log("Binding Found: ", indexedBinding)
    indexedBinding.values[binding] = value
    if (indexedBinding.recipe) {
      updateCodeWithIndexedBinding(indexedBinding, snippetOnly)
    }
    console.log("Binding: ", indexedBinding)
    let updatedBindings = bindings
    updatedBindings[index] = indexedBinding
    setBindings(updatedBindings)
  }


  useEffect(() => {
    if (currentSimulation) {
      let bindings: Binding[] = []
      for (let i = 0; i < currentSimulation.steps.length; i++) {
        let step = currentSimulation.steps[i]
        bindings.push({
          index: i,
          snippet: "",
          values: {},
          recipe: step.recipe ?? ""
        })
      }
      console.log("Bindings: ", bindings)
      setBindings(bindings)
    }
  }, [])

  useEffect(() => {
    let indexedBinding = bindings[currentIndex]
    if (indexedBinding) {
      updateCodeWithIndexedBinding(bindings[currentIndex], snippetOnly)
    }
  }, [currentIndex])
  return (
    <div className="h-screen bg-primarybg px-16 py-8">
      <main className="relative w-full h-full overflow-y-clip mx-auto flex flex-row gap-4">
        <div className="w-1/2 h-full flex flex-col flex-1 relative">
          <PythonCodeEditor snippetOnly={snippetOnly} setSnippetOnly={(value: boolean) => {
            setSnippetOnly(value)
            let indexedBinding = bindings[currentIndex]
            updateCodeWithIndexedBinding(indexedBinding, value)
          }} mode={mode} pythonCode={pythonCode} updatePythonCode={updatePythonCode} args={args} updateArgs={updateArgs} />
        </div>
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex flex-1 h-4/5">
            <TrameVisualizer currentIndex={currentIndex} setCurrentIndex={(index: number) => setCurrentIndex(index)} updateMode={(mode: "window" | "festim") => setMode(mode)} bindings={bindings} updateBindings={updateBindings} simulation={presetSimulations[0]} />
          </div>
          <PythonConsole args={args} />
        </div>
      </main>
    </div>
  );
}
