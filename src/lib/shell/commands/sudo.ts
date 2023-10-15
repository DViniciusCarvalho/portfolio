import { Shell } from '@/types/shell';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { executeSingleCommand } from '../interpreter/ASTanalyzer';
import { BREAK_LINE } from './common/patterns';


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
    const name = 'sudo - execute a command as another user';
    const synopsis = 'sudo [COMMAND [OPTION]... [ARG]...]';
    const description = `Allows a permitted user to execute a command as the superuser.${BREAK_LINE}${formattedOptions}`;

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


export const sudo = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const commandName = commandArguments.shift()!;

    const {
        environmentVariables
    } = systemAPI;

    const previousUser = environmentVariables['USER'];

    environmentVariables['USER'] = 'root';
    environmentVariables['HOME'] = '/root';

    const commandResult = executeSingleCommand(
        commandName, 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        false, 
        false
    );

    environmentVariables['USER'] = previousUser;
    environmentVariables['HOME'] = `/home/${previousUser}`;

    commandResult.systemAPI.environmentVariables['USER'] = previousUser;
    commandResult.systemAPI.environmentVariables['HOME'] = `/home/${previousUser}`;

    return {
        stdout: commandResult.stdout,
        stderr: commandResult.stderr,
        exitStatus: commandResult.exitStatus,
        modifiedSystemAPI: commandResult.systemAPI
    };
}