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
    getParentPathAndTargetName, 
    getResolvedPath 
} from './common/directoryAndFile';

import { changeContentUpdateTimestamps } from './common/timestamps';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: null,
        long: '--ignore-fail-on-non-empty',
        description: 'ignore each failure that is solely because a directory is non-empty'
    },
    {
        short: '-p',
        long: '--parents',
        description: 'remove  DIRECTORY  and  its ancestors'
    },
    {
        short: '-f',
        long: '--force-remove-non-empty',
        description: 'remove a directory even if it is non-empty'
    },
    {
        short: null,
        long: '--help',
        description: 'display this help and exit'
    }
];



const getToLowestLevelDirToHighest = (
    path: string
) => {
    const pathsAcc: string[] = [];

    let pathAcc = path;

    for (let i = 0; i < path.split('/').length; i++) {
        pathsAcc.push(pathAcc);

        const lastSlashIndex = pathAcc.lastIndexOf('/');
        pathAcc = pathAcc.slice(0, lastSlashIndex);
    }

    return pathsAcc;
}


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


export const rmdir = (    
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
            stderr: getCommandInvalidOptionMessage('rmdir', invalidOptions),
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

        const ignoreFailureOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
        const parentsOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
        const forceNonEmptyRemoveOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);

        const canIgnoreFailure = ignoreFailureOption.valid;
        const canRemoveParents = parentsOption.valid;
        const canRemoveNonEmpty = forceNonEmptyRemoveOption.valid;

        const cwd = systemAPI.environmentVariables['PWD'];
        const currentUser = systemAPI.currentShellUser;
        const fileSystem = systemAPI.fileSystem;

        for (const argument of argumentsValue) {
            const checkedPath = checkProvidedPath(
                argument,
                cwd,
                currentUser,
                fileSystem
            );

            if (!checkedPath.valid) {
                throw new ExecutionTreeError(
                    `rmdir: failed to remove '${argument}': No such file or directory`,
                    1
                );
            }

            const directoriesToRemove = canRemoveParents
                                      ? getToLowestLevelDirToHighest(argument)
                                        .map(dir => getResolvedPath(
                                            dir,
                                            cwd, 
                                            currentUser
                                        ))
                                      : [checkedPath.resolvedPath];


            for (const directoryToRemove of directoriesToRemove) {
                const directoryData = getDirectoryData(
                    directoryToRemove,
                    cwd,
                    currentUser,
                    fileSystem
                );
    
                const directoryChildrenFiles = directoryData.children.files;
                const directoryChildrenDirectories = directoryData.children.directories;
    
                const isNonEmpty = directoryChildrenFiles.length || directoryChildrenDirectories.length;
    
                if (isNonEmpty && !canRemoveNonEmpty) {
                    if (canIgnoreFailure) continue;
    
                    throw new ExecutionTreeError(
                        `rmdir: failed to remove directory '${argument}': Directory not empty`,
                        1
                    )
                }
    
                const {
                    parentPath,
                    targetName
                } = getParentPathAndTargetName(directoryToRemove);
                          
                const parentDirectoryData = getDirectoryData(
                    parentPath, 
                    cwd,
                    currentUser,
                    fileSystem
                );
    
                const targetDirectoryIndex = getDirectoryIndex(
                    targetName, 
                    parentDirectoryData.children.directories
                );
    
                parentDirectoryData.children.directories.splice(targetDirectoryIndex, 1);

                const currentTimestamp = Date.now();

                changeContentUpdateTimestamps(parentDirectoryData, currentTimestamp);
    
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