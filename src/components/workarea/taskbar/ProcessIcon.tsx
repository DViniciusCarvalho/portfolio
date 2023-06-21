import React, { useContext, useState } from 'react';
import processIconStyles from '@/styles/workarea/taskbar/ProcessIcon.module.sass';
import Image from 'next/image';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { getCorrespondentRunningProcess } from '@/lib/utils';
import { processIsRunning, processIsTheCurrentOpenned } from '@/lib/validation';
import { Data } from '@/types/data';


export default function ProcessIcon({ 
    processIconStaticImage, 
    processName,
    processElement,
    startProcess,
	restorePreviousDimensions
}: Props.ProcessIconProps) {

    const { 
        layoutStyleClass, 
        opennedProcessesData, 
        elevateProcessWindowZIndex, 
        currentActiveDesktopUUID,
        handleChangeCurrentDesktop
    } = useContext(MainContext);

    const [ processPID, setProcessPID ] = useState(0);

	
    function startProcessMiddleware(
        opennedProcessesData: Data.OpennedProcessData[], 
        processPID: number
    ): void {

		const processFound = getCorrespondentRunningProcess(opennedProcessesData, processPID);

        if (!processIsRunning(opennedProcessesData, processPID)) {
            const startedProcessPID = startProcess(processName, processElement);
            setProcessPID(previous => startedProcessPID);
        }

        if (processFound?.isMinimized) {
            restorePreviousDimensions(processPID);
            elevateProcessWindowZIndex(processPID);
        }

        if (
            processIsRunning(opennedProcessesData, processPID) 
            && processFound?.parentDesktopUUID !== currentActiveDesktopUUID
        ) {
            handleChangeCurrentDesktop(processFound!.parentDesktopUUID);
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
			onClick={() => startProcessMiddleware(opennedProcessesData, processPID)}
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
