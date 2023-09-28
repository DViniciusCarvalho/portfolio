import { Shell } from '@/types/shell';
import { interpretCommand } from '../../interpreter/interpreter';
import { ExecutionTreeError } from '../../exception';

import { 
    FULL_COMMAND_SUBSTITUTION_PATTERN,
    DOUBLE_QUOTED_STRING_PATTERN, 
    ESCAPE_SEQUENCES_SUBSTITUTION, 
    SINGLE_QUOTED_STRING_PATTERN, 
    VARIABLE_PATTERN 
} from './patterns';


export const getCommandArguments = (
    commandArguments: Shell.Token[],
    stdin: string | null
): any[] => {
    
    const commandArgumentsPassedDirectly = commandArguments.map(argument => argument.value);
    const commandArgumentsPassedByStdin = stdin !== null? stdin.split(' ') : [];
    
    const argumentsValue = [
        ...commandArgumentsPassedDirectly, 
        ...commandArgumentsPassedByStdin
    ];

    return argumentsValue;
}


export const resolveArguments = (
    commandArguments: Shell.Token[],
    stdin: string | null,
    systemAPI: Shell.SystemAPI,
    canInterpretEscapeSequences: boolean
): any[] => {

    const argumentsValue = getCommandArguments(commandArguments, stdin);

    const resolvedArgumentsValue = argumentsValue.map((argument: string) => {
        const argumentIsSingleQuotedString = argument.match(SINGLE_QUOTED_STRING_PATTERN);
        const argumentIsDoubleQuotedString = argument.match(DOUBLE_QUOTED_STRING_PATTERN);

        const argumentVariables = argument.match(VARIABLE_PATTERN);
        const commandSubstitutions = argument.match(FULL_COMMAND_SUBSTITUTION_PATTERN);

        if (argumentVariables && !argumentIsSingleQuotedString) {
            for (const variableName of argumentVariables) {
                const variableNameWithoutVariableSign = variableName.replace('$', '');
                const env = systemAPI.environmentVariables;
                const variableExists = env.hasOwnProperty(variableNameWithoutVariableSign);

                if (variableExists) {
                    const variableValue = env[variableNameWithoutVariableSign];
                    argument = argument.replace(variableName, variableValue);

                    continue;
                }

                argument = argument.replace(variableName, '');
            }
        }

        if (commandSubstitutions && !argumentIsSingleQuotedString) {
            for (const commandSubstitution of commandSubstitutions) {
                const command = commandSubstitution.slice(2, commandSubstitution.length - 1);

                const {
                    stdout,
                    stderr,
                    exitStatus
                } = interpretCommand(command, systemAPI);

                if (stderr) {
                    throw new ExecutionTreeError(stderr, exitStatus);
                }

                argument = argument.replace(commandSubstitution, stdout!);

            }
        }

        if (canInterpretEscapeSequences && argumentIsDoubleQuotedString) {
            for (const escapeSequence in ESCAPE_SEQUENCES_SUBSTITUTION) {
                const substitution = ESCAPE_SEQUENCES_SUBSTITUTION[escapeSequence];
                argument = argument.replace(escapeSequence, substitution);
            }
        }

        const splittedPathParts = argument.split('/');

        const withoutQuotesParts = splittedPathParts.reduce((
            acc,
            argument
        ) => {
            argument = argument.replace(SINGLE_QUOTED_STRING_PATTERN, '');
            argument = argument.replace(DOUBLE_QUOTED_STRING_PATTERN, '');

            acc.push(argument);

            return acc;
        }, [] as string[]);


        return withoutQuotesParts.join('/');
    });

    return resolvedArgumentsValue;
}