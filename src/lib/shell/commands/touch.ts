import { Shell } from '@/types/shell';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getFileOrDirectoryBytesSize, 
    getFilePermissionOctal,
    getParentPathAndTargetName
} from './common/directoryAndFile';

import { resolveArguments } from './common/arguments';
import { ExecutionTreeError } from '../exception';

import {  
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage, 
} from './common/options';

import { File } from './models/File';
import { changeContentUpdateTimestamps } from './common/timestamps';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-c',
        long: '--no-create',
        description: 'do not create any files'
    },
    {
        short: '-a',
        long: null,
        description: 'change only the access time'
    },
    {
        short: '-d',
        long: /^--date=.+$/,
        description: 'parse STRING and use it instead of current time'
    },
    {
        short: '-m',
        long: null,
        description: 'change only the modification time'
    },
    {
        short: null,
        long: '--help',
        description: 'display this help and exit'
    }
];


export const help = (
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {
    return {
        stdout: '',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const touch = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const { 
        hasInvalidOption, 
        invalidOptions 
    } = commandHasInvalidOptions(commandOptions, COMMAND_OPTIONS);

    if (hasInvalidOption) {
        return {
            stdout: null,
            stderr: getCommandInvalidOptionMessage('touch', invalidOptions),
            exitStatus: 2,
            modifiedSystemAPI: systemAPI
        };
    }

    const providedOptions = commandOptions.map(opt => opt.value);
    const hasHelpOption = !!providedOptions.find(opt => opt === '--help');

    if (hasHelpOption) {
        return help(systemAPI);
    }

    const argumentsValue = resolveArguments(
        commandArguments, 
        stdin, 
        systemAPI, 
        false
    );

    const cwd = systemAPI.environmentVariables['PWD'];
    const currentUser = systemAPI.currentShellUser;
    const fileSystem = systemAPI.fileSystem;

    try {

        const filePaths = argumentsValue;

        for (const filePath of filePaths) {
            const checkedFilePath = checkProvidedPath(
                filePath, 
                cwd, 
                currentUser, 
                fileSystem
            );

            if (checkedFilePath.insideFileError) {
                throw new ExecutionTreeError(
                    `touch: cannot touch '${filePath}': Not a directory`,
                    1
                );
            }

            const { 
                parentPath, 
                targetName 
            } = getParentPathAndTargetName(checkedFilePath.resolvedPath);

            const checkedParentDirectoryPath = checkProvidedPath(
                parentPath,
                cwd,
                currentUser,
                fileSystem
            );

            if (!checkedParentDirectoryPath.valid) {
                throw new ExecutionTreeError(
                    `touch: cannot touch '${filePath}': No such file or directory`,
                    1
                );
            }

            const parentDirectoryPath = checkedParentDirectoryPath.resolvedPath;

            const parentDirectory = getDirectoryData(
                parentDirectoryPath, 
                cwd, 
                currentUser, 
                fileSystem
            );

            if (!checkedFilePath.valid) {
                const filePermission = getFilePermissionOctal(systemAPI.umask);
                const currentTimestamp = Date.now();

                const file = new File(
                    targetName, 
                    {
                        content: '',
                        size: 0
                    },
                    { 
                        is: false, 
                        has: 1 
                    }, 
                    { 
                        group: currentUser, 
                        owner: currentUser, 
                        permissionOctal: filePermission
                    },
                    {
                        access: currentTimestamp,
                        birth: currentTimestamp,
                        change: currentTimestamp,
                        modify: currentTimestamp
                    }
                );

                file.data.size = getFileOrDirectoryBytesSize(file);
                parentDirectory.children.files.push(file);

                changeContentUpdateTimestamps(parentDirectory, currentTimestamp);
            }
        }

        return {
            stdout: '',
            stderr: null,
            exitStatus: 0,
            modifiedSystemAPI: systemAPI
        };
    }
    catch (err: unknown) {
        const errorObject = err as ExecutionTreeError;

        return {
            stdout: null,
            stderr: errorObject.errorMessage,
            exitStatus: errorObject.errorStatus,
            modifiedSystemAPI: systemAPI
        };
    }


}