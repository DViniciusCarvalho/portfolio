import React, { useState, createContext, useRef, useEffect } from 'react';
import mainStyles from '@/styles/workarea/Main.module.sass';
import GlobalMenuBar from './menu/GlobalMenuBar';
import TaskBar from './taskbar/TaskBar';
import ApplicationsWindow from './applications_window/ApplicationsWindow';
import { Data } from '@/types/data';
import { Props } from '@/types/props';

import { 
    getXAxisInterference, 
    getYAxisInterference 
} from '@/lib/coordinates';

import { 
    LAST_SYSTEM_ESSENTIAL_PID, 
    INITIAL_PROCESS_WINDOW_HIGHEST_ZINDEX,
    INITIAL_SYSTEM_COLOR_PALETTE,
    INITIAL_SYSTEM_THEME,
    INITIAL_SYSTEM_LAYOUT
} from '@/lib/constants';

import { 
    getNewHeightAndYAxisOnTop, 
    getNewWidthOnRight, 
    getNewHeightAndYAxisOnBottom, 
    getNewWidthAndXAxisOnLeft 
} from '@/lib/resize';

import { 
    deepClone, 
    getCorrespondentRunningProcess,
    generateUUID,
    getParentDesktopUUID,
    getRelativeInitialDimension
} from '@/lib/utils';

import { 
    parentDesktopIsNowVoid 
} from '@/lib/validation';

import { StaticImageData } from 'next/image';


export const MainContext = createContext<any>(null);

