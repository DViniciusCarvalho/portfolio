import { LexerTokensResponse } from "./types/types"

const SHELL_OPERATORS: {[key: string]: string} = {
    '&': 'Ampersand',
    '&&': 'Double ampersand',
    '|': 'Pipe',
    '||': 'Double Pipe',
    '>': 'Greater-than sign',
    '>>': 'Double greather-than sign',
    '<': 'Less-than sign',
    '<<': 'Doube less-than sign',
    ';': 'Semicolon',
};

const SHELL_COMMENT_SIGN = '#';

const RESERVED_WORDS: {[key: string]: string} = {
    if: 'IF Conditional Statement',
    then: 'THEN Conditional Statement',
    else: 'ELSE Conditional Statement',
    elif: 'ELIF Conditional Statement',
    fi: 'FI Conditional Statement',
    case: 'CASE Statement',
    esac: 'ESAC Statement',
    for: 'FOR Loop',
    while: 'WHILE Loop',
    until: 'UNTIL Loop',
    do: 'DO Loop',
    done: 'DONE Loop',
    function: 'FUNCTION Declaration',
    select: 'SELECT Loop',
    in: 'IN Keyword',
    return: 'RETURN Statement',
    break: 'BREAK Statement',
    continue: 'CONTINUE Statement',
    exit: 'EXIT Statement',
};


export const lexer = (command: string): LexerTokensResponse[] => {
    const commandWithoutSpaces = command.split(' ');

    const tokens = commandWithoutSpaces.reduce((acc: any, current: string, index: number) => {
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
        if (index === 0) {
            token['type'] = 'Command';
            token['value'] = current;
        }

        return token;
    }, []);

    return tokens as LexerTokensResponse[];


}