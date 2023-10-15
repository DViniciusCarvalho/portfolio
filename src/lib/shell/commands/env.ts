import { Shell } from '@/types/shell';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { deepClone } from '@/lib/utils';
import { checkOption } from './common/options';
import { checkProvidedPath } from './common/directoryAndFile';
import { interpretCommand } from '../interpreter/interpreter';
import { commandDecorator } from './common/decorator';
import { ExecutionTreeError } from '../exception';

import { 
    BREAK_LINE, 
    VARIABLE_ASSIGNMENT_PATTERN
} from './common/patterns';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-i',
        long: '--ignore-environment',
        description: 'start with an empty environment'
    },
    {
        short: '-C',
        long: /--chdir=.+/,
        description: 'change working directory to DIR'
    },
    {
        short: '-u',
        long: /--unset=.+/,
        description: 'remove variable from the environment'
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

    const regexOptionsMapping = new Map();

    regexOptionsMapping.set(COMMAND_OPTIONS[1].long, '--chdir=DIR');
    regexOptionsMapping.set(COMMAND_OPTIONS[2].long, '--unset=NAME');

    const formattedOptions = formatHelpPageOptions(
        COMMAND_OPTIONS, 
        regexOptionsMapping
    );

    const name = 'env - run a program in a modified environment';
    const synopsis = 'env [OPTION]... [NAME=VALUE]... ["COMMAND [OPTION]... [ARG]..."]';
    const description = `Set each NAME to VALUE in the environment and run COMMAND.${BREAK_LINE}${formattedOptions}`;

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
        environmentVariables
    } = systemAPI;

    const envDeepClone = deepClone(environmentVariables);

    const currentWorkingDirectory = envDeepClone['PWD']
    const currentShellUser = envDeepClone['USER'];

    systemAPI.environmentVariables = envDeepClone;

    // options operations
    const numberOfOptionValues = providedOptions.reduce((
        acc: number,
        option,
        index
    ) => {

        const ignoreEnvOption = checkOption(option, 0, COMMAND_OPTIONS);
        const changeDirOption = checkOption(option, 1, COMMAND_OPTIONS);
        const unsetVariableOption = checkOption(option, 2, COMMAND_OPTIONS);

        const isIgnoreEnvOption = ignoreEnvOption.valid;
        const isChangeDirOption = changeDirOption.valid;
        const isUnsetVariableOption = unsetVariableOption.valid;

        const changeDirOptionType = changeDirOption.type;
        const unsetVariableOptionType = unsetVariableOption.type;


        if (isIgnoreEnvOption) {
            const variableNames = Object.keys(envDeepClone);

            variableNames.forEach(variableName => delete envDeepClone[variableName]);
        }
        else if (isChangeDirOption) {
            const isShortOption = changeDirOptionType === 'short';

            const dir = isShortOption
                        ? providedArguments.at(index) 
                        : option.replace('--chdir=', '');
             
            if (dir === undefined) {
                throw new ExecutionTreeError(
                    `env: a directory must be provided if you are using '-C' or '--chdir'`,
                    2
                );
            }

            const checkedProvidedDirectory = checkProvidedPath(
                dir, 
                currentWorkingDirectory,
                currentShellUser,
                systemAPI.fileSystem
            );

            // logica de permissao de arquivo e diretorio

            if (!checkedProvidedDirectory.valid) {
                throw new ExecutionTreeError(
                    `env: cannot change directory to ${dir}: No such file or directory`,
                    1
                );
            }

            // logica de permissao de arquivo e diretorio

            envDeepClone['PWD'] = dir;

            acc = isShortOption? acc : ++acc;
        }
        else if (isUnsetVariableOption) {
            const isShortOption = unsetVariableOptionType === 'short';

            const variableName = isShortOption
                                 ? providedArguments.at(index) 
                                 : option.replace('--unset=', '');

            if (variableName === undefined) {
                throw new ExecutionTreeError(
                    `env: a variable name must be provided if you are using the '-u' or '--unset`,
                    2
                );
            }

            if (envDeepClone.hasOwnProperty(variableName)) {
                delete envDeepClone[variableName];
            }

            acc = isShortOption? acc : ++acc;
        }

        return acc;

    }, 0);

    
    // variable assignments
    providedArguments.forEach((argument: string) => {
        if (argument.match(VARIABLE_ASSIGNMENT_PATTERN)) {
            const equalSignalIndex = argument.indexOf('=');

            const variableName = argument.slice(0, equalSignalIndex);
            const variableValue = argument.slice(equalSignalIndex + 1);

            envDeepClone[variableName] = variableValue;
        }
    });

    
    const providedCommand = providedArguments.length > numberOfOptionValues
                            ? providedArguments
                              .splice(numberOfOptionValues + 1)
                              .join(' ')
                            : null;

    if (!providedCommand) {
        const variableNames = Object.keys(envDeepClone);

        const envLines = variableNames.reduce((
            acc: string[], 
            variableName: string
        ) => {

            const line = `${variableName}=${envDeepClone[variableName]}`;

            acc.push(line);

            return acc;

        }, []);
    
        return {
            stdout: envLines.join(BREAK_LINE),
            stderr: null,
            exitStatus: 0,
            modifiedSystemAPI: systemAPI
        };
    }


    const {
        stdout,
        stderr,
        exitStatus
    } = interpretCommand(
        providedCommand.replace(/^[\'\"]/, '').replace(/[\'\"]$/, ''), 
        systemAPI
    );

    systemAPI.environmentVariables = env;

    return { 
        stdout, 
        stderr,
        exitStatus,
        modifiedSystemAPI: systemAPI 
    };
}


export const env = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'env', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}