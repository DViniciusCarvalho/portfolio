import { Shell } from '@/types/shell';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getDirectoryPermissionOctal, 
    getFileOrDirectoryBytesSize, 
    getOrderedDirsHierarchy, 
    getParentPathAndTargetName
} from './common/directoryAndFile';

import { Directory } from './models/Directory';
import { resolveArguments } from './common/arguments';
import { ExecutionTreeError } from '../exception';
import { commandHasInvalidOptions, getCommandInvalidOptionMessage, optionIsPresent } from './common/options';
import { changeContentUpdateTimestamps } from './common/timestamps';
import { formatHelpPageOptions, helpPageSectionsAssembler } from './common/formatters';
import { BREAK_LINE, OCTAL_NUMBER_PATTERN } from './common/patterns';
import { commandDecorator } from './common/decorator';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-m',
        long: /^--mode=.+$/,
        description: 'set file mode (as in chmod), using octals like 0777 567 etc'
    },
    {
        short: '-p',
        long: '--parents',
        description: 'make parent directories as needed'
    }
];


export const help = (
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {
    const regexOptionsMapping = new Map();

    regexOptionsMapping.set(COMMAND_OPTIONS[0].long, '--mode=MODE');

    const formattedOptions = formatHelpPageOptions(
        COMMAND_OPTIONS, 
        regexOptionsMapping
    );

    const name = 'mkdir - make directories';
    const synopsis = 'mkdir [OPTION]... DIRECTORY...';
    const description = `Create the DIRECTORY(ies), if they do not already exist.${BREAK_LINE}${formattedOptions}`;

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

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;

    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const setModeOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
    const createParentsOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);

    const canSetMode = setModeOption.valid;
    const canCreateParents = createParentsOption.valid;

    const modeToSet = setModeOption.regExpValuePart;

    const pathsToCreate = providedArguments;

    for (const pathToCreate of pathsToCreate) {
        const checkedProvidedPath = checkProvidedPath(
            pathToCreate, 
            currentWorkingDirectory, 
            currentShellUser, 
            fileSystem
        );

        const resolvedPath = checkedProvidedPath.resolvedPath;

        if (checkedProvidedPath.valid) {
            throw new ExecutionTreeError(
                `mkdir: cannot create directory '${pathToCreate}': File exists`,
                1
            );
        }

        if (canSetMode && !modeToSet?.match(OCTAL_NUMBER_PATTERN)) {
            throw new ExecutionTreeError(
                `mkdir: invalid mode '${modeToSet}'`,
                1
            );
        }

        const directoryPermission = canSetMode
                                    ? modeToSet!
                                    : getDirectoryPermissionOctal(systemAPI.umask);

        const currentTimestamp = Date.now();

        if (canCreateParents) {
            const pathsHierarchy = getOrderedDirsHierarchy(pathToCreate, 'desc');

            for (const path of pathsHierarchy) {
                const checkedProvidedPath = checkProvidedPath(
                    path,
                    currentWorkingDirectory,
                    currentShellUser,
                    fileSystem
                );

                if (!checkedProvidedPath.valid) {
                    const {
                        parentPath,
                        targetName
                    } = getParentPathAndTargetName(checkedProvidedPath.resolvedPath);

                    const parentDirectoryData = getDirectoryData(
                        parentPath,
                        currentWorkingDirectory,
                        currentShellUser,
                        fileSystem
                    );

                    const directory = new Directory(
                        targetName, 
                        {
                            size: 0
                        },
                        {
                            directories: [],
                            files: []
                        }, 
                        { 
                            is: false, 
                            has: 1 
                        }, 
                        { 
                            group: currentShellUser, 
                            owner: currentShellUser, 
                            permissionOctal: directoryPermission
                        },
                        {
                            access: currentTimestamp,
                            birth: currentTimestamp,
                            change: currentTimestamp,
                            modify: currentTimestamp
                        }
                    );

                    parentDirectoryData.children.directories.push(directory);

                    changeContentUpdateTimestamps(parentDirectoryData, currentTimestamp);
                }
            }
        }
        else {
            const { 
                parentPath, 
                targetName 
            } = getParentPathAndTargetName(resolvedPath);

            const checkedParentDirectory = checkProvidedPath(
                parentPath,
                currentWorkingDirectory,
                currentShellUser,
                fileSystem
            );

            if (!checkedParentDirectory.valid) {
                throw new ExecutionTreeError(
                    `mkdir: cannot create directory '${pathToCreate}': No such file or directory`,
                    1
                );
            }

            const parentDirectoryPath = checkedParentDirectory.resolvedPath;

            const parentDirectory = getDirectoryData(
                parentDirectoryPath, 
                currentWorkingDirectory, 
                currentShellUser, 
                fileSystem
            );
            const directory = new Directory(
                targetName, 
                {
                    size: 0
                },
                {
                    directories: [],
                    files: []
                }, 
                { 
                    is: false, 
                    has: 1 
                }, 
                { 
                    group: currentShellUser, 
                    owner: currentShellUser, 
                    permissionOctal: directoryPermission
                },
                {
                    access: currentTimestamp,
                    birth: currentTimestamp,
                    change: currentTimestamp,
                    modify: currentTimestamp
                }
            );

            directory.data.size = getFileOrDirectoryBytesSize(directory);
            parentDirectory.children.directories.push(directory);

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


export const mkdir = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'mkdir', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}