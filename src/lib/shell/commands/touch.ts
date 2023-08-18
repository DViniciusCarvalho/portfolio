import { Shell } from "@/types/shell"
import { 
    checkProvidedPath, 
    getDirectoryData, 
    getFileOrDirectoryBytesSize, 
    getFilePermissionOctal
} from "./common/directoryAndFile";
import { getCommandArguments, resolveArguments } from "./common/arguments";
import { ExecutionTreeError } from "../exception";
import { 
    checkOption, 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage, 
    getOption 
} from "./common/options";
import { deepClone } from "@/lib/utils";
import { File } from "./models/File";


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-c',
        long: '--no-create',
        description: 'do not create any files'
    },
    {
        short: '-a',
        long: null,
        description: 'change only the access time'
    },
    {
        short: '-d',
        long: /^--date=.+$/,
        description: 'parse STRING and use it instead of current time'
    },
    {
        short: '-m',
        long: null,
        description: 'change only the modification time'
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


export const touch = (    
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
    const hasHelpOption = !!providedOptions.find(opt => opt === '--help');

    if (hasHelpOption) {
        return help(systemAPI);
    }

    const argumentsValue = getCommandArguments(commandArguments, stdin);

    const cwd = systemAPI.environmentVariables['PWD'];
    const currentUser = systemAPI.currentShellUser;
    const fileSystem = systemAPI.fileSystem;

    try {

        const filePaths = resolveArguments(
            argumentsValue, 
            systemAPI, 
            false
        );

        for (const filePath of filePaths) {
            const providedFile = checkProvidedPath(
                filePath, 
                cwd, 
                currentUser, 
                fileSystem
            );

            if (providedFile.insideFileError) {
                throw new ExecutionTreeError(
                    `touch: cannot touch '${filePath}': Not a directory`,
                    1
                );
            }

            const resolvedPath = providedFile.resolvedPath;
            const lastSlashIndex = resolvedPath.lastIndexOf('/');
            const startOfFileName = lastSlashIndex !== -1
                                    ? lastSlashIndex + 1
                                    : 0;

            const parentsDirectoryPath = resolvedPath.slice(0, startOfFileName).length === 0
                                         ? './'
                                         : resolvedPath.slice(0, startOfFileName);

            const parentsDirectory = checkProvidedPath(
                parentsDirectoryPath,
                cwd,
                currentUser,
                fileSystem
            );

            if (!parentsDirectory.valid) {
                throw new ExecutionTreeError(
                    `touch: cannot touch '${filePath}': No such file or directory`,
                    1
                );
            }

            const fileName = resolvedPath.slice(startOfFileName);
            const parentDirectoryPath = parentsDirectory.resolvedPath;

            const parentDirectory = getDirectoryData(
                parentDirectoryPath, 
                cwd, 
                currentUser, 
                fileSystem
            );


            if (!providedFile.valid) {
                const filePermission = getFilePermissionOctal(systemAPI.umask);

                const file = new File(
                    fileName, 
                    0, 
                    '', 
                    { 
                        is: false, 
                        has: 1 
                    }, 
                    { 
                        group: currentUser, 
                        owner: currentUser, 
                        permissionOctal: filePermission
                    },
                    {
                        access: 1,
                        birth: 1,
                        change: 1,
                        modify: 1
                    }
                );

                file.size = getFileOrDirectoryBytesSize(file);
                parentDirectory.children.files.push(file);
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