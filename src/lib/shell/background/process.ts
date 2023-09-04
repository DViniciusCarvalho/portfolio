import { Shell } from '@/types/shell';
import { interpretCommand } from '../interpreter/interpreter';


export const registerProcessInProcDir = (
    PID: number, 
    processTitle: string,
    systemAPI: Shell.SystemAPI
): void => {
    const statusFileContent = `Name:\t${processTitle}\nPid:\t${PID}`;

    const createProcessDir = `mkdir /proc/${PID}`;
    const createProcessStatusFile = `touch /proc/${PID}/status`;
    const writeStatusFileContent = `echo ${statusFileContent} >> /proc/${PID}/status`;

    interpretCommand(
        `${createProcessDir} && ${createProcessStatusFile} && ${writeStatusFileContent}`, 
        systemAPI
    );
}


export const removeProcessFromProcDir = (
    PID: number,
    systemAPI: Shell.SystemAPI
): void => {

    interpretCommand(
        `rm -r /proc/${PID}`,
        systemAPI
    );
    
}