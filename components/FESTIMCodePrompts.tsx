import { Bindings } from "@/app/page"
import { FESTIMSetting, FESTIMSim } from "@/utils/simulations"
import { useEffect, useRef, useState } from "react"

type FESTIMCodePromptsProps = {
    simulation: FESTIMSim;
    updateBindings: Function;
    bindings: Bindings[]
}

export default function FESTIMCodePrompts({ simulation, updateBindings, bindings }: FESTIMCodePromptsProps) {
    // This will be a dictionary of bdingins corresponding to each step!
    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentStep, setCurrentStep] = useState(simulation.steps[0])

    const getBindingName = (setting: FESTIMSetting) => {
        return setting.name ?? setting.title
    }

    const parseRecipe = (recipe : string) => {
        console.log(bindings)
        let indexedBinding = bindings.filter(binding => binding.index == currentIndex)[0]
        let parsedRecipe = recipe.replaceAll("problem_type", indexedBinding.values["problem_type"]).replaceAll("problem_variable", indexedBinding.values["problem_variable"])
        return parsedRecipe
    }

    const correspondingField = (setting: FESTIMSetting, index: number) => {
        // Assign values to what they are associated with in the binding, if they are bound to
        switch (setting.type) {
            case "string":
                return (
                    <input key={`${setting.title}${index}`} onChange={(e)=>updateBindings(getBindingName(setting), index, e.target.value)} placeholder="abc..." type="text" className="mt-1 px-2 py-1 placeholder:italic placeholder:text-sm placeholder-primarybg border-2 border-primarybg transition duration-300 focus:border-black rounded-md" />
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
                    <select onChange={(e)=>updateBindings(getBindingName(setting), index, e.target.value)} className="select-container" name="" id="">
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
            <button onClick={()=>{
                alert(currentStep.recipe ?? "There is no recipe here...")
                let parsedRecipe = parseRecipe(currentStep.recipe ?? "")
                alert(parsedRecipe)
            }} className="button mt-2">
                Print Recipe
            </button>
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