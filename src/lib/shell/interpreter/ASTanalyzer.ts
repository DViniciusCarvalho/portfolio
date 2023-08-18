import { Shell } from '@/types/shell';
import { ParseTree } from '../ParseTree';
import { ParseTreeNode } from '../ParseTreeNode';
import { SHELL_OPERATORS } from '../grammar';
import { deepClone } from '@/lib/utils';
import { ESCAPE_SEQUENCES_SUBSTITUTION } from '../commands/common/constants';


const getCommandOptionsArray = (
    commandNode: ParseTreeNode
): Shell.Token[] => {

    const initialNode = commandNode.leftNode!;

    const tokensAccumulator: Shell.Token[] = [];

    let nodeAccumulator = initialNode;

    while (true) {
        tokensAccumulator.push({
            type: nodeAccumulator.token.type,
            value: nodeAccumulator.token.value
        });

        if (nodeAccumulator.leftNode === null) break;

        nodeAccumulator = nodeAccumulator.leftNode;

    }

    return tokensAccumulator;
}


const getCommandArgumentsArray = (
    commandNode: ParseTreeNode
): Shell.Token[] => {

    const initialNode = commandNode.rightNode!;

    const tokensAccumulator: Shell.Token[] = [];

    let nodeAccumulator = initialNode;

    while (true) {
        tokensAccumulator.push({
            type: nodeAccumulator.token.type,
            value: nodeAccumulator.token.value
        });

        if (nodeAccumulator.rightNode === null) break;

        nodeAccumulator = nodeAccumulator.rightNode;

    }

    return tokensAccumulator;
}


const executeSingleCommand = (
    command: Shell.Token,
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null = null
): Shell.ExitFlux & { systemAPI: Shell.SystemAPI } => {

    const COMMAND_SUBSTITUTION_PATTERN = /\$\([^)]*\)/g;
    const START_PATTERN = /^\$\(/g;
    const END_PATTERN = /\)$/g;
    
    const commandName = command.value.match(COMMAND_SUBSTITUTION_PATTERN)
                        ? command.value.replace(START_PATTERN, '').replace(END_PATTERN, '')
                        : command.value;
                        
    const commandIsVariableAssignment = commandName.match(/^.*=.*$/);

    if (commandIsVariableAssignment) {
        const variableName = commandName.split('=')[0];
        const variableValue = commandName.split('=')[1];

        systemAPI.setEnvironmentVariables(previous => {
            const previousDeepCopy = deepClone(previous);

            previousDeepCopy[variableName] = variableValue;

            systemAPI.environmentVariables = previousDeepCopy;

            return previousDeepCopy;
        });

        systemAPI.environmentVariables[variableName] = variableValue;

        return {
            stdout: null,
            stderr: null,
            exitStatus: 0,
            systemAPI
        };
    }

    try {
        const commandModule = require(`@/lib/shell/commands/${commandName}`);
        const commandFunction = commandModule[commandName];

        const { 
            stdout,
            stderr, 
            exitStatus,
            modifiedSystemAPI
        } = commandFunction(commandOptions, commandArguments, systemAPI, stdin);

        systemAPI = modifiedSystemAPI;

        return {
            stdout,
            stderr,
            exitStatus,
            systemAPI
        };
    }
    catch(err: any) {
        return {
            stdout: null,
            stderr: `${commandName}: command not found`,
            exitStatus: 127,
            systemAPI
        };
    }
}


const concatStdoutAndStderr = (
    commandResult: Shell.ExitFlux,
    commandResultAcc: Shell.ExitFlux
) => {

    const breakline = ESCAPE_SEQUENCES_SUBSTITUTION['\\n'];

    const preLeftCommandStdout = commandResult.stdout !== null
                                 ? `${breakline}${commandResult.stdout}`
                                 : '';

    const stdout = commandResultAcc.stdout !== null 
                   ? `${commandResultAcc.stdout}${preLeftCommandStdout}`
                   : commandResult.stdout;

    const preLeftCommandStderr = commandResult.stderr !== null
                                 ? `${breakline}${commandResult.stderr}`
                                 : '';

    const stderr = commandResultAcc.stderr !== null
                   ? `${commandResultAcc.stderr}${preLeftCommandStderr}`
                   : commandResult.stderr;

    return {
        stdout,
        stderr
    };
}


