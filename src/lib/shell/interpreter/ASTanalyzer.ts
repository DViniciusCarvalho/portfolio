import { Shell } from "@/types/shell";
import { ParseTree } from "../ParseTree";
import { ParseTreeNode } from "../ParseTreeNode";
import { SHELL_OPERATORS } from "../grammar";


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
): Shell.ExitFlux => {

    const commandName = command.value;

    try {
        const commandModule = require(`@/lib/shell/commands/${commandName}`);
        const commandFunction = commandModule[commandName];
        const { 
            stdout,
            stderr, 
            exitStatus 
        } = commandFunction(commandOptions, commandArguments, systemAPI, stdin);

        return {
            stdout,
            stderr,
            exitStatus
        };
    }
    catch(err: any) {
        return {
            stdout: null,
            stderr: err.message,
            exitStatus: 127
        };
    }

}


const executeMultipleCommands = (
    numberOfOperators: number,
    AST: ParseTree,
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux => {

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

    const commandResultAccumulator: Shell.ExitFlux = {
        stdout: null,
        stderr: null,
        exitStatus: 0
    }

    const updateCommandResultAccumulator = (value: Shell.ExitFlux) => {
        const { stdout, stderr, exitStatus } = value;

        commandResultAccumulator.stdout = stdout;
        commandResultAccumulator.stderr = stderr;
        commandResultAccumulator.exitStatus = exitStatus;
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
                const preLeftCommandStdout = leftCommandResult.stdout !== null
                                                ? `\n${leftCommandResult.stdout}`
                                                : '';

                const stdout = commandResultAccumulator.stdout !== null 
                                ? `${commandResultAccumulator.stdout}${preLeftCommandStdout}`
                                : leftCommandResult.stdout;

                const preLeftCommandStderr = leftCommandResult.stderr !== null
                                                ? `\n${leftCommandResult.stderr}`
                                                : '';

                const stderr = commandResultAccumulator.stderr !== null
                                ? `${commandResultAccumulator.stderr}${preLeftCommandStderr}`
                                : leftCommandResult.stderr;

                updateCommandResultAccumulator({
                    stdout: stdout,
                    stderr: stderr,
                    exitStatus: leftCommandResult.exitStatus
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
                
                const preRightCommandStdout = rightCommandResult.stdout !== null
                                                ? `\n${rightCommandResult.stdout}`
                                                : '';

                const stdout = commandResultAccumulator.stdout !== null 
                                ? `${commandResultAccumulator.stdout}${preRightCommandStdout}`
                                : rightCommandResult.stdout;

                const preRightCommandStderr = rightCommandResult.stderr !== null
                                                ? `\n${rightCommandResult.stderr}`
                                                : '';

                const stderr = commandResultAccumulator.stderr !== null
                                ? `${commandResultAccumulator.stderr}${preRightCommandStderr}`
                                : rightCommandResult.stderr;

                updateCommandResultAccumulator({
                    stdout: stdout,
                    stderr: stderr,
                    exitStatus: rightCommandResult.exitStatus
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
    
                const stdout = commandResultAccumulator.stdout;

                const preRightCommandStderr = rightCommandResult.stderr !== null
                                                ? `\n${rightCommandResult.stderr}`
                                                : '';

                const stderr = commandResultAccumulator.stderr !== null
                                ? `${commandResultAccumulator.stderr}${preRightCommandStderr}`
                                : rightCommandResult.stderr;
                        
                updateCommandResultAccumulator({
                    stdout: stdout,
                    stderr: stderr,
                    exitStatus: rightCommandResult.exitStatus
                });
            }  
            else if (nodeOperator === '||' && !leftCommandWasSuccessfullyExecuted) {
                const rightCommandResult = executeSingleCommand(
                    rightCommandToken,
                    rightCommandOptions,
                    rightCommandArguments,
                    systemAPI
                );

                const preRightCommandStdout = rightCommandResult.stdout !== null
                                                ? `\n${rightCommandResult.stdout}`
                                                : '';

                const stdout = commandResultAccumulator.stdout !== null 
                                ? `${commandResultAccumulator.stdout}${preRightCommandStdout}`
                                : rightCommandResult.stdout;

                const preRightCommandStderr = rightCommandResult.stderr !== null
                                                ? `\n${rightCommandResult.stderr}`
                                                : '';

                const stderr = commandResultAccumulator.stderr !== null
                                ? `${commandResultAccumulator.stderr}${preRightCommandStderr}`
                                : rightCommandResult.stderr;

                updateCommandResultAccumulator({
                    stdout: stdout,
                    stderr: stderr,
                    exitStatus: rightCommandResult.exitStatus
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

                updateCommandResultAccumulator({
                    stdout: commandResultAccumulator.stdout,
                    stderr: commandResultAccumulator.stderr,
                    exitStatus: rightCommandResult.exitStatus
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

                updateCommandResultAccumulator({
                    stdout: commandResultAccumulator.stdout,
                    stderr: commandResultAccumulator.stderr,
                    exitStatus: rightCommandResult.exitStatus
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

                updateCommandResultAccumulator({
                    stdout: commandResultAccumulator.stdout,
                    stderr: commandResultAccumulator.stderr,
                    exitStatus: rightCommandResult.exitStatus
                });
            }  
            else if (nodeOperator === ';') {
                const rightCommandResult = executeSingleCommand(
                    rightCommandToken,
                    rightCommandOptions,
                    rightCommandArguments,
                    systemAPI
                );

                const preRightCommandStdout = rightCommandResult.stdout !== null
                                                ? `\n${rightCommandResult.stdout}`
                                                : '';

                const stdout = commandResultAccumulator.stdout !== null 
                                ? `${commandResultAccumulator.stdout}${preRightCommandStdout}`
                                : rightCommandResult.stdout;

                const preRightCommandStderr = rightCommandResult.stderr !== null
                                                ? `\n${rightCommandResult.stderr}`
                                                : '';

                const stderr = commandResultAccumulator.stderr !== null
                                ? `${commandResultAccumulator.stderr}${preRightCommandStderr}`
                                : rightCommandResult.stderr;

                updateCommandResultAccumulator({
                    stdout: stdout,
                    stderr: stderr,
                    exitStatus: rightCommandResult.exitStatus
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

            const leftCommandStdin = `${rightCommandResult.stdout}\n${rightCommandResult.stderr}`;

            const leftCommandResult = executeSingleCommand(
                leftCommandToken,
                leftCommandOptions,
                leftCommandArguments,
                systemAPI,
                leftCommandStdin
            );

            const preLeftCommandStdout = leftCommandResult.stdout !== null
                                         ? `\n${leftCommandResult.stdout}`
                                         : '';

            const stdout = commandResultAccumulator.stdout !== null 
                           ? `${commandResultAccumulator.stdout}${preLeftCommandStdout}`
                           : leftCommandResult.stdout;

            const preLeftCommandStderr = leftCommandResult.stderr !== null
                                         ? `\n${leftCommandResult.stderr}`
                                         : '';

            const stderr = commandResultAccumulator.stderr !== null
                           ? `${commandResultAccumulator.stderr}${preLeftCommandStderr}`
                           : leftCommandResult.stderr;

            updateCommandResultAccumulator({
                stdout: stdout,
                stderr: stderr,
                exitStatus: leftCommandResult.exitStatus
            });
        }
    }

    return commandResultAccumulator;
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
): Shell.ExitFlux => {

    const numberOfOperators = getNumberOfOperators(AST);
    const syntaxTreeIsSingleCommand = numberOfOperators === 0;

    console.log(syntaxTreeIsSingleCommand);

    if (syntaxTreeIsSingleCommand) {
        const commandNode = AST.root;
        console.log(!!commandNode.rightNode)

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