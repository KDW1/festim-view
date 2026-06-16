import { Binding } from "@/app/page";
import { FESTIMSetting, FESTIMSim, customClasses } from "@/utils/simulations"
import React, { ChangeEvent, JSX, JSXElementConstructor, useEffect, useRef, useState } from "react"

type FESTIMCodePromptsProps = {
    simulation: FESTIMSim;
    updateBindings: Function;
    currentIndex: number;
    setCurrentIndex: Function;
    bindings: Binding[]
}

type FieldFunction = (
    setting: FESTIMSetting,
    prefix?: string,
    suffix?: string
) => React.ReactNode

export default function FESTIMCodePrompts({ simulation, updateBindings, bindings, currentIndex, setCurrentIndex }: FESTIMCodePromptsProps) {
    // This will be a dictionary of bindings corresponding to each step!

    // FESTIM API Reference for FESTIM classes
    // https://festim.readthedocs.io/en/latest/api/index.html
    const [currentStep, setCurrentStep] = useState(simulation.steps[0])


    function InputList({ setting, bindings, correspondingField }: { setting: FESTIMSetting, bindings: Binding[], correspondingField: FieldFunction }) {
        const [indices, setIndices] = useState([1])
        // useEffect(() => {
        //     console.log("Binding Changed to: ", bindings)
        // }, [bindings])
        return (
            <div className="flex flex-col gap-y-2">
                <div className="flex gap-x-2">
                    <button onClick={() => {
                        let newIndex = indices[indices.length - 1] + 1
                        setIndices([...indices, newIndex])
                    }} className="button">
                        Add
                    </button>
                    <button onClick={() => {
                        setIndices(indices.slice(0, indices.length - 1))
                    }} disabled={indices.length <= 1} className="button">
                        Remove
                    </button>
                </div>
                {indices.map(i => (
                    setting.type in customClasses ? <div key={`item${i}`}>
                        <p className="font-semibold">{setting.type[0].toUpperCase() + setting.type.slice(1)} {i}</p>
                        {correspondingField({ ...setting, list: false }, i.toString())}
                    </div>
                        : <></>
                ))}
            </div>
        )
    }

    const correspondingField: FieldFunction = (setting: FESTIMSetting, prefix: string = "", suffix: string = "") => {
        // The custom binding function is for the case of classes or lists that have different functinos
        let indexedBindings = bindings[currentIndex]
        
        const getBindingName = (setting: FESTIMSetting) => {
            return setting.name ?? setting.title
        }
        const getBindingOfSetting = (setting: FESTIMSetting) => {
            return indexedBindings.values[prefix + getBindingName(setting) + suffix]
        }
        const eventHandler = (e: ChangeEvent<any, any>, setting: FESTIMSetting) => {
            // console.log("Prefix is: ", prefix)
            // console.log("Suffix is: ", suffix)
            updateBindings(prefix + getBindingName(setting) + suffix, e.target.value)
        }

        const fieldOfType = (type: string) => {
            // Assign values to what they are associated with in the binding, if they are bound to
            switch (setting.type) {
                case "string":
                    return (
                        <input value={getBindingOfSetting(setting) ?? ""} key={`${prefix}${setting.title}${currentIndex}${suffix}`} onChange={(e) => eventHandler(e, setting)} placeholder="abc..." type="text" className="input" />
                    )
                case "number":
                    return (
                        <input value={getBindingOfSetting(setting) ?? ""} key={`${prefix}${setting.title}${currentIndex}${suffix}`} onChange={(e) => eventHandler(e, setting)} placeholder="0.0" step={0.1} type="number" className="input" />
                    )
                case "boolean":
                    return (
                        <input value={getBindingOfSetting(setting) ?? ""} key={`${prefix}${setting.title}${currentIndex}${suffix}`} onChange={(e) => eventHandler(e, setting)} className="mr-auto w-4 h-auto" type="checkbox" name="" id="" />
                    )
                case "enum":
                    return (
                        <select value={getBindingOfSetting(setting) ?? ""} onChange={(e) => eventHandler(e, setting)} className="select-container" name="" id="">
                            <option value={""} className="border-blue-400 border-2" >Select a value</option>
                            {setting.options && setting.options.map((option, i) => (
                                <option className="border-blue-400 border-2" value={option} key={`${prefix}${setting.title}${option}${suffix}`}>{option}</option>
                            ))
                            }
                        </select>
                    )
                default:
                    if (setting.type in customClasses) {
                        return (
                            <div className="flex flex-col gap-y-2">
                                {customClasses[setting.type].map(classSetting => (
                                    <div key={`${classSetting.title}`} className="flex flex-col">
                                        <p className="text-sm">
                                            {classSetting.title}{classSetting.description && <em>, {classSetting.description}</em>}
                                        </p>
                                        {correspondingField(classSetting, `${setting.type}${prefix}.`, suffix)}
                                    </div>
                                ))}
                            </div>)
                    } else {
                        return (<p className="italic text-primarybg">Working on developing that type...</p>)
                    }
            }
        }

        return fieldOfType(setting.type)
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
                            {setting.list ? <InputList bindings={bindings} setting={setting} correspondingField={correspondingField}></InputList> : correspondingField(setting)}
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