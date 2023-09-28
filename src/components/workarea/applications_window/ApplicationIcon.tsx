import React, { useState, useContext } from 'react';
import applicationIconStyles from '@/styles/workarea/applications/ApplicationIcon.module.sass';
import Image from 'next/image';
import { Props } from '@/types/props';
import { MainContext } from '@/components/workarea/Main';
import { COLOR_PALETTE_OPTIONS } from '@/lib/initial/settings';
import { getCorrespondentRunningProcess, processIsRunning } from '@/lib/process';
import { getCorrespondentWorkspace } from '@/lib/workspace';


export default function ApplicationIcon({ 
    applicationIconStaticImage, 
    applicationIconAlt,
    applicationName, 
    applicationElement 
}: Props.ApplicationIconProps) {

    const { 
        systemColorPalette,
        opennedProcessesData, 
        workspaceActivitiesData,
        currentActiveWorkspaceUUID,
        applicationsAreBeingShowed, 
        openGraphicalProcess,
        elevateProcessWindowZIndex,
        restoreProcessWindowPreviousDimensions,
        changeCurrentWorkspace,
        changeApplicationsAreBeingShowed,
        transferApplicationIconToTaskbarOtherProcessesIcons
    } = useContext(MainContext);

    const [ processPID, setProcessPID ] = useState(0);

    const startProcessMiddleware = (): void => {

		const processFound = getCorrespondentRunningProcess(
            opennedProcessesData, 
            processPID
        );

        const processIsAlreadyRunning = processIsRunning(
            opennedProcessesData, 
            processPID
        );

        const processIsNotRunning = !processIsAlreadyRunning;

        const currentWorkspaceDoesNotExists = !getCorrespondentWorkspace(
            workspaceActivitiesData, 
            currentActiveWorkspaceUUID
        );

        const processIsMinimized = processFound?.isMinimized;

        const processIsRunningAndNotInTheCurrentWorkspace = processIsAlreadyRunning 
                                                            && processFound?.parentWorkspaceUUID 
                                                            !== currentActiveWorkspaceUUID;

        if (processIsNotRunning) {
            const startedProcessPID = openGraphicalProcess(
                applicationName, 
                applicationIconStaticImage,
                applicationIconAlt,
                applicationElement,
                currentWorkspaceDoesNotExists
            );
                
            transferApplicationIconToTaskbarOtherProcessesIcons(
                applicationIconStaticImage,
                applicationName,
                applicationElement,
                startedProcessPID
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
            changeCurrentWorkspace(processFound!.parentWorkspaceUUID);
        }

        if (processIsAlreadyRunning && applicationsAreBeingShowed) {
            changeApplicationsAreBeingShowed(false);
        }
    }

    return (
        <abbr 
            className={applicationIconStyles.container}
            style={{
                display: applicationsAreBeingShowed? 'inline-block' : 'none'
            }}
            onClick={startProcessMiddleware}
            title={applicationName}
        >
            <div className={applicationIconStyles.icon__wrapper}>
                <Image 
                    src={applicationIconStaticImage} 
                    alt={applicationIconAlt} 
                    className={applicationIconStyles.icon}
                />

                {applicationName}

                <div 
                    className={applicationIconStyles.openned__indicator}
                    style={{
                        backgroundColor: COLOR_PALETTE_OPTIONS[systemColorPalette].opennedIndicatorColor,
                        display: processIsRunning(opennedProcessesData, processPID)? 'block' : 'none'
                    }}
                />
            </div>
        </abbr>
    );
}