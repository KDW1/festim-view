
type VisualizerProps = {
    // Future user determined settings
}


export default function TrameVisualizer({} : VisualizerProps) {
    return (
        <div className="w-full flex-1 justify-center container">  
            <iframe className="h-full" src="http://localhost:8080/" />
        </div>
    )
}