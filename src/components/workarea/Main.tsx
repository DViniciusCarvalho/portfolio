import React, { useState, createContext, useRef, useEffect, useCallback } from 'react';
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
    INITIAL_SYSTEM_LAYOUT,
    INITIAL_TERMINAL_FONT_SIZE_IN_PIXELS,
    INITIAL_TERMINAL_USER_HOST_COLOR,
    INITIAL_TERMINAL_ROOT_HOST_COLOR,
    INITIAL_TERMINAL_CURRENT_DIRECTORY_COLOR,
    INITIAL_TERMINAL_DEFAULT_COLOR,
    INITIAL_TERMINAL_BACKGROUND_COLOR,
    INITIAL_SHELL_USER,
    SHELL_HOSTNAME,
    INITIAL_CURRENT_DIRECTORY,
    INITIAL_FILESYSTEM,
    INITIAL_SHELL_ENVIRONMENT_VARIABLES,
    INITIAL_UMASK
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
    getProcessWindowParentDesktopUUID,
    getInitialProcessWindowDimensions
} from '@/lib/utils';

import { 
    parentDesktopIsNowVoid 
} from '@/lib/validation';

import { StaticImageData } from 'next/image';
import { Shell } from '@/types/shell';
import { interpretCommand } from '@/lib/shell/interpreter/interpreter';
import { registerProcessInProcDir, removeProcessFromProcDir } from '@/lib/shell/background/process';


export const MainContext = createContext<any>(null);

