import { Shell } from '@/types/shell';
import { checkProvidedPath, getDirectoryData } from './common/directoryAndFile';
import { resolveArguments } from './common/arguments';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage 
} from './common/options';

import { ExecutionTreeError } from '../exception';
import { deepClone } from '@/lib/utils';
import { changeReadingTimestamps } from './common/timestamps';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { BREAK_LINE } from './common/patterns';
import { commandDecorator } from './common/decorator';


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
    const name = 'cd - change the shell working directory';
    const synopsis = 'cd [DIR]';
    const description = `Change the current directory to DIR. The default DIR is the value of the HOME shell variable.${BREAK_LINE}${formattedOptions}`;

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
    
    if (providedArguments.length === 0) {
        const currentUserHomeDir = systemAPI.environmentVariables['HOME'];
        providedArguments.push(currentUserHomeDir);
    }

    if (providedArguments.length > 1) {
        throw new ExecutionTreeError(
            `cd: too many arguments.`,
            1
        );
    }

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;

    const path = providedArguments[0];
    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const providedPath = checkProvidedPath(
        path, 
        currentWorkingDirectory, 
        currentShellUser, 
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

        systemAPI.environmentVariables['PWD'] = providedPath.resolvedPath;

        const directoryData = getDirectoryData(
            path,
            currentWorkingDirectory,
            currentShellUser,
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


export const cd = (
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'cat',
        commandOptions,
        commandArguments,
        systemAPI,
        stdin,
        COMMAND_OPTIONS,
        help,
        main
    );

}