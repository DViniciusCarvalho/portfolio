import React, { useContext, useState } from 'react';
import processIconStyles from '@/styles/workarea/taskbar/ProcessIcon.module.sass';
import Image from 'next/image';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { Data } from '@/types/data';
import { COLOR_PALETTE_OPTIONS } from '@/lib/initial/settings';
import { getCorrespondentRunningProcess, processIsRunning, processIsTheCurrentOpenned } from '@/lib/process';
import { getCorrespondentWorkspace } from '@/lib/workspace';


export default function ProcessIcon({ 
    processIconStaticImage, 
    processIconAlt,
    processName,
    processElement,
    initialPID
}: Props.ProcessIconProps) {

    const { 
        systemColorPalette,
        systemLayout, 
        opennedProcessesData, 
        workspaceActivitiesData,
        elevateProcessWindowZIndex, 
        currentActiveWorkspaceUUID,
        changeCurrentWorkspace,
        openGraphicalProcess,
        restoreProcessWindowPreviousDimensions,
        applicationsAreBeingShowed,
        changeApplicationsAreBeingShowed
    } = useContext(MainContext);


    const [ 
        processPID, 
        setProcessPID 
    ] = useState(initialPID!);

	
    function startProcessMiddleware(
        opennedProcessesData: Data.OpennedProcessData[], 
        workspaceActivitiesData: Data.WorkspaceActivityData[],
        processPID: number,
        currentActiveWorkspaceUUID: string
    ): void {

		const process = getCorrespondentRunningProcess(
            opennedProcessesData, 
            processPID
        );

        const processIsAlreadyRunning = !!process;
        const processIsNotRunning = !processIsAlreadyRunning;

        const currentWorkspaceDoesNotExists = !getCorrespondentWorkspace(
            workspaceActivitiesData, 
            currentActiveWorkspaceUUID
        );

        const processIsMinimized = process?.isMinimized;

        const processIsRunningAndNotInTheCurrentWorkspace = processIsAlreadyRunning 
                                                        && process?.parentWorkspaceUUID 
                                                        !== currentActiveWorkspaceUUID;

        if (processIsNotRunning) {
            const startedProcessPID = openGraphicalProcess(
                processName, 
                processIconStaticImage,
                processIconAlt,
                processElement,
                currentWorkspaceDoesNotExists
            );

            setProcessPID(previous => startedProcessPID);

        }

        if (processIsAlreadyRunning) {
            elevateProcessWindowZIndex(processPID);
        }

        if (processIsMinimized) {
            restoreProcessWindowPreviousDimensions(processPID);
        }

        if (processIsRunningAndNotInTheCurrentWorkspace) {
            changeCurrentWorkspace(process!.parentWorkspaceUUID);
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
                workspaceActivitiesData, 
                processPID, 
                currentActiveWorkspaceUUID
            )}
            title={processName}
        >
            <Image 
                src={processIconStaticImage} 
                alt={processIconAlt} 
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