export default function Main() {
    
    const globalMenuRef = useRef<HTMLDivElement | null>(null);
    const taskBarRef = useRef<HTMLDivElement | null>(null);
    const applicationsWindowRef = useRef<HTMLDivElement | null>(null);

    const initialBaseDesktopUUID = generateUUID();

    const [ lastPID, setLastPID ] = useState(LAST_SYSTEM_ESSENTIAL_PID);

    const [ 
        lastHighestZIndex, 
        setLastHighestZIndex 
    ] = useState(INITIAL_PROCESS_WINDOW_HIGHEST_ZINDEX);

    const [ baseDesktopUUID ] = useState(initialBaseDesktopUUID);

    const [ 
        currentActiveDesktopUUID, 
        setCurrentActiveDesktopUUID 
    ] = useState(initialBaseDesktopUUID);

    const [ opennedProcessesData, setOpennedProcessesData ] = useState<Data.OpennedProcessData[]>([]);
    const [ desktopActivitiesData, setDesktopActivitiesData ] = useState<Data.DesktopActivityData[]>([]);

    const [ 
        applicationsPropsDataInTaskbar, 
        setApplicationsPropsDataInTaskbar 
    ] = useState<Props.ProcessIconProps[]>([]);

    const [ systemColorPalette, setSystemColorPalette ] = useState(INITIAL_SYSTEM_COLOR_PALETTE);
    const [ systemTheme, setSystemTheme ] =  useState(INITIAL_SYSTEM_THEME);
    const [ systemLayout, setSystemLayout ] = useState(INITIAL_SYSTEM_LAYOUT);

    const [ backgroundIsImageBlob, setBackgroundIsImageBlob ] = useState(false);
    const [ backgroundImageUrl, setBackgroundImageUrl ] = useState('');

    const [ applicationsAreBeingShowed, setApplicationsAreBeingShowed ] = useState(false);


    const contextValues = {
        opennedProcessesData,
        desktopActivitiesData,

        systemColorPalette,
        systemTheme,
        systemLayout,

        applicationsAreBeingShowed,
        lastHighestZIndex,
        currentActiveDesktopUUID,
        baseDesktopUUID,
        backgroundIsImageBlob,
        backgroundImageUrl,

        elevateProcessWindowZIndex,
        sendSIGKILLToProcess,
        minimizeProcessWindow,
        restoreProcessWindowLastDimensions,
		maximizeProcessWindow,
        updateProcessWindowDimensions,
        changeApplicationsAreBeingShowed,
        handleChangeCurrentDesktop,
        removeDesktopActivity,
        openProcess,
        restorePreviousDimensions,
        transferApplicationIconToTaskbarOtherProcessesIcons,
        changeBackgroundStyle,
        changeSystemTheme,
        changeSystemLayout,
        updateProcessCoordinates
    };

    const globalMenuProps: Props.GlobalMenuProps = {
        globalMenuRef
    };

    const taskbarProps: Props.TaskBarProps = {
        taskBarRef,
        applicationsPropsDataInTaskbar
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
                changeApplicationsAreBeingShowed(true);
            }
        });
    }, []);


    function openProcess(
        processTitle: string, 
        processIcon: StaticImageData,
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
            processIcon: processIcon,
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
            
        }

        setCurrentActiveDesktopUUID(previous => parentDesktopUUID);
        setApplicationsAreBeingShowed(previous => false);

        setLastPID(previous => nextPID);

        setLastHighestZIndex(previous => nextLastHighestZIndex);

        setOpennedProcessesData(previous => [
            ...previous, 
            newProcessData
        ]);

        return nextPID;
    }


    function elevateProcessWindowZIndex(PID: number): void {   
        setLastHighestZIndex(previousHighestZIndex => {
            const nextHighestZIndex = previousHighestZIndex + 1;

            setOpennedProcessesData(previous => {
                const opennedProcessesDataDeepCopy = deepClone(previous);
                const elementPIDOwner = getCorrespondentRunningProcess(
                    opennedProcessesDataDeepCopy, 
                    PID
                );
    
                elementPIDOwner!.zIndex = nextHighestZIndex;

                return opennedProcessesDataDeepCopy;
            });

            return nextHighestZIndex;
        });
    }


    function sendSIGKILLToProcess(PID: number): void { 
        setOpennedProcessesData(previous => {
            const elementPIDOwner = getCorrespondentRunningProcess(previous, PID);
            const { parentDesktopUUID } = elementPIDOwner!;

            if (parentDesktopIsNowVoid(opennedProcessesData, parentDesktopUUID)) {
                setCurrentActiveDesktopUUID(previous => baseDesktopUUID);
                removeDesktopActivity(parentDesktopUUID);
                changeApplicationsAreBeingShowed(false);
            }

            const opennedProcessesDataWithoutElementPIDOwner = previous.filter(
                processData => processData.PID !== PID
            );

            return opennedProcessesDataWithoutElementPIDOwner;
        });

        setApplicationsPropsDataInTaskbar(previous => {
            const filteredPreviousDeepCopy = previous.filter(processData => processData.initialPID !== PID);
            return filteredPreviousDeepCopy;
        });

    }


    function updateProcessCoordinates(
        PID: number, 
        XAxisWithoutInterference: number, 
        YAxisWithoutInterference: number
    ): void {

        const currentXAxis = XAxisWithoutInterference - getXAxisInterference(taskBarRef, systemLayout);
        const currentYAxis = YAxisWithoutInterference - getYAxisInterference(globalMenuRef);

        setOpennedProcessesData(previous => {
            const opennedProcessesDataDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            elementPIDOwner!.coordinates = {
                x: currentXAxis,
                y: currentYAxis
            };

            return opennedProcessesDataDeepCopy;
        });
    }


    function minimizeProcessWindow(PID: number): void {
        setOpennedProcessesData(previous => {
            const opennedProcessesDataDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            elementPIDOwner!.isMinimized = true;

            return opennedProcessesDataDeepCopy;
        });
    }


    function restorePreviousDimensions(PID: number): void {
        setOpennedProcessesData(previous => {
            const opennedProcessesDataDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            elementPIDOwner!.isMinimized = false;

            return opennedProcessesDataDeepCopy;
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
            const opennedProcessesDataDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            elementPIDOwner!.isMaximized = false;

            elementPIDOwner!.dimensions = {
                width: memoizedWidth,
                height: memoizedHeight
            };

            elementPIDOwner!.coordinates = {
                x: memoizedXAxis,
                y: memoizedYAxis
            };

            return opennedProcessesDataDeepCopy;
        });
    }


    function maximizeProcessWindow(PID: number, parentDesktopElement: HTMLDivElement): void {
        const parentDesktopWidth = parentDesktopElement.getBoundingClientRect().width;
        const parentDesktopHeight = parentDesktopElement.getBoundingClientRect().height;

        setOpennedProcessesData(previous => {
            const opennedProcessesDataDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            elementPIDOwner!.isMaximized = true;

            elementPIDOwner!.dimensions = {
                width: parentDesktopWidth,
                height: parentDesktopHeight
            };

            elementPIDOwner!.coordinates = {
                x: 0,
                y: 0
            };

            return opennedProcessesDataDeepCopy;
        });
    }


    function updateProcessWindowDimensions(
        PID: number,
        currentXAxis: number,
        currentYAxis: number, 
        previousXAxis: number,
        previousYAxis: number,
        dragRef: React.MutableRefObject<HTMLDivElement | null>, 
        resizeSide: string
    ): void {

        setOpennedProcessesData(previous => {
            const opennedProcessesDataDeepCopy = deepClone(previous);
            const elementPIDOwner = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

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

            return opennedProcessesDataDeepCopy;
        });
    }


    function transferApplicationIconToTaskbarOtherProcessesIcons(                
        applicationIconStaticImage: StaticImageData,
        applicationName: string,
        applicationElement: JSX.Element,
        startedProcessPID: number
    ): void {

        const newProcessIconProps: Props.ProcessIconProps = {
            processIconStaticImage: applicationIconStaticImage,
            processName: applicationName,
            processElement: applicationElement,
            initialPID: startedProcessPID
        };

        setApplicationsPropsDataInTaskbar(previous => [
            ...previous, 
            newProcessIconProps
        ]);
    }

    
    function changeApplicationsAreBeingShowed(value: boolean): void {
        setApplicationsAreBeingShowed(previous => value);
    }


    function handleChangeCurrentDesktop(UUID: string): void {
        setCurrentActiveDesktopUUID(previous => UUID);
        changeApplicationsAreBeingShowed(false);
    }


    function removeDesktopActivity(UUID: string): void {
        setDesktopActivitiesData(previous => 
            previous.filter(desktopActivity => 
                desktopActivity.UUID !== UUID
            )
        );
    }

    function changeBackgroundStyle(isImageBlob: boolean, imageUrlBase64: string, systemColorPalette: string) {
        if (isImageBlob) {
            setBackgroundIsImageBlob(previous => true);
            setBackgroundImageUrl(previous => imageUrlBase64);

            return;
        }

        setBackgroundIsImageBlob(previous => false);
        setSystemColorPalette(previous => systemColorPalette);
    }

    function changeSystemTheme(theme: string): void {
        setSystemTheme(previous => theme);
    }

    function changeSystemLayout(layout: string): void {
        setSystemLayout(previous => layout);
        taskBarRef.current!.click();
    }

    return (
        <div className={mainStyles.container}>
            <MainContext.Provider value={{...contextValues}}>
                <GlobalMenuBar {...globalMenuProps}/>
                <div className={`${mainStyles.taskbar__desktop__wrapper} ${mainStyles[systemLayout]}`}>
                    <TaskBar {...taskbarProps}/>
                    <ApplicationsWindow {...applicationsWindowProps}/>
                </div>
            </MainContext.Provider>
        </div>
    );
}