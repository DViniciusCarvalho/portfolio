import { Shell } from '@/types/shell';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage 
} from './common/options';

import { resolveArguments } from './common/arguments';
import { ExecutionTreeError } from '../exception';

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

    const { 
        hasInvalidOption, 
        invalidOptions 
    } = commandHasInvalidOptions(commandOptions, COMMAND_OPTIONS);

    if (hasInvalidOption) {
        return {
            stdout: null,
            stderr: getCommandInvalidOptionMessage('mv', invalidOptions),
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

        if (!argumentsValue.length) {
            throw new ExecutionTreeError(
                `mv: missing file operand`,
                1
            );
        }

        if (argumentsValue.length < 2) {
            throw new ExecutionTreeError(
                `mv: missing destination file operand after '${argumentsValue[0]}'`,
                1
            );
        }

        const destination = argumentsValue.pop()!;
        const pathsToMove = argumentsValue;

        const cwd = systemAPI.environmentVariables['PWD'];
        const currentUser = systemAPI.currentShellUser;
        const fileSystem = systemAPI.fileSystem;

        const checkedDestinationPath = checkProvidedPath(
            destination,
            cwd,
            currentUser,
            fileSystem
        );

        if (argumentsValue.length > 2) {
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
            cwd,
            currentUser,
            fileSystem
        );

        for (const pathToMove of pathsToMove) {
            const checkedOriginPath = checkProvidedPath(
                pathToMove,
                cwd,
                currentUser,
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
                                   && argumentsValue.length === 2 
                                   && checkedDestinationParentPath.valid;

            const isOverwriteAction = checkedDestinationPath.valid
                                      && argumentsValue.length === 2;

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
                cwd,
                currentUser,
                fileSystem
            );

            const destinationParentDirectoryData = getDirectoryData(
                destinationPath.parentPath,
                cwd,
                currentUser,
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
                    cwd,
                    currentUser,
                    fileSystem
                );

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