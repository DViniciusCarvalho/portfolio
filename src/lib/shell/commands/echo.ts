import { Shell } from '@/types/shell';
import { commandHasInvalidOptions } from './common/options';
import { getCommandInvalidOptionMessage } from './common/options';
import { ExecutionTreeError } from '../exception';
import { resolveArguments } from './common/arguments';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { BREAK_LINE } from './common/patterns';
import { commandDecorator } from './common/decorator';


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

    const formattedOptions = formatHelpPageOptions(COMMAND_OPTIONS);
    const name = 'echo - display a line of text';
    const synopsis = 'echo [SHORT-OPTION]... [STRING]...';
    const description = `Echo the STRING(s) to standard output.${BREAK_LINE}${formattedOptions}`;

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

    return {
        stdout: providedArguments.join(' '),
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

    return commandDecorator(
        'echo', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}