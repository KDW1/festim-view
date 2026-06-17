"use client"
import PythonCodeEditor from "@/components/PythonCodeEditor";
import PythonConsole, { ConsoleArg } from "@/components/PythonConsole";
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import TrameVisualizer from "@/components/TrameVisualizer";
import { customClasses, FESTIMSetting, FESTIMSim, FESTIMStep, listTesting, presetSimulations } from "@/utils/simulations";
import { listenerCount } from "process";
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
  const [currentSimulation, setCurrentSimulation] = useState<FESTIMSim | null>(presetSimulations[0])

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

  const [bindings, setBindings] = useState<Binding[]>(initializedBindings ?? []) // Bindings for selected simulations
  const [args, setArgs] = useState<ConsoleArg[]>([])
  const updateArgs = (newArgs: ConsoleArg[]) => {
    setArgs(args => [...args, ...(newArgs.filter(el => el.message))])
  }

  const [pythonCode, setPythonCode] = useState<string>("")

  const updatePythonCode = (code: string) => {
    setPythonCode(code)
  }

  const parseRecipe = (indexedBinding: { values: {[key: string]: any}, recipe: string }) => {
    let recipe = indexedBinding.recipe
    let modifiedRecipe = recipe
    if(!recipe) return ""
    
    // Special character for variables
    modifiedRecipe = recipe.replaceAll("{*", "--{*--").replaceAll("*}", "--*}--")

    // Special character for lists
    modifiedRecipe = modifiedRecipe.replaceAll("$", "--$--").replaceAll(/--{2,}/g,"--")
    let tokens = modifiedRecipe.split("--")

    const parse = (tokens: string[], start: number = 0) => {
      let out: string[] = []
      let currentIndex = start
      while (currentIndex < tokens.length) {
        let token = tokens[currentIndex]
        if (token == "{*") {
          // We have "{*" + variableName + "*}"
          currentIndex += 1 // Set to variable index
          let variableName = tokens[currentIndex]
          let valueExists = (variableName in indexedBinding.values && indexedBinding.values[variableName] != "")
          let value = valueExists ? indexedBinding.values[variableName] : `{${variableName}}`
          out.push(value)
          currentIndex += 2
        } else if (token.includes("$")) {
          // TODO: Add a separator
          // We have "$" + binding + expression + "$"
          // x being the separator
          currentIndex += 1 // to binding
          
          let arrayName = tokens[currentIndex]
          // console.log("Array Name: ", arrayName)
          let arrayExists = (arrayName in indexedBinding.values && indexedBinding.values[arrayName] != "")
          currentIndex += 1 // to expression
          let followingTokens = tokens.slice(currentIndex)
          let closingIndex = currentIndex + followingTokens.indexOf("$")
          let nextIndex = closingIndex+1 // Skip the closing }
          
          if(!arrayExists || indexedBinding.values[arrayName].every((obj:Object) => Object.keys(obj).length == 0)) {
            // In the case that the binding doesn't exist
            out.push("$")
            out.push(arrayName)
            out.push("--")
            out.push(tokens.slice(currentIndex, closingIndex).join("").replaceAll("{*", "{").replaceAll("*}", "}"))
            out.push("$")
            currentIndex = nextIndex
            continue
          }
          
          let arrayBinding = indexedBinding.values[arrayName]
          let expression = tokens.slice(currentIndex,closingIndex)
          // console.log("With generic expression: ", expression.join(""))

          let listExpressions = []
          // console.log("Tokens: ", tokens)
          
          for(let binding of arrayBinding) {
            if(Object.keys(binding).length == 0) continue
            console.log("Binding: ", binding)
            let parsedExpression = parseRecipe({values: binding, recipe: expression.join("")})
            
            listExpressions.push(parsedExpression)
            let nextCharacter = tokens[nextIndex][0]
            let isInline = (nextCharacter == "]" || nextCharacter == "," || nextCharacter == "$")
            
            if((nextIndex < tokens.length) && !isInline && arrayBinding.length > 1) {
              listExpressions.push("\n")
            }
          }

          out = out.concat(listExpressions)
          currentIndex = nextIndex 
          // Binding[]
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
        <div className="w-2/3 h-full flex flex-col flex-1 relative">
          <PythonCodeEditor snippetOnly={snippetOnly} setSnippetOnly={(value: boolean) => {
            setSnippetOnly(value)
            let indexedBinding = bindings[currentIndex]
            updateCodeWithIndexedBinding(indexedBinding, value)
          }} mode={mode} pythonCode={pythonCode} updatePythonCode={updatePythonCode} args={args} updateArgs={updateArgs} />
        </div>
        <div className="w-1/3 flex flex-col gap-4">
          <div className="flex flex-1 h-4/5">
            <TrameVisualizer mode={mode} currentIndex={currentIndex} setCurrentIndex={(index: number) => setCurrentIndex(index)} updateMode={(mode: "window" | "festim") => setMode(mode)} bindings={bindings} updateBindings={updateBindings} simulation={currentSimulation} />
          </div>
          <PythonConsole args={args} />
        </div>
      </main>
    </div>
  );
}
