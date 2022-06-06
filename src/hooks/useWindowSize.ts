import {useEffect, useState} from "react";

export interface Size {
    width?: number;
    height?: number;
}

export const useWindowSize = (): Size => {
    const [windowSize, setWindowSize] = useState<Size>({
        width: undefined,
        height: undefined,
    });
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return windowSize;
}