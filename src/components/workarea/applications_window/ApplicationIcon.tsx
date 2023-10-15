import React, { 
    useState, 
    useContext, 
    useEffect 
} from 'react';

import Image from 'next/image';
import applicationIconStyles from '@/styles/workarea/applications/ApplicationIcon.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { Data } from '@/types/data';
import { Props } from '@/types/props';

import { 
    getCorrespondentRunningProcess, 
    processIsRunning 
} from '@/lib/process';

import { getCorrespondentWorkspace } from '@/lib/workspace';
import { COLOR_PALETTE_OPTIONS } from '@/lib/initial/settings';


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
        startGraphicalProcess,
        elevateProcessWindowZIndex,
        restoreProcessWindowPreviousDimensions,
        changeCurrentWorkspace,
        changeApplicationsAreBeingShowed,
        transferApplicationIconToTaskbarOtherProcessesIcons
    } = useContext(MainContext);


    const [ 
        processPID, 
        setProcessPID 
    ] = useState(0);


    useEffect(() => {
        const processData = (opennedProcessesData as Data.OpennedProcessData[]).find(
            processData => processData.processTitle === applicationName
        );

        if (processData && processPID !== processData.PID) {
            setProcessPID(previous => processData.PID);

            transferApplicationIconToTaskbarOtherProcessesIcons(
                applicationIconStaticImage,
                applicationIconAlt,
                applicationName,
                applicationElement,
                processData.PID
            );
        }
    }, [opennedProcessesData]);


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

        const processIsRunning = Boolean(process);
        const processIsMinimized = process?.isMinimized;

        const processIsInOtherWorkspace = process?.parentWorkspaceUUID 
                                          !== currentActiveWorkspaceUUID;

        const currentWorkspaceDoesNotExists = !getCorrespondentWorkspace(
            workspaceActivitiesData, 
            currentActiveWorkspaceUUID
        );


        if (processIsRunning) {
            elevateProcessWindowZIndex(processPID);

            if (processIsMinimized) {
                restoreProcessWindowPreviousDimensions(processPID);
            }
    
            if (processIsInOtherWorkspace) {
                changeCurrentWorkspace(process!.parentWorkspaceUUID);
            }
    
            if (applicationsAreBeingShowed) {
                changeApplicationsAreBeingShowed(false);
            }
        }
        else {
            const startedProcessPID = startGraphicalProcess(
                applicationName, 
                applicationIconStaticImage,
                applicationIconAlt,
                applicationElement,
                currentWorkspaceDoesNotExists
            );
                
            transferApplicationIconToTaskbarOtherProcessesIcons(
                applicationIconStaticImage,
                applicationIconAlt,
                applicationName,
                applicationElement,
                startedProcessPID
            );

            setProcessPID(previous => startedProcessPID);
        }
    }


    return (
        <abbr 
            className={`
                ${applicationIconStyles.container} 
                ${applicationIconStyles[
                    applicationsAreBeingShowed? 'visible' : 'non--visible'
                ]}
                `
            }
            onClick={() => startProcessMiddleware(
                opennedProcessesData, 
                workspaceActivitiesData, 
                processPID, 
                currentActiveWorkspaceUUID
            )}
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
                    className={`
                        ${applicationIconStyles.openned__indicator}
                        ${applicationIconStyles[
                            processIsRunning(opennedProcessesData, processPID)
                            ? 'process--running'
                            : 'process--not--running'
                        ]}
                        `
                    }
                    style={{
                        backgroundColor: COLOR_PALETTE_OPTIONS[systemColorPalette].opennedIndicatorColor
                    }}
                />
            </div>
        </abbr>
    );
}