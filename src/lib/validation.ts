import { Data } from '@/types/data';
import { getCorrespondentRunningProcess } from './utils';
import { TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS } from './constants';


export const isResizeAction = (
    clientX: number,
    clientY: number, 
    processWindowRef: React.MutableRefObject<HTMLDivElement | null>
): string | false => {

    const processWindowElement = processWindowRef.current! as HTMLDivElement;

    const processWindowElementTop = processWindowElement.getBoundingClientRect().top;
    const processWindowElementRight = processWindowElement.getBoundingClientRect().right;
    const processWindowElementBottom = processWindowElement.getBoundingClientRect().bottom;
    const processWindowElementLeft = processWindowElement.getBoundingClientRect().left;

    const resizingTop = clientY
                        >= processWindowElementTop
                        && clientY
                        <= processWindowElementTop + TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS;

    const resizingRight = clientX
                        <= processWindowElementRight
                        && clientX
                        >= processWindowElementRight - TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS;

    const resizingBottom = clientY
                        <= processWindowElementBottom
                        && clientY
                        >= processWindowElementBottom - TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS;

    const resizingLeft = clientX
                        >= processWindowElementLeft
                        && clientX
                        <= processWindowElementLeft + TOUCHABLE_AREA_TO_START_RESIZING_IN_PIXELS;

    const isResizing = resizingTop || resizingRight || resizingBottom || resizingLeft;

    if (isResizing) {
        if (resizingTop) return 'top';
        if (resizingRight) return 'right';
        if (resizingBottom) return 'bottom';
        if (resizingLeft) return 'left';
    }
 
    return false;
}


export const parentDesktopIsNowVoid = (
    opennedProcessesData: Data.OpennedProcessData[], 
    UUID: string
): boolean => {

    const parentDesktopChildren = opennedProcessesData.filter(opennedProcessData => {
        return opennedProcessData.parentDesktopUUID === UUID;
    });

    return parentDesktopChildren.length <= 1;
}


export const processIsRunning = (
    opennedProcessesData: Data.OpennedProcessData[], 
    PID: number
): boolean => {

    const processFound = getCorrespondentRunningProcess(opennedProcessesData, PID);

    return processFound ? true : false;
}


export const processIsTheCurrentOpenned = (
    opennedProcessesData: Data.OpennedProcessData[], 
    PID: number
): boolean => {
    
    const processFound = getCorrespondentRunningProcess(opennedProcessesData, PID);
    const processZIndex = processFound ? processFound.zIndex : '';
    const processIsMinimized = processFound ? processFound.isMinimized : false;

    const highestZIndex = opennedProcessesData.reduce((acc, curr) => {
        const currentProcessZIndex = curr.zIndex;

        return currentProcessZIndex > acc ? currentProcessZIndex : acc;
    }, 0);

    return (processZIndex === highestZIndex) && !processIsMinimized;
}

export const desktopCanBeShowed = (
    applicationsAreBeingShowed: boolean, 
    currentActiveDesktopUUID: string, 
    UUID: string
): boolean => {
    
    return !(applicationsAreBeingShowed || currentActiveDesktopUUID !== UUID);
}