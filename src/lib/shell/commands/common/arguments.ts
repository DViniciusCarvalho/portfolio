import { Shell } from "@/types/shell";
import { interpretCommand } from "../../interpreter/interpreter";
import { ExecutionTreeError } from "../../exception";
import { ESCAPE_SEQUENCES_SUBSTITUTION } from './constants';


export const getCommandArguments = (
    commandArguments: Shell.Token[],
    stdin: string | null
): any[] => {
    
    const commandArgumentsPassedDirectly = commandArguments.map(argument => argument.value);
    const commandArgumentsPassedByStdin = stdin !== null? stdin.split(' ') : [];
    const argumentsValue = [...commandArgumentsPassedDirectly, ...commandArgumentsPassedByStdin];

    return argumentsValue;
}


export const resolveArguments = (
    argumentsValue: string[],
    systemAPI: Shell.SystemAPI,
    canInterpretEscapeSequences: boolean
): string[] => {

    const VARIABLE_PATTERN = /(?<!\\)\$[A-Za-z0-9_\?]+/g;
    const COMMAND_SUBSTITUTION_PATTERN = /\$\([^)]*\)/g;
    const SINGLE_QUOTED_STRING_PATTERN = /^[']|[']$/g;
    const DOUBLE_QUOTED_STRING_PATTERN = /^["]|["]$/g;

    const resolvedArgumentsValue = argumentsValue.map((argument: string) => {
        const argumentIsSingleQuotedString = argument.match(SINGLE_QUOTED_STRING_PATTERN);
        const argumentIsDoubleQuotedString = argument.match(DOUBLE_QUOTED_STRING_PATTERN);

        const argumentVariables = argument.match(VARIABLE_PATTERN);
        const commandSubstitutions = argument.match(COMMAND_SUBSTITUTION_PATTERN);

        if (argumentVariables && !argumentIsSingleQuotedString) {
            for (const variableName of argumentVariables) {
                const variableNameWithoutVariableSign = variableName.replace('$', '');
                const env = systemAPI.environmentVariables;

                if (env.hasOwnProperty(variableNameWithoutVariableSign)) {
                    const variableValue = env[variableNameWithoutVariableSign];
                    argument = argument.replace(variableName, variableValue);

                    continue;
                }

                argument = argument.replace(variableName, 'nao tem');
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

        argument = argument.replace(SINGLE_QUOTED_STRING_PATTERN, '');
        argument = argument.replace(DOUBLE_QUOTED_STRING_PATTERN, '');

        return argument;
    });

    return resolvedArgumentsValue;
}