import { Shell } from '@/types/shell';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getDirectoryIndex, 
    getFileIndex, 
    getParentPathAndTargetName 
} from './common/directoryAndFile';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { changeContentUpdateTimestamps } from './common/timestamps';
import { optionIsPresent } from './common/options';
import { commandDecorator } from './common/decorator';
import { ExecutionTreeError } from '../exception';
import { BREAK_LINE } from './common/patterns';


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

    const formattedOptions = formatHelpPageOptions(COMMAND_OPTIONS);
    const name = 'rm - remove files or directories';
    const synopsis = 'rm [OPTION]... [FILE]...';
    const description = `Remove (unlink) the FILE(s).${BREAK_LINE}${formattedOptions}`;

    const formattedHelp = helpPageSectionsAssembler(
        name,
        synopsis,
        description
    );

    return {
        stdout: formattedHelp,
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


const main = (
    providedOptions: string[],
    providedArguments: string[],
    systemAPI: Shell.SystemAPI
) => {
    
    const removeRecursivelyOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
    const ignoreNonExistentOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);

    const canRemoveDirectoryData = removeRecursivelyOption.valid;
    const canIgnoreNonExistentFailure = ignoreNonExistentOption.valid;

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;

    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    for (const argument of providedArguments) {
        const providedPath = checkProvidedPath(
            argument,
            currentWorkingDirectory,
            currentShellUser,
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
            currentWorkingDirectory,
            currentShellUser,
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


export const rm = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'rm', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}