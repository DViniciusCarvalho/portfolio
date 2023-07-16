import React, { useContext, useState } from 'react';
import processIconStyles from '@/styles/workarea/taskbar/ProcessIcon.module.sass';
import Image from 'next/image';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { getCorrespondentDesktop, getCorrespondentRunningProcess } from '@/lib/utils';
import { processIsRunning, processIsTheCurrentOpenned } from '@/lib/validation';
import { Data } from '@/types/data';
import { COLOR_PALETTE_OPTIONS } from '@/lib/constants';


export default function ProcessIcon({ 
    processIconStaticImage, 
    processName,
    processElement,
    initialPID
}: Props.ProcessIconProps) {

    const { 
        systemColorPalette,
        systemLayout, 
        opennedProcessesData, 
        desktopActivitiesData,
        elevateProcessWindowZIndex, 
        currentActiveDesktopUUID,
        changeCurrentDesktop,
        openProcess,
        restoreProcessWindowPreviousDimensions,
        applicationsAreBeingShowed,
        changeApplicationsAreBeingShowed
    } = useContext(MainContext);

    const [ processPID, setProcessPID ] = useState(initialPID!);

	
    function startProcessMiddleware(
        opennedProcessesData: Data.OpennedProcessData[], 
        desktopActivitiesData: Data.DesktopActivityData[],
        processPID: number,
        currentActiveDesktopUUID: string
    ): void {

		const process = getCorrespondentRunningProcess(
            opennedProcessesData, 
            processPID
        );

        const processIsAlreadyRunning = !!process;
        const processIsNotRunning = !processIsAlreadyRunning;

        const currentDesktopDoesNotExists = !getCorrespondentDesktop(
            desktopActivitiesData, 
            currentActiveDesktopUUID
        );

        const processIsMinimized = process?.isMinimized;

        const processIsRunningAndNotInTheCurrentDesktop = processIsAlreadyRunning 
                                                        && process?.parentDesktopUUID 
                                                        !== currentActiveDesktopUUID;

        if (processIsNotRunning) {
            const startedProcessPID = openProcess(
                processName, 
                processIconStaticImage,
                processElement,
                currentDesktopDoesNotExists
            );

            setProcessPID(previous => startedProcessPID);

        }

        if (processIsAlreadyRunning) {
            elevateProcessWindowZIndex(processPID);
        }

        if (processIsMinimized) {
            restoreProcessWindowPreviousDimensions(processPID);
        }

        if (processIsRunningAndNotInTheCurrentDesktop) {
            changeCurrentDesktop(process!.parentDesktopUUID);
        }

        if (processIsAlreadyRunning && applicationsAreBeingShowed) {
            changeApplicationsAreBeingShowed(false);
        }

        
    }

    return (
        <abbr 
			className={`
				${processIconStyles.container} 
				${processIconStyles[systemLayout]} 
				${processIconStyles[
					processIsTheCurrentOpenned(opennedProcessesData, processPID)
                    ? 'current-active-process' 
                    : 'not-the-current-active-process'
				]}
				`
			}  
			onClick={() => startProcessMiddleware(
                opennedProcessesData, 
                desktopActivitiesData, 
                processPID, 
                currentActiveDesktopUUID
            )}
            title={processName}
        >
            <Image 
                src={processIconStaticImage} 
                alt={`${processName} icon`} 
                className={processIconStyles.icon}
            />
            <div 
				className={processIconStyles.openned__indicator}
				style={{
                    backgroundColor: COLOR_PALETTE_OPTIONS[systemColorPalette].opennedIndicatorColor,
					display: processIsRunning(opennedProcessesData, processPID) ? 'block' : 'none'
				}}
            />
        </abbr>
    );
}
