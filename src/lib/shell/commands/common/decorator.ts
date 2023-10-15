import { Shell } from '@/types/shell';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage 
} from './options';

import { resolveArguments } from './arguments';
import { ExecutionTreeError } from '../../exception';


export const commandDecorator = (
    commandName: string,
    commandProvidedOptions: Shell.Token[],
    commandProvidedArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null,
    commandAvailableOptions: Shell.CommandOption[],
    commandHelpFunction: any,
    commandMainFunction: any
) => {
    
    const { 
        hasInvalidOption, 
        invalidOptions 
    } = commandHasInvalidOptions(commandProvidedOptions, commandAvailableOptions);

    if (hasInvalidOption) {
        return {
            stdout: null,
            stderr: getCommandInvalidOptionMessage(commandName, invalidOptions),
            exitStatus: 2,
            modifiedSystemAPI: systemAPI
        };
    }

    const providedOptions = commandProvidedOptions.map(opt => opt.value);
    const hasHelpOption = !!providedOptions.find(opt => opt === '--help');

    if (hasHelpOption) {
        return commandHelpFunction(systemAPI);
    }

    const argumentsValue = resolveArguments(
        commandProvidedArguments, 
        stdin, 
        systemAPI, 
        false
    );

    try {

        const { 
            startNonGraphicalProcess,
            finishNonGraphicalProcess
        } = systemAPI;

        const commandProcessPID = startNonGraphicalProcess(commandName);

        const commandResult = commandMainFunction(
            providedOptions, 
            argumentsValue, 
            systemAPI
        );

        finishNonGraphicalProcess(commandProcessPID);

        return commandResult;
        
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