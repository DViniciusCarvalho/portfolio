import React, { useState, createContext, useRef } from 'react';
import mainStyles from "@/styles/workarea/Background.module.sass";
import Desktop from './desktop/Desktop';
import TaskBar from './taskbar/TaskBar';
import { Data } from '@/types/data';
import { Props } from '@/types/props';

import { 
    deepClone, 
    getCorrespondentRunningProcess, 
    getNewHeightAndYAxisOnTop, 
    getNewWidthOnRight, 
    getNewHeightAndYAxisOnBottom,
    getNewWidthAndXAxisOnLeft
} from '@/lib/utils';


export const MainContext = createContext<any>(null);

export default function Main() {
    
    const taskBarRef = useRef<HTMLDivElement | null>(null);
    const desktopRef = useRef<HTMLDivElement | null>(null);

    const [ lastPID, setLastPID ] = useState(1);
    const [ lastHighestZIndex, setLastHighestZIndex ] = useState(1);

    const [ opennedProcessesData, setOpennedProcessesData ] = useState<Data.OpennedProcessData[]>([]);

    const [ themeStyleClass, setThemeStyleClass ] = useState("default__theme");
    const [ layoutStyleClass, setLayoutStyleClass ] = useState("default__layout");

    const contextValues = {
        opennedProcessesData,
        themeStyleClass,
        layoutStyleClass,
        elevateProcessWindowZIndex,
        sendSIGKILLToProcess,
        minimizeProcessWindow,
        restoreProcessWindowLastDimensions,
		maximizeProcessWindow,
        updateProcessWindowDimensions
    };

    const taskbarProps: Props.TaskBarProps = {
        taskBarRef,
        openProcess,
        restorePreviousDimensions
    };

    const desktopProps: Props.DesktopProps = {
        desktopRef,
        opennedProcessesData,
        updateProcessCoordinates
    };


    function openProcess(processTitle: string, processElement: JSX.Element): number {
        const nextPID = lastPID + 1;

        const newProcessData = {
            PID: nextPID,
            processTitle: processTitle,
            processElement: processElement,
            zIndex: 1,
            isMinimized: false,
            isMaximized: false,
            coordinates: {
                x: 0,
                y: 0
            },
            dimensions: {
                width: 400,
                height: 400
            }
        };

        setLastPID(previous => nextPID);
        setOpennedProcessesData(previous => [...previous, newProcessData]);

        return nextPID;
    }


    function elevateProcessWindowZIndex(PID: number): void {   
        setLastHighestZIndex(previousHighestZIndex => {

            const nextHighestZIndex = previousHighestZIndex + 1;

            setOpennedProcessesData(previous => {
                const previousDeepCopy = deepClone(previous);
                const elementPIDOwner = getCorrespondentRunningProcess(previousDeepCopy, PID);
    
                elementPIDOwner!.zIndex = nextHighestZIndex;

                return previousDeepCopy;
            });

            return nextHighestZIndex;
        });
    }


    function sendSIGKILLToProcess(PID: number): void { 
        setOpennedProcessesData(previous => {
            const previousDeepCopy = deepClone(previous);
            const filteredPreviousDeepCopy = previousDeepCopy.filter(processData => processData.PID !== PID);

            return filteredPreviousDeepCopy;
        });
    }


    function updateProcessCoordinates(PID: number, XAxis: number, YAxis: number): void {
        const taskBarElement = taskBarRef.current! as HTMLDivElement;
        const taskBarWidth = taskBarElement.getBoundingClientRect().width;

        setOpennedProcessesData(previous => {
            const previousDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(previousDeepCopy, PID);

            elementPIDOwner!.coordinates = {
                x: XAxis - taskBarWidth,
                y: YAxis
            };

            return previousDeepCopy;
        });
    }


    function minimizeProcessWindow(PID: number): void {
        setOpennedProcessesData(previous => {
            const previousDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(previousDeepCopy, PID);

            elementPIDOwner!.isMinimized = true;

            return previousDeepCopy;
        });
    }


    function restorePreviousDimensions(PID: number): void {

        setOpennedProcessesData(previous => {
            const previousDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(previousDeepCopy, PID);

            elementPIDOwner!.isMinimized = false;

            return previousDeepCopy;
        });
    }


    function restoreProcessWindowLastDimensions(
        PID: number, 
        memoizedWidth: number,
        memoizedHeight: number,
        memoizedXAxis: number, 
        memoizedYAxis: number
    ): void {

        setOpennedProcessesData(previous => {
            const previousDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(previousDeepCopy, PID);

            elementPIDOwner!.isMaximized = false;

            elementPIDOwner!.dimensions = {
                width: memoizedWidth,
                height: memoizedHeight
            };

            elementPIDOwner!.coordinates = {
                x: memoizedXAxis,
                y: memoizedYAxis
            };

            return previousDeepCopy;
        });
    }


    function maximizeProcessWindow(PID: number): void {
        const desktopElement = desktopRef.current as HTMLDivElement;

        const desktopWidth = desktopElement.getBoundingClientRect().width;
        const desktopHeight = desktopElement.getBoundingClientRect().height;

        setOpennedProcessesData(previous => {
            const previousDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(previousDeepCopy, PID);

            elementPIDOwner!.isMaximized = true;

            elementPIDOwner!.dimensions = {
                width: desktopWidth,
                height: desktopHeight
            };

            elementPIDOwner!.coordinates = {
                x: 0,
                y: 0
            };

            return previousDeepCopy;
        });
    }

    function updateProcessWindowDimensions(
        PID: number,
        event: React.MouseEvent<HTMLDivElement, MouseEvent>, 
        previousXAxis: number,
        previousYAxis: number,
        dragRef: React.MutableRefObject<HTMLDivElement | null>, 
        resizeSide: string
    ): void {

        setOpennedProcessesData(previous => {
            const previousDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(previousDeepCopy, PID);

            const currentXAxis = event.clientX;
            const currentYAxis = event.clientY;

            const movementIsInFavorOfXAxis = currentXAxis > previousXAxis;
            const movementIsInFavorOfYAxis = currentYAxis > previousYAxis;

            if (resizeSide === "top") {
                const { newHeight, newCoordinates } = getNewHeightAndYAxisOnTop(
                    movementIsInFavorOfYAxis,
                    elementPIDOwner!,
                    previousYAxis,
                    currentYAxis
                );

                elementPIDOwner!.dimensions = {
                    width: elementPIDOwner!.dimensions.width,
                    height: newHeight
                };

                elementPIDOwner!.coordinates = {
                    x: elementPIDOwner!.coordinates.x,
                    y: newCoordinates
                };
            }
       
            else if (resizeSide === "right") {
                const newWidth = getNewWidthOnRight(
                    movementIsInFavorOfXAxis, 
                    elementPIDOwner!, 
                    previousXAxis, 
                    currentXAxis
                );

                elementPIDOwner!.dimensions = {
                    width: newWidth,
                    height: elementPIDOwner!.dimensions.height
                };
            }

            else if (resizeSide === "bottom") {
                const newHeight = getNewHeightAndYAxisOnBottom(
                    movementIsInFavorOfYAxis,
                    elementPIDOwner!,
                    previousYAxis,
                    currentYAxis
                );

                elementPIDOwner!.dimensions = {
                    width: elementPIDOwner!.dimensions.width,
                    height: newHeight
                };
            }

            else if (resizeSide === "left") {
                const { newWidth, newCoordinates } = getNewWidthAndXAxisOnLeft(
                    movementIsInFavorOfXAxis, 
                    elementPIDOwner!, 
                    previousXAxis, 
                    currentXAxis
                );

                elementPIDOwner!.dimensions = {
                    width: newWidth,
                    height: elementPIDOwner!.dimensions.height
                };

                elementPIDOwner!.coordinates = {
                    x: newCoordinates,
                    y: elementPIDOwner!.coordinates.y
                };
            }

            
            return previousDeepCopy;
        });
    }

    return (
        <div className={mainStyles.container}>
            <MainContext.Provider value={{...contextValues}}>
                <TaskBar {...taskbarProps}/>
                <Desktop {...desktopProps}/>
            </MainContext.Provider>
        </div>
    );
}