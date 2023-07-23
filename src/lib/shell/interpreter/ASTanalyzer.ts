import { Shell } from "@/types/shell";
import { ParseTree } from "../ParseTree";
import { ParseTreeNode } from "../ParseTreeNode";
import { SHELL_OPERATORS } from "../grammar";


const executeCommand = (
    command: Shell.Token,
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[]
): Shell.ExitFlux => {

    return {
        stdout: null,
        stderr: null,
        exitStatus: 0
    };
}


const getCommandOptionsAndArguments = () => {

}


const isSingleCommand = (
    AST: ParseTree
): boolean => {

    const initialNode = AST.root;

    let operatorsNumber = 0;
    let nodeAccumulator = initialNode;

    while (true) {
        if (nodeAccumulator.leftNode === null) break;

        if (nodeAccumulator.token.value in SHELL_OPERATORS) operatorsNumber++;

        nodeAccumulator = nodeAccumulator.leftNode;
    }

    return operatorsNumber === 0;
}


const getCommandOptionsArray = (
    commandNode: ParseTreeNode
): Shell.Token[] => {

    const initialNode = commandNode.leftNode!;

    const tokensAccumulator: Shell.Token[] = [];

    let nodeAccumulator = initialNode;

    while (true) {
        if (nodeAccumulator.leftNode === null) break;

        tokensAccumulator.push({
            type: nodeAccumulator.token.type,
            value: nodeAccumulator.token.value
        });

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
        if (nodeAccumulator.rightNode === null) break;

        tokensAccumulator.push({
            type: nodeAccumulator.token.type,
            value: nodeAccumulator.token.value
        });

        nodeAccumulator = nodeAccumulator.rightNode;
    }

    return tokensAccumulator;
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
    AST: ParseTree
): Shell.ExitFlux => {

    const syntaxTreeIsSingleCommand = isSingleCommand(AST);

    if (syntaxTreeIsSingleCommand) {
        const commandNode = AST.root;

        const { commandContext, ...tokenWithoutContext } = commandNode.token;

        const command = tokenWithoutContext as Shell.Token;
        const commandOptions = commandNode.leftNode? getCommandOptionsArray(commandNode) : [];
        const commandArguments = commandNode.rightNode? getCommandArgumentsArray(commandNode) : [];

        return executeCommand(
            command, 
            commandOptions,
            commandArguments
        );
    }

    

    return {
        stdout: null,
        stderr: null,
        exitStatus: 0
    };
}