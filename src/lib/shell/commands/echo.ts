import { Shell } from '@/types/shell';
import { commandHasInvalidOptions } from './common/options';
import { getCommandInvalidOptionMessage } from './common/options';
import { ExecutionTreeError } from '../exception';
import { getCommandArguments, resolveArguments } from './common/arguments';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-e',
        long: null,
        description: 'enable interpretation of backslash scapes'
    },
    {
        short: '-E',
        long: null,
        description: 'disable interpretation of backslash scapes (default)'
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


export const echo = (    
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

    const lastProvidedOption = providedOptions.length? providedOptions.at(-1) : null;
    const canInterpretEscapeSequences = lastProvidedOption === '-E' || !lastProvidedOption
                                        ? false 
                                        : true;

    const argumentsValue = getCommandArguments(commandArguments, stdin);

    try {
        const resolvedArgumentsValue = resolveArguments(
            argumentsValue, 
            systemAPI, 
            canInterpretEscapeSequences
        );

        return {
            stdout: resolvedArgumentsValue.join(' '),
            stderr: null,
            exitStatus: 0,
            modifiedSystemAPI: systemAPI
        };

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