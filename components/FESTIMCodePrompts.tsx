import { Bindings } from "@/app/page"
import { FESTIMSetting, FESTIMSim } from "@/utils/simulations"
import { useEffect, useRef, useState } from "react"

type FESTIMCodePromptsProps = {
    simulation: FESTIMSim;
    updateBindings: Function;
    bindings: Bindings[]
}

export default function FESTIMCodePrompts({ simulation, updateBindings, bindings }: FESTIMCodePromptsProps) {
    // This will be a dictionary of bindings corresponding to each step!
    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentStep, setCurrentStep] = useState(simulation.steps[0])

    const getBindingName = (setting: FESTIMSetting) => {
        return setting.name ?? setting.title
    }

    const parseRecipe = (recipe: string) => {
        console.log("Bindings: ", bindings)
        let indexedBinding = bindings.filter(binding => binding.index == currentIndex)[0]
        if(!indexedBinding) {
            return recipe
        }
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
                    let [followingTokens, nextIndex] = parse(tokens, currentIndex+1) as [string[], number]
                    out = [...out, ...followingTokens]
                    currentIndex = nextIndex
                } else if (token == "}") {
                    return [out, currentIndex + 1]
                } else if (token[0] == "*") {
                    let variableName = token.slice(1, token.length)
                    out.push(indexedBinding.values[variableName])
                    currentIndex += 1
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

    const correspondingField = (setting: FESTIMSetting, index: number) => {
        // Assign values to what they are associated with in the binding, if they are bound to
        switch (setting.type) {
            case "string":
                return (
                    <input key={`${setting.title}${index}`} onChange={(e) => updateBindings(getBindingName(setting), index, e.target.value)} placeholder="abc..." type="text" className="mt-1 px-2 py-1 placeholder:italic placeholder:text-sm placeholder-primarybg border-2 border-primarybg transition duration-300 focus:border-black rounded-md" />
                )
            case "number":
                return (
                    <input key={`${setting.title}${index}`} placeholder="0.0" type="number" className="mt-1 px-2 py-1 placeholder:italic placeholder:text-sm placeholder-primarybg border-2 border-primarybg transition duration-300 focus:border-black rounded-md" />
                )
            case "boolean":
                return (
                    <input key={`${setting.title}${index}`} className="mr-auto w-4 h-auto" type="checkbox" name="" id="" />
                )
            case "enum":
                return (
                    <select onChange={(e) => updateBindings(getBindingName(setting), index, e.target.value)} className="select-container" name="" id="">
                        {setting.options && setting.options.map((option, i) => (
                            <option className="border-blue-400 border-2" value={option} key={`${setting.title}${option}`}>{option}</option>
                        ))
                        }
                    </select>
                )
            default:
                return (<p className="italic text-primarybg">Working on developing that type...</p>)
        }
    }
    return (
        <div className="flex-col flex flex-1 text-primary text-base">
            <p className="font-semibold">{currentStep.title}</p>
            {currentStep.description && <p className="italic text-xs mb-2">{currentStep.description}</p>}
            <code className="text-xs">{JSON.stringify(currentStep, null, "\t")}</code>
            <div className="gap-4 flex-col flex max-h-72 overflow-y-auto pr-2">
                {
                    currentStep.settings.map((setting, i) => (
                        <div key={`setting${i}`} className="flex flex-col">
                            <p className="text-sm italic">
                                {setting.title}
                            </p>
                            {setting.description && <p className="text-sm">
                                {setting.description}
                            </p>}
                            {correspondingField(setting, currentIndex)}
                        </div>
                    ))
                }
            </div>
            {
                currentStep.recipe && 
            <button onClick={() => {
                // alert(currentStep.recipe ?? "There is no recipe here...")
                let parsedRecipe = parseRecipe(currentStep.recipe ?? "")
                // console.log("Parsed Recipe: ", parsedRecipe)
                alert(parsedRecipe)
            }} className="button mt-2">
                Print Recipe
            </button>
            }
            <div className="flex gap-2 mt-auto">
                {
                    currentIndex != 0 &&
                    <button onClick={() => {
                        let previousIndex = currentIndex - 1
                        setCurrentIndex(previousIndex)
                        setCurrentStep(simulation.steps[previousIndex])
                    }} className="button">
                        Previous
                    </button>
                }
                {
                    currentIndex != simulation.steps.length - 1 &&
                    <button onClick={() => {
                        let nextIndex = currentIndex + 1
                        setCurrentIndex(nextIndex)
                        setCurrentStep(simulation.steps[nextIndex])
                    }} className="button">
                        Next
                    </button>
                }
            </div>
        </div>
    )
}