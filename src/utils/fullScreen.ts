export const goFullScreen = (elementId: string) => {
    try {
        const element = document.getElementById(elementId);
        if (element === null) throw new Error(`Element with id "${elementId}" does not exist in the document`);

        if (!document.fullscreenElement) {
            element.requestFullscreen();
        }
    }
    catch (err) {
        console.error(err);
    }
}

export const exitFullScreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}