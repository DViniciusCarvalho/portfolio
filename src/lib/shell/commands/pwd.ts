import { Shell } from '@/types/shell';
import { commandHasInvalidOptions, getCommandInvalidOptionMessage } from './common/options';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-L',
        long: '--logical',
        description: 'use PWD from environment, even if it contains symlinks'
    },
    {
        short: '-P',
        long: '--physical',
        description: 'avoid all symlinks (default)'
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


export const pwd = (    
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
            stderr: getCommandInvalidOptionMessage('pwd', invalidOptions, 'pwd --help'),
            exitStatus: 2,
            modifiedSystemAPI: systemAPI
        };
    }

    const providedOptions = commandOptions.map(opt => opt.value);
    const hasHelpOption = !!providedOptions.find(opt => opt === '--help');

    if (hasHelpOption) {
        return help(systemAPI);
    }

    // logica para considerar ou ignorar symlinks
    
    const currentWorkingDirectory = systemAPI.environmentVariables['PWD'];

    return {
        stdout: currentWorkingDirectory ?? ' ',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}