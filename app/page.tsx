"use client"
import PythonCodeEditor from "@/components/PythonCodeEditor";
import PythonConsole, { ConsoleArg } from "@/components/PythonConsole";
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import TrameVisualizer from "@/components/TrameVisualizer";
import { customClasses, FESTIMSetting, FESTIMSim, FESTIMStep, listTesting, presetSimulations } from "@/utils/simulations";
type Dictionary = {
  [key: string]: any
}
export type Binding = {
  index: number,
  snippet: string,
  values: {
    [key: string]: any
  },
  recipe?: string
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<"window" | "festim">("festim")
  const [snippetOnly, setSnippetOnly] = useState<boolean>(true)
  const [currentSimulation, setCurrentSimulation] = useState<FESTIMSim | null>(listTesting)

  let initializedBindings = []
  if (currentSimulation) {
    for (let i = 0; i < currentSimulation.steps.length; i++) {
      let step: FESTIMStep = currentSimulation.steps[i]
      let values: { [key: string]: any } = {}
      for (let setting of step.settings) {
        let binding = setting.name ?? setting.title
        if (setting.defaultValue) {
          values[binding] = setting.defaultValue
        } else {
          values[binding] = setting.list ? [{}] : ""
        }
      }
      initializedBindings.push({
        index: i,
        snippet: "",
        values,
        recipe: step.recipe ?? ""
      })
    }
  }

  const [bindings, setBindings] = useState<Binding[]>(initializedBindings) // Bindings for selected simulations
  const [args, setArgs] = useState<ConsoleArg[]>([])
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

    // console.log("Indexed Binding: ", indexedBinding)
    // console.log(`Original: ${recipe}\nModified: ${modifiedRecipe}`)
    // console.log("Tokens: ", tokens)

    const parse = (tokens: string[], start: number = 0) => {
      let out: string[] = []
      let currentIndex = start
      while (currentIndex < tokens.length) {
        let token = tokens[currentIndex]
        if (token == "{") {
          // let [followingTokens, nextIndex] = parse(tokens, currentIndex + 1) as [string[], number]
          currentIndex += 1 // Set to variable index
          let variableName = tokens[currentIndex]
          let valueExists = (variableName in indexedBinding.values && indexedBinding.values[variableName] != "")
          let value = valueExists ? indexedBinding.values[variableName] : `{${variableName}}`
          out.push(value)
          currentIndex += 2 // Skip over the closing }
        } else {
          out.push(token)
          currentIndex += 1
        }
      }
      // console.log("Out: ", out)
      return [out, currentIndex]
    }

    let [parsedTokens, next_index] = parse(tokens, 0) as [string[], number]
    // console.log("Parsed Recipe: ", parsedTokens.join(""))
    return parsedTokens.join("")
  }

  const updateCodeWithIndexedBinding = (indexedBinding: Binding, exclusive: boolean) => {
    let parsedRecipe = parseRecipe(indexedBinding)
    indexedBinding.snippet = parsedRecipe
    // console.log("Parsed Snippet is: ", parsedRecipe)
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

  const updateBindings = (binding: string, value: any) => {
    let indexedBinding = bindings[currentIndex]
    indexedBinding.values[binding] = value
    
    if (indexedBinding.recipe) {
      updateCodeWithIndexedBinding(indexedBinding, snippetOnly)
    }
    
    let updatedBindings = [...bindings]
    updatedBindings[currentIndex] = indexedBinding
    setBindings(updatedBindings)
  }

  useEffect(() => {
    if (mode == "festim") {
      console.log("Updating Code with Indexed Binding")
      let indexedBinding = bindings[currentIndex]
      if (indexedBinding) {
        updateCodeWithIndexedBinding(bindings[currentIndex], snippetOnly)
      }
    }
  }, [currentIndex, mode])
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
            <TrameVisualizer mode={mode} currentIndex={currentIndex} setCurrentIndex={(index: number) => setCurrentIndex(index)} updateMode={(mode: "window" | "festim") => setMode(mode)} bindings={bindings} updateBindings={updateBindings} simulation={currentSimulation} />
          </div>
          <PythonConsole args={args} />
        </div>
      </main>
    </div>
  );
}
