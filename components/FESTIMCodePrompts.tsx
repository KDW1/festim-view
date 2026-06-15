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

type BindingFunction = (binding: string, value: any) => void
type BindingAccessFunction = (binding: string) => any

export default function FESTIMCodePrompts({ simulation, updateBindings, bindings, currentIndex, setCurrentIndex }: FESTIMCodePromptsProps) {
    // This will be a dictionary of bindings corresponding to each step!

    // FESTIM API Reference for FESTIM classes
    // https://festim.readthedocs.io/en/latest/api/index.html
    const [currentStep, setCurrentStep] = useState(simulation.steps[0])

    const getBindingName = (setting: FESTIMSetting) => {
        return setting.name ?? setting.title
    }

    const correspondingField = (setting: FESTIMSetting, bindingFunction: BindingFunction | null = null, accessBinding: BindingAccessFunction | null = null) => {
        // The custom binding function is for the case of classes or lists that have different functinos
        let indexedBindings = bindings[currentIndex]

        const getBindingOfSetting = (setting: FESTIMSetting) => {
            return accessBinding ? accessBinding(getBindingName(setting)) : indexedBindings.values[getBindingName(setting)]
        }
        const eventHandler = (e: ChangeEvent<any, any>, setting: FESTIMSetting) => {
            if (bindingFunction) {
                console.log("Binding Funtion: ", bindingFunction)
                bindingFunction(getBindingName(setting), e.target.value)
            } else {
                updateBindings(getBindingName(setting), e.target.value)
            }
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
                    <select value={getBindingOfSetting(setting)} onChange={(e) => eventHandler(e, setting)} className="select-container" name="" id="">
                        <option value={""} className="border-blue-400 border-2" >Select a value</option>
                        {setting.options && setting.options.map((option, i) => (
                            <option className="border-blue-400 border-2" value={option} key={`${setting.title}${option}`}>{option}</option>
                        ))
                        }
                    </select>
                )
            default:
                if (setting.type in customClasses) {
                    // A custom class has modified bindings in that it accesses a class
                    // and then treats that as the binding per-se
                    const bindingClassProps: BindingFunction = (classBinding: string, value: any) => {
                        let indexedBinding = bindings[currentIndex]
                        let updatedClass = indexedBinding.values[setting.name ?? setting.type]
                        updatedClass[classBinding] = value
                        updateBindings(getBindingName(setting), updatedClass)
                    }

                    const accessClassProps: BindingAccessFunction = (classBinding: string) => {
                        let indexedBinding = bindings[currentIndex]
                        let updatedClass = indexedBinding.values[setting.name ?? setting.type]
                        console.log("Associated setting is: ", updatedClass)
                        console.log("Class binding is: ", classBinding)
                        return updatedClass[classBinding]
                    }
                    return (
                        <div className="flex flex-col gap-y-2">
                            {customClasses[setting.type].map(setting => (
                                <div key={`${setting.title}`} className="flex flex-col">
                                    <p className="text-sm">
                                        {setting.title}{setting.description && <em>, {setting.description}</em>}
                                    </p>
                                    {correspondingField(setting, bindingClassProps, accessClassProps)}
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
                            {correspondingField(setting)}
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