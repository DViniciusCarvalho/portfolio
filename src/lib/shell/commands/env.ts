import { Shell } from '@/types/shell'
import { checkOption, commandHasInvalidOptions, getCommandInvalidOptionMessage } from './common/options';
import { deepClone } from '@/lib/utils';
import { checkProvidedPath } from './common/directoryAndFile';
import { ExecutionTreeError } from '../exception';
import { interpretCommand } from '../interpreter/interpreter';
import { getCommandArguments, resolveArguments } from './common/arguments';


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
    return {
        stdout: '',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const env = (    
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
            stderr: getCommandInvalidOptionMessage('env', invalidOptions, 'env --help'),
            exitStatus: 2,
            modifiedSystemAPI: systemAPI
        };
    }

    const providedOptions = commandOptions.map(opt => opt.value);
    const hasHelpOption = !!providedOptions.find(opt => opt === '--help');

    if (hasHelpOption) {
        return help(systemAPI);
    }

    const argumentsValue = getCommandArguments(commandArguments, stdin);
    
    try {
        const resolvedArgumentsValue = resolveArguments(argumentsValue, systemAPI, false);

        const hasOptions = !!commandOptions.length;

        const env = systemAPI.environmentVariables;
        const envBackup = deepClone(env);

        let numberOfArgumentsThatAreOptionValues = 0;

        if (hasOptions) {
            providedOptions.forEach((option: string, index) => {
                const changeDirOption = checkOption(option, 1, COMMAND_OPTIONS);
                const unsetVariableOption = checkOption(option, 2, COMMAND_OPTIONS);

                const IsIgnoreEnvOption = option === '-i' || option === '--ignore-environment';


                if (IsIgnoreEnvOption) {
                    const variableNames = Object.keys(env);

                    variableNames.forEach(variableName => delete env[variableName]);
                }
                else if (changeDirOption.valid) {
                    const isShortOption = changeDirOption.type === 'short';
                    const dir = isShortOption
                                ? resolvedArgumentsValue.at(index) 
                                : option.replace('--chdir=', '');

                    const cwd = env['PWD'];
                    const currentUser = systemAPI.currentShellUser;

                    
                    if (dir === undefined) {
                        throw new ExecutionTreeError(
                            `env: a directory must be provided if you are using '-C' or '--chdir'`,
                            2
                        );
                    }

                    const isValidDirectory = checkProvidedPath(
                        dir, 
                        cwd,
                        currentUser,
                        systemAPI.fileSystem
                    );

                    // logica de permissao de arquivo e diretorio

                    if (!isValidDirectory) {
                        throw new ExecutionTreeError(
                            `env: cannot change directory to ${dir}: No such file or directory`,
                            1
                        );
                    }

                    // logica de permissao de arquivo e diretorio

                    env['PWD'] = dir;

                    numberOfArgumentsThatAreOptionValues = isShortOption
                                                           ? numberOfArgumentsThatAreOptionValues
                                                           : numberOfArgumentsThatAreOptionValues + 1;
                }
                else if (unsetVariableOption.valid) {
                    const isShortOption = unsetVariableOption.type === 'short';
                    const variableName = isShortOption
                                         ? resolvedArgumentsValue.at(index) 
                                         : option.replace('--unset=', '');

                    if (variableName === undefined) {
                        throw new ExecutionTreeError(
                            `env: a variable name must be provided if you are using the '-u' or '--unset`,
                            2
                        );
                    }

                    if (env.hasOwnProperty(variableName)) {
                        delete env[variableName];
                    }

                    numberOfArgumentsThatAreOptionValues = isShortOption
                                                           ? numberOfArgumentsThatAreOptionValues
                                                           : numberOfArgumentsThatAreOptionValues + 1;
                }
            });
        }

        const providedCommand = resolvedArgumentsValue.length > numberOfArgumentsThatAreOptionValues
                                ? resolvedArgumentsValue
                                  .splice(numberOfArgumentsThatAreOptionValues + 1)
                                  .join(' ')
                                : null;

        if (!providedCommand) {
            const variableNames = Object.keys(env);

            const envLines = variableNames.reduce((
                acc: string[], 
                variableName: string
            ) => {

                const line = `${variableName}=${env[variableName]}`;
                acc.push(line);

                return acc;

            }, []);
        
            return {
                stdout: envLines.join('!<break_line>!'),
                stderr: null,
                exitStatus: 0,
                modifiedSystemAPI: systemAPI
            };
        }


        const result = interpretCommand(
            providedCommand.replace(/^[\'\"]/, '').replace(/[\'\"]$/, ''), 
            systemAPI
        );

        systemAPI.environmentVariables = envBackup;

        return {...result, modifiedSystemAPI: systemAPI};

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