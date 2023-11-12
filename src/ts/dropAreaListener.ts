import { dropAreaStore, PIXIGraphStore, PIXIAppStore } from "../ts/store";
import { generatePIXIGraph } from "@components/MapGraph";

const initializeDropAreaListerners = () => {
    const dropArea = dropAreaStore.get();

    if (dropArea !== null) {
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
            dropArea!.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e: Event) {
            e.preventDefault();
            e.stopPropagation();
        }

        ["dragenter", "dragover"].forEach((eventName) => {
            dropArea!.addEventListener(eventName, highlight, false);
        });
        ["dragleave", "drop"].forEach((eventName) => {
            dropArea!.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e: Event) {
            dropArea!.classList.add("border-amber-400");
        }

        function unhighlight(e: Event) {
            dropArea!.classList.remove("border-amber-400");
        }

        dropArea.addEventListener("drop", handleDrop, false);

        function handleDrop(e: DragEvent) {
            const dt = e.dataTransfer!;
            const file = dt.files[0];

            const PIXIApp = PIXIAppStore.get();
            const PIXIGraph = PIXIGraphStore.get();
            if (PIXIGraph !== null) {
                PIXIGraph.destroy();
            }
            if(PIXIApp !== null){
                generatePIXIGraph(PIXIApp, file);
            }
            else{
                console.error("Unable to generate PIXI Graph from file. PIXIApp is null.");
            }
        }
    }
}

export default initializeDropAreaListerners;
