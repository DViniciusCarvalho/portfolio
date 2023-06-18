import React, { useContext, useState } from 'react';
import processIconStyles from "@/styles/workarea/taskbar/ProcessIcon.module.sass";
import Image from 'next/image';
import { Props } from '@/types/props';
import { Data } from '@/types/data';
import { MainContext } from '../Main';
import { getCorrespondentRunningProcess } from '@/lib/utils';


export default function ProcessIcon({ 
    processIconStaticImage, 
    processName,
    processElement,
    startProcess,
	restorePreviousDimensions
}: Props.ProcessIconProps) {

    const { layoutStyleClass, opennedProcessesData } = useContext(MainContext);

    const [ processPID, setProcessPID ] = useState(0);

	
    function startProcessMiddleware(): void {
		const processFound = getCorrespondentRunningProcess(opennedProcessesData, processPID);

        if (!isProcessRunning(opennedProcessesData, processPID)) {
            const startedProcessPID = startProcess(processName, processElement);
            setProcessPID(previous => startedProcessPID);
        }
        else if (processFound?.isMinimized) {
            restorePreviousDimensions(processPID);
        }
    }

    function isProcessRunning(opennedProcessesData: Data.OpennedProcessData[], PID: number): boolean {
		const processFound = getCorrespondentRunningProcess(opennedProcessesData, PID);
        return processFound ? true : false;
    }

    return (
        <abbr 
          className={`
		    ${processIconStyles.container} 
			${processIconStyles[layoutStyleClass]}
			`
	      }
          title={processName}
          onClick={startProcessMiddleware}
        >
            <Image 
              src={processIconStaticImage} 
              alt={`${processName} icon`} 
              className={processIconStyles.icon}
            />
            <div 
              className={processIconStyles.openned__indicator}
              style={{
                display: isProcessRunning(opennedProcessesData, processPID) ? "block" : "none"
              }}
            />
        </abbr>
    );
}
