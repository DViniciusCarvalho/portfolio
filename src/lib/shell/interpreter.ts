import { LexerTokensResponse } from '@/types/shell_interpreter';
import { 
    SHELL_OPERATORS, 
    RESERVED_WORDS, 
    SHELL_COMMENT_SIGN, 
    SHELL_STRING_DOUBLE_QUOTE, 
    SHELL_STRING_QUOTE, 
    SHELL_VARIABLE_SIGN 
} from './grammar';


const startsWithSingleOrDoubleQuote = (
    array: string[],
    index: number
) => {

    const startsWithSingleQuote = array[index].startsWith(SHELL_STRING_QUOTE);
    const startsWithDoubleQuote = array[index].startsWith(SHELL_STRING_DOUBLE_QUOTE);

    const startsWithSomeone = startsWithSingleQuote || startsWithDoubleQuote;

    return {
        starts: startsWithSomeone,
        quote: startsWithSomeone? (startsWithSingleQuote? 'single' : 'double') : ''
    }
}

const endsWithSingleOrDoubleQuote = (
    array: string[],
    index: number
) => {

    const endsWithSingleQuote = array[index].endsWith(SHELL_STRING_QUOTE);
    const endsWithDoubleQuote = array[index].endsWith(SHELL_STRING_DOUBLE_QUOTE);

    const endsWithSomeone = endsWithSingleQuote || endsWithDoubleQuote;

    return {
        ends: endsWithSomeone,
        quote: endsWithSomeone? (endsWithSingleQuote? 'single' : 'double') : ''
    }

}

const splitCommand = (
    command: string
): string[] => {

    const pieces = command.split(' ');

    const piecesWithMergedStringParts = pieces.reduce((
        acc: string[], 
        current: string, 
        index: number,
        piecesArray: string[]
    ) => {

        const beforeSlice = piecesArray.slice(0, index);
        const afterSlice = piecesArray.slice(index, piecesArray.length);

        const someBeforeStartsWithQuote = beforeSlice.some((piece, index, arr) => {
            return startsWithSingleOrDoubleQuote(arr, index).starts;
        });

        const someAfterEndsWithQuote = afterSlice.some((piece, index, arr) => {
            return endsWithSingleOrDoubleQuote(arr, index).ends;
        });

        return acc;
    }, []);

    console.log(pieces);

    return pieces;

}

export const lexer = (command: string): LexerTokensResponse[] => {
    const commandWithoutSpaces = splitCommand(command);

    const tokens = commandWithoutSpaces.reduce((
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

    return tokens as LexerTokensResponse[];

}