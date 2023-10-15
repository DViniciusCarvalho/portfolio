import { Shell } from '@/types/shell';
import { ParseTree } from '../ParseTree';
import { ParseTreeNode } from '../ParseTreeNode';
import { ParseTreeError } from '../exception';

import { 
    SHELL_OPERATORS,
    RESERVED_WORDS 
} from '../grammar';


const doCommandTree = (
    commandAndArgumentsSlice: Shell.Token[]
): ParseTreeNode => {

    const commandIndex = 0;
    const commandParametersSliceStartIndex = commandIndex + 1;

    const commandToken = commandAndArgumentsSlice[0];

    const commandParameterTokensSlice = commandAndArgumentsSlice.slice(
        commandParametersSliceStartIndex
    );

    const commandNode = new ParseTreeNode(commandToken);

    const optionNodes: ParseTreeNode[] = [];
    const argumentNodes: ParseTreeNode[] = [];

    commandParameterTokensSlice.forEach(commandParameterToken => {
        const lastOption = optionNodes.length - 1;
        const lastArgument = argumentNodes.length - 1;

        const tokenValue = commandParameterToken.value;
        const tokenValueIsOption = tokenValue.startsWith('-');


        if (tokenValueIsOption) {
            const optionNode = new ParseTreeNode(commandParameterToken);

            if (lastOption >= 0) {
                optionNodes[lastOption].insertLeft(optionNode);
            }

            optionNodes.push(optionNode);
        }
        else {
            const argumentNode = new ParseTreeNode(commandParameterToken);

            if (lastArgument >= 0) {
                argumentNodes[lastArgument].insertRight(argumentNode);
            }

            argumentNodes.push(argumentNode);
        }
    });


    if (optionNodes.length) {
        commandNode.insertLeft(optionNodes[0]);
    }

    if (argumentNodes.length) {
        commandNode.insertRight(argumentNodes[0]);
    }

    return commandNode;

}


const doOperationTree = (
    tokens: Shell.Token[]
): ParseTreeNode => {

    const nodes: ParseTreeNode[] = [];
    const tokensAccumulator: Shell.Token[] = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const isOperator = token.value in SHELL_OPERATORS;
        const isTheLastToken = i + 1 === tokens.length;
        
        if (!isOperator) tokensAccumulator.push(token);

        if (isOperator || isTheLastToken) {
            if (tokensAccumulator.length) {
                const commandNodeTree = doCommandTree(tokensAccumulator);
                nodes.push(commandNodeTree);
            }
        }

        if (isOperator) {
            const operatorNode = new ParseTreeNode(token);

            nodes.push(operatorNode);
            tokensAccumulator.length = 0;

            continue;
        }

    }

    const shellOperators = nodes.filter(node => node.token.value in SHELL_OPERATORS);

    const firstOperatorIndex = nodes.indexOf(shellOperators[0]);
    const lastOperatorIndex = nodes.lastIndexOf(shellOperators[shellOperators.length - 1]);


    let lastOperatorIndexAccumulator = 0;

    for (let i = 0; i < nodes.length; i++) {
        const isOperator = nodes[i].token.value in SHELL_OPERATORS;
        const isTheFirstOperator = i === firstOperatorIndex;
        const hasTokenBefore = !!nodes[i - 1];
        const hasTokenAfter = !!nodes[i + 1];

        if (isOperator) {
            if (isTheFirstOperator) {
                if (hasTokenBefore) nodes[i].insertLeft(nodes[i - 1]);
                if (hasTokenAfter) nodes[i].insertRight(nodes[i + 1]);

            }
            else {
                nodes[i].insertLeft(nodes[lastOperatorIndexAccumulator]);

                if (hasTokenAfter) nodes[i].insertRight(nodes[i + 1]);
            }

            lastOperatorIndexAccumulator = i;
        }

    }

    return shellOperators.length? nodes[lastOperatorIndex] : nodes[nodes.length - 1];

}


export const parser = (
    tokens: Shell.Token[]
): ParseTree | ParseTreeError => {

    const reservedWordsToken = tokens.filter(token => token.value in RESERVED_WORDS);
    const shellOperatorsToken = tokens.filter(token => token.value in SHELL_OPERATORS);

    const reservedWords = reservedWordsToken.map(token => token.value);
    const shellOperators = shellOperatorsToken.map(token => token.value);
    

    if (reservedWords.length) {
        const mergedReservedWords = reservedWords.join(',');

        return new ParseTreeError(
            `${mergedReservedWords}: syntax error, reserved words are not yet accepted in this shell interpreter`,
            2
        );
    }

    if (shellOperators.indexOf('&') !== -1) {
        return new ParseTreeError(
            '&: syntax error, ampersand operator is not yet accepted in this shell interpreter',
            2
        );
    }


    const isNotSingleCommand = shellOperatorsToken.length;
    const lastOperator = shellOperatorsToken.pop();
    
    const rootNode = isNotSingleCommand 
                     ? new ParseTreeNode(lastOperator!)
                     : doCommandTree(tokens);
   
    if (isNotSingleCommand) {
        const rootNodeToken = lastOperator!;
        const rootNodeIndex = tokens.lastIndexOf(rootNodeToken);
        const lastCommandTokenIndex = rootNodeIndex + 1;

        const lastCommandSlice = tokens.slice(lastCommandTokenIndex);
        const otherSlice = tokens.slice(0, rootNodeIndex);
        const lastCommandNodeTree = doCommandTree(lastCommandSlice);

        const leftRootNode = doOperationTree(otherSlice);

        rootNode.insertRight(lastCommandNodeTree);
        rootNode.insertLeft(leftRootNode);
    }

    const parseTree = new ParseTree(rootNode);
    
    return parseTree;
}