const executeMultipleCommands = (
    numberOfOperators: number,
    AST: ParseTree,
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { systemAPI: Shell.SystemAPI } => {

    const rootNode = AST.root;

    const leftToRightOperators = [
        '&&', 
        '|', 
        '>', 
        '||', 
        ';', 
        '>', 
        '2>', 
        '>>'
    ];

    const rightToLeftOperators = [
        '<', 
        '<<'
    ];

    const commandResultAccumulator: Shell.ExitFlux & { systemAPI: Shell.SystemAPI } = {
        stdout: null,
        stderr: null,
        exitStatus: 0,
        systemAPI
    }

    const updateCommandResultAccumulator = (value: Shell.ExitFlux & { systemAPI: Shell.SystemAPI }) => {
        const { stdout, stderr, exitStatus, systemAPI } = value;

        commandResultAccumulator.stdout = stdout;
        commandResultAccumulator.stderr = stderr;
        commandResultAccumulator.exitStatus = exitStatus;
        commandResultAccumulator.systemAPI = systemAPI;
    }


    for (let i = numberOfOperators; i > 0; i--) {
        let nodeAccumulator: ParseTreeNode | null = rootNode;
        let previousNodeAccumulator: ParseTreeNode | null = null;

        for (let k = 1; k < i; k++) {
            nodeAccumulator = nodeAccumulator.leftNode!;

            if (k === 1) {
                previousNodeAccumulator = rootNode;
                continue;
            }

            previousNodeAccumulator = previousNodeAccumulator
                                      ? previousNodeAccumulator.leftNode
                                      : null;
        }


        const nodeOperator = nodeAccumulator.token.value;
        const previousNodeOperator = previousNodeAccumulator !== null
                                    ? previousNodeAccumulator.token.value
                                    : null;

        const leftNode = nodeAccumulator.leftNode!;
        const leftCommandToken = leftNode.token;
        const leftCommandOptions = leftNode.leftNode? getCommandOptionsArray(leftNode) : [];
        const leftCommandArguments = leftNode.rightNode? getCommandArgumentsArray(leftNode) : [];

        const rightNode = nodeAccumulator.rightNode!;
        const rightCommandToken = rightNode.token;
        const rightCommandOptions = rightNode.leftNode? getCommandOptionsArray(rightNode) : [];
        const rightCommandArguments = rightNode.rightNode? getCommandArgumentsArray(rightNode) : [];

        const isStartOperatorNode = i === numberOfOperators;
        const isLeftToRightOperator = leftToRightOperators.indexOf(nodeOperator) !== -1;

        const leftCommandHasRedirectStderrToSameAsStdoutSign = leftCommandArguments.filter(arg => 
            arg.value === '2>&1'
        ).length !== 0;

        const rightCommandHasRedirectStderrToSameAsStdoutSign = rightCommandArguments.filter(arg =>
            arg.value === '2>&1'
        ).length !== 0;


        if (isLeftToRightOperator) {
            const leftCommandResult = isStartOperatorNode
                                    ? executeSingleCommand(
                                            leftCommandToken,
                                            leftCommandOptions,
                                            leftCommandArguments,
                                            systemAPI
                                        )
                                    : commandResultAccumulator;

            systemAPI = leftCommandResult.systemAPI;

            
            const leftCommandWasSuccessfullyExecuted = leftCommandResult.exitStatus === 0;

            const operatorsThatOmitOutput = [
                '|', 
                '>', 
                '>>', 
                '2>'
            ];

            const isNotOperatorThatOmitOutput = operatorsThatOmitOutput.indexOf(
                nodeOperator
            ) === -1;

            const previousOperatorIsRightToLeft = rightToLeftOperators.indexOf(
                previousNodeOperator
            ) !== -1;


            if (isNotOperatorThatOmitOutput && isStartOperatorNode) {
                const { 
                    stdout, 
                    stderr 
                } = concatStdoutAndStderr(
                    leftCommandResult, 
                    commandResultAccumulator
                );

                updateCommandResultAccumulator({
                    stdout: stdout,
                    stderr: stderr,
                    exitStatus: leftCommandResult.exitStatus,
                    systemAPI
                });
            }

            if (previousOperatorIsRightToLeft) {
                previousNodeAccumulator?.insertLeft(rightNode!);
                continue;
            }

            if (nodeOperator === '&&' && leftCommandWasSuccessfullyExecuted) {
                const rightCommandResult = executeSingleCommand(
                    rightCommandToken,
                    rightCommandOptions,
                    rightCommandArguments,
                    systemAPI
                );

                systemAPI = rightCommandResult.systemAPI;
                
                const { 
                    stdout, 
                    stderr 
                } = concatStdoutAndStderr(
                    rightCommandResult, 
                    commandResultAccumulator
                );

                updateCommandResultAccumulator({
                    stdout: stdout,
                    stderr: stderr,
                    exitStatus: rightCommandResult.exitStatus,
                    systemAPI
                });
            }
            else if (nodeOperator === '|') {
                const rightCommandStdin = `${leftCommandResult.stdout}\n${leftCommandResult.stderr}`;
    
                const rightCommandResult = executeSingleCommand(
                    rightCommandToken,
                    rightCommandOptions,
                    rightCommandArguments,
                    systemAPI,
                    leftCommandHasRedirectStderrToSameAsStdoutSign
                    ? rightCommandStdin 
                    : leftCommandResult.stdout
                );

                systemAPI = rightCommandResult.systemAPI;
    
                const { 
                    stdout, 
                    stderr 
                } = concatStdoutAndStderr(
                    rightCommandResult, 
                    commandResultAccumulator
                );
                        
                updateCommandResultAccumulator({
                    stdout: stdout,
                    stderr: stderr,
                    exitStatus: rightCommandResult.exitStatus,
                    systemAPI
                });
            }  
            else if (nodeOperator === '||' && !leftCommandWasSuccessfullyExecuted) {
                const rightCommandResult = executeSingleCommand(
                    rightCommandToken,
                    rightCommandOptions,
                    rightCommandArguments,
                    systemAPI
                );

                systemAPI = rightCommandResult.systemAPI;

                const { 
                    stdout, 
                    stderr 
                } = concatStdoutAndStderr(
                    rightCommandResult, 
                    commandResultAccumulator
                );

                updateCommandResultAccumulator({
                    stdout: stdout,
                    stderr: stderr,
                    exitStatus: rightCommandResult.exitStatus,
                    systemAPI
                });
            }  
            else if (nodeOperator === '>') {
                const rightCommandStdin = `${leftCommandResult.stdout}\n${leftCommandResult.stderr}`;

                const rightCommandResult = executeSingleCommand(
                    rightCommandToken,
                    rightCommandOptions,
                    rightCommandArguments,
                    systemAPI,
                    rightCommandHasRedirectStderrToSameAsStdoutSign
                    ? rightCommandStdin
                    : leftCommandResult.stdout
                );

                systemAPI = rightCommandResult.systemAPI;

                updateCommandResultAccumulator({
                    stdout: commandResultAccumulator.stdout,
                    stderr: commandResultAccumulator.stderr,
                    exitStatus: rightCommandResult.exitStatus,
                    systemAPI
                });
            }  
            else if (nodeOperator === '>>') {
                const rightCommandStdin = `${leftCommandResult.stdout}\n${leftCommandResult.stderr}`;

                const rightCommandResult = executeSingleCommand(
                    rightCommandToken,
                    rightCommandOptions,
                    rightCommandArguments,
                    systemAPI,
                    rightCommandHasRedirectStderrToSameAsStdoutSign
                    ? rightCommandStdin
                    : leftCommandResult.stdout
                );

                systemAPI = rightCommandResult.systemAPI;

                updateCommandResultAccumulator({
                    stdout: commandResultAccumulator.stdout,
                    stderr: commandResultAccumulator.stderr,
                    exitStatus: rightCommandResult.exitStatus,
                    systemAPI
                });
            }  
            else if (nodeOperator === '2>') {
                const rightCommandResult = executeSingleCommand(
                    rightCommandToken,
                    rightCommandOptions,
                    rightCommandArguments,
                    systemAPI,
                    leftCommandResult.stderr
                );

                systemAPI = rightCommandResult.systemAPI;

                updateCommandResultAccumulator({
                    stdout: commandResultAccumulator.stdout,
                    stderr: commandResultAccumulator.stderr,
                    exitStatus: rightCommandResult.exitStatus,
                    systemAPI
                });
            }  
            else if (nodeOperator === ';') {
                const rightCommandResult = executeSingleCommand(
                    rightCommandToken,
                    rightCommandOptions,
                    rightCommandArguments,
                    systemAPI
                );

                systemAPI = rightCommandResult.systemAPI;

                const { 
                    stdout, 
                    stderr 
                } = concatStdoutAndStderr(
                    rightCommandResult, 
                    commandResultAccumulator
                );

                updateCommandResultAccumulator({
                    stdout: stdout,
                    stderr: stderr,
                    exitStatus: rightCommandResult.exitStatus,
                    systemAPI
                });
            }

        }
        else {
            const rightCommandResult = executeSingleCommand(
                rightCommandToken,
                rightCommandOptions,
                rightCommandArguments,
                systemAPI
            );

            systemAPI = rightCommandResult.systemAPI;

            const leftCommandStdin = `${rightCommandResult.stdout}\n${rightCommandResult.stderr}`;

            const leftCommandResult = executeSingleCommand(
                leftCommandToken,
                leftCommandOptions,
                leftCommandArguments,
                systemAPI,
                leftCommandStdin
            );

            systemAPI = leftCommandResult.systemAPI;

            const { 
                stdout, 
                stderr 
            } = concatStdoutAndStderr(
                leftCommandResult, 
                commandResultAccumulator
            );

            updateCommandResultAccumulator({
                stdout: stdout,
                stderr: stderr,
                exitStatus: leftCommandResult.exitStatus,
                systemAPI
            });
        }
    }


    return {
        stdout: commandResultAccumulator.stdout,
        stderr: commandResultAccumulator.stderr,
        exitStatus: commandResultAccumulator.exitStatus,
        systemAPI: systemAPI
    };
}


const getNumberOfOperators = (
    AST: ParseTree
): number => {

    const initialNode = AST.root;

    let operatorsNumber = 0;
    let nodeAccumulator = initialNode;

    while (true) {
        if (nodeAccumulator.leftNode === null) break;

        if (nodeAccumulator.token.value in SHELL_OPERATORS) operatorsNumber++;

        nodeAccumulator = nodeAccumulator.leftNode;
    }

    return operatorsNumber;
}


const getNodeToStartAnalyzing = (
    node: ParseTreeNode,
    lastOperatorNodeFind: ParseTreeNode | null = null
): ParseTreeNode => {

    if (node.leftNode === null) return lastOperatorNodeFind!;

    lastOperatorNodeFind = node.token.value in SHELL_OPERATORS? node : lastOperatorNodeFind;

    return getNodeToStartAnalyzing(node.leftNode, lastOperatorNodeFind);

}


export const executeAST = (
    AST: ParseTree,
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { systemAPI: Shell.SystemAPI } => {

    const numberOfOperators = getNumberOfOperators(AST);
    const syntaxTreeIsSingleCommand = numberOfOperators === 0;

    if (syntaxTreeIsSingleCommand) {
        const commandNode = AST.root;

        const { commandContext, ...tokenWithoutContext } = commandNode.token;

        const command = tokenWithoutContext as Shell.Token;
        const commandOptions = commandNode.leftNode? getCommandOptionsArray(commandNode) : [];
        const commandArguments = commandNode.rightNode? getCommandArgumentsArray(commandNode) : [];

        return executeSingleCommand(
            command, 
            commandOptions,
            commandArguments,
            systemAPI 
        );
    }

    return executeMultipleCommands(
        numberOfOperators,
        AST,
        systemAPI
    );
}