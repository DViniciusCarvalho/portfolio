import { Shell } from '@/types/shell';
import { commandHasInvalidOptions, getCommandInvalidOptionMessage } from './common/options';
import { executeSingleCommand } from '../interpreter/ASTanalyzer';


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


export const sudo = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const commandName = commandArguments.shift()!;

    const previousUser = systemAPI.currentShellUser;

    systemAPI.currentShellUser = 'root';
    systemAPI.environmentVariables['HOME'] = '/home/root';
    systemAPI.environmentVariables['USER'] = 'root';

    const commandResult = executeSingleCommand(
        commandName, 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        false, 
        false
    );

    systemAPI.currentShellUser = previousUser;
    systemAPI.environmentVariables['HOME'] = `/home/${previousUser}`;
    systemAPI.environmentVariables['USER'] = previousUser;

    commandResult.systemAPI.currentShellUser = previousUser;
    commandResult.systemAPI.environmentVariables['HOME'] = `/home/${previousUser}`;
    commandResult.systemAPI.environmentVariables['USER'] = previousUser;

    return {
        stdout: commandResult.stdout,
        stderr: commandResult.stderr,
        exitStatus: commandResult.exitStatus,
        modifiedSystemAPI: commandResult.systemAPI
    };
}