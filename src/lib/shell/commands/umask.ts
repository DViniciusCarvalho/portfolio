import { Shell } from '@/types/shell';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { commandDecorator } from './common/decorator';
import { ExecutionTreeError } from '../exception';

import { 
    BREAK_LINE, 
    OCTAL_NUMBER_PATTERN 
} from './common/patterns';


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
    const name = 'umask - set file mode creation mask';
    const synopsis = `umask${BREAK_LINE}umask [OCTAL-UMASK]`;
    const description = `Show the current file and directories mask or modify it using an octal value like 0777 255 etc.${BREAK_LINE}${formattedOptions}`;

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

    const {
        umask,
        setUmask
    } = systemAPI;

    if (providedArguments.length) {
        const firstUmaskProvided = providedArguments[0];

        if (!OCTAL_NUMBER_PATTERN.test(firstUmaskProvided)) {
            throw new ExecutionTreeError(
                `umask: invalid octal number: ${firstUmaskProvided}`,
                1
            );
        }

        setUmask(previous => firstUmaskProvided);

        return {
            stdout: '',
            stderr: null,
            exitStatus: 0,
            modifiedSystemAPI: systemAPI
        };
    }

    return {
        stdout: umask,
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

    return commandDecorator(
        'umask', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}