import { Shell } from '@/types/shell';

import { 
    getDirectoryData, 
    getDirectoryPermissionOctal, 
    getFileOrDirectoryBytesSize, 
    getFilePermissionOctal 
} from '../commands/common/directoryAndFile';

import { File } from '../commands/models/File';
import { Directory } from '../commands/models/Directory';


export const registerProcessInProcDir = (
    PID: number, 
    processTitle: string,
    systemAPI: Shell.SystemAPI
): void => {

    const { fileSystem, environmentVariables, umask } = systemAPI;

    const currentUser = environmentVariables['USER'];

    const currentTimestamp = Date.now();

    const currentDate = new Date(currentTimestamp);

    const currentHours = currentDate.getHours().toString().padStart(2, '0');
    const currentMinutes = currentDate.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    const statusFileContent = `Name:\t${processTitle}\nPid:\t${PID}\nStart:\t${currentTime}`;

    const statusFilePermission = getFilePermissionOctal(umask);

    const statusFile = new File(
        'status',
        {
            content: statusFileContent,
            size: 0
        },
        {
            is: false,
            has: 1
        },
        {
            owner: currentUser,
            group: currentUser,
            permissionOctal: statusFilePermission
        },
        {
            access: currentTimestamp,
            modify: currentTimestamp,
            change: currentTimestamp,
            birth: currentTimestamp
        }
    );

    statusFile.data.size = getFileOrDirectoryBytesSize(statusFile);

    const processDirectoryPermission = getDirectoryPermissionOctal(umask);

    const processDirectory = new Directory(
        PID.toString(),
        {
            size: 0
        },
        {
            directories: [],
            files: [
                statusFile
            ]
        },
        {
            is: false,
            has: 1
        },
        {
            owner: currentUser,
            group: currentUser,
            permissionOctal: processDirectoryPermission
        },
        {
            access: currentTimestamp,
            modify: currentTimestamp,
            change: currentTimestamp,
            birth: currentTimestamp
        }
    );

    processDirectory.data.size = getFileOrDirectoryBytesSize(processDirectory);

    const procDirectoryData = getDirectoryData(
        '/proc',
        '/',
        currentUser,
        fileSystem
    );

    procDirectoryData.children.directories.push(processDirectory);
}


export const removeProcessFromProcDir = async (
    PID: number,
    systemAPI: Shell.SystemAPI
): Promise<void> => {

    const { fileSystem, environmentVariables } = systemAPI;

    const currentUser = environmentVariables['USER'];

    const procDirectoryData = getDirectoryData(
        '/proc',
        '/',
        currentUser,
        fileSystem
    );

    procDirectoryData.children.directories = procDirectoryData.children.directories
                                             .filter(dir => dir.name !== PID.toString());
 
}