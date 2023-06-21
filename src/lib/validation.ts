import { Data } from "@/types/data";
import { getCorrespondentRunningProcess } from "./utils";

export function isResizeAction(
    event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent, 
    processWindowRef: React.MutableRefObject<HTMLDivElement | null>
): string | false {

    const touchableAreaToResizeInPixels = 4;

    const processWindowElement = processWindowRef.current! as HTMLDivElement;

    const processWindowElementTop = processWindowElement.getBoundingClientRect().top;
    const processWindowElementRight = processWindowElement.getBoundingClientRect().right;
    const processWindowElementBottom = processWindowElement.getBoundingClientRect().bottom;
    const processWindowElementLeft = processWindowElement.getBoundingClientRect().left;

    const resizingTop = event.clientY 
                        >= processWindowElementTop
                        && event.clientY 
                        <= processWindowElementTop + touchableAreaToResizeInPixels;

    const resizingRight = event.clientX
                        <= processWindowElementRight
                        && event.clientX 
                        >= processWindowElementRight - touchableAreaToResizeInPixels;

    const resizingBottom = event.clientY
                        <= processWindowElementBottom
                        && event.clientY
                        >= processWindowElementBottom - touchableAreaToResizeInPixels;

    const resizingLeft = event.clientX
                        >= processWindowElementLeft
                        && event.clientX
                        <= processWindowElementLeft + touchableAreaToResizeInPixels;

    const isResizing = resizingTop || resizingRight || resizingBottom || resizingLeft;

    if (isResizing) {
        if (resizingTop) return "top";
        if (resizingRight) return "right";
        if (resizingBottom) return "bottom";
        if (resizingLeft) return "left";
    }
 
    return false;
}

export function parentDesktopIsNowVoid(
    opennedProcessesData: Data.OpennedProcessData[], 
    UUID: string
): boolean {

    const parentDesktopChildren = opennedProcessesData.filter(opennedProcessData => {
        return opennedProcessData.parentDesktopUUID === UUID;
    });

    return parentDesktopChildren.length <= 1;
}

export function processIsRunning(opennedProcessesData: Data.OpennedProcessData[], PID: number): boolean {
    const processFound = getCorrespondentRunningProcess(opennedProcessesData, PID);
    return processFound ? true : false;
}

export function processIsTheCurrentOpenned(
    opennedProcessesData: Data.OpennedProcessData[], 
    PID: number
): boolean {
    
    const processFound = getCorrespondentRunningProcess(opennedProcessesData, PID);
    const processZIndex = processFound ? processFound.zIndex : "";
    const processIsMinimized = processFound ? processFound.isMinimized : false;

    const highestZIndex = opennedProcessesData.reduce((acc, curr) => {
        const processZIndex = curr.zIndex;

        return processZIndex > acc ? processZIndex : acc;
    }, 0);

    return (processZIndex === highestZIndex) && !processIsMinimized;
}