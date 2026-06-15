import { Binding } from "@/app/page";
import { FESTIMSetting, FESTIMSim, customClasses } from "@/utils/simulations"
import { ChangeEvent, useEffect, useRef, useState } from "react"

type FESTIMCodePromptsProps = {
    simulation: FESTIMSim;
    updateBindings: Function;
    currentIndex: number;
    setCurrentIndex: Function;
    bindings: Binding[]
}

export default function FESTIMCodePrompts({ simulation, updateBindings, bindings, currentIndex, setCurrentIndex }: FESTIMCodePromptsProps) {
    // This will be a dictionary of bindings corresponding to each step!

    // FESTIM API Reference for FESTIM classes
    // https://festim.readthedocs.io/en/latest/api/index.html
    const [currentStep, setCurrentStep] = useState(simulation.steps[0])

    const getBindingName = (setting: FESTIMSetting) => {
        return setting.name ?? setting.title
    }

    const correspondingField = (setting: FESTIMSetting) => {
        let indexedBindings = bindings[currentIndex]
        const getBindingOfSetting = (setting: FESTIMSetting) => {
            return indexedBindings.values[setting.name ?? setting.title] ?? ""
        }
        const eventHandler = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>, setting: FESTIMSetting) => {
            updateBindings(getBindingName(setting), currentIndex, e.target.value)
        }
        // Assign values to what they are associated with in the binding, if they are bound to
        switch (setting.type) {
            case "string":
                return (
                    <input value={getBindingOfSetting(setting)} key={`${setting.title}${currentIndex}`} onChange={(e) => eventHandler(e, setting)} placeholder="abc..." type="text" className="input" />
                )
            case "number":
                return (
                    <input value={getBindingOfSetting(setting)} key={`${setting.title}${currentIndex}`} onChange={(e) => eventHandler(e, setting)} placeholder="0.0" step={0.1} type="number" className="input" />
                )
            case "boolean":
                return (
                    <input value={getBindingOfSetting(setting)} key={`${setting.title}${currentIndex}`} onChange={(e) => eventHandler(e, setting)} className="mr-auto w-4 h-auto" type="checkbox" name="" id="" />
                )
            case "enum":
                return (
                    <select value={getBindingOfSetting(setting)} onChange={(e) => eventHandler(e, currentIndex, setting)} className="select-container" name="" id="">
                        <option value={""} className="border-blue-400 border-2" >Select a value</option>
                        {setting.options && setting.options.map((option, i) => (
                            <option className="border-blue-400 border-2" value={option} key={`${setting.title}${option}`}>{option}</option>
                        ))
                        }
                    </select>
                )
            default:
                if (setting.type in customClasses) {
                    return (
                    <div className="flex flex-col gap-y-2">
                        {customClasses[setting.type].map(setting => (
                            <div className="flex flex-col">
                                <p className="text-sm">
                                   {setting.title}{setting.description && <em>, {setting.description}</em>}
                                </p>
                                {correspondingField(setting)}
                            </div>
                        ))}
                    </div>)
                } else {
                    return (<p className="italic text-primarybg">Working on developing that type...</p>)
                }
        }
    }
    return (
        <div className="text-primary flex flex-1 flex-col text-base">
            <p className="font-semibold">{currentStep.title}</p>
            {currentStep.description && <p className="italic text-xs mb-2">{currentStep.description}</p>}
            <div className="gap-4 flex-col flex max-h-72 overflow-y-auto pr-2">
                {
                    currentStep.settings.map((setting, i) => (
                        <div key={`setting${i}`} className="flex flex-col">
                            <p className="text-sm">
                                {setting.title}
                            </p>
                            {setting.description && <p className="text-sm italic">
                                {setting.description}
                            </p>}
                            {correspondingField(setting, currentIndex)}
                        </div>
                    ))
                }
            </div>
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