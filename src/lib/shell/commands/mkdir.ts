import { Shell } from "@/types/shell"
import { checkProvidedPath, getDirectoryData, getDirectoryPermissionOctal, getFileOrDirectoryBytesSize } from "./common/directoryAndFile";
import { Directory } from "./models/Directory";
import { getCommandArguments, resolveArguments } from "./common/arguments";
import { ExecutionTreeError } from "../exception";
import { commandHasInvalidOptions, getCommandInvalidOptionMessage, getOption } from "./common/options";
import { deepClone } from "@/lib/utils";

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
            stderr: getCommandInvalidOptionMessage('echo', invalidOptions, 'echo --help'),
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

    const LAST_DIRECTORY_PATTERN = /\/[^\/]+$/;
    const argumentsValue = getCommandArguments(commandArguments, stdin);

    const cwd = systemAPI.environmentVariables['PWD'];
    const currentUser = systemAPI.currentShellUser;
    const fileSystem = systemAPI.fileSystem;

    try {

        const directoryPaths = resolveArguments(
            argumentsValue, 
            systemAPI, 
            false
        );

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
            const lastSlashIndex = resolvedPath.lastIndexOf('/');
            const startOfDirName = lastSlashIndex !== -1
                                    ? lastSlashIndex + 1
                                    : 0;

            const parentsDirectoryPath = resolvedPath.slice(0, startOfDirName).length === 0
                                         ? './'
                                         : resolvedPath.slice(0, startOfDirName);

            const parentsDirectory = checkProvidedPath(
                parentsDirectoryPath,
                cwd,
                currentUser,
                fileSystem
            );

            if (!parentsDirectory.valid) {
                throw new ExecutionTreeError(
                    `mkdir: cannot create directory '${directoryPath}': No such file or directory`,
                    1
                );
            }

            const directoryName = resolvedPath.slice(startOfDirName);
            const parentDirectoryPath = parentsDirectory.resolvedPath;

            const parentDirectory = getDirectoryData(
                parentDirectoryPath, 
                cwd, 
                currentUser, 
                fileSystem
            );

            const directoryPermission = getDirectoryPermissionOctal(systemAPI.umask);

            const directory = new Directory(
                directoryName, 
                0, 
                {
                    directories: [],
                    files: []
                }, 
                { 
                    is: false, 
                    has: 1 
                }, 
                { 
                    group: 'root', 
                    owner: 'root', 
                    permissionOctal: directoryPermission
                },
                {
                    access: 1,
                    birth: 1,
                    change: 1,
                    modify: 1
                }
            );

            directory.size = getFileOrDirectoryBytesSize(directory);
            parentDirectory.children.directories.push(directory);
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