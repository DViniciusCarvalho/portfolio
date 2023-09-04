import { Shell } from '@/types/shell';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage, 
    optionIsPresent 
} from './common/options';

import { ExecutionTreeError } from '../exception';
import { resolveArguments } from './common/arguments';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getDirectoryIndex, 
    getFileIndex, 
    getParentPathAndTargetName, 
    targetIsDirectory
} from './common/directoryAndFile';

import { File } from './models/File';
import { Directory } from './models/Directory';
import { changeMetadataUpdateTimestamps, changeReadingTimestamps } from './common/timestamps';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-R',
        long: '--recursive',
        description: 'operate on files and directories recursively'
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
        long: /^--from=[.]+:[.]+$/,
        description: 'change the owner and/or group of each file only if its current owner and/or group  match those specified here. Either may be omitted, in which case a match is not required for  the  omitted attribute'
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


export const chown = (    
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
            stderr: getCommandInvalidOptionMessage('chown', invalidOptions),
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

        if (argumentsValue.length < 2) {
            throw new ExecutionTreeError(
                `chown: missing operand!<break_line>!Try 'chown --help' for more information.`,
                1
            );
        }

        const cwd = systemAPI.environmentVariables['PWD'];
        const currentUser = systemAPI.currentShellUser;
        const fileSystem = systemAPI.fileSystem;

        const changeOwnershipRecursivelyOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
        const noPreserveRootOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
        const preserveRootOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);
        const filteredByOwnershipOption = optionIsPresent(providedOptions, 3, COMMAND_OPTIONS);

        const canChangeOwnershipRecursively = changeOwnershipRecursivelyOption.valid;
        const canPreserveRoot = preserveRootOption && !noPreserveRootOption;
        const canFilterByOwnerShip = filteredByOwnershipOption.valid;

        const ownershipToFilter = filteredByOwnershipOption.regExpValuePart;
        const hasGroup = ownershipToFilter?.split(':').length === 2;

        const ownership = argumentsValue.at(0);
        const targetPaths = argumentsValue.slice(1);

        const newOwnershipValues = ownership.split(':');
        const newOwner = newOwnershipValues.at(0);
        const newGroup = newOwnershipValues.at(1);

        const currentTimestamp = Date.now();
  
        const changeOwnershipRecursively = (
            pathFilesAndDirectories: (File | Directory)[],
            pathAcc: string
        ) => {
        
            for (let index = 0; index < pathFilesAndDirectories.length; index++) {
                const fileOrDirectory = pathFilesAndDirectories[index];
                const isDirectory = targetIsDirectory(fileOrDirectory);

                const owner = fileOrDirectory.management.owner;
                const group = fileOrDirectory.management.group;
                const ownershipValue = hasGroup? `${owner}:${group}` : owner;

                changeReadingTimestamps(fileOrDirectory, currentTimestamp);

                if (canFilterByOwnerShip && ownershipToFilter !== ownershipValue) continue;

                fileOrDirectory.management.owner = newOwner;
                fileOrDirectory.management.group = newGroup
                                                   ? newGroup
                                                   : fileOrDirectory.management.group;

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
                cwd,
                currentUser,
                fileSystem
            );
            
            const targetResolvedPath = checkedTargetPath.resolvedPath;

            if (!checkedTargetPath.valid) {
                throw new ExecutionTreeError(
                    `chown: cannot access '${targetPath}': No such file or directory`,
                    1
                );
            }
    
            if (currentUser !== 'root') {
                throw new ExecutionTreeError(
                    `chown: changing ownership of '${targetPath}': Operation not permitted`,
                    1
                );
            }

            if (canChangeOwnershipRecursively) {
                if (checkedTargetPath.validAs === 'file')  {
                    throw new ExecutionTreeError(
                        `chown: cannot iterate non-directory '${targetPath}' content`,
                        1
                    );
                }

                const targetDirectoryData = getDirectoryData(
                    targetResolvedPath,
                    cwd,
                    currentUser,
                    fileSystem
                );

                const targetDirectoryChildren = [
                    ...targetDirectoryData.children.files,
                    ...targetDirectoryData.children.directories
                ];
            
                changeReadingTimestamps(targetDirectoryData, currentTimestamp);

                if (targetResolvedPath !== '/' || (targetResolvedPath === '/' && !canPreserveRoot)) {
                    const owner = targetDirectoryData.management.owner;
                    const group = targetDirectoryData.management.group;
    
                    const ownershipValue = hasGroup? `${owner}:${group}` : owner;

                    if (!(canFilterByOwnerShip && ownershipToFilter !== ownershipValue)) {
                        targetDirectoryData.management.owner = newOwner;
                        targetDirectoryData.management.group = newGroup
                                                               ? newGroup
                                                               : targetDirectoryData.management.group;

                        changeMetadataUpdateTimestamps(targetDirectoryData, currentTimestamp);
                    }
                    
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
                    cwd,
                    currentUser,
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

                const owner = fileOrDirData.management.owner;
                const group = fileOrDirData.management.group;

                changeReadingTimestamps(fileOrDirData, currentTimestamp);

                if (targetResolvedPath !== '/' || (targetResolvedPath === '/' && !canPreserveRoot)) {
                    const ownershipValue = hasGroup? `${owner}:${group}` : owner;

                    if (!(canFilterByOwnerShip && ownershipToFilter !== ownershipValue)) {
                        fileOrDirData.management.owner = newOwner;
                        fileOrDirData.management.group = newGroup
                                                         ? newGroup
                                                         : fileOrDirData.management.group;

                        changeMetadataUpdateTimestamps(fileOrDirData, currentTimestamp);
                    }
                    
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