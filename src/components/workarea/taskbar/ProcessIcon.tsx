import React, { 
    useContext, 
    useEffect, 
    useState 
} from 'react';

import Image from 'next/image';
import processIconStyles from '@/styles/workarea/taskbar/ProcessIcon.module.sass';
import { MainContext } from '../Main';
import { Data } from '@/types/data';
import { Props } from '@/types/props';

import { 
    getCorrespondentRunningProcess, 
    processIsRunning, 
    processIsTheCurrentOpenned 
} from '@/lib/process';

import { getCorrespondentWorkspace } from '@/lib/workspace';
import { COLOR_PALETTE_OPTIONS } from '@/lib/initial/settings';


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
        startGraphicalProcess,
        restoreProcessWindowPreviousDimensions,
        applicationsAreBeingShowed,
        changeApplicationsAreBeingShowed
    } = useContext(MainContext);


    const [ 
        processPID, 
        setProcessPID 
    ] = useState(initialPID!);


    useEffect(() => {
        const processData = (opennedProcessesData as Data.OpennedProcessData[]).find(
            processData => processData.processTitle === processName
        );

        if (processData) {
            setProcessPID(previous => processData.PID);
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
                processName, 
                processIconStaticImage,
                processIconAlt,
                processElement,
                currentWorkspaceDoesNotExists
            );

            setProcessPID(previous => startedProcessPID);
        }
    }

    
    return (
        <abbr 
			className={`
				${processIconStyles.container} 
				${processIconStyles[systemLayout]} 
				${processIconStyles[
					processIsTheCurrentOpenned(opennedProcessesData, processPID)
                    ? 'current--active--process' 
                    : 'not--current--active--process'
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
				className={`
                    ${processIconStyles.openned__indicator}
                    ${processIconStyles[
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
        </abbr>
    );
}
