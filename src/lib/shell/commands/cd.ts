import { Shell } from '@/types/shell';
import { checkProvidedPath, getDirectoryData } from './common/directoryAndFile';
import { resolveArguments } from './common/arguments';
import { commandHasInvalidOptions, getCommandInvalidOptionMessage } from './common/options';
import { ExecutionTreeError } from '../exception';
import { deepClone } from '@/lib/utils';
import { changeReadingTimestamps } from './common/timestamps';


const COMMAND_OPTIONS: Shell.CommandOption[] = [];


export const cd = (
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
            stderr: getCommandInvalidOptionMessage('cd', invalidOptions),
            exitStatus: 2,
            modifiedSystemAPI: systemAPI
        };
    }

    try {

        const argumentsValue = resolveArguments(
            commandArguments,
            stdin,
            systemAPI, 
            false
        );

        if (argumentsValue.length > 1) {
            throw new ExecutionTreeError(
                `cd: too many arguments.`,
                1
            );
        }

        const path = argumentsValue[0];
        const currentUser = systemAPI.currentShellUser;
        const cwd = systemAPI.environmentVariables['PWD'];
        const fileSystem = systemAPI.fileSystem;

        const providedPath = checkProvidedPath(
            path, 
            cwd, 
            currentUser, 
            fileSystem
        );

        if (!providedPath.valid) {
            throw new ExecutionTreeError(
                `cd: ${providedPath.resolvedPath}: No such file or directory`,
                1
            )
        }

        if (providedPath.validAs === 'directory') {
            systemAPI.setEnvironmentVariables(previous => {
                const previousDeepCopy = deepClone(previous);

                previousDeepCopy['PWD'] = providedPath.resolvedPath;

                return previousDeepCopy;
            });

            systemAPI.setCurrentDirectory(previous => providedPath.resolvedPath);

            systemAPI.environmentVariables['PWD'] = providedPath.resolvedPath;

            systemAPI.currentDirectory = providedPath.resolvedPath;

            const directoryData = getDirectoryData(
                path,
                cwd,
                currentUser,
                fileSystem
            );

            const currentTimestamp = Date.now();

            changeReadingTimestamps(directoryData, currentTimestamp);

            return {
                stdout: '',
                stderr: null,
                exitStatus: 0,
                modifiedSystemAPI: systemAPI
            };
        }
        else {
            throw new ExecutionTreeError(
                `cd: ${providedPath.resolvedPath}: Not a directory`,
                1
            );
        }

    }
    catch(err: unknown) {
        const errorObject = err as ExecutionTreeError;

        return {
            stdout: null,
            stderr: errorObject.errorMessage,
            exitStatus: errorObject.errorStatus,
            modifiedSystemAPI: systemAPI
        };
    }

}