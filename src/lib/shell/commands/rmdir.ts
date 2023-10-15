import { Shell } from '@/types/shell';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getDirectoryIndex, 
    getOrderedDirsHierarchy, 
    getParentPathAndTargetName, 
    getResolvedPath 
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


export const help = (
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const formattedOptions = formatHelpPageOptions(COMMAND_OPTIONS);
    const name = 'rmdir - remove empty directories';
    const synopsis = 'rmdir [OPTION]... DIRECTORY...';
    const description = `Remove the DIRECTORY(ies), if they are empty.${BREAK_LINE}${formattedOptions}`;

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
    
    const ignoreFailureOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
    const parentsOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
    const forceNonEmptyRemoveOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);

    const canIgnoreFailure = ignoreFailureOption.valid;
    const canRemoveParents = parentsOption.valid;
    const canRemoveNonEmpty = forceNonEmptyRemoveOption.valid;

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;
    
    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    for (const argument of providedArguments) {
        const checkedPath = checkProvidedPath(
            argument,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );

        if (!checkedPath.valid) {
            throw new ExecutionTreeError(
                `rmdir: failed to remove '${argument}': No such file or directory`,
                1
            );
        }

        const directoriesToRemove = canRemoveParents
                                  ? getOrderedDirsHierarchy(argument)
                                    .map(dir => getResolvedPath(
                                        dir,
                                        currentWorkingDirectory, 
                                        currentShellUser
                                    ))
                                  : [checkedPath.resolvedPath];


        for (const directoryToRemove of directoriesToRemove) {
            const directoryData = getDirectoryData(
                directoryToRemove,
                currentWorkingDirectory,
                currentShellUser,
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
                currentWorkingDirectory,
                currentShellUser,
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


export const rmdir = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'rmdir', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}