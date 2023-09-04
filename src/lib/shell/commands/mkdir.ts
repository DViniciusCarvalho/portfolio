import { Shell } from '@/types/shell';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getDirectoryPermissionOctal, 
    getFileOrDirectoryBytesSize, 
    getParentPathAndTargetName
} from './common/directoryAndFile';

import { Directory } from './models/Directory';
import { resolveArguments } from './common/arguments';
import { ExecutionTreeError } from '../exception';
import { commandHasInvalidOptions, getCommandInvalidOptionMessage } from './common/options';
import { changeContentUpdateTimestamps } from './common/timestamps';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-m',
        long: /^--mode=.+$/,
        description: 'set file mode (as in chmod), not a=rwx - umask'
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

    const { 
        hasInvalidOption, 
        invalidOptions 
    } = commandHasInvalidOptions(commandOptions, COMMAND_OPTIONS);

    if (hasInvalidOption) {
        return {
            stdout: null,
            stderr: getCommandInvalidOptionMessage('mkdir', invalidOptions),
            exitStatus: 2,
            modifiedSystemAPI: systemAPI
        };
    }

    const providedOptions = commandOptions.map(opt => opt.value);
    const hasOptions = !!providedOptions.length;
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

    const cwd = systemAPI.environmentVariables['PWD'];
    const currentUser = systemAPI.currentShellUser;
    const fileSystem = systemAPI.fileSystem;

    try {

        const directoryPaths = argumentsValue;

        for (const directoryPath of directoryPaths) {
            const providedDirectory = checkProvidedPath(
                directoryPath, 
                cwd, 
                currentUser, 
                fileSystem
            );

            if (providedDirectory.valid) {
                throw new ExecutionTreeError(
                    `mkdir: cannot create directory '${directoryPath}': File exists`,
                    1
                );
            }

            const resolvedPath = providedDirectory.resolvedPath;

            const { 
                parentPath, 
                targetName 
            } = getParentPathAndTargetName(resolvedPath);

            const checkedParentDirectory = checkProvidedPath(
                parentPath,
                cwd,
                currentUser,
                fileSystem
            );

            if (!checkedParentDirectory.valid) {
                throw new ExecutionTreeError(
                    `mkdir: cannot create directory '${directoryPath}': No such file or directory`,
                    1
                );
            }

            const parentDirectoryPath = checkedParentDirectory.resolvedPath;

            const parentDirectory = getDirectoryData(
                parentDirectoryPath, 
                cwd, 
                currentUser, 
                fileSystem
            );

            const directoryPermission = getDirectoryPermissionOctal(systemAPI.umask);
            const currentTimestamp = Date.now();

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
                    group: currentUser, 
                    owner: currentUser, 
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