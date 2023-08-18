import { Shell } from "@/types/shell"
import { checkProvidedPath } from "./common/directoryAndFile";
import { getCommandArguments, resolveArguments } from "./common/arguments";
import { commandHasInvalidOptions, getCommandInvalidOptionMessage } from "./common/options";
import { ExecutionTreeError } from "../exception";
import { deepClone } from "@/lib/utils";


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
            stderr: getCommandInvalidOptionMessage('echo', invalidOptions, 'echo --help'),
            exitStatus: 2,
            modifiedSystemAPI: systemAPI
        };
    }

    try {
        const argumentsValue = getCommandArguments(commandArguments, stdin);

        const resolvedArguments = resolveArguments(
            argumentsValue, 
            systemAPI, 
            false
        );

        if (resolvedArguments.length > 1) {
            throw new ExecutionTreeError(
                `cd: too many arguments.`,
                1
            );
        }

        const path = resolvedArguments[0];
        const currentUser = systemAPI.currentShellUser;
        const cwd = systemAPI.environmentVariables['PWD'];
        const fileSystem = systemAPI.fileSystem;

        const { 
            valid,
            resolvedPath,
            validAs 
        } = checkProvidedPath(
            path, 
            cwd, 
            currentUser, 
            fileSystem
        );

        if (!valid) {
            throw new ExecutionTreeError(
                `cd: ${resolvedPath}: No such file or directory`,
                1
            )
        }

        if (validAs === 'directory') {
            systemAPI.setEnvironmentVariables(previous => {
                const previousDeepCopy = deepClone(previous);

                previousDeepCopy['PWD'] = resolvedPath;

                return previousDeepCopy;
            });

            systemAPI.setCurrentDirectory(previous => resolvedPath);

            systemAPI.environmentVariables['PWD'] = resolvedPath;

            systemAPI.currentDirectory = resolvedPath;

            return {
                stdout: '',
                stderr: null,
                exitStatus: 0,
                modifiedSystemAPI: systemAPI
            };
        }
        else {
            throw new ExecutionTreeError(
                `cd: ${resolvedPath}: Not a directory`,
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