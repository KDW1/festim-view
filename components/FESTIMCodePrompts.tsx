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

const getBindingName = (setting: FESTIMSetting) => {
    return setting.itemName ?? setting.name ?? setting.title
}
    
function InputList({ setting, bindings, updateBindings, currentIndex }: { setting: FESTIMSetting, bindings: Binding[], updateBindings: Function, currentIndex: number }) {
    let arrayLength = bindings[currentIndex].values[setting.name].length

    const [indices, setIndices] = useState([...Array(arrayLength).keys()])

    // This makes an index for every existing element in our array of values
    // such that if voluems is a list, we have an index corresponding to each
    // (Ideally that is...) :D

    
    const correspondingField = (classSetting: FESTIMSetting, index:number, prefix: string = "", suffix: string = "") => {
        // The custom binding function is for the case of classes or lists that have different functinos
        let indexedBinding = bindings[currentIndex]

        const getBindingOfSetting = (classSetting: FESTIMSetting) => {
            let list = indexedBinding.values[setting.name]
            console.log("Indexed Binding: ", indexedBinding)
            let indexedObject = list[index]
            console.log(`Indexed Object for index ${index}`, indexedObject)
            let binding = prefix+getBindingName(classSetting)+suffix
            return binding in indexedObject ? indexedObject[binding] : ""
        }

        const eventHandler = (e: ChangeEvent<any, any>, classSetting: FESTIMSetting) => {
            let list = [...indexedBinding.values[setting.name]]
            let indexedObject = list[index]
            let binding = prefix+getBindingName(classSetting)+suffix
            const inputType = e.target.type

            if(inputType == "checkbox") {
                console.log("Value: ", e.target.checked)
                indexedObject[binding] = e.target.checked
            } else {
                if(e.target.value == "") {
                    delete indexedObject[binding]
                } else {
                    indexedObject[binding] = e.target.value
                }
            }

            updateBindings(setting.name, list)
        }

        const fieldOfType = (setting: FESTIMSetting) => {
            // Assign values to what they are associated with in the binding, if they are bound to
            switch (setting.type) {
                case "string":
                    return (
                        <input value={getBindingOfSetting(classSetting) ?? ""} key={`item${classSetting.title}${currentIndex}`} onChange={(e) => eventHandler(e, classSetting)} placeholder="abc..." type="text" className="input" />
                    )
                case "number":
                    return (
                        <input value={getBindingOfSetting(classSetting) ?? ""} key={`item${classSetting.title}${currentIndex}`} onChange={(e) => eventHandler(e, classSetting)} placeholder="0.0" step={0.1} type="number" className="input" />
                    )
                case "boolean":
                    return (
                        <input value={getBindingOfSetting(classSetting) ?? ""} key={`item${classSetting.title}${currentIndex}`} onChange={(e) => eventHandler(e, classSetting)} className="mr-auto w-4 h-auto" type="checkbox" name="" id="" />
                    )
                case "enum":
                    return (
                        <select value={getBindingOfSetting(classSetting) ?? ""} onChange={(e) => eventHandler(e, classSetting)} className="select-container" name="" id="">
                            <option value={""} className="border-blue-400 border-2" >Select a value</option>
                            {classSetting.options && classSetting.options.map((option, i) => (
                                <option className="border-blue-400 border-2" value={option} key={`item${classSetting.title}${currentIndex}${option}`}>{option}</option>
                            ))
                            }
                        </select>
                    )
                default:
                    if (classSetting.type in customClasses) {
                        return (
                            <div className="flex flex-col gap-y-2">
                                {customClasses[classSetting.type].map(classProperty => (
                                    <div key={`${classProperty.title}`} className="flex flex-col">
                                        <p className="text-sm">
                                            {classProperty.title}{classProperty.description && <em>, {classProperty.description}</em>}
                                        </p>
                                        {correspondingField(classProperty, index, `${setting.itemName ?? setting.type}${prefix}.`, suffix)}
                                    </div>
                                ))}
                            </div>)
                    } else {
                        return (<p className="italic text-primarybg">Working on developing that type...</p>)
                    }
            }
        }

        return fieldOfType(classSetting)
    }

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex gap-x-2">
                <button onClick={() => {
                    let newIndex = indices[indices.length - 1] + 1
                    setIndices([...indices, newIndex])
                    
                    let indexedBinding = bindings[currentIndex]
                    let list = indexedBinding.values[setting.name]
                    // Making that new space for the new array item
                    updateBindings(setting.name, [...list, {}])
                }} className="button">
                    Add
                </button>
                <button onClick={() => {
                    setIndices(indices.slice(0, indices.length - 1))

                    let indexedBinding = bindings[currentIndex]
                    let list = indexedBinding.values[setting.name]

                    updateBindings(setting.name, list.slice(0,list.length-1))
                }} disabled={indices.length <= 1} className="button">
                    Remove
                </button>
            </div>
            {indices.map(i => (
                <div key={`item${i}`}>
                    <p className="font-semibold">{setting.type[0].toUpperCase() + setting.type.slice(1)} {i+1}</p>
                    {/* Note that here we don't have any recursive lists */}
                    {correspondingField({...setting, list: false}, i)}
                </div>
            ))}
        </div>
    )
}

export default function FESTIMCodePrompts({ simulation, updateBindings, bindings, currentIndex, setCurrentIndex }: FESTIMCodePromptsProps) {
    // This will be a dictionary of bindings corresponding to each step!

    // FESTIM API Reference for FESTIM classes
    // https://festim.readthedocs.io/en/latest/api/index.html
    const [currentStep, setCurrentStep] = useState(simulation.steps[currentIndex])

    const correspondingField = (setting: FESTIMSetting, prefix: string = "", suffix: string = "") => {
        // The custom binding function is for the case of classes or lists that have different functinos
        let indexedBinding = bindings[currentIndex]

        const getBindingOfSetting = (setting: FESTIMSetting) => {
            return indexedBinding.values[prefix + getBindingName(setting) + suffix]
        }
        const eventHandler = (e: ChangeEvent<any, any>, setting: FESTIMSetting) => {
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
                            {setting.list ? <InputList currentIndex={currentIndex} updateBindings={updateBindings} bindings={bindings} setting={setting}></InputList> : correspondingField(setting)}
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