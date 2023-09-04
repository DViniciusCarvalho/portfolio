import { Shell } from '@/types/shell';
import { ExecutionTreeError } from '../exception';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage, 
    optionIsPresent 
} from './common/options';

import { resolveArguments } from './common/arguments';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getDirectoryIndex, 
    getFileIndex, 
    getParentPathAndTargetName 
} from './common/directoryAndFile';

import { changeContentUpdateTimestamps } from './common/timestamps';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-r',
        long: '--recursive',
        description: 'remove directories and their contents recursively'
    },
    {
        short: '-f',
        long: '--force',
        description: 'ignore nonexistent files and arguments' 
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


export const rm = (    
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
            stderr: getCommandInvalidOptionMessage('rm', invalidOptions),
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

    try {

        const removeRecursivelyOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
        const ignoreNonExistentOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);

        const canRemoveDirectoryData = removeRecursivelyOption.valid;
        const canIgnoreNonExistentFailure = ignoreNonExistentOption.valid;

        const cwd = systemAPI.environmentVariables['PWD'];
        const currentUser = systemAPI.currentShellUser;
        const fileSystem = systemAPI.fileSystem;

        for (const argument of argumentsValue) {
            const providedPath = checkProvidedPath(
                argument,
                cwd,
                currentUser,
                fileSystem
            );

            if (!providedPath.valid && !canIgnoreNonExistentFailure) {
                throw new ExecutionTreeError(
                    `rmdir: failed to remove '${argument}': No such file or directory`,
                    1
                );
            }

            const pathToRemove = providedPath.resolvedPath;

            const {
                parentPath,
                targetName
            } = getParentPathAndTargetName(pathToRemove);

            const parentDirectoryData = getDirectoryData(
                parentPath, 
                cwd,
                currentUser,
                fileSystem
            );

            if (providedPath.validAs === 'directory') {
                if (!canRemoveDirectoryData) {
                    throw new ExecutionTreeError(
                        `rm: cannot remove '${argument}': Is a directory`,
                        1
                    );
                }
             
                const targetDirectoryIndex = getDirectoryIndex(
                    targetName, 
                    parentDirectoryData.children.directories
                );
    
                parentDirectoryData.children.directories.splice(targetDirectoryIndex, 1);
            }
            else {
                const targetFileIndex = getFileIndex(
                    targetName,
                    parentDirectoryData.children.files
                );

                parentDirectoryData.children.files.splice(targetFileIndex, 1);
            }

            const currentTimestamp = Date.now();

            changeContentUpdateTimestamps(parentDirectoryData, currentTimestamp);

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