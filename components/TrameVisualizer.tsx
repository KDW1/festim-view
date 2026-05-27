import ClientCommunicator from "@kitware/trame-iframe"
import { useEffect, useState } from "react"

// Entire structre is copied from trame-react since legacy dependencies with
// react-scripts, react-dom is preventing the package from functioning normally

type VisualizerProps = {
  url: string;
  iframeId: string;
  onCommunicatorReady: (communicator: unknown) => void;
};

const iframe_id = "my_frame"
const iframe_url = "http://localhost:8080/"

export default function TrameVisualizer({
    onCommunicatorReady
} : VisualizerProps) {
    const [resolution, setResolution] = useState("...")
    
    let listeners: Array<(e: Event) => void> = [];
    let iframeClientCommunicator: unknown = null;
    let iframe: HTMLElement | null = null;

    onCommunicatorReady = (communicator : ClientCommunicator) => {
    communicator.state.onReady(() => {
        communicator.state.watch(['resolution'], (e) => {
            console.log("Resolution: ", e)
            setResolution(e)
        })
    })
}

    useEffect(()=>{
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
        <div className="w-full flex-1 justify-center container">  
            <p className="font-semibold text-primary text-base">Resolution: <span className="font-normal">{resolution}</span></p>
            <iframe id={iframe_id} className="h-full" />
        </div>
    )
}