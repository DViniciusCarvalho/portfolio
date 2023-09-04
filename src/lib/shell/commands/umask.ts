import { Shell } from '@/types/shell';
import { commandHasInvalidOptions, getCommandInvalidOptionMessage } from './common/options';
import { resolveArguments } from './common/arguments';
import { ExecutionTreeError } from '../exception';
import { OCTAL_NUMBER_PATTERN } from './common/patterns';


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
    return {
        stdout: '',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const umask = (    
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
            stderr: getCommandInvalidOptionMessage('umask', invalidOptions),
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
        if (argumentsValue.length) {
            const firstUmaskProvided = argumentsValue[0];

            if (!OCTAL_NUMBER_PATTERN.test(firstUmaskProvided)) {
                throw new ExecutionTreeError(
                    `umask: invalid octal number: ${firstUmaskProvided}`,
                    1
                );
            }

            systemAPI.setUmask(previous => firstUmaskProvided);

            return {
                stdout: '',
                stderr: null,
                exitStatus: 0,
                modifiedSystemAPI: systemAPI
            };
        }

        const currentUmask = systemAPI.umask;

        return {
            stdout: currentUmask,
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