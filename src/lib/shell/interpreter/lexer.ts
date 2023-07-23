import { 
    SHELL_OPERATORS, 
    RESERVED_WORDS, 
    SHELL_COMMENT_SIGN, 
    SHELL_STRING_DOUBLE_QUOTE, 
    SHELL_STRING_QUOTE, 
    SHELL_VARIABLE_SIGN 
} from '@/lib/shell/grammar';

import { Shell } from '@/types/shell';


const splitCommand = (
    command: string
): string[] => {

    const parts: string[] = [];
  
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


export const lexer = (
    command: string
): Shell.Token[] => {

    const splittedCommand = splitCommand(command);

    const tokens = splittedCommand.reduce((
        acc: Shell.Token[], 
        current: string
    ) => {

        const token: Shell.Token = {
            type: 'String',
            value: current
        };

        const startsWithSingleQuote = current.startsWith(SHELL_STRING_QUOTE);
        const startsWithDoubleQuote = current.startsWith(SHELL_STRING_DOUBLE_QUOTE);

        const isOperator = current in SHELL_OPERATORS;
        const isStderrRedirect = current === '2>';
        const isComment = current.startsWith(SHELL_COMMENT_SIGN);
        const isReservedWord = current in RESERVED_WORDS;
        const isVariable = current.startsWith(SHELL_VARIABLE_SIGN);
        const isString = startsWithSingleQuote || startsWithDoubleQuote;
        const isNumber = !isNaN(Number(current));


        if (isOperator) {
            token['type'] = SHELL_OPERATORS[current];
            token['value'] = current;
        }
        else if (isStderrRedirect) {
            token['type'] = 'Stderr redirect';
            token['value'] = current;
        }
        else if (isComment) {
            token['type'] = 'Comment';
            token['value'] = current;
        }
        else if (isReservedWord) {
            token['type'] = RESERVED_WORDS[current];
            token['value'] = current;
        }
        else if (isVariable) {
            token['type'] = 'Variable';
            token['value'] = current;
        }
        else if (isString) {
            token['type'] = 'String';
            token['value'] = current;
        }
        else if (isNumber) {
            token['type'] = 'Number';
            token['value'] = current;
        }

        acc.push(token);

        return acc;

    }, []);

    return tokens as Shell.Token[];

}