import { Shell } from '@/types/shell';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage 
} from './common/options';

import { resolveArguments } from './common/arguments';
import { ExecutionTreeError } from '../exception';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getFileData, 
    getParentPathAndTargetName 
} from './common/directoryAndFile';
import { BREAK_LINE } from './common/patterns';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';
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
    const name = 'cat - concatenate files and print on the standard output';
    const synopsis = 'cat [OPTION]... [FILE]...';
    const description = `Concatenate FILE(s) to standard output.${BREAK_LINE}${formattedOptions}`;

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

    if (!providedArguments.length) {
        throw new ExecutionTreeError(
            `cat: no input provided, you need to provide an input`,
            1
        );
    }

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;

    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const stdout = providedArguments.reduce((
        acc,
        current,
        index,
        array
    ) => {

        const isLastInput = index === array.length - 1;

        const providedPath = checkProvidedPath(
            current,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );

        if (!providedPath.valid) {
            throw new ExecutionTreeError(
                `cat: ${current}: No such file or directory`,
                1
            );
        }


        if (providedPath.validAs === 'directory') {
            throw new ExecutionTreeError(
                `cat: ${current}: Is a directory`,
                1
            );
        }
        else if (providedPath.validAs === 'file') {

            const {
                parentPath,
                targetName
            } = getParentPathAndTargetName(providedPath.resolvedPath);

            const parentDirectoryData = getDirectoryData(
                parentPath,
                currentWorkingDirectory,
                currentShellUser,
                fileSystem
            );

            const fileData = getFileData(
                parentDirectoryData,
                targetName
            )!;

            const fileContent = fileData.data.content;

            acc += `${fileContent}${isLastInput? '' : fileContent === '' ? '' : BREAK_LINE}`;

            return acc;
        }

        return acc;

    }, '');

    return {
        stdout: stdout,
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const cat = (    
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