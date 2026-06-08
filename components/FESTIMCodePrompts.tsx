import { FESTIMSetting, FESTIMSim } from "@/utils/simulations"
import { useState } from "react"

type FESTIMCodePromptsProps = {
    simulation: FESTIMSim
}

export default function FESTIMCodePrompts({ simulation }: FESTIMCodePromptsProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentStep, setCurrentStep] = useState(simulation.steps[0])
    const correspondingField = (setting: FESTIMSetting) => {
        switch (setting.type) {
            case "string":
                return (
                    <input placeholder="text value" type="abc..." className="mt-1 px-2 py-1 placeholder:italic placeholder:text-sm placeholder-primarybg border-2 border-primarybg transition duration-300 focus:border-black rounded-md" />
                )
            case "number":
                return (
                    <input placeholder="number value" type="0.0" className="mt-1 px-2 py-1 placeholder:italic placeholder:text-sm placeholder-primarybg border-2 border-primarybg transition duration-300 focus:border-black rounded-md" />
                )
            case "boolean":
                return (
                    <input className="mr-auto w-4 h-auto" type="checkbox" name="" id="" />
                )
            case "enum":
                return (
                    <select className="select-container" name="" id="">
                {setting.options && setting.options.map((option, i) => (
                    <option className="border-blue-400 border-2" key={`${setting.title}${option}`}>{option}</option>
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
                            {correspondingField(setting)}
                        </div>
                    ))
                }
            </div>
            <div className="flex gap-2 mt-auto">
            {
                currentIndex != 0 && 
            <button onClick={()=>{
                let previousIndex = currentIndex-1
                setCurrentIndex(previousIndex)
                setCurrentStep(simulation.steps[previousIndex])
            }} className="button">
                Previous
            </button>
            }
            {
                currentIndex != simulation.steps.length - 1 && 
            <button onClick={()=>{
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