export default function Main() {
    
    // Refs
    const globalMenuRef = useRef<HTMLDivElement | null>(null);
    const taskBarRef = useRef<HTMLDivElement | null>(null);
    const applicationsWindowRef = useRef<HTMLDivElement | null>(null);

    // Initial desktop identificator
    const baseDesktopUUID = generateUUID();

    // States
    const [ 
        opennedProcessesData, 
        setOpennedProcessesData 
    ] = useState<Data.OpennedProcessData[]>([]);

    const [ 
        desktopActivitiesData, 
        setDesktopActivitiesData 
    ] = useState<Data.DesktopActivityData[]>([]);

    const [ 
        applicationsPropsDataInTaskbar, 
        setApplicationsPropsDataInTaskbar 
    ] = useState<Props.ProcessIconProps[]>([]);

    const [ 
        lastPID, 
        setLastPID 
    ] = useState(LAST_SYSTEM_ESSENTIAL_PID);

    const [ 
        lastHighestZIndex, 
        setLastHighestZIndex 
    ] = useState(INITIAL_PROCESS_WINDOW_HIGHEST_ZINDEX);

    const [ 
        currentActiveDesktopUUID, 
        setCurrentActiveDesktopUUID 
    ] = useState(baseDesktopUUID);

    const [ 
        applicationsAreBeingShowed, 
        setApplicationsAreBeingShowed 
    ] = useState(false);

    const [ 
        systemColorPalette, 
        setSystemColorPalette 
    ] = useState(INITIAL_SYSTEM_COLOR_PALETTE);

    const [ 
        systemTheme, 
        setSystemTheme 
    ] =  useState(INITIAL_SYSTEM_THEME);

    const [ 
        systemLayout, 
        setSystemLayout 
    ] = useState(INITIAL_SYSTEM_LAYOUT);

    const [
        fileSystem,
        setFileSystem
    ] = useState(INITIAL_FILESYSTEM);

    const [ 
        backgroundIsImageBlob, 
        setBackgroundIsImageBlob 
    ] = useState(false);

    const [ 
        backgroundImageUrl, 
        setBackgroundImageUrl 
    ] = useState('');

    const [ 
        terminalFontSizeInPixels, 
        setTerminalFontSizeInPixels 
    ] = useState(INITIAL_TERMINAL_FONT_SIZE_IN_PIXELS);

    const [ 
        terminalUserHostColor, 
        setTerminalUserHostColor 
    ] = useState(INITIAL_TERMINAL_USER_HOST_COLOR);

    const [ 
        terminalRootHostColor, 
        setTerminalRootHostColor 
    ] = useState(INITIAL_TERMINAL_ROOT_HOST_COLOR);

    const [ 
        terminalCurrentDirectoryColor, 
        setTerminalCurrentDirectoryColor 
    ] = useState(INITIAL_TERMINAL_CURRENT_DIRECTORY_COLOR);

    const [
        terminalDefaultColor,
        setTerminalDefaultColor
    ] = useState(INITIAL_TERMINAL_DEFAULT_COLOR);

    const [ 
        terminalBackgroundColor, 
        setTerminalBackgroundColor 
    ] = useState(INITIAL_TERMINAL_BACKGROUND_COLOR);

    const [ 
        currentShellUser, 
        setCurrentShellUser 
    ] = useState(INITIAL_SHELL_USER);

    const [ 
        hostName, 
        setHostName 
    ] = useState(SHELL_HOSTNAME);

    const [ 
        currentDirectory, 
        setCurrentDirectory 
    ] = useState(INITIAL_CURRENT_DIRECTORY);

    const [
        systemEnvironmentVariables,
        setSystemEnvironmentVariables
    ] = useState(INITIAL_SHELL_ENVIRONMENT_VARIABLES);

    const [
        umask,
        setUmask
    ] = useState(INITIAL_UMASK);

    const [ 
        canChangeApplicationsState,
        setCanChangeApplicationsState
    ] = useState(true);

    
    // Context
    const processesDesktopDataAndManipulators = {
        opennedProcessesData,
        desktopActivitiesData,
        setOpennedProcessesData,
        openProcess,
        sendSIGKILLToProcess,
        removeDesktopActivity,
    };

    const settingsStatesAndManipulators = {
        systemColorPalette,
        systemTheme,
        systemLayout,
        backgroundIsImageBlob,
        backgroundImageUrl,
        terminalFontSizeInPixels,
        terminalUserHostColor,
        terminalRootHostColor,
        terminalCurrentDirectoryColor,
        terminalDefaultColor,
        terminalBackgroundColor,
        changeBackgroundToImage,
        changeBackgroundDefaultColorPalette,
        changeSystemTheme,
        changeSystemLayout,
        changeTerminalFontSizeInPixels,
        changeTerminalUserHostColor,
        changeTerminalRootHostColor,
        changeTerminalCurrentDirectoryColor,
        changeTerminalDefaultColor,
        changeTerminalBackgroundColor
    };
 
    const fileSystemAndManipulators = {
        fileSystem,
        umask,
        setFileSystem,
        setUmask
    };

    const terminalStatesAndManipulators = {
        currentShellUser,
        hostName,
        currentDirectory,
        systemEnvironmentVariables,
        setCurrentShellUser,
        setCurrentDirectory,
        setSystemEnvironmentVariables
    };

    const desktopsStatesAndManipulators = {
        baseDesktopUUID,
        currentActiveDesktopUUID,
        changeCurrentDesktop,
    };

    const processesWindowStatesAndManipulators = {
        lastHighestZIndex,
        elevateProcessWindowZIndex,
        minimizeProcessWindow,
        restoreProcessWindowPreviousDimensions,
        restoreProcessWindowLastDimensions,
		maximizeProcessWindow,
        updateProcessWindowDimensions,
        updateProcessWindowCoordinates
    };

    const applicationsSectionStatesAndManipulators = {
        applicationsAreBeingShowed,
        changeApplicationsAreBeingShowed,
        transferApplicationIconToTaskbarOtherProcessesIcons
    };

    const contextValues = {
        ...processesDesktopDataAndManipulators,
        ...settingsStatesAndManipulators,
        ...fileSystemAndManipulators,
        ...terminalStatesAndManipulators,
        ...desktopsStatesAndManipulators,
        ...processesWindowStatesAndManipulators,
        ...applicationsSectionStatesAndManipulators
    };

    // Props
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
        desktopActivitiesData,
        baseDesktopUUID
    };

    
    useEffect(() => {
        window!.addEventListener('resize', () => {
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

        const processWindowParentDesktopUUID = getProcessWindowParentDesktopUUID(
            currentActiveDesktopUUID,
            currentActiveDesktopDoesNotExists,
            baseDesktopUUID
        );

        const initialProcessWindowCoordinates = {
            x: 0,
            y: 0
        };

        const initalProcessWindowDimensions = getInitialProcessWindowDimensions(
            window, 
            applicationsWindowRef
        );

        const newProcessData = {
            PID: nextPID,
            processTitle: processTitle,
            processIcon: processIcon,
            processElement: processElement,
            zIndex: nextLastHighestZIndex,
            isMinimized: false,
            isMaximized: false,
            parentDesktopUUID: processWindowParentDesktopUUID,
            coordinates: initialProcessWindowCoordinates,
            dimensions: initalProcessWindowDimensions
        };

        const currentDesktopIsTheBaseDesktopOrDoesNotExists = currentActiveDesktopUUID === baseDesktopUUID
                                                            || currentActiveDesktopDoesNotExists;


        if (currentDesktopIsTheBaseDesktopOrDoesNotExists) {
            const newCurrentDesktopData = {
                UUID: processWindowParentDesktopUUID
            };

            setDesktopActivitiesData(previous => [...previous, newCurrentDesktopData]);
            
        }

        setCurrentActiveDesktopUUID(previous => processWindowParentDesktopUUID);
        setApplicationsAreBeingShowed(previous => false);
        setLastPID(previous => nextPID);
        setLastHighestZIndex(previous => nextLastHighestZIndex);

        setOpennedProcessesData(previous => [
            ...previous, 
            newProcessData
        ]);

        const partialSystemAPI = {
            environmentVariables: systemEnvironmentVariables,
            currentShellUser: 'root',
            fileSystem: fileSystem,
            umask: umask
        } as Shell.SystemAPI;

        registerProcessInProcDir(nextPID, processTitle, partialSystemAPI);

        return nextPID;
    }



    function elevateProcessWindowZIndex(PID: number): void {   
        setLastHighestZIndex(previousHighestZIndex => {
            const nextHighestZIndex = previousHighestZIndex + 1;

            setOpennedProcessesData(previous => {
                const opennedProcessesDataDeepCopy = deepClone(previous);
                const process = getCorrespondentRunningProcess(
                    opennedProcessesDataDeepCopy, 
                    PID
                );
    
                process!.zIndex = nextHighestZIndex;

                return opennedProcessesDataDeepCopy;
            });

            return nextHighestZIndex;
        });
    }


    function sendSIGKILLToProcess(PID: number): void { 
        setOpennedProcessesData(previous => {
            const process = getCorrespondentRunningProcess(previous, PID);
            const { parentDesktopUUID } = process!;

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
            const filteredPreviousDeepCopy = previous.filter(
                processData => processData.initialPID !== PID
            );

            return filteredPreviousDeepCopy;
        });

        const partialSystemAPI = {
            environmentVariables: systemEnvironmentVariables,
            currentShellUser: 'root',
            fileSystem: fileSystem,
            umask: umask
        } as Shell.SystemAPI;

        removeProcessFromProcDir(PID, partialSystemAPI);
    }


    function updateProcessWindowCoordinates(
        PID: number, 
        XAxisWithoutInterference: number, 
        YAxisWithoutInterference: number
    ): void {

        const currentXAxis = XAxisWithoutInterference - getXAxisInterference(taskBarRef, systemLayout);
        const currentYAxis = YAxisWithoutInterference - getYAxisInterference(globalMenuRef);

        setOpennedProcessesData(previous => {
            const opennedProcessesDataDeepCopy = deepClone(previous);
            const process = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            process!.coordinates = {
                x: currentXAxis,
                y: currentYAxis
            };

            return opennedProcessesDataDeepCopy;
        });
    }


    function minimizeProcessWindow(PID: number): void {
        setOpennedProcessesData(previous => {
            const opennedProcessesDataDeepCopy = deepClone(previous);
            const process = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            process!.isMinimized = true;

            return opennedProcessesDataDeepCopy;
        });
    }


    function restoreProcessWindowPreviousDimensions(PID: number): void {
        setOpennedProcessesData(previous => {
            const opennedProcessesDataDeepCopy = deepClone(previous);
            const process = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            process!.isMinimized = false;

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
            const process = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            process!.isMaximized = false;

            process!.dimensions = {
                width: memoizedWidth,
                height: memoizedHeight
            };

            process!.coordinates = {
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
            const process = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            process!.isMaximized = true;

            process!.dimensions = {
                width: parentDesktopWidth,
                height: parentDesktopHeight
            };

            process!.coordinates = {
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
            
            const process = getCorrespondentRunningProcess(
                opennedProcessesDataDeepCopy, 
                PID
            );

            const movementIsInFavorOfXAxis = currentXAxis > previousXAxis;
            const movementIsInFavorOfYAxis = currentYAxis > previousYAxis;

            if (resizeSide === 'top') {
                const { newHeight, newCoordinates } = getNewHeightAndYAxisOnTop(
                    movementIsInFavorOfYAxis,
                    process!,
                    previousYAxis,
                    currentYAxis
                );

                process!.dimensions = {
                    width: process!.dimensions.width,
                    height: newHeight
                };

                process!.coordinates = {
                    x: process!.coordinates.x,
                    y: newCoordinates
                };
            }
       
            else if (resizeSide === 'right') {
                const newWidth = getNewWidthOnRight(
                    movementIsInFavorOfXAxis, 
                    process!, 
                    previousXAxis, 
                    currentXAxis
                );

                process!.dimensions = {
                    width: newWidth,
                    height: process!.dimensions.height
                };
            }

            else if (resizeSide === 'bottom') {
                const newHeight = getNewHeightAndYAxisOnBottom(
                    movementIsInFavorOfYAxis,
                    process!,
                    previousYAxis,
                    currentYAxis
                );

                process!.dimensions = {
                    width: process!.dimensions.width,
                    height: newHeight
                };
            }

            else if (resizeSide === 'left') {
                const { newWidth, newCoordinates } = getNewWidthAndXAxisOnLeft(
                    movementIsInFavorOfXAxis, 
                    process!, 
                    previousXAxis, 
                    currentXAxis
                );

                process!.dimensions = {
                    width: newWidth,
                    height: process!.dimensions.height
                };

                process!.coordinates = {
                    x: newCoordinates,
                    y: process!.coordinates.y
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


    function changeCurrentDesktop(desktopUUID: string): void {
        setCurrentActiveDesktopUUID(previous => desktopUUID);
        changeApplicationsAreBeingShowed(false);
    }


    function removeDesktopActivity(UUID: string): void {
        setDesktopActivitiesData(previous => 
            previous.filter(desktopActivity => 
                desktopActivity.UUID !== UUID
            )
        );
    }


    function changeBackgroundToImage(imageUrlBase64: string): void {
        setBackgroundIsImageBlob(previous => true);
        setBackgroundImageUrl(previous => imageUrlBase64);
    }


    function changeBackgroundDefaultColorPalette(systemColorPalette: string): void {
        setBackgroundIsImageBlob(previous => false);
        setBackgroundImageUrl(previous => '');

        setSystemColorPalette(previous => systemColorPalette);
    }


    function changeSystemTheme(theme: string): void {
        setSystemTheme(previous => theme);
    }


    function changeSystemLayout(layout: string): void {
        setSystemLayout(previous => layout);
    }


    function changeTerminalFontSizeInPixels(size: number): void {
        if (size > 0) setTerminalFontSizeInPixels(previous => size);
    }


    function changeTerminalUserHostColor(color: string): void {
        setTerminalUserHostColor(previous => color);
    }


    function changeTerminalRootHostColor(color: string): void {
        setTerminalRootHostColor(previous => color);
    }

    
    function changeTerminalCurrentDirectoryColor(color: string): void {
        setTerminalCurrentDirectoryColor(previous => color);
    }


    function changeTerminalDefaultColor(color: string): void {
        setTerminalDefaultColor(previous => color);
    }


    function changeTerminalBackgroundColor(color: string): void {
        setTerminalBackgroundColor(previous => color);
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