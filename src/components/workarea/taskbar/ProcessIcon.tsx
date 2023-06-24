import React, { useContext, useState } from 'react';
import processIconStyles from '@/styles/workarea/taskbar/ProcessIcon.module.sass';
import Image from 'next/image';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { getCorrespondentDesktop, getCorrespondentRunningProcess } from '@/lib/utils';
import { processIsRunning, processIsTheCurrentOpenned } from '@/lib/validation';
import { Data } from '@/types/data';


export default function ProcessIcon({ 
    processIconStaticImage, 
    processName,
    processElement
}: Props.ProcessIconProps) {

    const { 
        layoutStyleClass, 
        opennedProcessesData, 
        desktopActivitiesData,
        elevateProcessWindowZIndex, 
        currentActiveDesktopUUID,
        handleChangeCurrentDesktop,
        openProcess,
        restorePreviousDimensions,
        applicationsAreBeingShowed,
        changeApplicationsAreBeingShowed
    } = useContext(MainContext);

    const [ processPID, setProcessPID ] = useState(0);

	
    function startProcessMiddleware(
        opennedProcessesData: Data.OpennedProcessData[], 
        desktopActivitiesData: Data.DesktopActivityData[],
        processPID: number,
        currentActiveDesktopUUID: string
    ): void {

		const processFound = getCorrespondentRunningProcess(
            opennedProcessesData, 
            processPID
        );

        const processIsAlreadyRunning = processIsRunning(
            opennedProcessesData, 
            processPID
        );

        const processIsNotRunning = !processIsAlreadyRunning;

        const currentDesktopDoesNotExists = !getCorrespondentDesktop(
            desktopActivitiesData, 
            currentActiveDesktopUUID
        );

        const processIsMinimized = processFound?.isMinimized;

        const processIsRunningAndNotInTheCurrentDesktop = processIsRunning(opennedProcessesData, processPID) 
                                                        && processFound?.parentDesktopUUID 
                                                        !== currentActiveDesktopUUID;

        if (processIsNotRunning) {
            const startedProcessPID = openProcess(
                processName, 
                processElement,
                currentDesktopDoesNotExists
            );

            setProcessPID(previous => startedProcessPID);

        }

        if (processIsAlreadyRunning) {
            elevateProcessWindowZIndex(processPID);
        }

        if (processIsMinimized) {
            restorePreviousDimensions(processPID);
        }

        if (processIsRunningAndNotInTheCurrentDesktop) {
            handleChangeCurrentDesktop(processFound!.parentDesktopUUID);
        }

        if (processIsAlreadyRunning && applicationsAreBeingShowed) {
            changeApplicationsAreBeingShowed(false);
        }

        
    }

    return (
        <abbr 
			className={`
				${processIconStyles.container} 
				${processIconStyles[layoutStyleClass]} 
				${processIconStyles[
					processIsTheCurrentOpenned(opennedProcessesData, processPID)? 'active' : ''
				]}
				`
			} 
			title={processName} 
			onClick={() => startProcessMiddleware(
                opennedProcessesData, 
                desktopActivitiesData, 
                processPID, 
                currentActiveDesktopUUID
            )}
        >
            <Image 
                src={processIconStaticImage} 
                alt={`${processName} icon`} 
                className={processIconStyles.icon}
            />
            <div 
				className={processIconStyles.openned__indicator}
				style={{
					display: processIsRunning(opennedProcessesData, processPID) ? 'block' : 'none'
				}}
            />
        </abbr>
    );
}
