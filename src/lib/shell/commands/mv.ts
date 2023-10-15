import { Shell } from '@/types/shell';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getDirectoryIndex, 
    getFileIndex, 
    getParentPathAndTargetName 
} from './common/directoryAndFile';

import { 
    changeContentUpdateTimestamps, 
    changeMetadataUpdateTimestamps, 
    changeReadingTimestamps 
} from './common/timestamps';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { commandDecorator } from './common/decorator';
import { ExecutionTreeError } from '../exception';
import { BREAK_LINE } from './common/patterns';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
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
    const name = 'mv - move (rename) files';
    const synopsis = `mv [OPTION]... SOURCE DEST${BREAK_LINE}mv [OPTION]... SOURCE... DIRECTORY`;
    const description = `Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.${BREAK_LINE}${formattedOptions}`;

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

    if (!providedArguments.length) {
        throw new ExecutionTreeError(
            `mv: missing file operand`,
            1
        );
    }

    if (providedArguments.length < 2) {
        throw new ExecutionTreeError(
            `mv: missing destination file operand after '${providedArguments[0]}'`,
            1
        );
    }

    const destination = providedArguments.pop()!;
    const pathsToMove = providedArguments;

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;

    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const checkedDestinationPath = checkProvidedPath(
        destination,
        currentWorkingDirectory,
        currentShellUser,
        fileSystem
    );

    if (providedArguments.length > 2) {
        if (!checkedDestinationPath.valid) {
            throw new ExecutionTreeError(
                `mv: cannot move to '${destination}': No such file or directory`,
                1
            );
        }

        if (checkedDestinationPath.validAs === 'file') {
            throw new ExecutionTreeError(
                `mv: target '${destination}' is not a directory`,
                1
            );
        }

    }

    const destinationPath = getParentPathAndTargetName(
        checkedDestinationPath.resolvedPath
    );

    const checkedDestinationParentPath = checkProvidedPath(
        destinationPath.parentPath,
        currentWorkingDirectory,
        currentShellUser,
        fileSystem
    );

    for (const pathToMove of pathsToMove) {
        const checkedOriginPath = checkProvidedPath(
            pathToMove,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );

        if (!checkedOriginPath.valid) {
            throw new ExecutionTreeError(
                `mv: cannot stat '${pathToMove}': No such file or directory`,
                1
            );
        }

        const originPath = getParentPathAndTargetName(
            checkedOriginPath.resolvedPath
        );

        const isRenameAction = !checkedDestinationPath.valid
                               && providedArguments.length === 2 
                               && checkedDestinationParentPath.valid;

        const isOverwriteAction = checkedDestinationPath.valid
                                  && providedArguments.length === 2;

        if (
            isRenameAction && !checkedDestinationParentPath.valid 
            || !isRenameAction && !checkedDestinationPath.valid
        ) {
            throw new ExecutionTreeError(
                `mv: target '${destination}' is not a directory`,
                1
            );
        }

        const originParentDirectoryData = getDirectoryData(
            originPath.parentPath,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );

        const destinationParentDirectoryData = getDirectoryData(
            destinationPath.parentPath,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );


        const currentTimestamp = Date.now();

        if (isRenameAction) {
            if (checkedOriginPath.validAs === 'file') {
                const originParentFiles = originParentDirectoryData.children.files;

                const fileToRenameIndex = getFileIndex(
                    originPath.targetName, 
                    originParentFiles
                );

                const targetFile = originParentFiles[fileToRenameIndex];

                originParentFiles.splice(fileToRenameIndex, 1);

                targetFile.name = destinationPath.targetName;

                destinationParentDirectoryData.children.files.push(targetFile);

                changeMetadataUpdateTimestamps(targetFile, currentTimestamp);

            }
            else {
                const originParentDirectories = originParentDirectoryData.children.directories;

                const directoryToRenameIndex = getDirectoryIndex(
                    originPath.targetName,
                    originParentDirectories
                );

                const targetDirectory = originParentDirectories[directoryToRenameIndex];

                originParentDirectories.splice(directoryToRenameIndex, 1);

                targetDirectory.name = destinationPath.targetName;

                destinationParentDirectoryData.children.directories.push(targetDirectory);

                changeMetadataUpdateTimestamps(targetDirectory, currentTimestamp);
            }

        }
        else if (isOverwriteAction) {
            if (checkedOriginPath.validAs !== checkedDestinationPath.validAs) {
                throw new ExecutionTreeError(
                    `mv: cannot overwrite ${checkedDestinationPath.validAs} '${destination}' with ${checkedOriginPath.validAs} '${pathToMove}'`,
                    1
                );
            }

            if (checkedOriginPath.validAs === 'file') {
                const originParentFiles = originParentDirectoryData.children.files;
                const destinationParentFiles = destinationParentDirectoryData.children.files;

                const originFileIndex = getFileIndex(
                    originPath.targetName,
                    originParentFiles
                );

                const existingDestinationFileIndex = getFileIndex(
                    destinationPath.targetName,
                    destinationParentFiles
                );

                const originFile = originParentFiles[originFileIndex];

                destinationParentFiles.splice(existingDestinationFileIndex, 1);
                destinationParentFiles.push(originFile);
                originParentFiles.splice(originFileIndex, 1);

                changeReadingTimestamps(originFile, currentTimestamp);
            }
            else {
                const originParentDirectories = originParentDirectoryData.children.directories;
                const destinationParentDirectories = destinationParentDirectoryData.children.directories;

                const originDirectoryIndex = getDirectoryIndex(
                    originPath.targetName,
                    originParentDirectories
                );

                const existingDestinationDirectoryIndex = getDirectoryIndex(
                    destinationPath.targetName,
                    destinationParentDirectories
                );

                const originDirectory = originParentDirectories[originDirectoryIndex];

                destinationParentDirectories.splice(existingDestinationDirectoryIndex, 1);
                destinationParentDirectories.push(originDirectory);
                originParentDirectories.splice(originDirectoryIndex, 1);

                changeReadingTimestamps(originDirectory, currentTimestamp);
            }
        }
        else {
            const destinationDirectoryData = getDirectoryData(
                destination,
                currentWorkingDirectory,
                currentShellUser,
                fileSystem
            );

            const checkedFinalPath = checkProvidedPath(
                `${destination}/${originPath.targetName}`,
                currentWorkingDirectory,
                currentShellUser,
                fileSystem
            );

            if (checkedFinalPath.valid) return;

            if (checkedOriginPath.validAs === 'file') {
                const originParentFiles = originParentDirectoryData.children.files;

                const targetFileIndex = getFileIndex(
                    originPath.targetName,
                    originParentFiles
                );

                const targetFile = originParentFiles[targetFileIndex];

                originParentFiles.splice(targetFileIndex, 1);

                destinationDirectoryData.children.files.push(targetFile);
            }
            else {
                const originParentDirectories = originParentDirectoryData.children.directories;

                const targetDirectoryIndex = getDirectoryIndex(
                    originPath.targetName,
                    originParentDirectories
                );

                const targetDirectory = originParentDirectories[targetDirectoryIndex];

                originParentDirectories.splice(targetDirectoryIndex, 1);

                destinationDirectoryData.children.directories.push(targetDirectory);
            }

        }

        changeContentUpdateTimestamps(originParentDirectoryData, currentTimestamp);
        changeContentUpdateTimestamps(destinationParentDirectoryData, currentTimestamp);
    }

    return {
        stdout: '',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const mv = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'mv', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}