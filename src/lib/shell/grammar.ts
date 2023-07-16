export const SHELL_OPERATORS: {[key: string]: string} = {
    '&': 'Ampersand',
    '&&': 'Double ampersand',
    '|': 'Pipe',
    '||': 'Double Pipe',
    '>': 'Greater-than sign',
    '>>': 'Double greather-than sign',
    '<': 'Less-than sign',
    '<<': 'Double less-than sign',
    ';': 'Semicolon',
};

export const SHELL_COMMENT_SIGN = '#';
export const SHELL_VARIABLE_SIGN = '$';

export const SHELL_STRING_QUOTE = '\'';
export const SHELL_STRING_DOUBLE_QUOTE = '\"';

export const RESERVED_WORDS: {[key: string]: string} = {
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