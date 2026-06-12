import ClientCommunicator from "@kitware/trame-iframe"
import { useEffect, useState } from "react"
import { FESTIMSim } from "@/utils/simulations"
import FESTIMCodePrompts from "./FESTIMCodePrompts";
import { Binding } from "@/app/page";

// Entire structre is copied from trame-react since legacy dependencies with
// react-scripts, react-dom is preventing the package from functioning normally

type VisualizerProps = {
  simulation?: FESTIMSim;
  updateBindings: Function;
  updateMode: Function;
  onCommunicatorReady: (communicator: unknown) => void;
  bindings: Binding[];
  currentIndex: number;
  setCurrentIndex: Function;
};

const iframe_id = "my_frame"
const iframe_url = "http://localhost:8080/"

export default function TrameVisualizer({
  onCommunicatorReady, simulation, updateBindings, bindings, updateMode, currentIndex, setCurrentIndex
}: VisualizerProps) {
  const tabs = simulation ? ["Window", "FESTIM"] : ["Window"]
  const [resolution, setResolution] = useState("...")
  const [currentTab, setCurrentTab] = useState("window")

  let listeners: Array<(e: Event) => void> = [];
  let iframeClientCommunicator: unknown = null;
  let iframe: HTMLElement | null = null;

  onCommunicatorReady = (communicator: ClientCommunicator) => {
    communicator.state.onReady(() => {
      communicator.state.watch(['resolution'], (e) => {
        console.log("Resolution: ", e)
        setResolution(e)
      })
    })
  }

  useEffect(() => {
    console.log("Mounting trame visualizer component....")
    let iframe = document.getElementById(iframe_id);

    if (iframe == null) {
      throw new Error(`iframe ${iframe_id} not found`);
    }

    const createClientCommunicator = () => {
      let iframeClientCommunicator = new ClientCommunicator(iframe, iframe_url);
      onCommunicatorReady(iframeClientCommunicator);
      console.log("Creating client commuicator")
    };
    
    listeners.push(createClientCommunicator);
    console.log("Iframe: ", iframe)
    iframe.addEventListener('load', createClientCommunicator);
    iframe.setAttribute("src", iframe_url)
    console.log("Set src of iframe...")
    return function unmount() {
      console.log("Unmounting the client communicator")
      if (iframe) {
        listeners.forEach((l) => iframe.removeEventListener('load', l));
      }

      listeners = [];

      if (iframeClientCommunicator) {
        iframeClientCommunicator.cleanup();
      }
    };
  }, [])
  
  return (
    <div className="w-full flex h-full container text-base text-primary">
      <p className="italic text-sm">{simulation ? simulation.title : "Trame Window"}</p>
      <div className="flex gap-2 text-primary items-center rounded-md">
        {
          tabs.map((tab) =>
          (
            <button key={`option${tab}`} onClick={(e) => {
              e.preventDefault()
              setCurrentTab(tab.toLowerCase())
              updateMode(tab.toLowerCase())
            }} className={`cursor-pointer ease-in-out duration-300 transition ${tab.toLowerCase() == currentTab ? "bg-primarybg" : "bg-lightbg"} px-2 py-1 rounded-md`}>{tab}</button>
          )
          )
        }
      </div>
      <div className={`flex-col flex flex-1 ${currentTab == "window" ? "" : "hidden h-0"}`}>
        <p className="font-semibold text-primary text-base">Resolution: <span className="font-normal">{resolution}</span></p>
        <iframe id={iframe_id} className="h-full w-full" />
      </div>
      {
        currentTab == "festim" && simulation &&
        <FESTIMCodePrompts currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} bindings={bindings} updateBindings={updateBindings} simulation={simulation} />
      }
    </div>
  )
}