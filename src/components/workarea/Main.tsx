import React, { useState, createContext, useRef, useEffect } from 'react';
import mainStyles from '@/styles/workarea/Main.module.sass';
import GlobalMenuBar from './menu/GlobalMenuBar';
import TaskBar from './taskbar/TaskBar';
import ApplicationsWindow from './applications_window/ApplicationsWindow';
import { Data } from '@/types/data';
import { Props } from '@/types/props';

import { 
    deepClone, 
    getCorrespondentRunningProcess, 
    getNewHeightAndYAxisOnTop, 
    getNewWidthOnRight, 
    getNewHeightAndYAxisOnBottom,
    getNewWidthAndXAxisOnLeft,
    generateUUID,
    getParentDesktopUUID,
    getRelativeInitialDimension
} from '@/lib/utils';

import { parentDesktopIsNowVoid } from '@/lib/validation';


export const MainContext = createContext<any>(null);

export default function Main() {
    
    const globalMenuRef = useRef<HTMLDivElement | null>(null);
    const taskBarRef = useRef<HTMLDivElement | null>(null);
    const applicationsWindowRef = useRef<HTMLDivElement | null>(null);

    const initialBaseDesktopUUID = generateUUID();

    const [ lastPID, setLastPID ] = useState(1);
    const [ lastHighestZIndex, setLastHighestZIndex ] = useState(0);
    const [ baseDesktopUUID ] = useState(initialBaseDesktopUUID);
    const [ currentActiveDesktopUUID, setCurrentActiveDesktopUUID ] = useState(initialBaseDesktopUUID);

    const [ opennedProcessesData, setOpennedProcessesData ] = useState<Data.OpennedProcessData[]>([]);
    const [ desktopActivitiesData, setDesktopActivitiesData ] = useState<Data.DesktopActivityData[]>([]);

    const [ themeStyleClass, setThemeStyleClass ] = useState('default__theme');
    const [ layoutStyleClass, setLayoutStyleClass ] = useState('row__style');

    const [ applicationsAreBeingShowed, setApplicationsAreBeingShowed ] = useState(false);

    const contextValues = {
        opennedProcessesData,
        desktopActivitiesData,

        themeStyleClass,
        layoutStyleClass,
        applicationsAreBeingShowed,
        lastHighestZIndex,
        currentActiveDesktopUUID,
        baseDesktopUUID,

        elevateProcessWindowZIndex,
        sendSIGKILLToProcess,
        minimizeProcessWindow,
        restoreProcessWindowLastDimensions,
		maximizeProcessWindow,
        updateProcessWindowDimensions,
        showAllApplicationsAndOpennedWindows,
        handleChangeCurrentDesktop,
        removeDesktopActivity
    };

    const globalMenuProps: Props.GlobalMenuProps = {
        globalMenuRef
    };

    const taskbarProps: Props.TaskBarProps = {
        taskBarRef,
        openProcess,
        restorePreviousDimensions
    };

    const applicationsWindowProps: Props.ApplicationsWindowProps = {
        applicationsWindowRef,
        opennedProcessesData,
        updateProcessCoordinates,
        desktopActivitiesData,
        baseDesktopUUID
    };


    useEffect(() => {
        window!.addEventListener("resize", () => {
            if (!applicationsAreBeingShowed) {
                setApplicationsAreBeingShowed(previous => true);
            }
        });
    }, []);


    function openProcess(
        processTitle: string, 
        processElement: JSX.Element, 
        currentActiveDesktopDoesNotExists: boolean
    ): number {

        const nextPID = lastPID + 1;
        const nextLastHighestZIndex = lastHighestZIndex + 1;

        const parentDesktopUUID = getParentDesktopUUID(
            currentActiveDesktopUUID,
            currentActiveDesktopDoesNotExists,
            baseDesktopUUID
        );

        const newProcessData = {
            PID: nextPID,
            processTitle: processTitle,
            processElement: processElement,
            zIndex: nextLastHighestZIndex,
            isMinimized: false,
            isMaximized: false,
            parentDesktopUUID: parentDesktopUUID,
            coordinates: {
                x: 0,
                y: 0
            },
            dimensions: {
                width: getRelativeInitialDimension('x', 60, applicationsWindowRef),
                height: getRelativeInitialDimension('y', 60, applicationsWindowRef)
            }
        };

        if (currentActiveDesktopUUID === baseDesktopUUID || currentActiveDesktopDoesNotExists) {
            const newCurrentDesktopData = {
                UUID: parentDesktopUUID
            };

            setDesktopActivitiesData(previous => [...previous, newCurrentDesktopData]);
            setCurrentActiveDesktopUUID(previous => parentDesktopUUID);
        }

        setLastPID(previous => nextPID);
        setLastHighestZIndex(previous => nextLastHighestZIndex);
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
            const elementPIDOwner = getCorrespondentRunningProcess(previousDeepCopy, PID);
            const { parentDesktopUUID } = elementPIDOwner!;

            if (parentDesktopIsNowVoid(opennedProcessesData, parentDesktopUUID)) {
                setCurrentActiveDesktopUUID(previous => baseDesktopUUID);
                removeDesktopActivity(parentDesktopUUID);
                setApplicationsAreBeingShowed(previous => false);
            }

            const filteredPreviousDeepCopy = previousDeepCopy.filter(processData => processData.PID !== PID);

            return filteredPreviousDeepCopy;
        });

    }


    function updateProcessCoordinates(PID: number, XAxis: number, YAxis: number): void {
        const taskBarElement = taskBarRef.current! as HTMLDivElement;
        const taskBarWidth = taskBarElement.getBoundingClientRect().width;

        const globalMenuElement = globalMenuRef.current! as HTMLDivElement;
        const globalMenuHeight = globalMenuElement.getBoundingClientRect().height;

        setOpennedProcessesData(previous => {
            const previousDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(previousDeepCopy, PID);

            elementPIDOwner!.coordinates = {
                x: XAxis - (layoutStyleClass === 'row__style'? taskBarWidth : 0),
                y: YAxis - globalMenuHeight
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


    function maximizeProcessWindow(PID: number, parentDesktopElement: HTMLDivElement): void {
        const parentDesktopWidth = parentDesktopElement.getBoundingClientRect().width;
        const parentDesktopHeight = parentDesktopElement.getBoundingClientRect().height;

        setOpennedProcessesData(previous => {
            const previousDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(previousDeepCopy, PID);

            elementPIDOwner!.isMaximized = true;

            elementPIDOwner!.dimensions = {
                width: parentDesktopWidth,
                height: parentDesktopHeight
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

            if (resizeSide === 'top') {
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
       
            else if (resizeSide === 'right') {
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

            else if (resizeSide === 'bottom') {
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

            else if (resizeSide === 'left') {
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


    function showAllApplicationsAndOpennedWindows(): void {
        setApplicationsAreBeingShowed(previous => !previous);
    }


    function handleChangeCurrentDesktop(UUID: string): void {
        setCurrentActiveDesktopUUID(previous => UUID);
        setApplicationsAreBeingShowed(previous => false);
    }


    function removeDesktopActivity(UUID: string): void {
        setDesktopActivitiesData(previous => 
            previous.filter(desktopActivity => 
                desktopActivity.UUID !== UUID
            )
        );
    }


    return (
        <div className={mainStyles.container}>
            <MainContext.Provider value={{...contextValues}}>
                <GlobalMenuBar {...globalMenuProps}/>
                <div className={`${mainStyles.taskbar__desktop__wrapper} ${mainStyles[layoutStyleClass]}`}>
                    <TaskBar {...taskbarProps}/>
                    <ApplicationsWindow {...applicationsWindowProps}/>
                </div>
            </MainContext.Provider>
        </div>
    );
}