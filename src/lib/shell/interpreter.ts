import { Token } from '@/types/shell_interpreter';
import { 
    SHELL_OPERATORS, 
    RESERVED_WORDS, 
    SHELL_COMMENT_SIGN, 
    SHELL_STRING_DOUBLE_QUOTE, 
    SHELL_STRING_QUOTE, 
    SHELL_VARIABLE_SIGN 
} from './grammar';

import { ParseTree } from './ParseTree';
import { ParseTreeNode } from './ParseTreeNode';


const splitCommand = (
    command: string
): string[] => {

    const parts = [];
  
    let currentWord = '';
    let insideString = false;

    let isSingleQuote = false;
    let isDoubleQuote = false;

    for (let i = 0; i < command.length; i++) {
        const char = command[i];

        const isSingleQuoteStringStart = char === '\'' && !insideString;
        const isSingleQuoteStringEnd = char === '\'' && insideString && isSingleQuote;

        const isDoubleQuoteStringStart = char === '"' && !insideString;
        const isDoubleQuoteStringEnd = char === '"' && insideString && isDoubleQuote;

        const isSpace = char === ' ';

        const isTheLastChar = i + 1 === command.length;


        if (isSingleQuoteStringStart) {
            insideString = true;
            isSingleQuote = true;
            currentWord += char;
            continue;
        }
        else if (isDoubleQuoteStringStart) {
            insideString = true;
            isDoubleQuote = true;
            currentWord += char;
            continue;
        }
        else if (isSingleQuoteStringEnd) {
            insideString = false;
            isSingleQuote = false;
            currentWord += char;
            parts.push(currentWord);
            currentWord = '';
        }
        else if (isDoubleQuoteStringEnd) {
            insideString = false;
            isDoubleQuote = false;
            currentWord += char;
            parts.push(currentWord);
            currentWord = '';
        }
        else if (isSpace) {
            if (insideString) {
                currentWord += char;
                continue;
            }
            else {
                parts.push(currentWord);
                currentWord = '';
            }
        }
        else {
            currentWord += char;
            if (isTheLastChar) parts.push(currentWord);
        }
    }
  
    return parts.filter(part => part !== '');

}


export const lexer = (command: string): Token[] => {
    const splittedCommand = splitCommand(command);

    const tokens = splittedCommand.reduce((
        acc: {[key: string]: any}[], 
        current: string
    ) => {

        const token: {[key: string]: any} = {};

        if (current in SHELL_OPERATORS) {
            token['type'] = SHELL_OPERATORS[current];
        }
        else if (current.startsWith(SHELL_COMMENT_SIGN)) {
            token['type'] = 'Comment';
        }
        else if (current in RESERVED_WORDS) {
            token['type'] = RESERVED_WORDS[current];
        }
        else if (current.startsWith(SHELL_VARIABLE_SIGN)) {
            token['type'] = 'Variable';
            token['value'] = current;
        }
        else if (
            current.startsWith(SHELL_STRING_QUOTE) || current.startsWith(SHELL_STRING_DOUBLE_QUOTE)
        ) {
            token['type'] = 'String';
            token['value'] = current;
        }
        else if (!isNaN(Number(current))) {
            token['type'] = 'Number';
            token['value'] = current;
        }
        else {
            token['type'] = 'String';
            token['value'] = current;
        }

        acc.push(token);

        return acc;

    }, []);

    return tokens as Token[];

}


export const parser = (
    tokens: Token[]
) => {

    const reservedWordTokens = tokens.filter(token => token.type in RESERVED_WORDS);
    const shellOperatorsInOrder = tokens.filter(token => token.type in SHELL_OPERATORS);

    const hasOperators = shellOperatorsInOrder.length;
    const rootNodeToken = hasOperators? shellOperatorsInOrder.pop()! : tokens.shift()!;

    const rootNode = new ParseTreeNode(rootNodeToken);
    const parseTree = new ParseTree(rootNode);

    if (hasOperators) {
        const rootNodeIndex = tokens.lastIndexOf(rootNodeToken);
        const lastCommandTokenIndex = rootNodeIndex + 1;
    }

    for (const token in tokens) {
        
    }

    return parseTree;
}