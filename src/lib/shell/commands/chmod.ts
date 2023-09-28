import { Shell } from '@/types/shell';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage, 
    optionIsPresent 
} from './common/options';

import { ExecutionTreeError } from '../exception';
import { resolveArguments } from './common/arguments';

import { 
    changeMetadataUpdateTimestamps, 
    changeReadingTimestamps 
} from './common/timestamps';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getDirectoryIndex, 
    getFileIndex, 
    getParentPathAndTargetName, 
    targetIsDirectory 
} from './common/directoryAndFile';

import { Directory } from './models/Directory';
import { File } from './models/File';
import { BREAK_LINE, OCTAL_NUMBER_PATTERN } from './common/patterns';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';
import { commandDecorator } from './common/decorator';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-R',
        long: '--recursive',
        description: 'change files and directories recursively'
    },
    {
        short: null,
        long: '--no-preserve-root',
        description: 'do not treat \'/\' specially (the default)'
    },    
    {
        short: null,
        long: '--preserve-root',
        description: 'fail to operate recursively on \'/\''
    },
    {
        short: null,
        long: '--help',
        description: 'display this help and exit'
    }
];


const resolvePermissionOctals = (
    sentence: string
) => {

    if (sentence.length > 4 || sentence.length < 3 || !sentence.match(OCTAL_NUMBER_PATTERN)) {
        throw new ExecutionTreeError(
            `chmod: invalid mode: '${sentence}'`,
            1
        );
    }

    return (permission: string) => sentence.length === 3? permission[0] + sentence : sentence;
}


export const help = (
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const formattedOptions = formatHelpPageOptions(COMMAND_OPTIONS);
    const name = 'chmod - change file mode bits';
    const synopsis = 'chmod [OPTION]... OCTAL-MODE FILE...';
    const description = `Change the mode of each FILE to OCTAL-MODE.${BREAK_LINE}${formattedOptions}`;

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
    
    if (providedArguments.length < 2) {
        throw new ExecutionTreeError(
            `chmod: missing operand${BREAK_LINE}Try 'chmod --help' for more information.`,
            1
        );
    }

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;

    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const changeOwnershipRecursivelyOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
    const noPreserveRootOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
    const preserveRootOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);

    const canChangeOwnershipRecursively = changeOwnershipRecursivelyOption.valid;
    const canPreserveRoot = preserveRootOption && !noPreserveRootOption;

    const permissionSentence = providedArguments.at(0)!;
    const newPermissionFunction = resolvePermissionOctals(permissionSentence);

    const targetPaths = providedArguments.slice(1);

    const currentTimestamp = Date.now();


    const changeOwnershipRecursively = (
        pathFilesAndDirectories: (File | Directory)[],
        pathAcc: string
    ) => {
    
        for (let index = 0; index < pathFilesAndDirectories.length; index++) {
            const fileOrDirectory = pathFilesAndDirectories[index];
            const isDirectory = targetIsDirectory(fileOrDirectory);

            const permission = fileOrDirectory.management.permissionOctal;

            changeReadingTimestamps(fileOrDirectory, currentTimestamp);

            fileOrDirectory.management.permissionOctal = newPermissionFunction(permission);

            changeMetadataUpdateTimestamps(fileOrDirectory, currentTimestamp);

            const fileOrDirName = fileOrDirectory.name;

            const fullPath = `${pathAcc}/${fileOrDirName}`;

            if (isDirectory) {
                const directory = fileOrDirectory as Directory;

                const childrenFiles = directory.children.files;
                const childrenDirectories = directory.children.directories;

                const children = [
                    ...childrenFiles,
                    ...childrenDirectories
                ];
                
                changeOwnershipRecursively(children, fullPath);
            }
        }

        return;
    };


    for (const targetPath of targetPaths) {
        const checkedTargetPath = checkProvidedPath(
            targetPath,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );
        
        const targetResolvedPath = checkedTargetPath.resolvedPath;

        if (!checkedTargetPath.valid) {
            throw new ExecutionTreeError(
                `chmod: cannot access '${targetPath}': No such file or directory`,
                1
            );
        }

        if (canChangeOwnershipRecursively) {
            if (checkedTargetPath.validAs === 'file')  {
                throw new ExecutionTreeError(
                    `chmod: cannot iterate non-directory '${targetPath}' content`,
                    1
                );
            }

            const targetDirectoryData = getDirectoryData(
                targetResolvedPath,
                currentWorkingDirectory,
                currentShellUser,
                fileSystem
            );

            const targetDirectoryChildren = [
                ...targetDirectoryData.children.files,
                ...targetDirectoryData.children.directories
            ];
        
            changeReadingTimestamps(targetDirectoryData, currentTimestamp);

            if (targetResolvedPath !== '/' || (targetResolvedPath === '/' && !canPreserveRoot)) {
                const permission = targetDirectoryData.management.permissionOctal;

                // alterar permissao

                changeMetadataUpdateTimestamps(targetDirectoryData, currentTimestamp);
            } 

            changeOwnershipRecursively(
                targetDirectoryChildren, 
                checkedTargetPath.resolvedPath
            );
        
        }
        else {
            const {
                parentPath,
                targetName
            } = getParentPathAndTargetName(targetResolvedPath);

            const parentDirectoryData = getDirectoryData(
                parentPath,
                currentWorkingDirectory,
                currentShellUser,
                fileSystem
            );

            const isFile = checkedTargetPath.validAs === 'file';

            const getIndexFunction = isFile? getFileIndex : getDirectoryIndex;

            const childrenFilesOrDirs = isFile
                                        ? parentDirectoryData.children.files
                                        : parentDirectoryData.children.directories;

            const fileOrDirIndex = getIndexFunction(
                targetName, 
                childrenFilesOrDirs as any
            );

            const fileOrDirData = childrenFilesOrDirs[fileOrDirIndex];

            changeReadingTimestamps(fileOrDirData, currentTimestamp);

            if (targetResolvedPath !== '/' || (targetResolvedPath === '/' && !canPreserveRoot)) {
                const permission = fileOrDirData.management.permissionOctal;

                fileOrDirData.management.permissionOctal = newPermissionFunction(permission);

                changeMetadataUpdateTimestamps(fileOrDirData, currentTimestamp);   
            } 
        }
    }

    return {
        stdout: '',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const chmod = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'chmod', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );

}