import { Data } from '@/types/data';

import { 
    INITIAL_PROCESS_WINDOW_HEIGHT_IN_PERCENTAGE, 
    INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE, INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE_IF_WINDOW_LE_LIMIT, LIMIT_TO_CHANGE_INITIAL_PROCESS_WINDOW_DIMENSION_PERCENTAGE_IN_PIXELS 
} from './initial/process';

import { generateUUID } from './utils';


export const getCorrespondentRunningProcess = (
    opennedProcessesData: Data.OpennedProcessData[],
    PID: number
): Data.OpennedProcessData | undefined => {

    const processFound = opennedProcessesData.find(processData => 
        processData.PID === PID
    );
    
    return processFound;
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
 

export const getProcessWindowParentWorkspaceUUID = (
    currentActiveWorkspaceUUID: string, 
    currentActiveWorkspaceDoesNotExists: boolean,
    baseWorkspaceUUID: string
): string => {

    const currentUUIDEqualsToBaseWorkspaceUUID = currentActiveWorkspaceUUID === baseWorkspaceUUID;
    const invalidUUID = currentActiveWorkspaceDoesNotExists || currentUUIDEqualsToBaseWorkspaceUUID;

    return invalidUUID? generateUUID() : currentActiveWorkspaceUUID;
}


export const getRelativeInitialProcessWindowAxisDimension = (
    axis: string, 
    percentage: number, 
    applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>
): number => {
    
    const applicationsWindowElement = applicationsWindowRef.current as HTMLDivElement;

    const applicationsWindowWidth = applicationsWindowElement.getBoundingClientRect().width;
    const applicationsWindowHeight = applicationsWindowElement.getBoundingClientRect().height;

    return axis === 'x'
            ? applicationsWindowWidth * percentage / 100
            : applicationsWindowHeight * percentage / 100;
}

 
export const getInitialProcessWindowDimensions = (
    window: Window, 
    applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>
) => {

    const windowLELimit = window.innerWidth 
                        <= LIMIT_TO_CHANGE_INITIAL_PROCESS_WINDOW_DIMENSION_PERCENTAGE_IN_PIXELS;

    
    const initialWidthPercentage = windowLELimit
                                    ? INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE_IF_WINDOW_LE_LIMIT
                                    : INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE;

    return {
        width: getRelativeInitialProcessWindowAxisDimension(
            'x', 
            initialWidthPercentage, 
            applicationsWindowRef
        ),
        height: getRelativeInitialProcessWindowAxisDimension(
            'y', 
            INITIAL_PROCESS_WINDOW_HEIGHT_IN_PERCENTAGE, 
            applicationsWindowRef
        )
    };
 
}