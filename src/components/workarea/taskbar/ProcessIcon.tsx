import React, { useContext, useState } from 'react';
import processIconStyles from "@/styles/workarea/taskbar/ProcessIcon.module.sass";
import Image from 'next/image';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { 
	getCorrespondentRunningProcess, 
	processIsRunning, 
	processIsTheCurrentOpenned 
} from '@/lib/utils';


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

        if (!processIsRunning(opennedProcessesData, processPID)) {
            const startedProcessPID = startProcess(processName, processElement);
            setProcessPID(previous => startedProcessPID);
        }
        else if (processFound?.isMinimized) {
            restorePreviousDimensions(processPID);
        }
    }

    return (
        <abbr 
          className={`
		    ${processIconStyles.container} 
			${processIconStyles[layoutStyleClass]}
			${processIconStyles[
				processIsTheCurrentOpenned(opennedProcessesData, processPID)? "active" : ""
			]}
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
                display: processIsRunning(opennedProcessesData, processPID) ? "block" : "none"
              }}
            />
        </abbr>
    );
}
