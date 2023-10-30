import { Shell } from '@/types/shell'

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { commandDecorator } from './common/decorator';
import { BREAK_LINE } from './common/patterns';


const COMMAND_OPTIONS: Shell.CommandOption[] = [];


export const help = (
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const formattedOptions = formatHelpPageOptions(COMMAND_OPTIONS);
    const name = 'man - an interface to the system reference manuals';
    const synopsis = 'man [COMMAND_NAME]';
    const description = `Show the manual of a command.${BREAK_LINE}${formattedOptions}`;

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

    const targetCommand = providedArguments.at(0);
    
    if (!targetCommand) {
        return {
            stdout: null,
            stderr: `What manual page do you want?${BREAK_LINE}For example, try 'man man'.`,
            exitStatus: 1,
            modifiedSystemAPI: systemAPI
        };
    }

    const commandName = targetCommand;
    const commandModule = require(`@/lib/shell/commands/${commandName}`);
    const commandHelpFunction = commandModule['help'];

    return commandHelpFunction(systemAPI);
}


export const man = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'man', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}