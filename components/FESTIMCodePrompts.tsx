import { Binding } from "@/app/page";
import { FESTIMSetting, FESTIMSim } from "@/utils/simulations"
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

    const correspondingField = (setting: FESTIMSetting, index: number) => {
        let indexedBindings = bindings[currentIndex]
        const getBindingOfSetting = (setting: FESTIMSetting) => {
            return indexedBindings.values[setting.name ?? setting.title] ?? ""
        }
        const eventHandler = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>, index: number, setting: FESTIMSetting) => {
            updateBindings(getBindingName(setting), index, e.target.value)
        }
        // Assign values to what they are associated with in the binding, if they are bound to
        switch (setting.type) {
            case "string":
                return (
                    <input value={getBindingOfSetting(setting)} key={`${setting.title}${index}`} onChange={(e) => eventHandler(e, index, setting)} placeholder="abc..." type="text" className="input" />
                )
            case "number":
                return (
                    <input value={getBindingOfSetting(setting)} key={`${setting.title}${index}`} onChange={(e) => eventHandler(e, index, setting)} placeholder="0.0" step={0.1} type="number" className="input" />
                )
            case "boolean":
                return (
                    <input value={getBindingOfSetting(setting)} key={`${setting.title}${index}`} onChange={(e) => eventHandler(e, index, setting)} className="mr-auto w-4 h-auto" type="checkbox" name="" id="" />
                )
            case "enum":
                return (
                    <select value={getBindingOfSetting(setting)} onChange={(e) => eventHandler(e, index, setting)} className="select-container" name="" id="">
                        <option value={""} className="border-blue-400 border-2" >Select a value</option>
                        {setting.options && setting.options.map((option, i) => (
                            <option className="border-blue-400 border-2" value={option} key={`${setting.title}${option}`}>{option}</option>
                        ))
                        }
                    </select>
                )
            case "material":
                // mat_1 = F.Material(name="", D_0=0.0, E_D=0.0, K_S_0=0.0, E_K_S=0.0)
                return (
                    <div className="flex flex-col gap-y-2">
                        <div className="flex flex-col">
                            <p className="text-sm">
                                Variable, variable name
                            </p>
                            <input onChange={(e) => eventHandler(e, index, setting)} placeholder="abc..." type="text" className="input" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">
                                Name, the name of the material
                            </p>
                            <input onChange={(e) => eventHandler(e, index, setting)} placeholder="abc..." type="text" className="input" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">
                                D_0, the pre-exponential factor of the diffusion coefficient (m2/s)
                            </p>
                            <input onChange={(e) => eventHandler(e, index, setting)} placeholder="0.0" type="number" className="input" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">
                                E_D, the activation energy of the diffusion coefficient (eV)
                            </p>
                            <input onChange={(e) => eventHandler(e, index, setting)} placeholder="0.0" type="number" className="input" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">
                                K_S, the pre-exponential factor of the solubility coefficient (H/m3/Pa0.5)
                            </p>
                            <input onChange={(e) => eventHandler(e, index, setting)} placeholder="0.0" type="number" className="input" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">
                                K_S_0, the activation energy of the solubility coeficient (eV)
                            </p>
                            <input onChange={(e) => eventHandler(e, index, setting)} placeholder="0.0" type="number" className="input" />
                        </div>
                    </div>
                )
            default:
                return (<p className="italic text-primarybg">Working on developing that type...</p>)
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