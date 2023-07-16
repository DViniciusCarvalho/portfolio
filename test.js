const SHELL_OPERATORS = {
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
const SHELL_VARIABLE_SIGN = '$';

const SHELL_STRING_QUOTE = '\'';
const SHELL_STRING_DOUBLE_QUOTE = '\"';

const RESERVED_WORDS = {
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

const startsWithSingleOrDoubleQuote = (
    array,
    index
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
    array,
    index
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
    command
) => {

    const pieces = command.split(' ');

    const piecesWithMergedStringParts = pieces.reduce((
        acc, 
        current, 
        index,
        piecesArray
    ) => {

        const beforeSlice = piecesArray.slice(0, index);
        const afterSlice = piecesArray.slice(index, piecesArray.length);

        const someBeforeStartsWithQuote = beforeSlice.some(piece => {
            return 
        })
        

        return acc;
    }, []);

    console.log(pieces);

    return pieces;

}

const lexer = (command) => {
    const commandWithoutSpaces = command.split(' ');

    const tokens = commandWithoutSpaces.reduce((acc, current, index) => {
        const token = {};

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

    return tokens;


}

console.log(lexer('cd /home/slaoq && mkdir pasta2'))