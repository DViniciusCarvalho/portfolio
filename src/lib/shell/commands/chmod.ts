import { Shell } from '@/types/shell';
import { commandHasInvalidOptions, getCommandInvalidOptionMessage, optionIsPresent } from './common/options';
import { ExecutionTreeError } from '../exception';
import { resolveArguments } from './common/arguments';
import { changeMetadataUpdateTimestamps, changeReadingTimestamps } from './common/timestamps';
import { checkProvidedPath, getDirectoryData, getDirectoryIndex, getFileIndex, getParentPathAndTargetName, targetIsDirectory } from './common/directoryAndFile';
import { Directory } from './models/Directory';
import { File } from './models/File';
import { BREAK_LINE, OCTAL_NUMBER_PATTERN } from './common/patterns';


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

const INDEX_MAPPING: {[key: string]: any} = {
    permIndexes: {
        'u': 0,
        'g': 1,
        'o': 2
    },
    binaryTercetIndexes: {
        'r': 0,
        'w': 1,
        'x': 2
    }
};


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

    const { 
        hasInvalidOption, 
        invalidOptions 
    } = commandHasInvalidOptions(commandOptions, COMMAND_OPTIONS);

    if (hasInvalidOption) {
        return {
            stdout: null,
            stderr: getCommandInvalidOptionMessage('chmod', invalidOptions),
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
                `chmod: missing operand${BREAK_LINE}Try 'chmod --help' for more information.`,
                1
            );
        }

        const cwd = systemAPI.environmentVariables['PWD'];
        const currentUser = systemAPI.currentShellUser;
        const fileSystem = systemAPI.fileSystem;

        const changeOwnershipRecursivelyOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
        const noPreserveRootOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
        const preserveRootOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);

        const canChangeOwnershipRecursively = changeOwnershipRecursivelyOption.valid;
        const canPreserveRoot = preserveRootOption && !noPreserveRootOption;

        const permissionSentence = argumentsValue.at(0);
        const newPermissionFunction = resolvePermissionOctals(permissionSentence);

        const targetPaths = argumentsValue.slice(1);

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
                cwd,
                currentUser,
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